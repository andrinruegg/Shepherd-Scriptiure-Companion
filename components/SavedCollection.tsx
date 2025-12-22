import React, { useState } from 'react';
import { Trash2, Heart, MessageSquare, BookOpen, Menu, Feather, Image, ArrowLeft } from 'lucide-react';
import { SavedItem } from '../types.ts';
import { translations } from '../utils/translations.ts';

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
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-6 shadow-sm">
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

             <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto">
                 <button onClick={() => setFilter('all')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${filter === 'all' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>{t.filterAll}</button>
                 <button onClick={() => setFilter('verse')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${filter === 'verse' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>{t.filterVerse}</button>
                 <button onClick={() => setFilter('chat')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${filter === 'chat' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>{t.filterChat}</button>
                 <button onClick={() => setFilter('prayer')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${filter === 'prayer' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>{t.filterPrayer}</button>
             </div>
         </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
         <div className="max-w-3xl mx-auto space-y-4">
            {filteredItems.length === 0 ? (
                <div className="text-center py-20 opacity-50"><Heart size={48} className="mx-auto mb-4 text-slate-300" /><p className="text-slate-500 text-lg">{t.empty}</p></div>
            ) : (
                filteredItems.map(item => (
                    <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 group hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'verse' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : item.type === 'prayer' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>
                                {item.type === 'verse' ? <BookOpen size={20} /> : item.type === 'prayer' ? <Feather size={20} /> : <MessageSquare size={20} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2"><span className="text-xs font-bold uppercase tracking-wider text-slate-400">{getTypeLabel(item.type)}</span><span className="text-xs text-slate-400">{new Date(item.date).toLocaleDateString()}</span></div>
                                <p className="text-slate-800 dark:text-slate-200 font-serif-text leading-relaxed text-lg mb-2">"{item.content}"</p>
                                {item.reference && (<p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">— {item.reference}</p>)}
                            </div>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => onRemoveItem(item.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title={t.remove}><Trash2 size={18} /></button>
                                <button onClick={() => onOpenComposer(item.content, item.reference)} className="p-2 text-slate-300 hover:text-purple-500 hover:bg-purple-900/20 rounded-lg transition-colors" title="Create Image"><Image size={18} /></button>
                            </div>
                        </div>
                    </div>
                ))
            )}
         </div>
      </main>
    </div>
  );
};

export default SavedCollection;