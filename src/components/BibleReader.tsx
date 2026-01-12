
import React, { useState, useEffect } from 'react';
import { Book, ChevronLeft, ChevronRight, Heart, X, ArrowLeft, Pause, Volume1, Image, Loader2, AlertTriangle } from 'lucide-react';
import { BIBLE_BOOKS, fetchChapter } from '../services/bibleService';
import { BibleChapter, SavedItem, BibleHighlight } from '../types';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { generateSpeech } from '../services/geminiService';

const BibleReader: React.FC<{ language: string, onSaveItem: (item: SavedItem) => void, onMenuClick: () => void, highlights: BibleHighlight[], onAddHighlight: (h: BibleHighlight) => void, onRemoveHighlight: (ref: string) => void, onOpenComposer: (t: string, r: string) => void, hasApiKey: boolean }> = ({ 
    language, onSaveItem, onMenuClick, highlights, onAddHighlight, onRemoveHighlight, onOpenComposer, hasApiKey
}) => {
  const { t } = useTranslation();
  const [selectedBookId, setSelectedBookId] = useState('JHN');
  const [chapter, setChapter] = useState(1);
  const [data, setData] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeVerse, setActiveVerse] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  
  const selectedBook = BIBLE_BOOKS.find((b: any) => b.id === selectedBookId) || BIBLE_BOOKS[0];
  const displayBookName = language === 'German' ? selectedBook.names.de : language === 'Romanian' ? selectedBook.names.ro : selectedBook.names.en;

  useEffect(() => {
    const loadChapter = async () => {
      setLoading(true);
      setData(await fetchChapter(selectedBook.name, chapter, language));
      setLoading(false);
    };
    loadChapter();
  }, [selectedBookId, chapter, language]);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors">
       <header className="bg-white dark:bg-slate-950 border-b dark:border-slate-800 p-4 sticky top-0 z-10 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="flex items-center gap-2 w-full md:w-auto">
               <button onClick={onMenuClick} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><ArrowLeft size={24} /></button>
               <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-xl text-emerald-600 dark:text-emerald-400"><Book size={20} /></div>
               <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-serif-text">{displayBookName} {chapter}</h1>
               <button onClick={() => setIsPlaying(!isPlaying)} className={`ml-2 p-2 rounded-full transition-all ${isPlaying ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{audioLoading ? <Loader2 size={20} className="animate-spin" /> : isPlaying ? <Pause size={20} fill="currentColor"/> : <Volume1 size={20}/>}</button>
           </div>
           <div className="flex items-center gap-2 w-full md:w-auto">
               <select value={selectedBookId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setSelectedBookId(e.target.value); setChapter(1); }} className="flex-1 md:w-48 p-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none">
                   <optgroup label={t('bible.oldTestament')}>{BIBLE_BOOKS.filter((b: any) => b.testament === 'OT').map((b: any) => (<option key={b.id} value={b.id}>{language === 'German' ? b.names.de : language === 'Romanian' ? b.names.ro : b.names.en}</option>))}</optgroup>
                   <optgroup label={t('bible.newTestament')}>{BIBLE_BOOKS.filter((b: any) => b.testament === 'NT').map((b: any) => (<option key={b.id} value={b.id}>{language === 'German' ? b.names.de : language === 'Romanian' ? b.names.ro : b.names.en}</option>))}</optgroup>
               </select>
               <select value={chapter} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setChapter(Number(e.target.value))} className="w-20 p-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none">
                   {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((num: number) => (<option key={num} value={num}>{num}</option>))}
               </select>
           </div>
       </header>

       <main className="flex-1 overflow-y-auto p-4 md:p-8">
           <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border dark:border-slate-700 p-8 min-h-[60vh] mb-10">
               {loading ? (<div className="flex flex-col items-center justify-center h-64 text-slate-400"><Loader2 size={40} className="animate-spin mb-4"/><p className="text-sm font-bold uppercase tracking-widest">{t('bible.loading')}</p></div>) : data ? (
                   <div className="font-serif-text leading-[2] text-lg text-slate-800 dark:text-slate-200 pb-20">
                       <h2 className="text-3xl font-bold mb-8 text-center text-slate-900 dark:text-white border-b dark:border-slate-700 pb-6">{displayBookName} {chapter}</h2>
                       {data.verses.map((v: any) => (
                           <span key={v.verse} onClick={() => setActiveVerse(activeVerse === v.verse ? null : v.verse)} className={`relative inline cursor-pointer rounded px-1 transition-all mx-0.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 ${highlights.find((h: BibleHighlight)=>h.ref===`${selectedBookId} ${chapter}:${v.verse}`) ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''}`}>
                               <sup className="text-[10px] font-sans mr-1 text-slate-400 font-black">{v.verse}</sup>{v.text}
                               {activeVerse === v.verse && (
                                   <span className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-2xl shadow-2xl p-2 flex gap-1 items-center z-20 whitespace-nowrap animate-scale-in">
                                       <button onClick={() => onAddHighlight({id: uuidv4(), ref:`${selectedBookId} ${chapter}:${v.verse}`, color:'yellow'})} className="w-7 h-7 rounded-full bg-yellow-400 hover:scale-110 shadow-sm"></button>
                                       <button onClick={() => {onOpenComposer(v.text, `${displayBookName} ${chapter}:${v.verse}`); setActiveVerse(null);}} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-purple-600 transition-colors"><Image size={16}/></button>
                                       <button onClick={() => {onSaveItem({id: uuidv4(), type:'verse', content:v.text, reference:`${displayBookName} ${chapter}:${v.verse}`, date:Date.now()}); setActiveVerse(null);}} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-rose-500 transition-colors"><Heart size={16}/></button>
                                       <div className="w-px h-6 bg-slate-100 dark:bg-slate-700 mx-1"></div>
                                       <button onClick={() => setActiveVerse(null)} className="p-1.5 text-slate-400"><X size={16}/></button>
                                   </span>
                               )}
                           </span>
                       ))}
                   </div>
               ) : <div className="text-center text-red-400 p-8 flex flex-col items-center gap-3"><AlertTriangle size={40}/><p>{t('bible.error')}</p></div>}
           </div>
       </main>

       <footer className="bg-white dark:bg-slate-950 border-t dark:border-slate-800 p-4 flex items-center justify-between z-10">
           <button onClick={() => setChapter(chapter-1)} disabled={chapter <= 1} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 disabled:opacity-50 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300"><ChevronLeft size={16} /> {t('bible.prev')}</button>
           <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest hidden md:block">{displayBookName} {chapter} / {selectedBook.chapters}</span>
           <button onClick={() => setChapter(chapter+1)} disabled={chapter >= selectedBook.chapters} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 disabled:opacity-50 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">{t('bible.next')} <ChevronRight size={16} /></button>
       </footer>
    </div>
  );
};

export default BibleReader;
