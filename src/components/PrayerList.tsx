
import React, { useState } from 'react';
import { Plus, Trash2, Feather, Circle, CheckCircle2, Globe, Lock, Users, User, Eye, EyeOff, ArrowLeft, Calendar } from 'lucide-react';
import { SavedItem, PrayerVisibility } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';

interface PrayerListProps {
    savedItems: SavedItem[];
    onSaveItem: (item: SavedItem) => void;
    onUpdateItem: (item: SavedItem) => void;
    onRemoveItem: (id: string) => void;
    language: string;
    onMenuClick: () => void;
    currentUserId?: string;
    userName?: string;
    userAvatar?: string;
}

const PrayerList: React.FC<PrayerListProps> = ({ 
    savedItems, onSaveItem, onUpdateItem, onRemoveItem, language, onMenuClick, currentUserId, userName, userAvatar
}) => {
    const { t } = useTranslation();
    const [newPrayer, setNewPrayer] = useState('');
    const [activeTab, setActiveTab] = useState<'journal' | 'community'>('journal');
    const [visibility, setVisibility] = useState<PrayerVisibility>('private');
    const [isAnonymous, setIsAnonymous] = useState(false);
    
    const prayers = savedItems.filter(i => i.type === 'prayer');
    const activePrayers = prayers.filter(p => !p.metadata?.answered);
    const answeredPrayers = prayers.filter(p => p.metadata?.answered);

    const handleAddPrayer = () => {
        if (!newPrayer.trim()) return;
        onSaveItem({
            id: uuidv4(), type: 'prayer', content: newPrayer.trim(), date: Date.now(),
            metadata: { 
                answered: false, visibility, is_anonymous: isAnonymous,
                author_name: userName || t('common.guest'), author_avatar: userAvatar || '',
                interactions: { type: 'amen', count: 0, user_ids: [] }
            }
        });
        setNewPrayer('');
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors">
            <header className="bg-white dark:bg-slate-950 border-b dark:border-slate-800 p-4 shadow-sm z-20 flex flex-col items-center">
                <div className="w-full max-w-3xl flex flex-col gap-4">
                    <div className="flex items-center gap-3 w-full">
                        <button onClick={onMenuClick} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><ArrowLeft size={24} /></button>
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-xl text-indigo-600 dark:text-indigo-400"><Feather size={24} /></div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-serif-text">{t('prayer.title')}</h1>
                    </div>
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full">
                        <button onClick={() => setActiveTab('journal')} className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'journal' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500'}`}>{t('prayer.tabs.journal')}</button>
                        <button onClick={() => setActiveTab('community')} className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'community' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500'}`}>{t('prayer.tabs.community')}</button>
                    </div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-3xl mx-auto space-y-8 pb-24">
                    {activeTab === 'journal' && (
                        <>
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border dark:border-slate-700 animate-slide-up">
                                <textarea value={newPrayer} onChange={(e) => setNewPrayer(e.target.value)} placeholder={t('prayer.placeholder')} rows={3} className="w-full bg-transparent outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 resize-none mb-4 text-lg font-serif-text italic"/>
                                <div className="flex items-center justify-between border-t dark:border-slate-700 pt-4">
                                    <div className="flex gap-2">
                                        <button onClick={() => setVisibility(visibility === 'private' ? 'public' : 'private')} className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 transition-colors">{visibility === 'private' ? <Lock size={14}/> : <Globe size={14} className="text-emerald-500"/>}<span>{visibility === 'private' ? t('prayer.privacy.private') : t('prayer.privacy.public')}</span></button>
                                        <button onClick={() => setIsAnonymous(!isAnonymous)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${isAnonymous ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>{isAnonymous ? <EyeOff size={14} /> : <Eye size={14} />}<span>{isAnonymous ? t('prayer.privacy.anonymous') : t('prayer.privacy.publicId')}</span></button>
                                    </div>
                                    <button onClick={handleAddPrayer} disabled={!newPrayer.trim()} className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 shadow-lg"><Plus size={24} /></button>
                                </div>
                            </div>
                            <section>
                                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2"><Circle size={10} className="fill-indigo-500 text-indigo-500"/> {t('prayer.active')}</h3>
                                {activePrayers.length === 0 ? <div className="text-center py-12 text-slate-400 italic text-sm border-2 border-dashed dark:border-slate-800 rounded-3xl">{t('prayer.empty')}</div> : (
                                    <div className="space-y-4">{activePrayers.map(p => (
                                        <div key={p.id} className="group bg-white dark:bg-slate-800 p-6 rounded-3xl border dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex items-start gap-4"><button onClick={() => onUpdateItem({...p, metadata:{...p.metadata, answered:true}})} className="mt-1 text-slate-300 hover:text-emerald-500 transition-colors"><Circle size={24}/></button><div className="flex-1"><p className="text-slate-800 dark:text-slate-200 text-lg font-serif-text leading-relaxed">"{p.content}"</p><div className="flex items-center gap-3 mt-4"><span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Calendar size={10}/> {new Date(p.date).toLocaleDateString()}</span></div></div><button onClick={() => onRemoveItem(p.id)} className="p-2 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={20}/></button></div>
                                        </div>
                                    ))}</div>
                                )}
                            </section>
                            {answeredPrayers.length > 0 && (
                                <section className="opacity-60">
                                    <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-4">{t('prayer.answered')}</h3>
                                    <div className="space-y-3">{answeredPrayers.map(p => (
                                        <div key={p.id} className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
                                            <div className="flex items-center gap-3"><CheckCircle2 className="text-emerald-500" size={20}/><p className="text-slate-600 dark:text-slate-400 line-through text-sm">{p.content}</p></div>
                                            <button onClick={() => onRemoveItem(p.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                                        </div>
                                    ))}</div>
                                </section>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PrayerList;
