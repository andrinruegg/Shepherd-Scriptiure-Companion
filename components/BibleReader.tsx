
import React, { useState, useEffect, useRef } from 'react';
import { Book, ChevronLeft, ChevronRight, Heart, X, ArrowLeft, Pause, Volume1, Image, Loader2, AlertTriangle } from 'lucide-react';
import { BIBLE_BOOKS, fetchChapter } from '../services/bibleService';
import { BibleChapter, SavedItem, BibleHighlight } from '../types';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { generateSpeech } from '../services/geminiService';

interface BibleReaderProps {
  language: string;
  onSaveItem: (item: SavedItem) => void;
  onMenuClick: () => void;
  highlights: BibleHighlight[];
  onAddHighlight: (highlight: BibleHighlight) => void;
  onRemoveHighlight: (ref: string) => void;
  onOpenComposer: (text: string, reference: string) => void;
  hasApiKey: boolean; 
}

function base64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

const VERSES_PER_CHUNK = 10;

const BibleReader: React.FC<BibleReaderProps> = ({ 
    language, 
    onSaveItem, 
    onMenuClick, 
    highlights, 
    onAddHighlight, 
    onRemoveHighlight,
    onOpenComposer,
    hasApiKey
}) => {
  const { t } = useTranslation();
  const [selectedBookId, setSelectedBookId] = useState('JHN');
  const [chapter, setChapter] = useState(1);
  const [data, setData] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeVerse, setActiveVerse] = useState<number | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState<number | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [showBufferingWarning, setShowBufferingWarning] = useState(false);
  const [showNoKeyError, setShowNoKeyError] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const isPlayingRef = useRef(false);
  
  const audioCacheRef = useRef<Map<number, AudioBuffer>>(new Map());
  const pendingRequestsRef = useRef<Set<number>>(new Set());
  
  const selectedBook = BIBLE_BOOKS.find(b => b.id === selectedBookId) || BIBLE_BOOKS[0];
  
  const getLocalizedBookName = (book: typeof BIBLE_BOOKS[0]) => {
      if (language === 'German') return book.names.de;
      if (language === 'Romanian') return book.names.ro;
      return book.names.en;
  };

  const displayBookName = getLocalizedBookName(selectedBook);

  useEffect(() => {
    stopAudio();
    audioCacheRef.current.clear();
    pendingRequestsRef.current.clear();
    
    const loadChapter = async () => {
      setLoading(true);
      const result = await fetchChapter(selectedBook.name, chapter, language);
      setData(result);
      setLoading(false);
      setActiveVerse(null);
    };
    loadChapter();
    return () => {
        stopAudio();
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    };
  }, [selectedBookId, chapter, language]);

  useEffect(() => {
      let timer: any;
      if (audioLoading) {
          timer = setTimeout(() => setShowBufferingWarning(true), 1000);
      } else {
          setShowBufferingWarning(false);
      }
      return () => clearTimeout(timer);
  }, [audioLoading]);

  const initAudioContext = async () => {
      if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      }
      if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
      }
      return audioContextRef.current;
  };

  const fetchAndDecodeChunk = async (text: string): Promise<AudioBuffer> => {
      const ctx = await initAudioContext();
      const base64Audio = await generateSpeech(text, language);
      const rawBytes = base64ToUint8Array(base64Audio);
      const pcm16 = new Int16Array(rawBytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
          float32[i] = pcm16[i] / 32768;
      }
      const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
      audioBuffer.copyToChannel(float32, 0);
      return audioBuffer;
  };

  const getChunkText = (verses: any[], chunkIndex: number) => {
      const start = chunkIndex * VERSES_PER_CHUNK;
      const end = start + VERSES_PER_CHUNK;
      const chunkVerses = verses.slice(start, end);
      return chunkVerses.map(v => v.text).join(' ');
  };

  const preloadChunk = async (chunkIndex: number, verses: any[]) => {
      const totalChunks = Math.ceil(verses.length / VERSES_PER_CHUNK);
      if (chunkIndex >= totalChunks) return;
      if (!hasApiKey) return;
      
      if (audioCacheRef.current.has(chunkIndex) || pendingRequestsRef.current.has(chunkIndex)) return;

      try {
          pendingRequestsRef.current.add(chunkIndex);
          const text = getChunkText(verses, chunkIndex);
          const buffer = await fetchAndDecodeChunk(text);
          audioCacheRef.current.set(chunkIndex, buffer);
          pendingRequestsRef.current.delete(chunkIndex);
      } catch (e) {
          console.warn(`Preload failed for chunk ${chunkIndex}`, e);
          pendingRequestsRef.current.delete(chunkIndex);
      }
  };

  const playChunk = async (chunkIndex: number) => {
      if (!data || !data.verses) return;
      if (!isPlayingRef.current) return;

      const totalChunks = Math.ceil(data.verses.length / VERSES_PER_CHUNK);
      if (chunkIndex >= totalChunks) {
          stopAudio();
          return;
      }

      setCurrentChunkIndex(chunkIndex);
      
      preloadChunk(chunkIndex + 1, data.verses);
      preloadChunk(chunkIndex + 2, data.verses);

      try {
          let bufferToPlay: AudioBuffer;

          if (audioCacheRef.current.has(chunkIndex)) {
              bufferToPlay = audioCacheRef.current.get(chunkIndex)!;
          } else {
              setAudioLoading(true);
              const text = getChunkText(data.verses, chunkIndex);
              bufferToPlay = await fetchAndDecodeChunk(text);
              
              audioCacheRef.current.set(chunkIndex, bufferToPlay);
              
              if (!isPlayingRef.current) { setAudioLoading(false); return; }
              setAudioLoading(false);
          }

          const ctx = await initAudioContext();
          const source = ctx.createBufferSource();
          source.buffer = bufferToPlay;
          source.connect(ctx.destination);
          
          source.onended = () => {
              if (sourceNodeRef.current === source && isPlayingRef.current) {
                  playChunk(chunkIndex + 1);
              }
          };

          if (sourceNodeRef.current) try { sourceNodeRef.current.stop(); } catch(e) {}
          sourceNodeRef.current = source;
          source.start();

      } catch (e) {
          console.error("Audio playback error:", e);
          setAudioLoading(false);
          setIsPlaying(false);
          isPlayingRef.current = false;
      }
  };

  const toggleAudio = () => {
      if (!hasApiKey) {
          setShowNoKeyError(true);
          setTimeout(() => setShowNoKeyError(false), 4000);
          return;
      }

      if (isPlaying) {
          stopAudio();
      } else {
          const startChunk = currentChunkIndex || 0;
          setIsPlaying(true);
          isPlayingRef.current = true;
          playChunk(startChunk);
      }
  };

  const stopAudio = () => {
      if (sourceNodeRef.current) {
          try { sourceNodeRef.current.stop(); } catch(e) {}
          sourceNodeRef.current = null;
      }
      setIsPlaying(false);
      isPlayingRef.current = false;
      setAudioLoading(false);
      setShowBufferingWarning(false);
  };

  const handleNext = () => {
      if (chapter < selectedBook.chapters) {
          setChapter(c => c + 1);
      }
  };

  const handlePrev = () => {
      if (chapter > 1) {
          setChapter(c => c - 1);
      }
  };

  const saveVerse = (text: string, verseNum: number) => {
      const reference = `${displayBookName} ${chapter}:${verseNum}`;
      onSaveItem({
          id: uuidv4(),
          type: 'verse',
          content: text,
          reference: reference,
          date: Date.now()
      });
      setActiveVerse(null);
  };

  const highlightVerse = (verseNum: number, color: 'yellow' | 'green' | 'blue' | 'pink') => {
      const ref = `${selectedBookId} ${chapter}:${verseNum}`;
      onAddHighlight({ id: uuidv4(), ref, color });
      setActiveVerse(null);
  };

  const removeHighlight = (verseNum: number) => {
      const ref = `${selectedBookId} ${chapter}:${verseNum}`;
      onRemoveHighlight(ref);
      setActiveVerse(null);
  }

  const getHighlightColor = (verseNum: number) => {
      const ref = `${selectedBookId} ${chapter}:${verseNum}`;
      const highlight = highlights.find(h => h.ref === ref);
      if (!highlight) return '';
      
      switch (highlight.color) {
          case 'yellow': return 'bg-yellow-200 dark:bg-yellow-900/50';
          case 'green': return 'bg-emerald-200 dark:bg-emerald-900/50';
          case 'blue': return 'bg-blue-200 dark:bg-blue-900/50';
          case 'pink': return 'bg-rose-200 dark:bg-rose-900/50';
          default: return '';
      }
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors">
       <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-10 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
           
           <div className="flex items-center gap-2 w-full md:w-auto">
               <button 
                  onClick={onMenuClick}
                  className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
               >
                  <ArrowLeft size={24} />
               </button>
               <div className="bg-emerald-100 dark:bg-slate-800 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
                   <Book size={20} />
               </div>
               <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-serif-text">
                   {displayBookName} {chapter}
               </h1>
               
               <button
                  onClick={toggleAudio}
                  disabled={loading || !data}
                  className={`ml-2 p-2 rounded-full transition-all flex items-center justify-center ${isPlaying ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  title={isPlaying ? t('bible.audio.pause') : t('bible.audio.play')}
               >
                   {audioLoading ? <Loader2 size={20} className="animate-spin" /> : isPlaying ? <Pause size={20} fill="currentColor"/> : <Volume1 size={20}/>}
               </button>
           </div>

           <div className="flex items-center gap-2 w-full md:w-auto">
               <select 
                  value={selectedBookId} 
                  onChange={(e) => { setSelectedBookId(e.target.value); setChapter(1); }}
                  className="flex-1 md:w-48 p-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
               >
                   <optgroup label={t('bible.oldTestament')}>
                       {BIBLE_BOOKS.filter(b => b.testament === 'OT').map(b => (
                           <option key={b.id} value={b.id}>{getLocalizedBookName(b)}</option>
                       ))}
                   </optgroup>
                   <optgroup label={t('bible.newTestament')}>
                       {BIBLE_BOOKS.filter(b => b.testament === 'NT').map(b => (
                           <option key={b.id} value={b.id}>{getLocalizedBookName(b)}</option>
                       ))}
                   </optgroup>
               </select>

               <select
                  value={chapter}
                  onChange={(e) => setChapter(Number(e.target.value))}
                  className="w-20 p-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
               >
                   {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(num => (
                       <option key={num} value={num}>{num}</option>
                   ))}
               </select>
           </div>
       </header>

       {showNoKeyError && (
           <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-5 py-3 rounded-2xl flex items-center gap-3 shadow-2xl animate-pop-in">
               <AlertTriangle size={20} />
               <div className="flex flex-col">
                   <span className="text-xs font-bold">{t('common.warning')}</span>
                   <span className="text-xs opacity-90">{t('bible.needKey')}</span>
               </div>
           </div>
       )}

       {showBufferingWarning && (
           <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-indigo-900/90 text-white px-4 py-2 rounded-full flex items-center gap-3 shadow-xl backdrop-blur-sm animate-scale-in">
               <Loader2 size={16} className="animate-spin text-indigo-300" />
               <div className="flex flex-col">
                   <span className="text-xs font-bold">Downloading audio...</span>
                   <span className="text-[10px] text-indigo-300">Using high quality AI voice</span>
               </div>
           </div>
       )}

       <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
           <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-sm p-8 min-h-[60vh] mb-10">
               {loading ? (
                   <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                       <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                       <p>{t('bible.loading')}</p>
                   </div>
               ) : data ? (
                   <div className="font-serif-text leading-loose text-lg text-slate-800 dark:text-slate-200 pb-20">
                       <h2 className="text-3xl font-bold mb-6 text-center text-slate-900 dark:text-white border-b pb-4 border-slate-100 dark:border-slate-700">
                           {displayBookName} {chapter}
                       </h2>
                       
                       {data.verses.map((v) => {
                           const highlightColor = getHighlightColor(v.verse);
                           const thisChunkIndex = Math.floor((v.verse - 1) / VERSES_PER_CHUNK);
                           const isReading = currentChunkIndex === thisChunkIndex && isPlaying;
                           
                           return (
                               <span 
                                    key={v.verse} 
                                    onClick={() => setActiveVerse(activeVerse === v.verse ? null : v.verse)}
                                    className={`
                                        relative inline cursor-pointer rounded px-1 transition-all mx-0.5 duration-300
                                        ${highlightColor || 'hover:bg-slate-100 dark:hover:bg-slate-700'}
                                        ${isReading ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100' : ''}
                                    `}
                               >
                                   <sup className={`text-xs font-sans mr-1 select-none ${isReading ? 'text-indigo-500 font-bold' : 'text-slate-400'}`}>{v.verse}</sup>
                                   {v.text}
                                   
                                   {activeVerse === v.verse && (
                                       <span className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1.5 flex gap-1 items-center z-20 whitespace-nowrap animate-scale-in">
                                           <button onClick={(e) => { e.stopPropagation(); highlightVerse(v.verse, 'yellow'); }} className="w-6 h-6 rounded-full bg-yellow-400 hover:scale-110 transition-transform"></button>
                                           <button onClick={(e) => { e.stopPropagation(); highlightVerse(v.verse, 'green'); }} className="w-6 h-6 rounded-full bg-emerald-400 hover:scale-110 transition-transform"></button>
                                           <button onClick={(e) => { e.stopPropagation(); highlightVerse(v.verse, 'blue'); }} className="w-6 h-6 rounded-full bg-blue-400 hover:scale-110 transition-transform"></button>
                                           <button onClick={(e) => { e.stopPropagation(); highlightVerse(v.verse, 'pink'); }} className="w-6 h-6 rounded-full bg-rose-400 hover:scale-110 transition-transform"></button>
                                           
                                           {highlightColor && (
                                                <button onClick={(e) => { e.stopPropagation(); removeHighlight(v.verse); }} className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-red-500">
                                                    <X size={14} />
                                                </button>
                                           )}

                                           <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>

                                           <button
                                              onClick={(e) => { e.stopPropagation(); onOpenComposer(v.text, `${displayBookName} ${chapter}:${v.verse}`); setActiveVerse(null); }}
                                              className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-purple-600 px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded"
                                              title="Create Image"
                                           >
                                               <Image size={14} />
                                           </button>

                                           <button 
                                              onClick={(e) => { e.stopPropagation(); saveVerse(v.text, v.verse); }}
                                              className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded"
                                           >
                                               <Heart size={14} /> {t('bible.save')}
                                           </button>
                                       </span>
                                   )}
                                   {" "}
                               </span>
                           );
                       })}
                   </div>
               ) : (
                   <div className="text-center text-red-400 p-8">{t('bible.error')}</div>
               )}
           </div>
       </main>

       <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
           <button 
                onClick={handlePrev} 
                disabled={chapter <= 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-50 text-slate-700 dark:text-slate-300 font-medium hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
           >
               <ChevronLeft size={18} /> {t('bible.prev')}
           </button>
           <span className="text-sm text-slate-500 font-medium hidden md:block">{displayBookName} {chapter} / {selectedBook.chapters}</span>
           <button 
                onClick={handleNext} 
                disabled={chapter >= selectedBook.chapters}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-50 text-slate-700 dark:text-slate-300 font-medium hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
           >
               {t('bible.next')} <ChevronRight size={18} />
           </button>
       </footer>
    </div>
  );
};

export default BibleReader;
