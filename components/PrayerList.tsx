import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Check, Feather, Calendar, Menu, Circle, CheckCircle2, Globe, Lock, Users, ChevronDown, User } from 'lucide-react';
import { SavedItem, PrayerVisibility, UserProfile } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { translations } from '../utils/translations';
import { db } from '../services/db';

interface PrayerListProps {
    savedItems: SavedItem[];
    onSaveItem: (item: SavedItem) => void;
    onUpdateItem: (item: SavedItem) => void;
    onRemoveItem: (id: string) => void;
    language: string;
    onMenuClick: () => void;
}

const PrayerList: React.FC<PrayerListProps> = ({ savedItems, onSaveItem, onUpdateItem, onRemoveItem, language, onMenuClick }) => {
    const [newPrayer, setNewPrayer] = useState('');
    const [activeTab, setActiveTab] = useState<'journal' | 'community'>('journal');
    
    // Privacy State
    const [visibility, setVisibility] = useState<PrayerVisibility>('private');
    const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
    const [showFriendSelector, setShowFriendSelector] = useState(false);
    
    // Data Loading
    const [friendsList, setFriendsList] = useState<UserProfile[]>([]);
    const [communityPrayers, setCommunityPrayers] = useState<SavedItem[]>([]);
    const [loadingCommunity, setLoadingCommunity] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);
    const t = translations[language]?.prayer || translations['English'].prayer;

    // Filter local prayers
    const prayers = savedItems.filter(i => i.type === 'prayer');
    const activePrayers = prayers.filter(p => !p.metadata?.answered);
    const answeredPrayers = prayers.filter(p => p.metadata?.answered);

    useEffect(() => {
        // Load friends for the selector
        const loadFriends = async () => {
            try {
                const f = await db.social.getFriends();
                setFriendsList(f);
            } catch (e) { console.error(e); }
        };
        loadFriends();

        // Close menu on click outside
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowVisibilityMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load Community Prayers when tab changes
    useEffect(() => {
        if (activeTab === 'community') {
            const loadCommunity = async () => {
                setLoadingCommunity(true);
                try {
                    const data = await db.prayers.getCommunityPrayers();
                    setCommunityPrayers(data);
                } catch(e) { console.error(e); } 
                finally { setLoadingCommunity(false); }
            };
            loadCommunity();
        }
    }, [activeTab]);

    const handleAddPrayer = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newPrayer.trim()) return;

        // Get Current User Profile for Metadata
        // We assume we can get it from local storage or cached profile to save a DB call, 
        // but robustly we should probably pass it in props. For now, we rely on Supabase auth.
        const profile = await db.social.getUserProfile((await db.social.getFriends())[0]?.id || 'unknown'); // Hacky fallback if no friends, usually we'd have a getCurrentUser method
        // Better approach: get it from localStorage which is set in App.tsx
        const authorName = localStorage.getItem('displayName') || 'Anonymous';
        const authorAvatar = localStorage.getItem('userAvatar') || '';

        const item: SavedItem = {
            id: uuidv4(),
            type: 'prayer',
            content: newPrayer.trim(),
            date: Date.now(),
            metadata: { 
                answered: false,
                visibility: visibility,
                allowed_users: visibility === 'specific' ? selectedFriends : [],
                author_name: authorName,
                author_avatar: authorAvatar,
                interactions: { type: 'amen', count: 0, user_ids: [] }
            }
        };

        onSaveItem(item);
        setNewPrayer('');
        setVisibility('private');
        setSelectedFriends([]);
        setShowVisibilityMenu(false);
    };

    const toggleAnswered = (prayer: SavedItem) => {
        const updated = {
            ...prayer,
            metadata: { ...prayer.metadata, answered: !prayer.metadata?.answered }
        };
        onUpdateItem(updated); 
    };

    const handleToggleFriend = (friendId: string) => {
        setSelectedFriends(prev => 
            prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]
        );
    };

    const handleAmen = async (prayer: SavedItem) => {
        // Optimistic UI update for community prayers
        if (activeTab === 'community') {
            // Find in local state
            const currentUserId = (await db.social.getFriends())[0]?.id || 'me'; // Placeholder ID check
            // Actually, we need real user ID. 
            // Since we can't easily get it synchronously, we'll just toggle visually
            
            setCommunityPrayers(prev => prev.map(p => {
                if (p.id === prayer.id) {
                     const interactions = p.metadata?.interactions || { type: 'amen', count: 0, user_ids: [] };
                     // Simple toggle logic assuming we are adding 1 for UX immediately
                     return { 
                         ...p, 
                         metadata: { 
                             ...p.metadata, 
                             interactions: { 
                                 ...interactions,
                                 type: 'amen',
                                 count: interactions.count + 1 
                             } 
                         } 
                     };
                }
                return p;
            }));

            try {
                await db.prayers.toggleAmen(prayer.id, prayer.metadata);
                // Reload to get real state
                const data = await db.prayers.getCommunityPrayers();
                setCommunityPrayers(data);
            } catch (e) { console.error(e); }
        }
    };

    const VisibilityIcon = ({ vis }: { vis: PrayerVisibility }) => {
        switch(vis) {
            case 'public': return <Globe size={14} className="text-emerald-500" />;
            case 'friends': return <Users size={14} className="text-blue-500" />;
            case 'specific': return <User size={14} className="text-purple-500" />;
            default: return <Lock size={14} className="text-slate-400" />;
        }
    };

    const VisibilityLabel = ({ vis }: { vis: PrayerVisibility }) => {
        switch(vis) {
            case 'public': return t.privacy.public;
            case 'friends': return t.privacy.friends;
            case 'specific': return t.privacy.specific;
            default: return t.privacy.private;
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
            <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 shadow-sm sticky top-0 z-20">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                            <Menu size={24} />
                        </button>
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <Feather size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-serif-text">{t.title}</h1>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <button 
                            onClick={() => setActiveTab('journal')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'journal' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            {t.tabs.journal}
                        </button>
                        <button 
                            onClick={() => setActiveTab('community')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'community' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            {t.tabs.community}
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    
                    {/* MY JOURNAL TAB */}
                    {activeTab === 'journal' && (
                        <>
                            {/* Input Area */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                                <textarea 
                                    value={newPrayer}
                                    onChange={(e) => setNewPrayer(e.target.value)}
                                    placeholder={t.placeholder}
                                    rows={2}
                                    className="w-full bg-transparent outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 resize-none mb-3"
                                />
                                
                                <div className="flex items-center justify-between">
                                    {/* Privacy Menu */}
                                    <div className="relative" ref={menuRef}>
                                        <button 
                                            onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            <VisibilityIcon vis={visibility} />
                                            <span>{VisibilityLabel({vis: visibility})}</span>
                                            <ChevronDown size={12} />
                                        </button>

                                        {showVisibilityMenu && (
                                            <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 z-30 overflow-hidden animate-scale-in">
                                                <button onClick={() => { setVisibility('private'); setShowVisibilityMenu(false); }} className="w-full text-left px-4 py-3 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                                                    <Lock size={14} className="text-slate-400"/> {t.privacy.private}
                                                </button>
                                                <button onClick={() => { setVisibility('friends'); setShowVisibilityMenu(false); }} className="w-full text-left px-4 py-3 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                                                    <Users size={14} className="text-blue-500"/> {t.privacy.friends}
                                                </button>
                                                <button onClick={() => { setVisibility('specific'); setShowVisibilityMenu(false); setShowFriendSelector(true); }} className="w-full text-left px-4 py-3 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                                                    <User size={14} className="text-purple-500"/> {t.privacy.specific}
                                                </button>
                                                <button onClick={() => { setVisibility('public'); setShowVisibilityMenu(false); }} className="w-full text-left px-4 py-3 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800">
                                                    <Globe size={14} className="text-emerald-500"/> {t.privacy.public}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <button 
                                        onClick={handleAddPrayer} 
                                        disabled={!newPrayer.trim()} 
                                        className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>

                                {/* Specific Friend Selector (Inline) */}
                                {showFriendSelector && visibility === 'specific' && (
                                    <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 animate-slide-up">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-slate-500 uppercase">{t.privacy.selectFriends}</span>
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

                            {/* Active Prayers */}
                            <section>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Circle size={10} className="fill-indigo-500 text-indigo-500"/> {t.active}
                                </h3>
                                {activePrayers.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 italic text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                                        {t.empty}
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
                                                            {/* Visibility Badge */}
                                                            <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                                                <VisibilityIcon vis={p.metadata?.visibility || 'private'} />
                                                                {VisibilityLabel({vis: p.metadata?.visibility || 'private'})}
                                                            </span>
                                                            {/* Interactions Count (if shared) */}
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

                            {/* Answered Prayers */}
                            {answeredPrayers.length > 0 && (
                                <section className="opacity-80">
                                    <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <CheckCircle2 size={10} /> {t.answered}
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
                                                        Answered
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

                    {/* COMMUNITY TAB */}
                    {activeTab === 'community' && (
                        <div className="space-y-4">
                             <div className="bg-indigo-600 rounded-xl p-6 text-white text-center shadow-lg mb-6">
                                 <h3 className="text-lg font-bold font-serif-text mb-1">Prayer Wall</h3>
                                 <p className="text-indigo-100 text-sm opacity-90">Bear one another's burdens (Galatians 6:2)</p>
                             </div>

                             {loadingCommunity ? (
                                 <div className="text-center py-10 text-slate-400 animate-pulse">Loading prayers...</div>
                             ) : communityPrayers.length === 0 ? (
                                 <div className="text-center py-10 text-slate-400 italic">No shared prayers yet. Be the first to share!</div>
                             ) : (
                                 communityPrayers.map((prayer, i) => (
                                     <div key={prayer.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                                          <div className="flex items-center gap-3 mb-3">
                                              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 overflow-hidden">
                                                  {prayer.metadata?.author_avatar ? <img src={prayer.metadata.author_avatar} className="w-full h-full object-cover"/> : prayer.metadata?.author_name?.charAt(0) || '?'}
                                              </div>
                                              <div>
                                                  <div className="text-sm font-bold text-slate-800 dark:text-white">{prayer.metadata?.author_name || "Anonymous"}</div>
                                                  <div className="text-[10px] text-slate-400">{new Date(prayer.date).toLocaleDateString()}</div>
                                              </div>
                                              <div className="ml-auto">
                                                  <VisibilityIcon vis={prayer.metadata?.visibility || 'public'} />
                                              </div>
                                          </div>
                                          
                                          <p className="text-slate-800 dark:text-slate-200 text-lg leading-relaxed mb-4">
                                              "{prayer.content}"
                                          </p>

                                          <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-700 pt-3">
                                              <button 
                                                onClick={() => handleAmen(prayer)}
                                                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors active:scale-95"
                                              >
                                                  <span>🙏</span>
                                                  <span className="text-sm font-bold">{t.amen}</span>
                                                  {prayer.metadata?.interactions?.count ? (
                                                      <span className="bg-indigo-200 dark:bg-indigo-800 px-1.5 rounded text-xs ml-1">{prayer.metadata.interactions.count}</span>
                                                  ) : null}
                                              </button>
                                          </div>
                                     </div>
                                 ))
                             )}
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default PrayerList;