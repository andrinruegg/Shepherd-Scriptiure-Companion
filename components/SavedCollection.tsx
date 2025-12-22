import React, { useState } from 'react';
import { Trash2, Heart, MessageSquare, BookOpen, Menu, Feather, Image, ArrowLeft, Star } from 'lucide-react';
import { SavedItem } from '../types';
import { translations } from '../utils/translations';
import ShepherdLogo from './ShepherdLogo';

interface SavedCollectionProps {
  savedItems: SavedItem[];
  onRemoveItem: (id: string) => void;
  language: string;
  onMenuClick: () => void;
  onOpenComposer: (text: string, reference?: string) => void; 
}

const SavedCollection: React.FC<SavedCollectionProps> = ({ savedItems, onRemoveItem, language, onMenuClick, onOpenComposer }) => {
  const [filter, setFilter] = useState<'all' | 'verse' | 'chat' | 'prayer'>('all');
  const t = translations[language]?.saved || translations['English'].saved;

  const filteredItems = savedItems.filter(item => 
    filter === 'all' ? true : item.type === filter
  );

  const getTypeLabel = (type: string) => {
      if (type === 'verse') return t.bibleVerse;
      if (type === 'chat') return t.chatMessage;
      if (type === 'prayer') return t.prayerItem;
      return 'Item';
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors">
      <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-6 shadow-sm z-10">
         <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
             <div className="flex items-center gap-3">
                 <button 
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                 >
                    <ArrowLeft size={24} />
                 </button>
                 <div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded-xl text-rose-500">
                     <Heart size={24} fill="currentColor" />
                 </div>
                 <div>
                     <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-serif-text">{t.title}</h1>
                     <p className="text-sm text-slate-500">{savedItems.length} items</p>
                 </div>
             </div>

             <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto w-full md:w-auto">
                 {(['all', 'verse', 'chat', 'prayer'] as const).map((f) => (
                     <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${filter === f ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                     >
                        {f === 'all' ? t.filterAll : f === 'verse' ? t.filterVerse : f === 'chat' ? t.filterChat : t.filterPrayer}
                     </button>
                 ))}
             </div>
         </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
         <div className="max-w-3xl mx-auto space-y-6">
            {filteredItems.length === 0 ? (
                <div className="text-center py-20 opacity-50 animate-fade-in">
                    <Heart size={48} className="mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500 text-lg">{t.empty}</p>
                </div>
            ) : (
                filteredItems.map(item => (
                    <div key={item.id} className={`
                        relative bg-white dark:bg-slate-800 rounded-3xl shadow-sm border p-6 group hover:shadow-xl hover:-translate-y-0.5 transition-all animate-slide-up
                        ${item.type === 'chat' ? 'border-indigo-100 dark:border-indigo-900/30 bg-gradient-to-br from-white to-indigo-50/20 dark:from-slate-800 dark:to-indigo-900/5' : 'border-slate-100 dark:border-slate-700'}
                    `}>
                        <div className="flex items-start gap-4">
                            <div className={`
                                flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm
                                ${item.type === 'verse' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 
                                  item.type === 'prayer' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                                  'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600'}
                            `}>
                                {item.type === 'verse' ? <BookOpen size={24} /> : 
                                 item.type === 'prayer' ? <Feather size={24} /> :
                                 <ShepherdLogo size={24} />}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                            item.type === 'chat' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                                        }`}>
                                            {getTypeLabel(item.type)}
                                        </span>
                                        {item.type === 'chat' && <Star size={10} className="text-indigo-400 fill-indigo-400" />}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                
                                <p className={`
                                    text-slate-800 dark:text-slate-200 leading-relaxed text-lg mb-3
                                    ${item.type === 'verse' ? 'font-serif-text italic' : 'font-sans'}
                                `}>
                                    {item.type === 'chat' ? item.content : `"${item.content}"`}
                                </p>
                                
                                {item.reference && (
                                    <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm tracking-wide">
                                        — {item.reference}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-1 ml-2">
                                <button 
                                    onClick={() => onRemoveItem(item.id)}
                                    className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                    title={t.remove}
                                >
                                    <Trash2 size={18} />
                                </button>
                                <button
                                    onClick={() => onOpenComposer(item.content, item.reference)}
                                    className="p-2.5 text-slate-300 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all"
                                    title="Create Image"
                                >
                                    <Image size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
         </div>
         <div className="h-20"></div>
      </main>
    </div>
  );
};

export default SavedCollection;