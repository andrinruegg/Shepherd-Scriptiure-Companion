
import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users, Bell, Search, Check, AlertCircle, Copy, User, MessageCircle, ArrowLeft, Trash2, Shield, Info, Circle, Flame, Award, Book, Scroll, Trophy } from 'lucide-react';
import { UserProfile, FriendRequest, AppUpdate, Achievement } from '../types';
import { db } from '../services/db';
import FriendChat from './FriendChat';

interface SocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserShareId: string;
  isDarkMode: boolean;
  onUpdateNotifications?: () => void; // New callback
}

const UPDATES_LOG: AppUpdate[] = [
    { version: "1.5.0", date: "2025-12-11", title: "Quiz & Achievements", changes: ["Added Bible Trivia mode", "Earn achievements for perfect scores", "View friend's streaks and badges", "Global progress tracking"] },
    { version: "1.4.0", date: "2025-12-10", title: "Graffiti Perfection", changes: ["Fixed Graffiti Mode saving issues", "Smoother drawing experience", "Improved upload reliability"] },
    { version: "1.3.0", date: "2025-12-09", title: "Social Chat", changes: ["Real-time messaging with friends", "Photo sharing", "Voice messages", "Online Status & Read Receipts"] },
    { version: "1.2.0", date: "2025-12-09", title: "Winter Update", changes: ["Added festive Winter Mode", "Improved splash screen visuals", "Bug fixes for API connectivity"] },
    { version: "1.1.0", date: "2025-12-08", title: "Bible Reader", changes: ["Added full Bible reader", "Highlighting support", "Save verses to collection"] },
    { version: "1.0.0", date: "2025-12-08", title: "Initial Launch", changes: ["Shepherd AI Chat", "Supabase Integration"] }
];

