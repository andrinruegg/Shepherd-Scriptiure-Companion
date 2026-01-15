
import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { ChevronLeft, ChevronRight, Heart, X, ArrowLeft, Pause, Volume1, Image, Loader2, AlertTriangle, Key, BookOpen, GripVertical } from 'lucide-react';
import { BIBLE_BOOKS, fetchChapter } from '../services/bibleService';
import { BibleChapter, SavedItem, BibleHighlight } from '../types';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import Navigation from './Navigation';

interface BibleReaderProps {
    language: string;
    onSaveItem: (item: SavedItem) => void;
    onMenuClick: () => void;
    highlights: BibleHighlight[];
    onAddHighlight: (h: BibleHighlight) => void;
    onRemoveHighlight: (ref: string) => void;
    onOpenComposer: (t: string, r: string) => void;
    hasApiKey: boolean;
    onTriggerKeyWarning?: () => void;
}

const BibleReader: React.FC<BibleReaderProps> = ({ 
    language, onSaveItem, onMenuClick, highlights, onAddHighlight, onRemoveHighlight, onOpenComposer, hasApiKey, onTriggerKeyWarning
}) => {
  const { t } = useTranslation();
  const [selectedBookId, setSelectedBookId] = useState('JHN');
  const [chapter, setChapter] = useState(1);
  const [data, setData] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeVerse, setActiveVerse] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [showKeyError, setShowKeyError] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  
  const contentRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedBook = useMemo(() => {
      return BIBLE_BOOKS.find((b: any) => b.id === selectedBookId) || BIBLE_BOOKS[42]; 
  }, [selectedBookId]);

  const displayBookName = useMemo(() => {
      if (language === 'German') return selectedBook.names.de;
      if (language === 'Romanian') return selectedBook.names.ro;
      return selectedBook.names.en;
  }, [selectedBook, language]);

  useEffect(() => {
    const loadChapter = async () => {
      if (!selectedBook) return;
      setLoading(true);
      setActiveVerse(null);
      const safeChapter = Math.min(Math.max(1, chapter), selectedBook.chapters);
      if (safeChapter !== chapter) {
          setChapter(safeChapter);
          return;
      }
      
      try {
        const res = await fetchChapter(selectedBook.name, safeChapter, language);
        setData(res);
        if (contentRef.current) contentRef.current.scrollTop = 0;
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadChapter();
  }, [selectedBook, chapter, language]);

  const handleNavigate = (bookId: string, chap: number) => {
    setSelectedBookId(bookId);
    setChapter(chap);
  };

  const handleAudioToggle = () => {
    if (!hasApiKey) {
      if (onTriggerKeyWarning) onTriggerKeyWarning();
      return;
    }
    setIsPlaying(!isPlaying);
  };

  useLayoutEffect(() => {
    if (activeVerse && menuRef.current) {
        requestAnimationFrame(() => {
            if (!menuRef.current) return;
            const rect = menuRef.current.getBoundingClientRect();
            const pad = 12;
            const vW = window.innerWidth;
            const vH = window.innerHeight;
            let targetX = (vW - rect.width) / 2;
            let targetY = (vH - rect.height) / 2;
            const minX = pad;
            const maxX = Math.max(pad, vW - rect.width - pad);
            const minY = pad;
            const maxY = Math.max(pad, vH - rect.height - pad);
            targetX = Math.max(minX, Math.min(maxX, targetX));
            targetY = Math.max(minY, Math.min(maxY, targetY));
            setMenuPos({ x: targetX, y: targetY });
        });
    }
  }, [activeVerse]);

  const handleVerseClick = (verseNum: number) => {
    if (activeVerse === verseNum) {
        setActiveVerse(null);
    } else {
        setMenuPos({ x: 0, y: 0 });
        setActiveVerse(verseNum);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - menuPos.x, y: e.clientY - menuPos.y };
    target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    let nextX = e.clientX - dragOffset.current.x;
    let nextY = e.clientY - dragOffset.current.y;
    const pad = 12;
    const minX = pad;
    const maxX = window.innerWidth - rect.width - pad;
    const minY = pad;
    const maxY = window.innerHeight - rect.height - pad;
    nextX = Math.max(minX, Math.min(maxX, nextX));
    nextY = Math.max(minY, Math.min(maxY, nextY));
    setMenuPos({ x: nextX, y: nextY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'green': return 'bg-emerald-200/50 dark:bg-emerald-900/40 border-b-2 border-emerald-400';
      case 'blue': return 'bg-blue-200/50 dark:bg-blue-900/40 border-b-2 border-blue-400';
      case 'pink': return 'bg-rose-200/50 dark:bg-rose-900/40 border-b-2 border-rose-400';
      default: return 'bg-amber-200/50 dark:bg-amber-900/40 border-b-2 border-amber-400';
    }
  };

  const getMarkerClass = (color: string) => {
    switch (color) {
      case 'green': return 'bg-emerald-500';
      case 'blue': return 'bg-blue-500';
      case 'pink': return 'bg-rose-500';
      default: return 'bg-amber-500';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] dark:bg-slate-950 transition-colors relative touch-none">
       <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 px-4 py-3 sticky top-0 z-20 shadow-sm flex items-center justify-between shrink-0">
           <div className="flex items-center gap-3">
               <button onClick={onMenuClick} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"><ArrowLeft size={20} /></button>
               <Navigation 
                  currentBookId={selectedBookId} 
                  currentChapter={chapter} 
                  onNavigate={handleNavigate}
                  language={language}
               />
           </div>
           
           <div className="flex items-center gap-2">
               <button 
                  onClick={handleAudioToggle} 
                  className={`p-2.5 rounded-xl transition-all flex items-center gap-2 ${isPlaying ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 text-emerald-700 hover:bg-emerald-50'}`}
               >
                  {audioLoading ? <Loader2 size={18} className="animate-spin" /> : isPlaying ? <Pause size={18} fill="currentColor"/> : <Volume1 size={18}/>}
                  <span className="text-xs font-bold hidden sm:inline">{isPlaying ? 'Playing' : 'Listen'}</span>
               </button>
           </div>
       </header>

       <main ref={contentRef} className="flex-1 overflow-y-auto scroll-smooth">
           <div className="max-w-3xl mx-auto px-6 py-12 md:py-16 min-h-[80vh] relative">
               {loading ? (
                   <div className="flex flex-col items-center justify-center h-64 text-slate-400 animate-pulse">
                       <BookOpen size={48} className="mb-4 text-emerald-100 dark:text-emerald-900"/>
                       <p className="text-sm font-bold uppercase tracking-widest">{t('bible.loading')}</p>
                   </div>
               ) : data ? (
                   <div className="animate-fade-in">
                       <div className="text-center mb-12 pb-8 border-b border-slate-100 dark:border-slate-800">
                           <h1 className="font-serif-text text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                               {displayBookName} {chapter}
                           </h1>
                           <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-[0.3em]">
                               {data.translation_id || 'WEB'} • {language}
                           </p>
                       </div>

                       <div 
                          className="font-serif-text leading-[2.2] text-slate-800 dark:text-slate-300"
                          style={{ fontSize: `${fontSize}px` }}
                       >
                           {data.verses.map((v: any) => {
                               const verseRef = `${selectedBookId} ${chapter}:${v.verse}`;
                               const highlight = highlights.find((h: BibleHighlight) => h.ref === verseRef);
                               const isActive = activeVerse === v.verse;
                               return (
                                   <React.Fragment key={v.verse}>
                                       <span 
                                          id={`verse-${v.verse}`}
                                          onClick={() => handleVerseClick(v.verse)} 
                                          className={`relative inline cursor-pointer rounded px-1 -mx-1 transition-colors duration-200 ${highlight ? getColorClass(highlight.color) : 'hover:bg-slate-100 dark:hover:bg-white/5'} ${isActive ? 'bg-emerald-50 dark:bg-emerald-900/10 ring-2 ring-emerald-500/20' : ''}`}
                                       >
                                           <sup className="text-[0.6em] font-sans mr-1 text-slate-400 dark:text-slate-600 font-bold select-none">{v.verse}</sup>
                                           {v.text}
                                       </span>
                                       {' '}
                                   </React.Fragment>
                               );
                           })}
                       </div>

                       {activeVerse && (
                           <div 
                               ref={menuRef}
                               onPointerDown={handlePointerDown}
                               onPointerMove={handlePointerMove}
                               onPointerUp={handlePointerUp}
                               style={{ left: `${menuPos.x}px`, top: `${menuPos.y}px`, touchAction: 'none', visibility: menuPos.x === 0 ? 'hidden' : 'visible' }}
                               className="fixed bg-slate-900 text-white rounded-[2rem] shadow-2xl p-2 flex gap-1.5 items-center z-50 animate-pop-in border border-slate-700 backdrop-blur-2xl"
                           >
                               <div className="pl-1.5 text-slate-500 shrink-0"><GripVertical size={16} /></div>
                               <div className="px-2 border-r border-white/10 font-bold text-[10px] text-amber-400 uppercase tracking-widest">v.{activeVerse}</div>
                               <div className="flex gap-1 px-1 shrink-0">
                                   {(['yellow', 'green', 'blue', 'pink'] as const).map((color) => (
                                      <button key={color} onClick={() => { onAddHighlight({id: uuidv4(), ref: `${selectedBookId} ${chapter}:${activeVerse}`, color}); setActiveVerse(null); }} className={`w-7 h-7 rounded-full ${getMarkerClass(color)} hover:scale-110 shadow-md ring-1 ring-white/10`} />
                                   ))}
                               </div>
                               <div className="flex items-center gap-0.5 shrink-0 px-1">
                                   <button onClick={() => { onOpenComposer(data.verses.find(v=>v.verse===activeVerse)?.text || '', `${displayBookName} ${chapter}:${activeVerse}`); setActiveVerse(null);}} className="p-2 hover:bg-white/10 rounded-full text-emerald-400"><Image size={18}/></button>
                                   <button onClick={() => { onSaveItem({id: uuidv4(), type:'verse', content: data.verses.find(v=>v.verse===activeVerse)?.text || '', reference:`${displayBookName} ${chapter}:${activeVerse}`, date:Date.now()}); setActiveVerse(null);}} className="p-2 hover:bg-white/10 rounded-full text-rose-400"><Heart size={18}/></button>
                                   <button onClick={() => { onRemoveHighlight(`${selectedBookId} ${chapter}:${activeVerse}`); setActiveVerse(null); }} className="p-2 hover:bg-red-500/20 text-slate-400"><X size={18}/></button>
                               </div>
                           </div>
                       )}
                   </div>
               ) : (
                   <div className="text-center text-slate-400 p-20 flex flex-col items-center gap-4 mt-10">
                       <AlertTriangle size={48} className="opacity-50 text-amber-500"/>
                       <p>{t('bible.error')}</p>
                   </div>
               )}
           </div>
       </main>

       <footer className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 p-4 pb-safe z-10 shrink-0">
           <div className="max-w-3xl mx-auto flex items-center justify-between">
               <button onClick={() => setChapter(Math.max(1, chapter - 1))} disabled={chapter <= 1} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-xs font-black uppercase tracking-widest text-[#7c4a32]"><ChevronLeft size={16} /> {t('bible.prev')}</button>
               <div className="flex gap-2">
                   <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 text-xs font-bold">A-</button>
                   <button onClick={() => setFontSize(Math.min(32, fontSize + 2))} className="w-8 h-8 rounded-lg hover:bg-slate-100 text-[#7c4a32] text-lg font-bold">A+</button>
               </div>
               <button onClick={() => setChapter(Math.min(selectedBook.chapters, chapter + 1))} disabled={chapter >= selectedBook.chapters} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">{t('bible.next')} <ChevronRight size={16} /></button>
           </div>
       </footer>
    </div>
  );
};

export default BibleReader;
