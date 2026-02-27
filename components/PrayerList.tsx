
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
        if (activeTab === 'community') {
            loadCommunityPrayers();
        }
    }, [activeTab]);

    const loadCommunityPrayers = async () => {
        setLoadingCommunity(true);
        try {
            const data = await db.prayers.getCommunityPrayers();
            setCommunityPrayers(data);
        } catch (e) { console.error(e); }
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
                answered: false,
                visibility: visibility,
                allowed_users: visibility === 'specific' ? selectedFriends : [],
                is_anonymous: isAnonymous,
                author_name: authorName,
                author_avatar: authorAvatar,
                interactions: { type: 'amen', count: 0, user_ids: [] }
            }
        };

        onSaveItem(item);
        setNewPrayer('');
        setVisibility('private');
        setSelectedFriends([]);
        setIsAnonymous(false);
        setShowVisibilityMenu(false);

        if (activeTab === 'community' && visibility !== 'private') {
            setTimeout(loadCommunityPrayers, 500);
        }
    };

    const toggleAnswered = (prayer: SavedItem) => {
        const updated = {
            ...prayer,
            metadata: { ...prayer.metadata, answered: !prayer.metadata?.answered }
        };
        onUpdateItem(updated);

        if (activeTab === 'community') {
            setCommunityPrayers(prev => prev.map(p => p.id === updated.id ? updated : p));
        }
    };

    const handleCommunityDelete = async (id: string) => {
        onRemoveItem(id);
        setCommunityPrayers(prev => prev.filter(p => p.id !== id));
    };

    const handleToggleFriend = (friendId: string) => {
        setSelectedFriends(prev =>
            prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]
        );
    };

    const handleAmen = async (prayer: SavedItem) => {
        setCommunityPrayers(prev => prev.map(p => {
            if (p.id === prayer.id) {
                const interactions = p.metadata?.interactions || { type: 'amen', count: 0, user_ids: [] };
                const currentUserIdLocal = currentUserId || "";
                const hasAmened = interactions.user_ids.includes(currentUserIdLocal);

                let newCount = interactions.count;
                let newIds = interactions.user_ids;

                if (hasAmened) {
                    newCount = Math.max(0, newCount - 1);
                    newIds = newIds.filter((id: string) => id !== currentUserIdLocal);
                } else {
                    newCount = newCount + 1;
                    newIds = [...newIds, currentUserIdLocal];
                }

                return {
                    ...p,
                    metadata: {
                        ...p.metadata,
                        interactions: {
                            ...interactions,
                            type: 'amen',
                            count: newCount,
                            user_ids: newIds
                        }
                    }
                };
            }
            return p;
        }));

        try {
            await db.prayers.toggleAmen(prayer.id, prayer.metadata);
        } catch (e) { console.error(e); }
    };

    const handleTranslate = async (id: string, text: string) => {
        if (translationsMap[id]) {
            const newMap = { ...translationsMap };
            delete newMap[id];
            setTranslationsMap(newMap);
            return;
        }

        setTranslatingIds(prev => new Set(prev).add(id));
        try {
            const targetLang = language || 'English';
            const translated = await translateContent(text, targetLang);
            setTranslationsMap(prev => ({ ...prev, [id]: translated }));
        } catch (e) {
            console.error("Translation failed", e);
        } finally {
            setTranslatingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const VisibilityIcon = ({ vis }: { vis: PrayerVisibility }) => {
        switch (vis) {
            case 'public': return <Globe size={14} className="text-emerald-500" />;
            case 'friends': return <Users size={14} className="text-blue-500" />;
            case 'specific': return <User size={14} className="text-purple-500" />;
            default: return <Lock size={14} className="text-slate-400" />;
        }
    };

    const VisibilityLabel = ({ vis }: { vis: PrayerVisibility }) => {
        switch (vis) {
            case 'public': return t('prayer.privacy.public');
            case 'friends': return t('prayer.privacy.friends');
            case 'specific': return t('prayer.privacy.specific');
            default: return t('prayer.privacy.private');
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
            <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 shadow-sm sticky top-0 z-20 flex flex-col items-center">
                <div className="w-full flex flex-col gap-4">
                    <div className="flex items-center gap-3 w-full">
                        <button
                            onClick={onMenuClick}
                            className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <Feather size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-serif-text">{t('prayer.title')}</h1>
                        </div>
                    </div>

                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-full">
                        <button
                            onClick={() => setActiveTab('journal')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'journal' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            {t('prayer.tabs.journal')}
                        </button>
                        <button
                            onClick={() => setActiveTab('community')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'community' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            {t('prayer.tabs.community')}
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="w-full space-y-8">

                    {activeTab === 'journal' && (
                        <>
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                                <textarea
                                    value={newPrayer}
                                    onChange={(e) => setNewPrayer(e.target.value)}
                                    placeholder={t('prayer.placeholder')}
                                    rows={2}
                                    className="w-full bg-transparent outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 resize-none mb-3"
                                />

                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <div className="relative" ref={menuRef}>
                                            <button
                                                onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <VisibilityIcon vis={visibility} />
                                                <span>{VisibilityLabel({ vis: visibility })}</span>
                                                <ChevronDown size={12} />
                                            </button>

                                            {showVisibilityMenu && (
                                                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 z-30 overflow-hidden animate-scale-in">
                                                    <button onClick={() => { setVisibility('private'); setShowVisibilityMenu(false); }} className="w-full text-left px-4 py-3 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                                                        <Lock size={14} className="text-slate-400" /> {t('prayer.privacy.private')}
                                                    </button>
                                                    <button onClick={() => { setVisibility('friends'); setShowVisibilityMenu(false); }} className="w-full text-left px-4 py-3 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                                                        <Users size={14} className="text-blue-500" /> {t('prayer.privacy.friends')}
                                                    </button>
                                                    <button onClick={() => { setVisibility('specific'); setShowVisibilityMenu(false); setShowFriendSelector(true); }} className="w-full text-left px-4 py-3 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                                                        <User size={14} className="text-purple-500" /> {t('prayer.privacy.specific')}
                                                    </button>
                                                    <button onClick={() => { setVisibility('public'); setShowVisibilityMenu(false); }} className="w-full text-left px-4 py-3 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800">
                                                        <Globe size={14} className="text-emerald-500" /> {t('prayer.privacy.public')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => setIsAnonymous(!isAnonymous)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isAnonymous ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400'}`}
                                            title="Post Anonymously"
                                        >
                                            {isAnonymous ? <EyeOff size={14} /> : <Eye size={14} />}
                                            {isAnonymous ? t('prayer.privacy.anonymous') : t('prayer.privacy.publicId')}
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleAddPrayer}
                                        disabled={!newPrayer.trim()}
                                        className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>

                                {showFriendSelector && visibility === 'specific' && (
                                    <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 animate-slide-up">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-slate-500 uppercase">{t('prayer.privacy.selectFriends')}</span>
                                            <button onClick={() => setShowFriendSelector(false)} className="text-xs text-indigo-500 hover:underline">Done</button>
                                        </div>
                                        <div className="max-h-32 overflow-y-auto space-y-1">
                                            {friendsList.map(friend => (
                                                <button
                                                    key={friend.id}
                                                    onClick={() => handleToggleFriend(friend.id)}
                                                    className={`w-full flex items-center gap-2 p-2 rounded-md text-xs transition-colors ${selectedFriends.includes(friend.id) ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                                                >
                                                    <div className={`w-3 h-3 rounded-full border ${selectedFriends.includes(friend.id) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-400'}`}></div>
                                                    {friend.display_name}
                                                </button>
                                            ))}
                                            {friendsList.length === 0 && <div className="text-xs text-slate-400 italic">No friends added yet.</div>}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <section>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Circle size={10} className="fill-indigo-500 text-indigo-500" /> {t('prayer.active')}
                                </h3>
                                {activePrayers.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 italic text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                                        {t('prayer.empty')}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {activePrayers.map(p => (
                                            <div key={p.id} className="group bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                                                <div className="flex items-start gap-3">
                                                    <button onClick={() => toggleAnswered(p)} className="mt-1 text-slate-300 hover:text-emerald-500 transition-colors">
                                                        <Circle size={20} />
                                                    </button>
                                                    <div className="flex-1">
                                                        <p className="text-slate-800 dark:text-slate-200 text-lg leading-relaxed">{p.content}</p>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                                <Calendar size={10} /> {new Date(p.date).toLocaleDateString()}
                                                            </span>
                                                            <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                                                <VisibilityIcon vis={p.metadata?.visibility || 'private'} />
                                                                {VisibilityLabel({ vis: p.metadata?.visibility || 'private' })}
                                                            </span>
                                                            {p.metadata?.visibility !== 'private' && (
                                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                                    <span className="text-xs">🙏</span> {p.metadata?.interactions?.count || 0}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button onClick={() => onRemoveItem(p.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {answeredPrayers.length > 0 && (
                                <section className="opacity-80">
                                    <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <CheckCircle2 size={10} /> {t('prayer.answered')}
                                    </h3>
                                    <div className="space-y-3">
                                        {answeredPrayers.map(p => (
                                            <div key={p.id} className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-3">
                                                <button onClick={() => toggleAnswered(p)} className="mt-1 text-emerald-500">
                                                    <CheckCircle2 size={20} className="fill-emerald-100 dark:fill-emerald-900" />
                                                </button>
                                                <div className="flex-1">
                                                    <p className="text-slate-600 dark:text-slate-300 line-through decoration-emerald-300">{p.content}</p>
                                                    <span className="text-xs text-emerald-500/70 flex items-center gap-1 mt-1">
                                                        {t('prayer.answered')}
                                                    </span>
                                                </div>
                                                <button onClick={() => onRemoveItem(p.id)} className="p-2 text-slate-300 hover:text-red-500">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    )}

                    {activeTab === 'community' && (
                        <div className="space-y-4">
                            <div className="bg-indigo-600 rounded-xl p-6 text-white text-center shadow-lg mb-6">
                                <h3 className="text-lg font-bold font-serif-text mb-1">{t('prayer.communityTitle')}</h3>
                                <p className="text-indigo-100 text-sm opacity-90">{t('prayer.communitySubtitle')}</p>
                            </div>

                            {loadingCommunity ? (
                                <div className="text-center py-10 text-slate-400 animate-pulse">{t('common.loading')}</div>
                            ) : communityPrayers.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 italic">{t('prayer.communityEmpty')}</div>
                            ) : (
                                communityPrayers.map((prayer, i) => {
                                    const isOwner = currentUserId && prayer.user_id === currentUserId;
                                    const isAnon = prayer.metadata?.is_anonymous;
                                    const isAnswered = prayer.metadata?.answered;
                                    const isAmened = prayer.metadata?.interactions?.user_ids?.includes(currentUserId || "");
                                    const translatedText = translationsMap[prayer.id];
                                    const isTranslating = translatingIds.has(prayer.id);

                                    return (
                                        <div key={prayer.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 overflow-hidden">
                                                    {isAnon ? <User size={16} /> : (prayer.metadata?.author_avatar ? <img src={prayer.metadata.author_avatar} className="w-full h-full object-cover" /> : (prayer.metadata?.author_name?.charAt(0) || '?'))}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-800 dark:text-white">
                                                        {isAnon ? t('prayer.privacy.anonymous') : (prayer.metadata?.author_name || t('common.guest'))}
                                                        {isAnswered && <span className="ml-2 text-[10px] text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">{t('prayer.answered')}</span>}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400">{new Date(prayer.date).toLocaleDateString()}</div>
                                                </div>

                                                <div className="ml-auto flex items-center gap-2">
                                                    <VisibilityIcon vis={prayer.metadata?.visibility || 'public'} />
                                                    {isOwner && (
                                                        <>
                                                            <button
                                                                onClick={() => toggleAnswered(prayer)}
                                                                className={`p-1.5 rounded-full transition-colors ${isAnswered ? 'text-emerald-500 bg-emerald-50' : 'text-slate-300 hover:text-emerald-500'}`}
                                                                title="Mark Answered"
                                                            >
                                                                <CheckCircle2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleCommunityDelete(prayer.id)}
                                                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <p className={`text-slate-800 dark:text-slate-200 text-lg leading-relaxed mb-4 ${isAnswered ? 'line-through opacity-70' : ''}`}>
                                                "{prayer.content}"
                                            </p>

                                            {translatedText && (
                                                <div className="mb-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                                                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">{t('common.translated')}:</div>
                                                    <p className="text-slate-600 dark:text-slate-300 text-sm italic">"{translatedText}"</p>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-700 pt-3">
                                                <button
                                                    onClick={() => handleAmen(prayer)}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors active:scale-95 ${isAmened ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
                                                >
                                                    <span>🙏</span>
                                                    <span className="text-sm font-bold">{t('prayer.amen')}</span>
                                                    {prayer.metadata?.interactions?.count ? (
                                                        <span className={`px-1.5 rounded text-xs ml-1 ${isAmened ? 'bg-indigo-200 dark:bg-indigo-800' : 'bg-slate-200 dark:bg-slate-700'}`}>{prayer.metadata.interactions.count}</span>
                                                    ) : null}
                                                </button>

                                                <button
                                                    onClick={() => handleTranslate(prayer.id, prayer.content)}
                                                    disabled={isTranslating}
                                                    className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"
                                                    title={t('common.translate')}
                                                >
                                                    {isTranslating ? <Loader2 size={16} className="animate-spin" /> : <Languages size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default PrayerList;
