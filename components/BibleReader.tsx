
import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { ChevronLeft, ChevronRight, Heart, X, ArrowLeft, Image, AlertTriangle, BookOpen, GripVertical } from 'lucide-react';
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
    language, onSaveItem, onMenuClick, highlights, onAddHighlight, onRemoveHighlight, onOpenComposer
}) => {
  const { t } = useTranslation();
  const [selectedBookId, setSelectedBookId] = useState('JHN');
  const [chapter, setChapter] = useState(1);
  const [data, setData] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeVerse, setActiveVerse] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState(18);
  
  // Positioning for contextual menu
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
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

  const handleVerseClick = (verseNum: number) => {
    if (activeVerse === verseNum) {
        setActiveVerse(null);
    } else {
        setActiveVerse(verseNum);
        // Menu position calculation
        requestAnimationFrame(() => {
            const verseEl = document.getElementById(`verse-${verseNum}`);
            if (!verseEl || !menuRef.current) return;
            
            const vRect = verseEl.getBoundingClientRect();
            const mRect = menuRef.current.getBoundingClientRect();
            const pad = 16;
            
            let tx = vRect.left + (vRect.width / 2) - (mRect.width / 2);
            let ty = vRect.top - mRect.height - 12;

            tx = Math.max(pad, Math.min(window.innerWidth - mRect.width - pad, tx));
            ty = Math.max(80, Math.min(window.innerHeight - mRect.height - 80, ty));

            setMenuPos({ x: tx, y: ty });
        });
    }
  };

  const handleNavigate = (bookId: string, chap: number) => {
    setSelectedBookId(bookId);
    setChapter(chap);
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'green': return 'bg-emerald-200/50 dark:bg-emerald-900/40 border-b-2 border-emerald-400 dark:border-emerald-700';
      case 'blue': return 'bg-blue-200/50 dark:bg-blue-900/40 border-b-2 border-blue-400 dark:border-blue-700';
      case 'pink': return 'bg-rose-200/50 dark:bg-rose-900/40 border-b-2 border-rose-400 dark:border-rose-700';
      default: return 'bg-amber-200/50 dark:bg-amber-900/40 border-b-2 border-amber-400 dark:border-amber-700';
    }
  };

  const getMarkerClass = (color: string) => {
    switch (color) {
      case 'green': return 'bg-emerald-400';
      case 'blue': return 'bg-blue-400';
      case 'pink': return 'bg-rose-400';
      default: return 'bg-amber-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7] dark:bg-slate-950 transition-colors relative touch-none">
       <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 px-4 py-3 sticky top-0 z-20 shadow-sm flex items-center justify-between shrink-0">
           <div className="flex items-center gap-3">
               <button onClick={onMenuClick} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><ArrowLeft size={20} /></button>
               <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
               <Navigation currentBookId={selectedBookId} currentChapter={chapter} onNavigate={handleNavigate} language={language} />
           </div>
       </header>

       <main ref={contentRef} className="flex-1 overflow-y-auto scroll-smooth">
           <div className="max-w-3xl mx-auto px-6 py-12 md:py-16 min-h-[80vh] relative">
               {loading ? (
                   <div className="flex flex-col items-center justify-center h-64 text-slate-400 animate-pulse">
                       <BookOpen size={48} className="mb-4 text-slate-200 dark:text-slate-800"/>
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

                       <div className="font-serif-text leading-[2.2] text-slate-800 dark:text-slate-300" style={{ fontSize: `${fontSize}px` }}>
                           {data.verses.map((v: any) => {
                               const verseRef = `${selectedBookId} ${chapter}:${v.verse}`;
                               const highlight = highlights.find((h: BibleHighlight) => h.ref === verseRef);
                               const isActive = activeVerse === v.verse;
                               
                               return (
                                   <React.Fragment key={v.verse}>
                                       <span 
                                           id={`verse-${v.verse}`} 
                                           onClick={() => handleVerseClick(v.verse)} 
                                           className={`relative inline cursor-pointer rounded px-1 -mx-1 transition-all duration-300 ${highlight ? getColorClass(highlight.color) : 'hover:bg-slate-100 dark:hover:bg-white/5'} ${isActive ? 'bg-indigo-100 dark:bg-white/10 ring-2 ring-indigo-500/40 rounded shadow-sm' : ''}`}
                                       >
                                           <sup className="text-[0.6em] font-sans mr-1 text-slate-400 dark:text-slate-600 font-bold select-none flex-inline items-center gap-1">
                                               {v.verse}
                                           </sup>
                                           {v.text}
                                       </span>
                                       {' '}
                                   </React.Fragment>
                               );
                           })}
                       </div>

                       {activeVerse && (
                           <div ref={menuRef} 
                               style={{ left: `${menuPos.x}px`, top: `${menuPos.y}px`, touchAction: 'none' }}
                               className={`fixed bg-slate-900 text-white rounded-[2rem] shadow-[0_30px_60px_-10px_rgba(0,0,0,0.5)] p-2 flex flex-nowrap whitespace-nowrap gap-1.5 items-center z-50 animate-pop-in border border-slate-700/50 backdrop-blur-2xl bg-opacity-95 select-none w-fit min-w-max max-w-[calc(100vw-24px)] overflow-x-auto no-scrollbar`}>
                               <div className="pl-1.5 pr-0.5 text-slate-500 flex items-center justify-center shrink-0"><GripVertical size={16} strokeWidth={3} /></div>
                               <div className="px-2 border-r border-white/10 font-bold text-[10px] font-serif-text text-indigo-300 uppercase tracking-widest shrink-0">v.{activeVerse}</div>
                               
                               <div className="flex gap-1 px-1 shrink-0">
                                   {(['yellow', 'green', 'blue', 'pink'] as const).map((color) => (
                                      <button key={color} onClick={(e) => { e.stopPropagation(); onAddHighlight({id: uuidv4(), ref: `${selectedBookId} ${chapter}:${activeVerse}`, color}); setActiveVerse(null); }} className={`w-7 h-7 rounded-full ${getMarkerClass(color)} hover:scale-125 transition-transform shadow-md ring-1 ring-white/10 active:scale-95`} />
                                   ))}
                               </div>
                               <div className="w-px h-6 bg-white/10 mx-0.5 shrink-0"></div>
                               <div className="flex items-center gap-0.5 shrink-0">
                                   <button onClick={(e) => { e.stopPropagation(); onOpenComposer(data.verses.find(v=>v.verse===activeVerse)?.text || '', `${displayBookName} ${chapter}:${activeVerse}`); setActiveVerse(null);}} className="p-2 hover:bg-white/10 rounded-full text-indigo-300 transition-all active:scale-90" title={t('dailyVerse.createImage')}><Image size={18}/></button>
                                   <button onClick={(e) => { e.stopPropagation(); onSaveItem({id: uuidv4(), type:'verse', content: data.verses.find(v=>v.verse===activeVerse)?.text || '', reference:`${displayBookName} ${chapter}:${activeVerse}`, date:Date.now()}); setActiveVerse(null);}} className="p-2 hover:bg-white/10 rounded-full text-rose-400 transition-all active:scale-90" title={t('bible.save')}><Heart size={18}/></button>
                                   <button onClick={(e) => { e.stopPropagation(); onRemoveHighlight(`${selectedBookId} ${chapter}:${activeVerse}`); setActiveVerse(null); }} className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-full transition-all active:scale-90" title={t('bible.removeHighlight')}><X size={18}/></button>
                               </div>
                               <div className="w-px h-6 bg-white/10 mx-0.5 shrink-0 hidden sm:block"></div>
                               <button onClick={() => setActiveVerse(null)} className="p-2 hover:bg-white/10 rounded-full text-slate-500 transition-all ml-0.5"><X size={16} strokeWidth={3} /></button>
                           </div>
                       )}
                   </div>
               ) : (
                   <div className="text-center text-slate-400 p-20 flex flex-col items-center gap-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl mt-10">
                       <AlertTriangle size={48} className="opacity-50"/><p>{t('bible.error')}</p>
                   </div>
               )}
           </div>
       </main>

       <footer className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 p-4 pb-safe z-10 shrink-0">
           <div className="max-w-3xl mx-auto flex items-center justify-between">
               <button onClick={() => setChapter(Math.max(1, chapter - 1))} disabled={chapter <= 1} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-100 transition-all text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300"><ChevronLeft size={16} /> {t('bible.prev')}</button>
               <div className="flex gap-2">
                   <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 text-xs font-bold">A-</button>
                   <button onClick={() => setFontSize(Math.min(32, fontSize + 2))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-lg font-bold">A+</button>
               </div>
               <button onClick={() => setChapter(Math.min(selectedBook.chapters, chapter + 1))} disabled={chapter >= selectedBook.chapters} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">{t('bible.next')} <ChevronRight size={16} /></button>
           </div>
       </footer>
    </div>
  );
};

export default BibleReader;
