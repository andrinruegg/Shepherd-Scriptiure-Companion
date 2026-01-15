
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Feather, Circle, CheckCircle2, Globe, Lock, Users, ChevronDown, User, Eye, EyeOff, Languages, Loader2, ArrowLeft, Calendar } from 'lucide-react';
import { SavedItem, PrayerVisibility, UserProfile } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { db } from '../services/db';
import { translateContent } from '../services/geminiService';

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
    savedItems, 
    onSaveItem, 
    onUpdateItem, 
    onRemoveItem, 
    language, 
    onMenuClick, 
    currentUserId,
    userName,
    userAvatar
}) => {
    const { t } = useTranslation();
    const [newPrayer, setNewPrayer] = useState('');
    const [activeTab, setActiveTab] = useState<'journal' | 'community'>('journal');
    const [visibility, setVisibility] = useState<PrayerVisibility>('private');
    const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
    const [showFriendSelector, setShowFriendSelector] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [friendsList, setFriendsList] = useState<UserProfile[]>([]);
    const [communityPrayers, setCommunityPrayers] = useState<SavedItem[]>([]);
    const [loadingCommunity, setLoadingCommunity] = useState(false);
    const [translationsMap, setTranslationsMap] = useState<Record<string, string>>({});
    const [translatingIds, setTranslatingIds] = useState<Set<string>>(new Set());
    const menuRef = useRef<HTMLDivElement>(null);

    const prayers = savedItems.filter(i => i.type === 'prayer');
    const activePrayers = prayers.filter(p => !p.metadata?.answered);
    const answeredPrayers = prayers.filter(p => p.metadata?.answered);

    useEffect(() => {
        const loadFriends = async () => {
            try {
                const f = await db.social.getFriends();
                setFriendsList(f);
            } catch (e) { console.error(e); }
        };
        loadFriends();
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowVisibilityMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (activeTab === 'community') loadCommunityPrayers();
    }, [activeTab]);

    const loadCommunityPrayers = async () => {
        setLoadingCommunity(true);
        try {
            const data = await db.prayers.getCommunityPrayers();
            setCommunityPrayers(data);
        } catch(e) { console.error(e); } 
        finally { setLoadingCommunity(false); }
    };

    const handleAddPrayer = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newPrayer.trim()) return;
        const authorName = userName || localStorage.getItem('displayName') || t('common.guest');
        const authorAvatar = userAvatar || localStorage.getItem('userAvatar') || '';
        const item: SavedItem = {
            id: uuidv4(),
            type: 'prayer',
            content: newPrayer.trim(),
            date: Date.now(),
            metadata: { 
                answered: false, visibility, allowed_users: visibility === 'specific' ? selectedFriends : [],
                is_anonymous: isAnonymous, author_name: authorName, author_avatar: authorAvatar,
                interactions: { type: 'amen', count: 0, user_ids: [] }
            }
        };
        onSaveItem(item);
        setNewPrayer('');
        setVisibility('private');
        setSelectedFriends([]);
        setIsAnonymous(false);
        if (activeTab === 'community' && visibility !== 'private') setTimeout(loadCommunityPrayers, 500);
    };

    const toggleAnswered = (prayer: SavedItem) => {
        const updated = { ...prayer, metadata: { ...prayer.metadata, answered: !prayer.metadata?.answered } };
        onUpdateItem(updated); 
        if (activeTab === 'community') setCommunityPrayers(prev => prev.map(p => p.id === updated.id ? updated : p));
    };

    const handleAmen = async (prayer: SavedItem) => {
        setCommunityPrayers(prev => prev.map(p => {
            if (p.id === prayer.id) {
                 const interactions = p.metadata?.interactions || { type: 'amen', count: 0, user_ids: [] };
                 const hasAmened = interactions.user_ids.includes(currentUserId || "");
                 let newCount = hasAmened ? Math.max(0, interactions.count - 1) : interactions.count + 1;
                 let newIds = hasAmened ? interactions.user_ids.filter((id: string) => id !== currentUserId) : [...interactions.user_ids, currentUserId || ""];
                 return { ...p, metadata: { ...p.metadata, interactions: { ...interactions, count: newCount, user_ids: newIds } } };
            }
            return p;
        }));
        try { await db.prayers.toggleAmen(prayer.id, prayer.metadata); } catch (e) { console.error(e); }
    };

    const VisibilityIcon = ({ vis }: { vis: PrayerVisibility }) => {
        switch(vis) {
            case 'public': return <Globe size={14} className="text-emerald-500" />;
            case 'friends': return <Users size={14} className="text-amber-500" />;
            default: return <Lock size={14} className="text-[#7c4a32]" />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#fdfbf7] dark:bg-slate-900">
            <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 shadow-sm sticky top-0 z-20 flex flex-col items-center">
                <div className="w-full max-w-3xl flex flex-col gap-4">
                    <div className="flex items-center gap-3 w-full">
                        <button onClick={onMenuClick} className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 rounded-lg"><ArrowLeft size={24} /></button>
                        <div className="bg-[#7c4a32]/10 p-2 rounded-xl text-[#7c4a32]"><Feather size={24} /></div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white font-serif-text">{t('prayer.title')}</h1>
                    </div>
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-full">
                        <button onClick={() => setActiveTab('journal')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'journal' ? 'bg-white shadow-sm text-[#7c4a32]' : 'text-slate-500'}`}>{t('prayer.tabs.journal')}</button>
                        <button onClick={() => setActiveTab('community')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'community' ? 'bg-white shadow-sm text-[#7c4a32]' : 'text-slate-500'}`}>{t('prayer.tabs.community')}</button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    {activeTab === 'journal' && (
                        <>
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                                <textarea value={newPrayer} onChange={(e) => setNewPrayer(e.target.value)} placeholder={t('prayer.placeholder')} rows={2} className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400 resize-none mb-3" />
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <div className="relative" ref={menuRef}>
                                            <button onClick={() => setShowVisibilityMenu(!showVisibilityMenu)} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-[#7c4a32]"><VisibilityIcon vis={visibility} /> {VisibilityLabel({vis: visibility})}</button>
                                            {showVisibilityMenu && (
                                                <div className="absolute top-full left-0 mt-2 w-48 bg-white shadow-xl border z-30 rounded-xl overflow-hidden">
                                                    <button onClick={() => { setVisibility('private'); setShowVisibilityMenu(false); }} className="w-full text-left px-4 py-3 text-xs font-medium hover:bg-slate-50 flex items-center gap-2"><Lock size={14}/> {t('prayer.privacy.private')}</button>
                                                    <button onClick={() => { setVisibility('public'); setShowVisibilityMenu(false); }} className="w-full text-left px-4 py-3 text-xs font-medium hover:bg-slate-50 flex items-center gap-2"><Globe size={14}/> {t('prayer.privacy.public')}</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button onClick={handleAddPrayer} disabled={!newPrayer.trim()} className="p-2 bg-[#7c4a32] text-white rounded-xl hover:opacity-90 shadow-lg"><Plus size={20} /></button>
                                </div>
                            </div>
                            <section>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('prayer.active')}</h3>
                                {activePrayers.map(p => (
                                    <div key={p.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border mb-3 flex items-start gap-3 shadow-sm group">
                                        <button onClick={() => toggleAnswered(p)} className="mt-1 text-slate-300 hover:text-emerald-500"><Circle size={20} /></button>
                                        <div className="flex-1">
                                            <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{p.content}</p>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 block">{new Date(p.date).toLocaleDateString()}</span>
                                        </div>
                                        <button onClick={() => onRemoveItem(p.id)} className="p-2 text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                                    </div>
                                ))}
                            </section>
                        </>
                    )}
                    {activeTab === 'community' && (
                        <div className="space-y-4">
                             {communityPrayers.map((prayer, i) => (
                                 <div key={prayer.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border shadow-sm animate-slide-up">
                                      <div className="flex items-center gap-3 mb-3">
                                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{prayer.metadata?.author_name?.charAt(0) || '?'}</div>
                                          <div><div className="text-sm font-bold text-slate-800 dark:text-white">{prayer.metadata?.author_name || t('common.guest')}</div><div className="text-[10px] text-slate-400">{new Date(prayer.date).toLocaleDateString()}</div></div>
                                      </div>
                                      <p className="text-slate-800 dark:text-slate-200 text-lg leading-relaxed mb-4">"{prayer.content}"</p>
                                      <button onClick={() => handleAmen(prayer)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${prayer.metadata?.interactions?.user_ids?.includes(currentUserId || "") ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                                          <span className="text-sm font-bold">🙏 {t('prayer.amen')}</span>
                                          {prayer.metadata?.interactions?.count > 0 && <span className="text-xs bg-white/50 px-1.5 rounded-full">{prayer.metadata.interactions.count}</span>}
                                      </button>
                                 </div>
                             ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
function VisibilityLabel({ vis }: { vis: PrayerVisibility }) {
    if (vis === 'public') return "Public Wall";
    return "Only Me";
}
export default PrayerList;
