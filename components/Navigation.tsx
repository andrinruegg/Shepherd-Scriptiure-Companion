import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BIBLE_BOOKS } from '../services/bibleService';
import { ChevronDown, Search, X, Book, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface NavigationProps {
  currentBookId: string;
  currentChapter: number;
  onNavigate: (bookId: string, chapter: number) => void;
  language: string;
}

const Navigation: React.FC<NavigationProps> = ({ currentBookId, currentChapter, onNavigate, language }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChaptersMobile, setShowChaptersMobile] = useState(false);
  const [menuAlignment, setMenuAlignment] = useState<'left' | 'right'>('left');
  
  const currentBookObj = useMemo(() => 
    BIBLE_BOOKS.find(b => b.id === currentBookId) || BIBLE_BOOKS[0]
  , [currentBookId]);

  const [selectedBookForNav, setSelectedBookForNav] = useState(currentBookObj);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setSelectedBookForNav(currentBookObj);
  }, [currentBookObj]);

  useEffect(() => {
    if (isOpen) {
      setShowChaptersMobile(false);
      setSearchQuery('');
      
      // Calculate alignment to prevent overflow on tablets/small desktops
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const menuWidth = 600; // Target width
        
        // If there isn't enough space on the right, align to the right edge of the trigger
        if (rect.left + menuWidth > viewportWidth - 20) {
          setMenuAlignment('right');
        } else {
          setMenuAlignment('left');
        }
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth >= 768 && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      if (window.innerWidth < 768) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const getBookName = (book: typeof BIBLE_BOOKS[0]) => {
    if (language === 'German') return book.names.de;
    if (language === 'Romanian') return book.names.ro;
    return book.names.en;
  };

  const filteredBooks = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return BIBLE_BOOKS.filter(b => 
      b.names.en.toLowerCase().includes(q) ||
      b.names.de.toLowerCase().includes(q) ||
      b.names.ro.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleBookClick = (book: typeof BIBLE_BOOKS[0]) => {
    setSelectedBookForNav(book);
    setSearchQuery(''); 
    setShowChaptersMobile(true);
  };

  const handleChapterClick = (chapter: number) => {
    onNavigate(selectedBookForNav.id, chapter);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors rounded-xl text-slate-800 dark:text-white font-serif-text max-w-[180px] sm:max-w-none shadow-sm active:scale-95"
      >
        <Book size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="font-bold text-sm md:text-lg tracking-tight truncate">
          {getBookName(currentBookObj)} {currentChapter}
        </span>
        <ChevronDown size={16} className={`transition-transform duration-300 opacity-50 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay - specifically high Z and solid for mobile viewport */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] md:hidden" onClick={() => setIsOpen(false)} />
          
          <div 
            ref={menuRef}
            className={`
              fixed top-0 left-0 right-0 bottom-0 z-[110] flex flex-col bg-white dark:bg-slate-900 h-[100dvh]
              md:absolute md:top-full md:left-auto md:right-auto md:bottom-auto md:h-[500px] md:w-[600px] md:max-w-[calc(100vw-24px)] md:mt-3
              ${menuAlignment === 'left' ? 'md:left-0' : 'md:right-0'}
              md:rounded-[2rem] md:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] md:border md:border-slate-200 md:dark:border-slate-800
              animate-pop-in overflow-hidden
            `}
          >
            {/* Modal Header - Uses safe areas for mobile */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-[#fdfbf7] dark:bg-slate-950 flex items-center justify-between shrink-0 pt-[env(safe-area-inset-top,1rem)]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <Book size={18} />
                </div>
                <h3 className="font-black text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-[0.2em]">{t('bible.selectBook')}</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                <X size={22} strokeWidth={3} />
              </button>
            </div>

            <div className="flex flex-col md:flex-row flex-1 overflow-hidden h-full">
              {/* Left Column: Book Search & List */}
              <div className={`
                  flex-1 md:w-5/12 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 min-h-0
                  ${showChaptersMobile ? 'hidden md:flex' : 'flex'}
              `}>
                <div className="p-3 bg-white dark:bg-slate-900 shrink-0">
                  <div className="relative group">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="text" 
                      placeholder={t('bible.searchBooks')} 
                      className="w-full pl-10 pr-4 py-3 text-base md:text-sm bg-slate-100 dark:bg-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#d2b48c] dark:text-white transition-all border border-transparent focus:bg-white dark:focus:bg-slate-850"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus={window.innerWidth >= 768}
                    />
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-0.5 custom-scrollbar">
                  {filteredBooks.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => handleBookClick(book)}
                      className={`w-full text-left px-4 py-4 md:py-3 rounded-xl text-base md:text-sm transition-all font-medium flex justify-between items-center group ${
                        selectedBookForNav.id === book.id 
                          ? 'bg-[#7c4a32] text-white shadow-lg shadow-[#7c4a32]/20 font-bold' 
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate">{getBookName(book)}</span>
                      <span className={`md:hidden transition-transform group-hover:translate-x-1 ${selectedBookForNav.id === book.id ? 'text-white' : 'text-slate-300'}`}>›</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Chapter Selection */}
              <div className={`
                  flex-1 md:w-7/12 bg-slate-50/50 dark:bg-slate-950/30 flex flex-col min-h-0
                  ${!showChaptersMobile ? 'hidden md:flex' : 'flex'}
              `}>
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shrink-0 flex items-center justify-between shadow-sm z-10">
                  <button 
                    onClick={() => setShowChaptersMobile(false)}
                    className="md:hidden p-2 -ml-2 text-slate-500 hover:text-[#7c4a32] dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="text-center flex-1 min-w-0">
                    <span className="text-lg md:text-base font-bold text-slate-900 dark:text-white block truncate px-2 font-serif-text">
                      {getBookName(selectedBookForNav)}
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block uppercase tracking-[0.2em] font-black mt-0.5">
                      {selectedBookForNav.chapters} {t('bible.chapters')}
                    </span>
                  </div>
                  <div className="w-8 md:hidden"></div>
                </div>

                <div className="overflow-y-auto flex-1 p-5 md:p-6 custom-scrollbar pb-32 md:pb-6">
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {Array.from({ length: selectedBookForNav.chapters }, (_, i) => i + 1).map((chapter) => (
                      <button
                        key={chapter}
                        onClick={() => handleChapterClick(chapter)}
                        className={`aspect-square flex items-center justify-center rounded-2xl text-base md:text-sm font-bold transition-all shadow-sm active:scale-90 transform hover:-translate-y-0.5 ${
                          selectedBookForNav.id === currentBookId && chapter === currentChapter
                            ? 'bg-[#7c4a32] text-white shadow-[#7c4a32]/30 ring-2 ring-amber-200 dark:ring-amber-900 scale-105'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#7c4a32] hover:text-[#7c4a32] hover:shadow-md'
                        }`}
                      >
                        {chapter}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Navigation;