import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users, Bell, Search, Check, AlertCircle, Copy, User, MessageCircle, ArrowLeft, Trash2, Shield, Info, Circle, Flame, Award, Book, Scroll, Trophy } from 'lucide-react';
import { UserProfile, FriendRequest, AppUpdate, Achievement, SocialTab } from '../types.ts';
import { db } from '../services/db.ts';
import FriendChat from './FriendChat.tsx';
import { translations } from '../utils/translations.ts';

interface SocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SocialTab;
  currentUserShareId: string;
  isDarkMode: boolean;
  onUpdateNotifications?: () => void;
  language: string;
}

const ACHIEVEMENT_STRUCTURE = [
    { id: 'perfect-easy', icon: 'Book' },
    { id: 'perfect-medium', icon: 'Scroll' },
    { id: 'perfect-hard', icon: 'Trophy' }
];

const SocialModal: React.FC<SocialModalProps> = ({ isOpen, onClose, initialTab = 'inbox', currentUserShareId, isDarkMode, onUpdateNotifications, language }) => {
  const [currentView, setCurrentView] = useState<SocialTab>(initialTab);
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

  const t = translations[language]?.social || translations['English'].social;
  const commonT = translations[language]?.common || translations['English'].common;
  const updatesLog = t.updatesList || []; 

  useEffect(() => {
      if (isOpen) setCurrentView(initialTab);
  }, [isOpen, initialTab]);

  useEffect(() => {
      if (isOpen && !activeChatFriend && !viewingProfile) loadSocialData();
  }, [isOpen, currentView, activeChatFriend, viewingProfile]);

  useEffect(() => {
      if (isOpen && currentView === 'profile') {
          db.social.getCurrentUser().then(p => { if(p) setCurrentUserProfile(p); });
      }
  }, [currentView]);

  const loadSocialData = async () => {
      setLoadingData(true);
      try {
          const [reqs, friendsList, myProfile] = await Promise.all([
              db.social.getIncomingRequests(),
              db.social.getFriends(),
              db.social.getCurrentUser()
          ]);
          setRequests(reqs);
          setCurrentUserProfile(myProfile);
          setTotalUnreadMessages(friendsList.reduce((acc, f) => acc + (f.unread_count || 0), 0));
          setFriends(friendsList.sort((a, b) => {
              if ((a.unread_count || 0) > 0 && (b.unread_count || 0) === 0) return -1;
              if ((a.unread_count || 0) === 0 && (b.unread_count || 0) > 0) return 1;
              const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
              const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
              return timeB - timeA;
          }));
      } catch (e) {
          console.error(e);
      } finally {
          setLoadingData(false);
      }
  };

  const handleSearch = async () => {
      if (!searchId.trim()) return;
      setSearchLoading(true);
      setSearchResult(null);
      setSearchError('');
      try {
          if (searchId === currentUserShareId) { setSearchError("That is your own ID."); return; }
          const user = await db.social.searchUserByShareId(searchId.trim());
          if (user) { setViewingProfile(user); setSearchResult(user); }
          else setSearchError("User not found.");
      } catch (e) { setSearchError("Error searching user."); } finally { setSearchLoading(false); }
  };

  const sendRequest = async (targetId: string) => {
      setSearchLoading(true);
      try { await db.social.sendFriendRequest(targetId); alert("Friend Request Sent!"); setViewingProfile(null); }
      catch (e: any) { alert(e.message || "Failed."); } finally { setSearchLoading(false); }
  };

  const handleRespond = async (requestId: string, accept: boolean) => {
      try {
          setRequests(prev => prev.filter(r => r.id !== requestId));
          if (onUpdateNotifications) onUpdateNotifications();
          await db.social.respondToRequest(requestId, accept);
      } catch (e) { console.error(e); }
  };

  const handleUnfriend = async (friendId: string) => {
      setFriends(prev => prev.filter(f => f.id !== friendId));
      setViewingProfile(null); 
      try { await db.social.removeFriend(friendId); } catch (e) { }
  }

  const copyMyId = () => navigator.clipboard.writeText(currentUserShareId);
  const isOnline = (isoDate?: string) => isoDate && (Date.now() - new Date(isoDate).getTime() < 5 * 60 * 1000);
  const handleOpenChat = (friend: UserProfile) => {
      setFriends(prev => prev.map(f => f.id === friend.id ? { ...f, unread_count: 0 } : f));
      setActiveChatFriend(friend);
  };
  const handleReturnFromChat = () => { setActiveChatFriend(null); loadSocialData(); };

  const renderAchievementGrid = (userAchievements: Achievement[] = []) => {
      const unlockedIds = new Set(userAchievements.map(a => a.id));
      const renderItem = (achStruct: any, isUnlocked: boolean) => {
          const localized = t.achievementList[achStruct.id] || { title: achStruct.id, description: "..." };
          return (
              <div key={achStruct.id} className={`flex flex-col items-center gap-1 text-center group relative cursor-help ${isUnlocked ? '' : 'opacity-50 grayscale'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-transform group-hover:scale-110 ${isUnlocked ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 border-amber-200' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 border-slate-300'}`}>
                      {achStruct.icon === 'Book' && <Book size={18} />}
                      {achStruct.icon === 'Scroll' && <Scroll size={18} />}
                      {achStruct.icon === 'Trophy' && <Trophy size={18} />}
                  </div>
                  <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 leading-tight">{localized.title}</span>
              </div>
          );
      };
      return (
          <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-100 dark:border-slate-800 text-left shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1"><Trophy size={12} /> {t.profile.achievements}</h4>
              <div className="grid grid-cols-4 gap-2">{ACHIEVEMENT_STRUCTURE.map(ach => renderItem(ach, unlockedIds.has(ach.id)))}</div>
          </div>
      );
  };

  if (!isOpen) return null;
  if (activeChatFriend) return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} /><div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[85vh] animate-scale-in border border-slate-200 dark:border-slate-800"><FriendChat friend={activeChatFriend} onBack={handleReturnFromChat} currentUserShareId={currentUserShareId} onMessagesRead={onUpdateNotifications} /></div></div>);
  if (viewingProfile) return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewingProfile(null)} /><div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-scale-in border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] h-[85vh]"><button onClick={() => setViewingProfile(null)} className="absolute top-4 left-4 p-2 bg-black/20 text-white rounded-full z-20 shadow-lg"><ArrowLeft size={20} /></button><div className="flex-1 overflow-y-auto w-full no-scrollbar"><div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative shrink-0"><div className="absolute inset-0 opacity-20"></div></div><div className="px-6 pb-6 flex flex-col items-center text-center"><div className="-mt-12 w-28 h-28 rounded-full border-4 border-white dark:border-slate-900 bg-white overflow-hidden shadow-lg mb-2 relative z-10">{viewingProfile.avatar ? <img src={viewingProfile.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400"><User size={48} /></div>}</div><div className="flex items-center gap-2 mb-1"><h2 className="text-2xl font-bold text-slate-800 dark:text-white font-serif-text">{viewingProfile.display_name}</h2>{(viewingProfile.streak || 0) > 0 && <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200"><Flame size={12} className="text-amber-500 fill-amber-500"/><span className="text-xs font-bold text-amber-700">{viewingProfile.streak}</span></div>}</div><div className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-6"><p className="text-sm text-indigo-600 dark:text-indigo-400 font-mono font-semibold tracking-wide">{viewingProfile.share_id}</p></div><div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 mb-4 border border-slate-100 dark:border-slate-800 text-left shadow-sm"><h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.profile.about}</h4>{viewingProfile.bio ? <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed whitespace-pre-wrap">{viewingProfile.bio}</p> : <p className="text-xs text-slate-400 italic text-center py-2">{t.noBio || "No bio."}</p>}</div>{renderAchievementGrid(viewingProfile.achievements || [])}<div className="flex gap-3 w-full mt-auto">{friends.some(f => f.id === viewingProfile.id) ? (<><button onClick={() => { handleOpenChat(viewingProfile); setViewingProfile(null); }} className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"><MessageCircle size={18} /> {t.profile.message}</button><button onClick={() => handleUnfriend(viewingProfile.id)} className="px-4 py-3.5 bg-red-100 text-red-600 rounded-xl font-medium hover:bg-red-200 border border-red-200 shadow-sm"><Trash2 size={20} /></button></>) : (<button onClick={() => sendRequest(viewingProfile.id)} className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"><UserPlus size={18} /> {t.profile.addFriend}</button>)}</div></div></div></div></div>);

  const getHeaderConfig = () => {
      switch(currentView) {
          case 'inbox': return { title: t.inbox?.title || "Notifications", icon: Bell, showAdd: false, showBack: false };
          case 'friends': return { title: t.friends?.title || "Friends", icon: Users, showAdd: true, showBack: false };
          case 'add': return { title: t.add?.title || "Add Friend", icon: UserPlus, showAdd: false, showBack: true };
          case 'profile': return { title: t.profile?.title || "My Profile", icon: User, showAdd: false, showBack: false };
          default: return { title: "Social", icon: Circle, showAdd: false, showBack: false };
      }
  };
  const header = getHeaderConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] h-[85vh] border border-slate-200/50 dark:border-slate-800/50">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50 flex-shrink-0">
            <div className="flex items-center gap-3">
                {header.showBack && (<button onClick={() => setCurrentView('friends')} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"><ArrowLeft size={20} /></button>)}
                <div className="flex items-center gap-2"><header.icon size={20} className="text-indigo-600 dark:text-indigo-400" /><h2 className="text-lg font-bold text-slate-800 dark:text-white font-serif-text">{header.title}</h2></div>
            </div>
            <div className="flex items-center gap-2">
                {header.showAdd && (<button onClick={() => setCurrentView('add')} className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full hover:bg-indigo-200 transition-colors shadow-sm"><UserPlus size={18} /></button>)}
                <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-transform"><X size={20} /></button>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
            {currentView === 'inbox' && (<div className="space-y-6"><div><h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t.inbox.requests}{requests.length > 0 && <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px]">{requests.length} New</span>}</h3>{loadingData ? (<div className="text-center py-4 text-slate-400 text-sm animate-pulse">{commonT.loading}</div>) : requests.length === 0 ? (<div className="text-center py-8 text-slate-400 text-sm italic bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">{t.inbox.noRequests}</div>) : (<div className="space-y-2">{requests.map(req => (<div key={req.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 animate-slide-up"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">{req.requester?.avatar ? <img src={req.requester.avatar} className="w-full h-full object-cover" /> : <User size={20} className="text-indigo-600"/>}</div><div><div className="text-sm font-semibold text-slate-800 dark:text-white">{req.requester?.display_name || "Unknown"}</div><div className="text-xs text-slate-500">ID: {req.requester?.share_id}</div></div></div><div className="flex gap-2"><button onClick={() => handleRespond(req.id, true)} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200"><Check size={16}/></button><button onClick={() => handleRespond(req.id, false)} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200"><X size={16}/></button></div></div>))}</div>)}</div><div><h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t.inbox.updates}</h3><div className="space-y-3">{updatesLog.map((update: any, idx: number) => (<div key={idx} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 animate-slide-up"><div className="flex justify-between items-start mb-2"><span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">v{update.version}</span><span className="text-xs text-slate-400">{update.date}</span></div><h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">{update.title}</h4><ul className="text-xs text-slate-600 dark:text-slate-400 list-disc ml-4 space-y-1">{update.changes.map((c: string, i: number) => <li key={i}>{c}</li>)}</ul></div>))}</div></div></div>)}
            {currentView === 'friends' && (<div className="space-y-3">{loadingData ? (<div className="text-center py-8 text-slate-400 animate-pulse">{t.friends.loading}</div>) : friends.length === 0 ? (<div className="text-center py-20 opacity-60"><Users size={48} className="mx-auto mb-2 text-slate-300"/><p className="text-slate-500">{t.friends.empty}</p></div>) : (friends.map(friend => { const online = isOnline(friend.last_seen); const hasUnread = (friend.unread_count || 0) > 0; return (<div key={friend.id} onClick={() => setViewingProfile(friend)} className={`flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border transition-all cursor-pointer group animate-slide-up ${hasUnread ? 'border-indigo-300 dark:border-indigo-700 shadow-md ring-1 ring-indigo-100' : 'border-slate-100 dark:border-slate-700 hover:shadow-md'}`}><div className="flex items-center gap-3 pl-2"><div className="relative"><div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-indigo-400 transition-colors">{friend.avatar ? <img src={friend.avatar} className="w-full h-full object-cover"/> : <User size={24} className="text-slate-400"/>}</div>{online && (<div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full shadow-sm animate-pulse"></div>)}</div><div><div className="flex items-center gap-2"><div className={`font-medium transition-colors ${hasUnread ? 'text-indigo-700 dark:text-indigo-300 font-bold' : 'text-slate-800 dark:text-white group-hover:text-indigo-600'}`}>{friend.display_name}</div>{(friend.streak || 0) > 0 && (<div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-full text-[10px] text-amber-600 border border-amber-200"><Flame size={8} className="fill-current" /> {friend.streak}</div>)}</div><div className={`text-xs truncate max-w-[120px] ${hasUnread ? 'text-indigo-500 font-medium' : 'text-slate-500'}`}>{hasUnread ? `${friend.unread_count} new messages` : (friend.bio || friend.share_id)}</div></div></div><div className="flex items-center gap-2">{hasUnread && (<div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold animate-bounce">{friend.unread_count}</div>)}<button onClick={(e) => { e.stopPropagation(); handleOpenChat(friend); }} className={`p-2 rounded-lg transition-colors ${hasUnread ? 'bg-indigo-600 text-white shadow-md' : 'bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100'}`}><MessageCircle size={20} /></button></div></div>); }))}</div>)}
            {currentView === 'add' && (<div className="space-y-6 animate-slide-in-right"><div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg animate-float"><div className="text-xs font-medium opacity-80 uppercase tracking-wide mb-2">{t.add.yourId}</div><div className="flex items-center justify-between bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/10"><div className="text-2xl font-bold font-mono tracking-wider">{currentUserShareId}</div><button onClick={copyMyId} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"><Copy size={18} /></button></div><div className="text-[10px] mt-3 opacity-70 flex items-center gap-1"><Info size={12}/> {t.add.shareText}</div></div><div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">{t.add.enterId}</label><div className="flex gap-2"><input type="text" value={searchId} onChange={(e) => setSearchId(e.target.value.toUpperCase())} placeholder="NAME-1234" className="flex-1 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white uppercase placeholder:normal-case transition-all"/><button onClick={handleSearch} disabled={searchLoading || !searchId} className="px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-transform shadow-md"><Search size={20} /></button></div>{searchError && <div className="mt-2 text-xs text-red-500 flex items-center gap-1 animate-fade-in"><AlertCircle size={12}/> {searchError}</div>}</div></div>)}
            {currentView === 'profile' && (<div className="animate-slide-up flex flex-col items-center pt-6"><div className="w-28 h-28 rounded-full border-4 border-white dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-xl mb-4 relative ring-2 ring-indigo-100">{currentUserProfile?.avatar ? (<img src={currentUserProfile.avatar} className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400"><User size={48} /></div>)}</div><h2 className="text-3xl font-bold text-slate-800 dark:text-white font-serif-text mb-1">{currentUserProfile?.display_name || "Loading..."}</h2><div className="inline-block px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-8 border border-indigo-100"><p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-semibold tracking-wide">{currentUserProfile?.share_id}</p></div><div className="w-full grid grid-cols-2 gap-4 mb-8"><div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-center shadow-sm"><div className="text-xs text-slate-400 font-bold uppercase mb-2 tracking-wider">{t.profile.streak}</div><div className="flex items-center justify-center gap-1.5 text-2xl font-bold text-amber-500"><Flame size={24} fill="currentColor" /> {currentUserProfile?.streak || 0}</div></div><div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-center shadow-sm"><div className="text-xs text-slate-400 font-bold uppercase mb-2 tracking-wider">{t.profile.achievements}</div><div className="flex items-center justify-center gap-1.5 text-2xl font-bold text-purple-500"><Trophy size={24} /> {(currentUserProfile?.achievements || []).length}</div></div></div>{renderAchievementGrid(currentUserProfile?.achievements || [])}</div>)}
        </div>
      </div>
    </div>
  );
};

export default SocialModal;