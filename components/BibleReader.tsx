import React, { useState, useEffect } from 'react';
import { Book, ChevronLeft, ChevronRight, Heart, X, Menu } from 'lucide-react';
import { BIBLE_BOOKS, fetchChapter } from '../services/bibleService';
import { BibleChapter, SavedItem, BibleHighlight } from '../types';
import { translations } from '../utils/translations';
import { v4 as uuidv4 } from 'uuid';

interface BibleReaderProps {
  language: string;
  onSaveItem: (item: SavedItem) => void;
  onMenuClick: () => void;
  highlights: BibleHighlight[];
  onAddHighlight: (highlight: BibleHighlight) => void;
  onRemoveHighlight: (ref: string) => void;
}

const BibleReader: React.FC<BibleReaderProps> = ({ 
    language, 
    onSaveItem, 
    onMenuClick, 
    highlights, 
    onAddHighlight, 
    onRemoveHighlight 
}) => {
  const [selectedBookId, setSelectedBookId] = useState('JHN');
  const [chapter, setChapter] = useState(1);
  const [data, setData] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeVerse, setActiveVerse] = useState<number | null>(null);
  
  const t = translations[language]?.bible || translations['English'].bible;
  
  const selectedBook = BIBLE_BOOKS.find(b => b.id === selectedBookId) || BIBLE_BOOKS[0];

  useEffect(() => {
    const loadChapter = async () => {
      setLoading(true);
      const result = await fetchChapter(selectedBook.name, chapter, language);
      setData(result);
      setLoading(false);
      setActiveVerse(null);
    };
    loadChapter();
  }, [selectedBookId, chapter, language]);

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
      const reference = `${selectedBook.name} ${chapter}:${verseNum}`;
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
       {/* Bible Header */}
       <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-10 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
           
           <div className="flex items-center gap-2 w-full md:w-auto">
               <button 
                  onClick={onMenuClick}
                  className="md:hidden p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
               >
                  <Menu size={24} />
               </button>
               <div className="bg-indigo-100 dark:bg-slate-800 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                   <Book size={20} />
               </div>
               <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-serif-text">
                   {selectedBook.name} {chapter}
               </h1>
           </div>

           <div className="flex items-center gap-2 w-full md:w-auto">
               {/* Book Selector */}
               <select 
                  value={selectedBookId} 
                  onChange={(e) => { setSelectedBookId(e.target.value); setChapter(1); }}
                  className="flex-1 md:w-48 p-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
               >
                   <optgroup label={t.oldTestament}>
                       {BIBLE_BOOKS.filter(b => b.testament === 'OT').map(b => (
                           <option key={b.id} value={b.id}>{b.name}</option>
                       ))}
                   </optgroup>
                   <optgroup label={t.newTestament}>
                       {BIBLE_BOOKS.filter(b => b.testament === 'NT').map(b => (
                           <option key={b.id} value={b.id}>{b.name}</option>
                       ))}
                   </optgroup>
               </select>

               {/* Chapter Selector */}
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

       {/* Reader Area */}
       <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
           <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-sm p-8 min-h-[60vh] mb-10">
               {loading ? (
                   <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                       <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                       <p>{t.loading}</p>
                   </div>
               ) : data ? (
                   <div className="font-serif-text leading-loose text-lg text-slate-800 dark:text-slate-200 pb-20">
                       <h2 className="text-3xl font-bold mb-6 text-center text-slate-900 dark:text-white border-b pb-4 border-slate-100 dark:border-slate-700">
                           {selectedBook.name} {chapter}
                       </h2>
                       
                       {data.verses.map((v) => {
                           const highlightColor = getHighlightColor(v.verse);
                           return (
                               <span 
                                    key={v.verse} 
                                    onClick={() => setActiveVerse(activeVerse === v.verse ? null : v.verse)}
                                    className={`
                                        relative inline cursor-pointer rounded px-1 transition-colors mx-0.5
                                        ${highlightColor || 'hover:bg-slate-100 dark:hover:bg-slate-700'}
                                    `}
                               >
                                   <sup className="text-xs text-slate-400 font-sans mr-1 select-none">{v.verse}</sup>
                                   {v.text}
                                   
                                   {/* Floating Action Menu */}
                                   {activeVerse === v.verse && (
                                       <span className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1.5 flex gap-1 items-center z-20 whitespace-nowrap animate-scale-in">
                                           {/* Highlight Colors */}
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
                                              onClick={(e) => { e.stopPropagation(); saveVerse(v.text, v.verse); }}
                                              className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded"
                                           >
                                               <Heart size={14} /> {t.save}
                                           </button>
                                       </span>
                                   )}
                                   {" "}
                               </span>
                           );
                       })}
                   </div>
               ) : (
                   <div className="text-center text-red-400 p-8">{t.error}</div>
               )}
           </div>
       </main>

       {/* Footer Navigation */}
       <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
           <button 
                onClick={handlePrev} 
                disabled={chapter <= 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-50 text-slate-700 dark:text-slate-300 font-medium hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
           >
               <ChevronLeft size={18} /> {t.prev}
           </button>
           <span className="text-sm text-slate-500 font-medium hidden md:block">{selectedBook.name} {chapter} / {selectedBook.chapters}</span>
           <button 
                onClick={handleNext} 
                disabled={chapter >= selectedBook.chapters}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-50 text-slate-700 dark:text-slate-300 font-medium hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
           >
               {t.next} <ChevronRight size={18} />
           </button>
       </footer>
    </div>
  );
};

export default BibleReader;