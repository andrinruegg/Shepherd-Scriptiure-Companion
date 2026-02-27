
import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users, Bell, Search, Check, AlertCircle, Copy, User, MessageCircle, ArrowLeft, Trash2, Circle, Flame, Book, Trophy, Info, Lock, Grid, Award, Footprints, BookOpen } from 'lucide-react';
import { UserProfile, FriendRequest, SocialTab } from '../types';
import { db } from '../services/db';
import FriendChat from './FriendChat';
import { useTranslation } from 'react-i18next';
import { NODES } from '../data/nodes';
import { MILESTONES, Milestone } from '../data/milestones';
import { BIBLE_BOOKS } from '../services/bibleService';

interface SocialModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: SocialTab;
    currentUserShareId: string;
    isDarkMode: boolean;
    onUpdateNotifications?: () => void;
    language: string;
}

const SocialModal: React.FC<SocialModalProps> = ({ isOpen, onClose, initialTab = 'inbox', currentUserShareId, onUpdateNotifications }) => {
    const { t } = useTranslation();
    const [currentView, setCurrentView] = useState<SocialTab>(initialTab);

    // Achievement Categories State
    const [achievementCategory, setAchievementCategory] = useState<'journey' | 'reading' | 'social' | 'consistency'>('journey');

    const [activeChatFriend, setActiveChatFriend] = useState<UserProfile | null>(null);
    const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);

    const [searchId, setSearchId] = useState('');
    const [searchResult, setSearchResult] = useState<UserProfile | null>(null);
    const [searchError, setSearchError] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [requestSent, setRequestSent] = useState(false);

    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [friends, setFriends] = useState<UserProfile[]>([]);
    const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
    const [loadingData, setLoadingData] = useState(false);
    const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);

    const updatesLog: any[] = Array.isArray(t('social.updatesList', { returnObjects: true }))
        ? (t('social.updatesList', { returnObjects: true }) as any[])
        : [];

    useEffect(() => {
        if (isOpen) {
            setCurrentView(initialTab);
            setActiveChatFriend(null);
            setViewingProfile(null);
        }
    }, [isOpen, initialTab]);

    useEffect(() => {
        if (isOpen && !activeChatFriend && !viewingProfile) {
            loadSocialData();
        }
    }, [isOpen, currentView, activeChatFriend, viewingProfile]);

    useEffect(() => {
        if (isOpen && currentView === 'profile') {
            db.social.getCurrentUser().then(p => {
                if (p) setCurrentUserProfile(p);
            }).catch(e => console.warn("Could not reload profile", e));
        }
    }, [currentView]);

    const loadSocialData = async () => {
        setLoadingData(true);
        const timer = setTimeout(() => {
            if (loadingData) setLoadingData(false);
        }, 8000);

        try {
            const [reqs, friendsList, myProfile] = await Promise.all([
                db.social.getIncomingRequests(),
                db.social.getFriends(),
                db.social.getCurrentUser()
            ]);

            setRequests(reqs);
            setCurrentUserProfile(myProfile);

            const unreadCount = friendsList.reduce((acc, f) => acc + (f.unread_count || 0), 0);
            setTotalUnreadMessages(unreadCount);

            const sortedFriends = friendsList.sort((a, b) => {
                if ((a.unread_count || 0) > 0 && (b.unread_count || 0) === 0) return -1;
                if ((a.unread_count || 0) === 0 && (b.unread_count || 0) > 0) return 1;
                const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
                const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
                if (timeA !== timeB) return timeB - timeA;
                return 0;
            });

            setFriends(sortedFriends);
        } catch (e) {
            console.error("Failed to load social data", e);
        } finally {
            clearTimeout(timer);
            setLoadingData(false);
        }
    };

    const handleSearch = async () => {
        if (!searchId.trim()) return;
        setSearchLoading(true);
        setSearchResult(null);
        setSearchError('');
        setRequestSent(false);

        try {
            if (searchId === currentUserShareId) {
                setSearchError("That is your own ID.");
                return;
            }

            const user = await db.social.searchUserByShareId(searchId.trim());
            if (user) {
                setViewingProfile(user);
                setSearchResult(user);
            } else {
                setSearchError("User not found. Check the ID.");
            }
        } catch (e) {
            setSearchError("Error searching user.");
        } finally {
            setSearchLoading(false);
        }
    };

    const sendRequest = async (targetId: string) => {
        setSearchLoading(true);
        try {
            await db.social.sendFriendRequest(targetId);
            setRequestSent(true);
            alert("Friend Request Sent!");
            setViewingProfile(null);
        } catch (e: any) {
            alert(e.message || "Failed to send request.");
        } finally {
            setSearchLoading(false);
        }
    };

    const handleRespond = async (requestId: string, accept: boolean) => {
        try {
            setRequests(prev => prev.filter(r => r.id !== requestId));
            if (onUpdateNotifications) onUpdateNotifications();
            await db.social.respondToRequest(requestId, accept);
        } catch (e) {
            console.error("Response failed", e);
        }
    };

    const handleUnfriend = async (friendId: string) => {
        setFriends(prev => prev.filter(f => f.id !== friendId));
        setViewingProfile(null);
        try {
            await db.social.removeFriend(friendId);
        } catch (e: any) {
            console.error("Background friend delete failed", e);
        }
    }

    const copyMyId = () => {
        navigator.clipboard.writeText(currentUserShareId);
    };

    const isOnline = (isoDate?: string) => {
        if (!isoDate) return false;
        const diff = Date.now() - new Date(isoDate).getTime();
        return diff < 5 * 60 * 1000;
    };

    const handleOpenChat = (friend: UserProfile) => {
        setFriends(prev => prev.map(f => f.id === friend.id ? { ...f, unread_count: 0 } : f));
        setTotalUnreadMessages(prev => {
            const count = friend.unread_count || 0;
            return Math.max(0, prev - count);
        });
        setActiveChatFriend(friend);
    };

    const handleReturnFromChat = () => {
        const friendId = activeChatFriend?.id;
        setActiveChatFriend(null);
        if (onUpdateNotifications) onUpdateNotifications();
        if (friendId) {
            setFriends(prev => prev.map(f => f.id === friendId ? { ...f, unread_count: 0 } : f));
        }
        loadSocialData();
    };

    // --- Render Helpers ---

    const renderBadge = (m: Milestone, isUnlocked: boolean) => {
        const tierStyles = {
            bronze: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
            silver: 'bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
            gold: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
            diamond: 'bg-cyan-50 border-cyan-200 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800'
        };

        const iconBg = {
            bronze: 'bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-100',
            silver: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-100',
            gold: 'bg-yellow-200 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-100',
            diamond: 'bg-cyan-200 dark:bg-cyan-800 text-cyan-700 dark:text-cyan-100'
        };

        return (
            <div key={m.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${isUnlocked ? tierStyles[m.tier] : 'bg-slate-50/50 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 opacity-50 grayscale'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isUnlocked ? iconBg[m.tier] : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                    <m.icon size={24} />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm leading-tight mb-0.5 truncate">{m.title}</h4>
                    <p className="text-[10px] uppercase font-bold opacity-70 tracking-wide">{m.description}</p>
                </div>
                {isUnlocked ? (
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-black/20 flex items-center justify-center">
                        <Check className="text-green-500" size={16} strokeWidth={3} />
                    </div>
                ) : (
                    <Lock size={16} className="opacity-30" />
                )}
            </div>
        );
    };

    const renderMilestones = (user: UserProfile, friendCount: number) => {
        // Logic for calculating progress - Fixed to check FULL completion
        const readChaptersMap = user.read_chapters || {};
        const booksRead = Object.keys(readChaptersMap).filter(bookId => {
            const bookData = BIBLE_BOOKS.find(b => b.id === bookId);
            if (!bookData) return false;
            // Count unique chapters read for this book
            const uniqueReadCount = new Set(readChaptersMap[bookId] || []).size;
            return uniqueReadCount >= bookData.chapters;
        }).length;

        const streak = user.streak || 0;
        const journeyLevel = (user.completed_nodes || []).length;

        const filteredMilestones = MILESTONES.filter(m => m.category === achievementCategory);

        return (
            <div className="space-y-4 w-full animate-fade-in">
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto no-scrollbar mb-2">
                    {[
                        { id: 'journey', label: 'Journey', icon: Footprints, color: 'text-amber-500' },
                        { id: 'reading', label: 'Reading', icon: BookOpen, color: 'text-blue-500' },
                        { id: 'social', label: 'Social', icon: Users, color: 'text-indigo-500' },
                        { id: 'consistency', label: 'Streak', icon: Flame, color: 'text-rose-500' }
                    ].map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setAchievementCategory(cat.id as any)}
                            className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${achievementCategory === cat.id ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <cat.icon size={12} className={achievementCategory === cat.id ? cat.color : ''} />
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredMilestones.map(m => {
                        let unlocked = false;
                        if (m.category === 'social') unlocked = friendCount >= m.threshold;
                        if (m.category === 'reading') unlocked = booksRead >= m.threshold;
                        if (m.category === 'consistency') unlocked = streak >= m.threshold;
                        if (m.category === 'journey') unlocked = journeyLevel >= m.threshold;
                        return renderBadge(m, unlocked);
                    })}
                </div>
            </div>
        );
    };

    // --- Main Render ---

    if (!isOpen) return null;

    if (activeChatFriend) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
                <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[85vh] animate-scale-in border border-slate-200 dark:border-slate-800">
                    <FriendChat
                        friend={activeChatFriend}
                        onBack={handleReturnFromChat}
                        currentUserShareId={currentUserShareId}
                        onMessagesRead={onUpdateNotifications}
                    />
                </div>
            </div>
        );
    }

    // Viewing Profile Render (Either mine or friend's)
    const profileToRender = viewingProfile || currentUserProfile;

    if (currentView === 'profile' || viewingProfile) {
        const isFriend = viewingProfile ? friends.some(f => f.id === viewingProfile.id) : false;
        const isMe = !viewingProfile;
        const friendCount = isMe ? friends.length : 0;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={viewingProfile ? () => setViewingProfile(null) : onClose} />
                <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-scale-in border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] h-[85vh]">

                    {/* Header */}
                    <div className="absolute top-4 left-4 z-20">
                        <button
                            onClick={viewingProfile ? () => setViewingProfile(null) : onClose}
                            className="p-2 bg-black/20 text-white rounded-full hover:bg-black/30 backdrop-blur-sm shadow-lg transition-transform hover:scale-105"
                        >
                            {viewingProfile ? <ArrowLeft size={20} /> : <X size={20} />}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto w-full no-scrollbar">
                        <div className="h-32 bg-gradient-to-r from-[#7c4a32] to-[#54362d] relative shrink-0">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        </div>

                        <div className="px-6 pb-6 flex flex-col items-center text-center">
                            <div className="-mt-12 w-28 h-28 rounded-full border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-800 overflow-hidden shadow-lg mb-2 relative z-10 animate-pop-in">
                                {profileToRender?.avatar ? <img src={profileToRender.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400"><User size={48} /></div>}
                            </div>

                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-serif-text">{profileToRender?.display_name || "Unknown"}</h2>
                                {(profileToRender?.streak || 0) > 0 && <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800"><Flame size={12} className="text-amber-500 fill-amber-500 animate-pulse" /><span className="text-xs font-bold text-amber-700 dark:text-amber-400">{profileToRender?.streak}</span></div>}
                            </div>

                            <div className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-6">
                                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-mono font-semibold tracking-wide">{profileToRender?.share_id || "..."}</p>
                            </div>

                            {/* Dynamic Content */}
                            {profileToRender && renderMilestones(profileToRender, friendCount)}

                            {/* Action Buttons (Only if viewing someone else) */}
                            {viewingProfile && (
                                <div className="flex gap-3 w-full mt-8">
                                    {isFriend ? (
                                        <>
                                            <button onClick={() => { handleOpenChat(viewingProfile); setViewingProfile(null); }} className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 hover:scale-105"><MessageCircle size={18} /> {t('social.profile.message')}</button>
                                            <button onClick={() => handleUnfriend(viewingProfile.id)} className="px-4 py-3.5 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 rounded-xl font-medium hover:bg-red-200 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800 transition-colors shadow-sm"><Trash2 size={20} /></button>
                                        </>
                                    ) : (
                                        <button onClick={() => sendRequest(viewingProfile.id)} className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 hover:scale-105"><UserPlus size={18} /> {t('social.profile.addFriend')}</button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Normal Tabs (Inbox, Friends, Add) ---

    const getHeaderConfig = () => {
        switch (currentView) {
            case 'inbox': return { title: t('social.inbox.title'), icon: Bell, showAdd: false, showBack: false };
            case 'friends': return { title: t('social.friends.title'), icon: Users, showAdd: true, showBack: false };
            case 'add': return { title: t('social.add.title'), icon: UserPlus, showAdd: false, showBack: true };
            default: return { title: "Social", icon: Circle, showAdd: false, showBack: false };
        }
    };
    const header = getHeaderConfig();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] h-[85vh] animate-scale-in border border-slate-200/50 dark:border-slate-800/50">

                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {header.showBack && (
                            <button
                                onClick={() => setCurrentView('friends')}
                                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <div className="flex items-center gap-2">
                            <header.icon size={20} className="text-[#7c4a32] dark:text-[#d2b48c]" />
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white font-serif-text">{header.title}</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {header.showAdd && (
                            <button
                                onClick={() => setCurrentView('add')}
                                className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors shadow-sm"
                            >
                                <UserPlus size={18} />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:rotate-90 transition-transform">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">

                    {currentView === 'inbox' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                    {t('social.inbox.requests')}
                                    {requests.length > 0 && <span className="ml-2 bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-[10px]">{requests.length} New</span>}
                                </h3>
                                {loadingData ? (
                                    <div className="text-center py-4 text-slate-400 text-sm animate-pulse">{t('common.loading')}</div>
                                ) : requests.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 text-sm italic bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">{t('social.inbox.noRequests')}</div>
                                ) : (
                                    <div className="space-y-2">
                                        {requests.map((req, i) => (
                                            <div
                                                key={req.id}
                                                className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 animate-slide-up"
                                                style={{ animationDelay: `${i * 0.1}s` }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                                        {req.requester?.avatar ? <img src={req.requester.avatar} className="w-full h-full object-cover" /> : <User size={20} className="text-[#7c4a32] dark:text-slate-300" />}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-800 dark:text-white">{req.requester?.display_name || "Unknown User"}</div>
                                                        <div className="text-xs text-slate-500">ID: {req.requester?.share_id || "?"}</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleRespond(req.id, true)} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 hover:scale-110 transition-transform"><Check size={16} /></button>
                                                    <button onClick={() => handleRespond(req.id, false)} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 hover:scale-110 transition-transform"><X size={16} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('social.inbox.updates')}</h3>
                                <div className="space-y-3">
                                    {updatesLog.map((update: any, idx: number) => (
                                        <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 animate-slide-up" style={{ animationDelay: `${0.2 + (idx * 0.1)}s` }}>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-sm font-bold text-[#7c4a32] dark:text-[#d2b48c]">v{update.version}</span>
                                                <span className="text-xs text-slate-400">{update.date}</span>
                                            </div>
                                            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">{update.title}</h4>
                                            <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc ml-4 space-y-1">
                                                {update.changes.map((c: string, i: number) => <li key={i}>{c}</li>)}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentView === 'friends' && (
                        <div className="space-y-3">
                            {loadingData ? (
                                <div className="text-center py-8 text-slate-400 animate-pulse">{t('common.loading')}</div>
                            ) : friends.length === 0 ? (
                                <div className="text-center py-20 opacity-60">
                                    <Users size={48} className="mx-auto mb-2 text-slate-300" />
                                    <p className="text-slate-500">{t('social.friends.empty')}</p>
                                </div>
                            ) : (
                                friends.map((friend, i) => {
                                    if (!friend) return null;
                                    const online = isOnline(friend.last_seen);
                                    const hasUnread = (friend.unread_count || 0) > 0;

                                    return (
                                        <div
                                            key={friend.id}
                                            onClick={() => setViewingProfile(friend)}
                                            className={`
                                        flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border transition-all cursor-pointer group relative overflow-hidden animate-slide-up
                                        ${hasUnread ? 'border-amber-300 dark:border-amber-700 shadow-md ring-1 ring-amber-100 dark:ring-amber-900' : 'border-slate-100 dark:border-slate-700 hover:shadow-md hover:scale-[1.01]'}
                                    `}
                                            style={{ animationDelay: `${i * 0.05}s` }}
                                        >
                                            {hasUnread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 animate-pulse"></div>}

                                            <div className="flex items-center gap-3 pl-2">
                                                <div className="relative">
                                                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-[#7c4a32] transition-colors">
                                                        {friend.avatar ? <img src={friend.avatar} className="w-full h-full object-cover" /> : <User size={24} className="text-slate-400" />}
                                                    </div>
                                                    {online && (
                                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full shadow-sm animate-pulse" title={t('social.status.online')}></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`font-medium transition-colors ${hasUnread ? 'text-amber-700 dark:text-amber-300 font-bold' : 'text-slate-800 dark:text-white group-hover:text-[#7c4a32]'}`}>
                                                            {friend.display_name || "Friend"}
                                                        </div>
                                                        {(friend.streak || 0) > 0 && (
                                                            <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-full text-[10px] text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                                                <Flame size={8} className="fill-current" /> {friend.streak}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className={`text-xs truncate max-w-[120px] ${hasUnread ? 'text-amber-600 font-medium' : 'text-slate-500'}`}>
                                                        {hasUnread ? `${friend.unread_count} new messages` : (friend.bio || friend.share_id)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {hasUnread && (
                                                    <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-sm animate-bounce">
                                                        {friend.unread_count}
                                                    </div>
                                                )}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenChat(friend); }}
                                                    className={`p-2 rounded-lg transition-colors ${hasUnread ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-700 text-[#7c4a32] dark:text-[#d2b48c] hover:bg-slate-100 dark:hover:bg-slate-600 hover:scale-110'}`}
                                                    title={t('social.profile.message')}
                                                >
                                                    <MessageCircle size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {currentView === 'add' && (
                        <div className="space-y-6 animate-slide-in-right">
                            <div className="bg-gradient-to-br from-[#7c4a32] to-[#54362d] rounded-xl p-6 text-white shadow-lg animate-float">
                                <div className="text-xs font-medium opacity-80 uppercase tracking-wide mb-2">{t('social.add.yourId')}</div>
                                <div className="flex items-center justify-between bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/10">
                                    <div className="text-2xl font-bold font-mono tracking-wider">{currentUserShareId}</div>
                                    <button onClick={copyMyId} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors hover:scale-110 active:scale-95 shadow-sm" title={t('common.original')}>
                                        <Copy size={18} />
                                    </button>
                                </div>
                                <div className="text-[10px] mt-3 opacity-70 flex items-center gap-1">
                                    <Info size={12} /> {t('social.add.shareText')}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">{t('social.add.enterId')}</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={searchId}
                                        onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                                        placeholder="NAME-1234"
                                        className="flex-1 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 dark:text-white uppercase placeholder:normal-case transition-all focus:shadow-md"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        disabled={searchLoading || !searchId}
                                        className="px-4 bg-[#7c4a32] text-white rounded-xl hover:bg-[#54362d] disabled:opacity-50 hover:scale-105 active:scale-95 transition-transform shadow-md"
                                        title={t('social.add.search')}
                                    >
                                        <Search size={20} />
                                    </button>
                                </div>
                                {searchError && <div className="mt-2 text-xs text-red-500 flex items-center gap-1 animate-fade-in"><AlertCircle size={12} /> {searchError}</div>}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default SocialModal;