const SocialModal: React.FC<SocialModalProps> = ({ isOpen, onClose, currentUserShareId, isDarkMode, onUpdateNotifications }) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'friends' | 'add' | 'profile'>('inbox');
  
  // Navigation States
  const [activeChatFriend, setActiveChatFriend] = useState<UserProfile | null>(null);
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);

  // Search States
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<UserProfile | null>(null);
  const [searchError, setSearchError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  
  // Data Lists
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);

  useEffect(() => {
      if (isOpen && !activeChatFriend && !viewingProfile) {
          loadSocialData();
      }
  }, [isOpen, activeTab, activeChatFriend, viewingProfile]);

  // Force refresh when switching to Profile tab to ensure latest Trophies are visible
  useEffect(() => {
      if (isOpen && activeTab === 'profile') {
          db.social.getCurrentUser().then(p => {
              if(p) setCurrentUserProfile(p);
          });
      }
  }, [activeTab]);

  const loadSocialData = async () => {
      setLoadingData(true);
      // Timeout fallback to prevent infinite loading state
      const timer = setTimeout(() => {
          if (loadingData) setLoadingData(false);
      }, 8000);

      try {
          // Always load to keep badges updated, but optimize if needed
          const [reqs, friendsList, myProfile] = await Promise.all([
              db.social.getIncomingRequests(),
              db.social.getFriends(),
              db.social.getCurrentUser()
          ]);
          
          setRequests(reqs);
          setCurrentUserProfile(myProfile);
          
          // Calculate total unread
          const unreadCount = friendsList.reduce((acc, f) => acc + (f.unread_count || 0), 0);
          setTotalUnreadMessages(unreadCount);

          // Sort Friends
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
          setViewingProfile(null); // Go back
      } catch (e: any) {
          alert(e.message || "Failed to send request.");
      } finally {
          setSearchLoading(false);
      }
  };

  const handleRespond = async (requestId: string, accept: boolean) => {
      try {
          // Optimistic update
          setRequests(prev => prev.filter(r => r.id !== requestId));
          
          // Trigger Bell update immediately
          if (onUpdateNotifications) onUpdateNotifications();

          await db.social.respondToRequest(requestId, accept);
      } catch (e) {
          console.error("Response failed", e);
      }
  };

  const handleUnfriend = async (friendId: string) => {
      // INSTANTLY HIDE (Optimistic)
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
      return diff < 5 * 60 * 1000; // Online if active in last 5 mins
  };

  // Called when clicking to chat
  const handleOpenChat = (friend: UserProfile) => {
      // 1. Optimistic UI update: Remove unread badge locally for this friend immediately
      setFriends(prev => prev.map(f => f.id === friend.id ? { ...f, unread_count: 0 } : f));
      
      // 2. Reduce total count immediately
      setTotalUnreadMessages(prev => {
          const count = friend.unread_count || 0;
          return Math.max(0, prev - count);
      });

      // 3. Open the chat
      setActiveChatFriend(friend);
  };

  // Callback when returning from chat
  const handleReturnFromChat = () => {
      const friendId = activeChatFriend?.id;
      setActiveChatFriend(null);

      // Force update of main Bell icon
      if (onUpdateNotifications) onUpdateNotifications();

      // Ensure local state is clean
      if (friendId) {
          setFriends(prev => prev.map(f => f.id === friendId ? { ...f, unread_count: 0 } : f));
      }

      loadSocialData();
  };

  if (!isOpen) return null;

  // --- SUB-VIEW: CHAT ---
  if (activeChatFriend) {
      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
              <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[85vh] animate-scale-in border border-slate-200 dark:border-slate-800">
                  <FriendChat 
                      friend={activeChatFriend} 
                      onBack={handleReturnFromChat} 
                      currentUserShareId={currentUserShareId}
                      onMessagesRead={onUpdateNotifications} // Pass update handler to chat
                  />
              </div>
          </div>
      );
  }

  // --- SUB-VIEW: PROFILE DETAILS ---
  if (viewingProfile) {
      const isFriend = friends.some(f => f.id === viewingProfile.id);
      
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setViewingProfile(null)} />
             
             {/* Profile Card */}
             <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-scale-in border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] h-[85vh]">
                 <button 
                    onClick={() => setViewingProfile(null)} 
                    className="absolute top-4 left-4 p-2 bg-black/20 text-white rounded-full hover:bg-black/30 backdrop-blur-sm z-20 shadow-lg"
                 >
                     <ArrowLeft size={20} />
                 </button>

                 <div className="flex-1 overflow-y-auto w-full no-scrollbar">
                     <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative shrink-0">
                         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                     </div>

                     <div className="px-6 pb-6 flex flex-col items-center text-center">
                         <div className="-mt-12 w-28 h-28 rounded-full border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-800 overflow-hidden shadow-lg mb-2 relative z-10 animate-pop-in">
                             {viewingProfile.avatar ? (
                                 <img src={viewingProfile.avatar} className="w-full h-full object-cover" />
                             ) : (
                                 <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
                                     <User size={48} />
                                 </div>
                             )}
                         </div>

                         <div className="flex items-center gap-2 mb-1">
                             <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-serif-text">
                                 {viewingProfile.display_name || "Unknown"}
                             </h2>
                             {/* Daily Streak Badge */}
                             {(viewingProfile.streak || 0) > 0 && (
                                 <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                                     <Flame size={12} className="text-amber-500 fill-amber-500 animate-pulse" />
                                     <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{viewingProfile.streak}</span>
                                 </div>
                             )}
                         </div>
                         
                         <div className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-6">
                            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-mono font-semibold tracking-wide">
                                {viewingProfile.share_id || "ID-ERROR"}
                            </p>
                         </div>

                         <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 mb-4 border border-slate-100 dark:border-slate-800 text-left shadow-sm">
                             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About</h4>
                             {viewingProfile.bio ? (
                                 <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed whitespace-pre-wrap">
                                     {viewingProfile.bio}
                                 </p>
                             ) : (
                                 <p className="text-xs text-slate-400 italic text-center py-2">No bio available.</p>
                             )}
                         </div>

                         {/* Achievements Section */}
                         {viewingProfile.achievements && viewingProfile.achievements.length > 0 && (
                            <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-100 dark:border-slate-800 text-left shadow-sm">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                                    <Trophy size={12} /> Achievements
                                </h4>
                                <div className="grid grid-cols-4 gap-2">
                                    {viewingProfile.achievements.map((ach) => (
                                        <div key={ach.id} className="flex flex-col items-center gap-1 text-center" title={`${ach.title}: ${ach.description}`}>
                                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                                {ach.icon === 'Book' && <Book size={18} />}
                                                {ach.icon === 'Scroll' && <Scroll size={18} />}
                                                {ach.icon === 'Trophy' && <Trophy size={18} />}
                                                {ach.icon === 'Award' && <Award size={18} />}
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 leading-tight">{ach.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                         )}

                         <div className="flex gap-3 w-full mt-auto">
                             {isFriend ? (
                                 <>
                                     <button 
                                        onClick={() => { handleOpenChat(viewingProfile); setViewingProfile(null); }}
                                        className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 hover:scale-105"
                                     >
                                         <MessageCircle size={18} /> Message
                                     </button>
                                     <button 
                                        onClick={() => handleUnfriend(viewingProfile.id)}
                                        className="px-4 py-3.5 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 rounded-xl font-medium hover:bg-red-200 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800 transition-colors shadow-sm"
                                        title="Unfriend"
                                     >
                                         <Trash2 size={20} />
                                     </button>
                                 </>
                             ) : (
                                 <button 
                                    onClick={() => sendRequest(viewingProfile.id)}
                                    className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 hover:scale-105"
                                 >
                                     <UserPlus size={18} /> Add Friend
                                 </button>
                             )}
                         </div>
                     </div>
                 </div>
             </div>
        </div>
      );
  }

  // --- MAIN MODAL ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] h-[85vh] animate-scale-in border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 flex-shrink-0">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white font-serif-text">Social & Updates</h2>
            <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:rotate-90 transition-transform">
                <X size={20} />
            </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
            <button 
                onClick={() => setActiveTab('inbox')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'inbox' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm scale-105' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
                <Bell size={16} />
                Inbox
                {requests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-bounce">{requests.length}</span>}
            </button>
            <button 
                onClick={() => setActiveTab('friends')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'friends' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm scale-105' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
                <Users size={16} />
                Friends
                {totalUnreadMessages > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-bounce">{totalUnreadMessages}</span>}
            </button>
            <button 
                onClick={() => setActiveTab('add')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'add' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm scale-105' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
                <UserPlus size={16} />
                Add
            </button>
            <button 
                onClick={() => setActiveTab('profile')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm scale-105' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
                <User size={16} />
                Me
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900">
            
            {/* INBOX TAB */}
            {activeTab === 'inbox' && (
                <div className="space-y-6">
                    {/* Friend Requests Section */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                           Friend Requests
                           {requests.length > 0 && <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px]">{requests.length} New</span>}
                        </h3>
                        {loadingData ? (
                            <div className="text-center py-4 text-slate-400 text-sm animate-pulse">Loading...</div>
                        ) : requests.length === 0 ? (
                            <div className="text-center py-4 text-slate-400 text-sm italic bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">No pending requests</div>
                        ) : (
                            <div className="space-y-2">
                                {requests.map((req, i) => (
                                    <div 
                                        key={req.id} 
                                        className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 animate-slide-up"
                                        style={{ animationDelay: `${i * 0.1}s` }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                                {req.requester?.avatar ? <img src={req.requester.avatar} className="w-full h-full object-cover" /> : <User size={20} className="text-indigo-600 dark:text-slate-300"/>}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-slate-800 dark:text-white">{req.requester?.display_name || "Unknown User"}</div>
                                                <div className="text-xs text-slate-500">ID: {req.requester?.share_id || "?"}</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleRespond(req.id, true)} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 hover:scale-110 transition-transform"><Check size={16}/></button>
                                            <button onClick={() => handleRespond(req.id, false)} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 hover:scale-110 transition-transform"><X size={16}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Updates Log Section */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">System Updates</h3>
                        <div className="space-y-3">
                            {UPDATES_LOG.map((update, idx) => (
                                <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 animate-slide-up" style={{ animationDelay: `${0.2 + (idx * 0.1)}s` }}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">v{update.version}</span>
                                        <span className="text-xs text-slate-400">{update.date}</span>
                                    </div>
                                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">{update.title}</h4>
                                    <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc ml-4 space-y-1">
                                        {update.changes.map((c, i) => <li key={i}>{c}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* FRIENDS TAB */}
            {activeTab === 'friends' && (
                <div className="space-y-3">
                     {loadingData ? (
                        <div className="text-center py-8 text-slate-400 animate-pulse">Loading friends...</div>
                     ) : friends.length === 0 ? (
                        <div className="text-center py-10 opacity-60">
                            <Users size={48} className="mx-auto mb-2 text-slate-300"/>
                            <p className="text-slate-500">You haven't added any friends yet.</p>
                        </div>
                     ) : (
                        friends.map((friend, i) => {
                            if (!friend) return null; // Safe check
                            const online = isOnline(friend.last_seen);
                            const hasUnread = (friend.unread_count || 0) > 0;
                            
                            return (
                                <div 
                                    key={friend.id} 
                                    onClick={() => setViewingProfile(friend)}
                                    className={`
                                        flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border transition-all cursor-pointer group relative overflow-hidden animate-slide-up
                                        ${hasUnread ? 'border-indigo-300 dark:border-indigo-700 shadow-md ring-1 ring-indigo-100 dark:ring-indigo-900' : 'border-slate-100 dark:border-slate-700 hover:shadow-md hover:scale-[1.01]'}
                                    `}
                                    style={{ animationDelay: `${i * 0.05}s` }}
                                >
                                    {/* Unread Flash Effect */}
                                    {hasUnread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 animate-pulse"></div>}

                                    <div className="flex items-center gap-3 pl-2">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-indigo-400 transition-colors">
                                                {friend.avatar ? <img src={friend.avatar} className="w-full h-full object-cover"/> : <User size={24} className="text-slate-400"/>}
                                            </div>
                                            {/* Online Status Indicator */}
                                            {online && (
                                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full shadow-sm animate-pulse" title="Online"></div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <div className={`font-medium transition-colors ${hasUnread ? 'text-indigo-700 dark:text-indigo-300 font-bold' : 'text-slate-800 dark:text-white group-hover:text-indigo-600'}`}>
                                                    {friend.display_name || "Friend"}
                                                </div>
                                                {/* Streak Icon in List */}
                                                {(friend.streak || 0) > 0 && (
                                                    <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-full text-[10px] text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                                        <Flame size={8} className="fill-current" /> {friend.streak}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`text-xs truncate max-w-[120px] ${hasUnread ? 'text-indigo-500 font-medium' : 'text-slate-500'}`}>
                                                {hasUnread ? `${friend.unread_count} new messages` : (friend.bio || friend.share_id)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        {hasUnread && (
                                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-sm animate-bounce">
                                                {friend.unread_count}
                                            </div>
                                        )}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleOpenChat(friend); }}
                                            className={`p-2 rounded-lg transition-colors ${hasUnread ? 'bg-indigo-600 text-white shadow-md' : 'bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-slate-600 hover:scale-110'}`}
                                            title="Chat"
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

            {/* ADD FRIEND TAB */}
            {activeTab === 'add' && (
                <div className="space-y-6 animate-slide-in-right">
                    {/* My ID Card */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white shadow-lg animate-float">
                        <div className="text-xs font-medium opacity-80 uppercase tracking-wide mb-1">Your Share ID</div>
                        <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold font-mono tracking-wider">{currentUserShareId}</div>
                            <button onClick={copyMyId} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors hover:scale-110 active:scale-95">
                                <Copy size={18} />
                            </button>
                        </div>
                        <div className="text-[10px] mt-2 opacity-70">Share this ID with friends so they can add you.</div>
                    </div>

                    {/* Search Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Enter Friend's ID</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                                placeholder="NAME-1234"
                                className="flex-1 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white uppercase placeholder:normal-case transition-all focus:shadow-md"
                            />
                            <button 
                                onClick={handleSearch}
                                disabled={searchLoading || !searchId}
                                className="px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 hover:scale-105 active:scale-95 transition-transform"
                            >
                                <Search size={20} />
                            </button>
                        </div>
                        {searchError && <div className="mt-2 text-xs text-red-500 flex items-center gap-1 animate-fade-in"><AlertCircle size={12}/> {searchError}</div>}
                    </div>
                </div>
            )}

            {/* MY PROFILE TAB */}
            {activeTab === 'profile' && currentUserProfile && (
                <div className="animate-slide-up flex flex-col items-center pt-6">
                     <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-lg mb-3 relative">
                         {currentUserProfile.avatar ? (
                             <img src={currentUserProfile.avatar} className="w-full h-full object-cover" />
                         ) : (
                             <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
                                 <User size={40} />
                             </div>
                         )}
                     </div>

                     <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-serif-text mb-1">
                         {currentUserProfile.display_name}
                     </h2>
                     <div className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-6">
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-semibold tracking-wide">
                            {currentUserProfile.share_id}
                        </p>
                     </div>

                     <div className="w-full grid grid-cols-2 gap-3 mb-6">
                         <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                             <div className="text-xs text-slate-400 font-bold uppercase mb-1">Daily Streak</div>
                             <div className="flex items-center justify-center gap-1 text-xl font-bold text-amber-500">
                                 <Flame size={20} fill="currentColor" /> {currentUserProfile.streak || 0}
                             </div>
                         </div>
                         <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                             <div className="text-xs text-slate-400 font-bold uppercase mb-1">Achievements</div>
                             <div className="flex items-center justify-center gap-1 text-xl font-bold text-purple-500">
                                 <Trophy size={20} /> {(currentUserProfile.achievements || []).length}
                             </div>
                         </div>
                     </div>

                     <div className="w-full bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                             <Award size={14} /> My Trophy Case
                         </h4>
                         
                         {(currentUserProfile.achievements && currentUserProfile.achievements.length > 0) ? (
                            <div className="grid grid-cols-4 gap-3">
                                {currentUserProfile.achievements.map((ach) => (
                                    <div key={ach.id} className="flex flex-col items-center gap-1 text-center group relative cursor-help">
                                        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 transition-transform group-hover:scale-110">
                                            {ach.icon === 'Book' && <Book size={20} />}
                                            {ach.icon === 'Scroll' && <Scroll size={20} />}
                                            {ach.icon === 'Trophy' && <Trophy size={20} />}
                                            {ach.icon === 'Award' && <Award size={20} />}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-tight mt-1">{ach.title}</span>
                                        
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                            {ach.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                         ) : (
                             <div className="text-center py-6 text-slate-400 italic text-sm">
                                 No trophies yet. Play Trivia to earn them!
                             </div>
                         )}
                     </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default SocialModal;
