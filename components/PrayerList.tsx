import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Feather, Menu, Circle, CheckCircle2, Globe, Lock, Users, ChevronDown, User, Eye, EyeOff, Languages, Loader2, ArrowLeft, Calendar } from 'lucide-react';
import { SavedItem, PrayerVisibility, UserProfile } from '../types.ts';
import { v4 as uuidv4 } from 'uuid';
import { translations } from '../utils/translations.ts';
import { db } from '../services/db.ts';
import { translateContent } from '../services/geminiService.ts';

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
    const t = translations[language]?.prayer || translations['English'].prayer;
    const commonT = translations[language]?.common || translations['English'].common;
    const prayers = savedItems.filter(i => i.type === 'prayer');
    const activePrayers = prayers.filter(p => !p.metadata?.answered);
    const answeredPrayers = prayers.filter(p => p.metadata?.answered);

    useEffect(() => {
        db.social.getFriends().then(setFriendsList).catch(() => {});
        const handleClickOutside = (event: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(event.target as Node)) setShowVisibilityMenu(false); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => { if (activeTab === 'community') loadCommunityPrayers(); }, [activeTab]);

    const loadCommunityPrayers = async () => {
        setLoadingCommunity(true);
        try { const data = await db.prayers.getCommunityPrayers(); setCommunityPrayers(data); } catch(e) { } finally { setLoadingCommunity(false); }
    };

    const handleAddPrayer = async (e?: React.FormEvent) => {
        e?.preventDefault(); if (!newPrayer.trim()) return;
        const authorName = userName || localStorage.getItem('displayName') || 'Guest';
        const authorAvatar = userAvatar || localStorage.getItem('userAvatar') || '';
        const item: SavedItem = { id: uuidv4(), type: 'prayer', content: newPrayer.trim(), date: Date.now(), metadata: { answered: false, visibility, allowed_users: visibility === 'specific' ? selectedFriends : [], is_anonymous: isAnonymous, author_name: authorName, author_avatar: authorAvatar, interactions: { type: 'amen', count: 0, user_ids: [] } } };
        onSaveItem(item); setNewPrayer(''); setVisibility('private'); setSelectedFriends([]); setIsAnonymous(false); setShowVisibilityMenu(false);
        if (activeTab === 'community' && visibility !== 'private') setTimeout(loadCommunityPrayers, 500);
    };

    const toggleAnswered = (prayer: SavedItem) => { const updated = { ...prayer, metadata: { ...prayer.metadata, answered: !prayer.metadata?.answered } }; onUpdateItem(updated); if (activeTab === 'community') setCommunityPrayers(prev => prev.map(p => p.id === updated.id ? updated : p)); };
    const handleCommunityDelete = (id: string) => { onRemoveItem(id); setCommunityPrayers(prev => prev.filter(p => p.id !== id)); };
    const handleAmen = async (prayer: SavedItem) => {
        const uid = currentUserId || "";
        setCommunityPrayers(prev => prev.map(p => {
            if (p.id === prayer.id) {
                const ints = p.metadata?.interactions || { type: 'amen', count: 0, user_ids: [] };
                const amened = ints.user_ids.includes(uid);
                return { ...p, metadata: { ...p.metadata, interactions: { ...ints, count: amened ? Math.max(0, ints.count - 1) : ints.count + 1, user_ids: amened ? ints.user_ids.filter(id => id !== uid) : [...ints.user_ids, uid] } } };
            }
            return p;
        }));
        try { await db.prayers.toggleAmen(prayer.id, prayer.metadata); } catch (e) { }
    };

    const handleTranslate = async (id: string, text: string) => {
        if (translationsMap[id]) { const next = { ...translationsMap }; delete next[id]; setTranslationsMap(next); return; }
        setTranslatingIds(prev => new Set(prev).add(id));
        try { const trans = await translateContent(text, language || 'English'); setTranslationsMap(prev => ({ ...prev, [id]: trans })); } catch (e) { } finally { setTranslatingIds(prev => { const n = new Set(prev); n.delete(id); return n; }); }
    };

    const VisibilityIcon = ({ vis }: { vis: PrayerVisibility }) => { switch(vis) { case 'public': return <Globe size={14} className="text-emerald-500" />; case 'friends': return <Users size={14} className="text-blue-500" />; case 'specific': return <User size={14} className="text-purple-500" />; default: return <Lock size={14} className="text-slate-400" />; } };
    const VisibilityLabel = ({ vis }: { vis: PrayerVisibility }) => { switch(vis) { case 'public': return t.privacy.public; case 'friends': return t.privacy.friends; case 'specific': return t.privacy.specific; default: return t.privacy.private; } };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
            <header className="bg-white dark:bg-slate-950 border-b border-slate-200 p-4 shadow-sm sticky top-0 z-20 flex flex-col items-center">
                <div className="w-full max-w-3xl flex flex-col gap-4">
                    <div className="flex items-center gap-3 w-full">
                        <button onClick={onMenuClick} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"><ArrowLeft size={24} /></button>
                        <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600"><Feather size={24} /></div>
                        <div><h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-serif-text">{t.title}</h1></div>
                    </div>
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-full">
                        <button onClick={() => setActiveTab('journal')} className={`flex-1 py-2 text-sm font-medium rounded-md ${activeTab === 'journal' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500'}`}>{t.tabs.journal}</button>
                        <button onClick={() => setActiveTab('community')} className={`flex-1 py-2 text-sm font-medium rounded-md ${activeTab === 'community' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500'}`}>{t.tabs.community}</button>
                    </div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    {activeTab === 'journal' && (
                        <><div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700"><textarea value={newPrayer} onChange={(e) => setNewPrayer(e.target.value)} placeholder={t.placeholder} rows={2} className="w-full bg-transparent outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 resize-none mb-3"/><div className="flex items-center justify-between"><div className="flex gap-2"><div className="relative" ref={menuRef}><button onClick={() => setShowVisibilityMenu(!showVisibilityMenu)} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors"><VisibilityIcon vis={visibility} /><span>{VisibilityLabel({vis: visibility})}</span><ChevronDown size={12} /></button>{showVisibilityMenu && (<div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 z-30 overflow-hidden"><button onClick={() => { setVisibility('private'); setShowVisibilityMenu(false); }} className="w-full text-left px-4 py-3 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"><Lock size={14} className="text-slate-400"/> {t.privacy.private}</button><button onClick={() => { setVisibility('friends'); setShowVisibilityMenu(false); }} className="w-full text-left px-4 py-3 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"><Users size={14} className="text-blue-500"/> {t.privacy.friends}</button><button onClick={() => { setVisibility('specific'); setShowVisibilityMenu(false); setShowFriendSelector(true); }} className="w-full text-left px-4 py-3 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"><User size={14} className="text-purple-500"/> {t.privacy.specific}</button><button onClick={() => { setVisibility('public'); setShowVisibilityMenu(false); }} className="w-full text-left px-4 py-3 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 border-t"><Globe size={14} className="text-emerald-500"/> {t.privacy.public}</button></div>)}</div><button onClick={() => setIsAnonymous(!isAnonymous)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${isAnonymous ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>{isAnonymous ? <EyeOff size={14} /> : <Eye size={14} />} {isAnonymous ? 'Anon' : 'Public ID'}</button></div><button onClick={handleAddPrayer} disabled={!newPrayer.trim()} className="p-2 bg-indigo-600 text-white rounded-xl disabled:opacity-50"><Plus size={20} /></button></div>{showFriendSelector && visibility === 'specific' && (<div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border"><div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-slate-500">FRIENDS</span><button onClick={() => setShowFriendSelector(false)} className="text-xs text-indigo-500">Done</button></div><div className="max-h-32 overflow-y-auto space-y-1">{friendsList.map(f => (<button key={f.id} onClick={() => setSelectedFriends(prev => prev.includes(f.id) ? prev.filter(id => id !== f.id) : [...prev, f.id])} className={`w-full flex items-center gap-2 p-2 rounded-md text-xs ${selectedFriends.includes(f.id) ? 'bg-indigo-100 text-indigo-700' : ''}`}><div className={`w-3 h-3 rounded-full border ${selectedFriends.includes(f.id) ? 'bg-indigo-500' : ''}`} />{f.display_name}</button>))}</div></div>)}</div><section><h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Circle size={10} className="fill-indigo-500" /> {t.active}</h3>{activePrayers.length === 0 ? (<div className="text-center py-8 text-slate-400 italic text-sm border-2 border-dashed rounded-xl">{t.empty}</div>) : (<div className="space-y-3">{activePrayers.map(p => (<div key={p.id} className="group bg-white dark:bg-slate-800 p-4 rounded-xl border shadow-sm hover:shadow-md"><div className="flex items-start gap-3"><button onClick={() => toggleAnswered(p)} className="mt-1 text-slate-300 hover:text-emerald-500"><Circle size={20} /></button><div className="flex-1"><p className="text-slate-800 dark:text-slate-200 text-lg">{p.content}</p><div className="flex items-center gap-3 mt-2"><span className="text-xs text-slate-400 flex items-center gap-1"><Calendar size={10} /> {new Date(p.date).toLocaleDateString()}</span><span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded"><VisibilityIcon vis={p.metadata?.visibility || 'private'} />{VisibilityLabel({vis: p.metadata?.visibility || 'private'})}</span></div></div><button onClick={() => onRemoveItem(p.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button></div></div>))}</div>)}</section></>
                    )}
                    {activeTab === 'community' && (<div className="space-y-4">{loadingCommunity ? (<div className="text-center py-10 text-slate-400 animate-pulse">Loading...</div>) : communityPrayers.length === 0 ? (<div className="text-center py-10 text-slate-400 italic">No prayers shared yet.</div>) : (communityPrayers.map(p => { const isMe = currentUserId && p.user_id === currentUserId; const isAmened = p.metadata?.interactions?.user_ids?.includes(currentUserId || ""); return (<div key={p.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border animate-slide-up"><div className="flex items-center gap-3 mb-3"><div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs overflow-hidden">{p.metadata?.is_anonymous ? <User size={16}/> : (p.metadata?.author_avatar ? <img src={p.metadata.author_avatar} className="w-full h-full object-cover"/> : '?')}</div><div className="flex-1"><div className="text-sm font-bold">{p.metadata?.is_anonymous ? "Anonymous" : (p.metadata?.author_name || "Guest")}{p.metadata?.answered && <span className="ml-2 text-[10px] text-emerald-500 bg-emerald-100 px-1.5 py-0.5 rounded">Answered</span>}</div><div className="text-[10px] text-slate-400">{new Date(p.date).toLocaleDateString()}</div></div><div className="ml-auto flex gap-2"><VisibilityIcon vis={p.metadata?.visibility || 'public'} />{isMe && (<><button onClick={() => toggleAnswered(p)} className="p-1.5 text-slate-300 hover:text-emerald-500"><CheckCircle2 size={16} /></button><button onClick={() => handleCommunityDelete(p.id)} className="p-1.5 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button></>)}</div></div><p className={`text-slate-800 dark:text-slate-200 text-lg leading-relaxed mb-4 ${p.metadata?.answered ? 'line-through opacity-70' : ''}`}>"{p.content}"</p>{translationsMap[p.id] && (<div className="mb-4 pt-3 border-t"><div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Translation:</div><p className="text-sm italic">"{translationsMap[p.id]}"</p></div>)}<div className="flex items-center justify-between border-t pt-3"><button onClick={() => handleAmen(p)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isAmened ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-50 text-slate-500'}`}><span>🙏</span><span className="text-sm font-bold">{t.amen}</span>{p.metadata?.interactions?.count ? (<span className="px-1.5 rounded text-xs ml-1 bg-slate-200">{p.metadata.interactions.count}</span>) : null}</button><button onClick={() => handleTranslate(p.id, p.content)} disabled={translatingIds.has(p.id)} className="p-2 text-slate-400 hover:text-indigo-500">{translatingIds.has(p.id) ? <Loader2 size={16} className="animate-spin" /> : <Languages size={16} />}</button></div></div>); }))}</div>)}
                </div>
            </main>
        </div>
    );
};

export default PrayerList;