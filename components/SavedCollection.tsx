import React, { useState } from 'react';
import { Trash2, Heart, BookOpen, Feather, Image, ArrowLeft, MessageSquare } from 'lucide-react';
import { SavedItem } from '../types';
import { useTranslation } from 'react-i18next';
import ShepherdLogo from './ShepherdLogo';

interface SavedCollectionProps {
  savedItems: SavedItem[];
  onRemoveItem: (id: string) => void;
  language: string;
  onMenuClick: () => void;
  onOpenComposer: (text: string, reference?: string) => void; 
}

const SavedCollection: React.FC<SavedCollectionProps> = ({ savedItems, onRemoveItem, onMenuClick, onOpenComposer }) => {
  const [filter, setFilter] = useState<'all' | 'verse' | 'chat' | 'prayer'>('all');
  const { t } = useTranslation();

  const filteredItems = savedItems.filter(item => 
    filter === 'all' ? true : item.type === filter
  );

  const getTypeLabel = (type: string) => {
      if (type === 'verse') return t('saved.bibleVerse');
      if (type === 'chat') return t('saved.chatMessage');
      if (type === 'prayer') return t('saved.prayerItem');
      return type;
  };

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
                     <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-serif-text">{t('saved.title')}</h1>
                     <p className="text-sm text-slate-500 font-medium">
                        {t('saved.itemsCount', { count: savedItems.length })}
                     </p>
                 </div>
             </div>

             <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto w-full md:w-auto scrollbar-hide">
                 {(['all', 'verse', 'chat', 'prayer'] as const).map((f) => (
                     <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-md transition-all whitespace-nowrap ${filter === f ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                     >
                        {t(`saved.filter${f.charAt(0).toUpperCase() + f.slice(1)}`)}
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
                    <p className="text-slate-500 text-lg font-medium">{t('saved.empty')}</p>
                </div>
            ) : (
                filteredItems.map(item => (
                    <div key={item.id} className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 group hover:shadow-xl transition-all animate-slide-up">
                        <div className="flex items-start gap-4">
                            <div className={`
                                flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm
                                ${item.type === 'verse' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 
                                  item.type === 'prayer' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                                  'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600'}
                            `}>
                                {item.type === 'verse' ? <BookOpen size={24} /> : 
                                 item.type === 'prayer' ? <Feather size={24} /> :
                                 <MessageSquare size={24} />}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500">
                                        {getTypeLabel(item.type)}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                                        {new Date(item.date).toLocaleDateString()}
                                    </span>
                                </div>
                                
                                <p className={`
                                    text-slate-800 dark:text-slate-200 leading-relaxed text-lg mb-3
                                    ${item.type === 'verse' ? 'font-serif-text italic' : ''}
                                `}>
                                    {item.type === 'chat' ? item.content : `"${item.content}"`}
                                </p>
                                
                                {item.reference && (
                                    <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm tracking-wide">
                                        — {item.reference}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => onRemoveItem(item.id)}
                                    className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                    title={t('common.delete')}
                                >
                                    <Trash2 size={18} />
                                </button>
                                <button
                                    onClick={() => onOpenComposer(item.content, item.reference)}
                                    className="p-2.5 text-slate-300 hover:text-purple-500 hover:bg-purple-900/20 rounded-xl transition-all"
                                    title={t('dailyVerse.createImage')}
                                >
                                    <Image size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
         </div>
         <div className="h-24"></div>
      </main>
    </div>
  );
};

export default SavedCollection;