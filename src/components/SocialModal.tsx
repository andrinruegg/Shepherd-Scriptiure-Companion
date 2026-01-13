import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users, Bell, Search, Check, AlertCircle, Copy, User, MessageCircle, ArrowLeft, Trash2, Flame, Award, Book, Scroll, Trophy, Info, Circle } from 'lucide-react';
import { UserProfile, FriendRequest, Achievement, SocialTab } from '../types';
import { db } from '../services/db';
import FriendChat from './FriendChat';
import { useTranslation } from 'react-i18next';

const SocialModal: React.FC<{ isOpen: boolean, onClose: () => void, initialTab?: SocialTab, currentUserShareId: string, isDarkMode: boolean, onUpdateNotifications?: () => void, language: string }> = ({ isOpen, onClose, initialTab = 'inbox', currentUserShareId, onUpdateNotifications }) => {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<SocialTab>(initialTab);
  const [activeChatFriend, setActiveChatFriend] = useState<UserProfile | null>(null);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Fetch the translated updates log from i18n
  const updatesLog: any[] = Array.isArray(t('social.updatesList', { returnObjects: true })) 
    ? (t('social.updatesList', { returnObjects: true }) as any[]) 
    : [];

  useEffect(() => { if (isOpen) loadSocialData(); }, [isOpen, currentView]);

  const loadSocialData = async () => {
      setLoadingData(true);
      try {
          const [reqs, friendsList, myProfile] = await Promise.all([db.social.getIncomingRequests(), db.social.getFriends(), db.social.getCurrentUser()]);
          setRequests(reqs); setFriends(friendsList); setCurrentUserProfile(myProfile);
      } catch (e) {} finally { setLoadingData(false); }
  };

  if (!isOpen) return null;
  if (activeChatFriend) return <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} /><div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl h-[85vh] overflow-hidden flex flex-col animate-scale-in border dark:border-slate-800"><FriendChat friend={activeChatFriend} onBack={() => {setActiveChatFriend(null); loadSocialData();}} currentUserShareId={currentUserShareId} onMessagesRead={onUpdateNotifications} /></div></div>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[85vh] animate-scale-in border dark:border-slate-800">
        <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white font-serif-text">{t(`social.tabs.${currentView === 'profile' ? 'me' : currentView}`)}</h2>
            <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
            {currentView === 'inbox' && (
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">{t('social.inbox.requests')}</h3>
                    {requests.length === 0 ? <div className="text-center py-12 text-slate-400 italic text-sm border-2 border-dashed dark:border-slate-800 rounded-3xl">{t('social.inbox.noRequests')}</div> : (
                        <div className="space-y-3">{requests.map(req => (
                            <div key={req.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 shadow-sm"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center overflow-hidden">{req.requester?.avatar ? <img src={req.requester.avatar} className="w-full h-full object-cover" /> : <User size={20}/>}</div><div><div className="text-sm font-bold dark:text-white">{req.requester?.display_name}</div><div className="text-xs text-slate-400 font-mono tracking-tighter">ID: {req.requester?.share_id}</div></div></div><div className="flex gap-2"><button onClick={() => db.social.respondToRequest(req.id, true).then(loadSocialData)} className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><Check size={18}/></button><button onClick={() => db.social.respondToRequest(req.id, false).then(loadSocialData)} className="p-2 bg-slate-100 text-slate-500 rounded-xl"><X size={18}/></button></div></div>
                        ))}</div>
                    )}
                    
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">{t('social.inbox.updates')}</h3>
                        <div className="space-y-3">
                            {updatesLog.map((update: any, idx: number) => (
                                <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 animate-slide-up" style={{ animationDelay: `${0.2 + (idx * 0.1)}s` }}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">v{update.version}</span>
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
                    {friends.length === 0 ? <div className="text-center py-20 opacity-60"><Users size={64} className="mx-auto mb-4 text-slate-200"/><p className="text-slate-500 font-medium">{t('social.friends.empty')}</p></div> : friends.map(f => (
                        <div key={f.id} onClick={() => setActiveChatFriend(f)} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 hover:shadow-md transition-all cursor-pointer group">
                            <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-700 group-hover:border-indigo-400 transition-colors">{f.avatar ? <img src={f.avatar} className="w-full h-full object-cover"/> : <User size={24} className="text-slate-400"/>}</div><div><div className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">{f.display_name}</div><div className="text-xs text-slate-400 truncate max-w-[150px]">{f.bio || f.share_id}</div></div></div>
                            <div className="relative"><MessageCircle size={20} className="text-slate-300 group-hover:text-indigo-600 transition-colors"/>{f.unread_count ? <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce">{f.unread_count}</span> : null}</div>
                        </div>
                    ))}
                </div>
            )}
            {currentView === 'add' && (
                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"><div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" /><div className="relative z-10"><p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-2">{t('social.add.yourId')}</p><div className="flex items-center justify-between bg-black/20 p-4 rounded-2xl border border-white/10"><div className="text-2xl font-bold font-mono tracking-widest">{currentUserShareId}</div><button onClick={() => {navigator.clipboard.writeText(currentUserShareId); alert('ID Copied!');}} className="p-2 hover:bg-white/20 rounded-xl transition-colors"><Copy size={20} /></button></div><p className="text-[10px] mt-4 opacity-60 flex items-center gap-2"><Info size={12}/>{t('social.add.shareText')}</p></div></div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border dark:border-slate-700"><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-1">{t('social.add.enterId')}</label><div className="flex gap-2"><input type="text" placeholder="NAME-1234" className="flex-1 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-2xl px-5 py-4 outline-none text-white font-mono uppercase" /><button className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all"><Search size={20}/></button></div></div>
                </div>
            )}
            {currentView === 'profile' && currentUserProfile && (
                <div className="flex flex-col items-center pt-8">
                    <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-800 shadow-xl overflow-hidden mb-6">{currentUserProfile.avatar ? <img src={currentUserProfile.avatar} className="w-full h-full object-cover" /> : <User size={48} className="text-slate-200 m-auto mt-8" />}</div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-serif-text">{currentUserProfile.display_name}</h2>
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-1.5 rounded-full mt-3 border dark:border-indigo-800"><p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-bold tracking-widest">{currentUserProfile.share_id}</p></div>
                    <div className="w-full grid grid-cols-2 gap-4 mt-10">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border dark:border-slate-700 text-center shadow-sm"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{t('social.profile.streak')}</span><div className="text-3xl font-bold text-amber-500 flex items-center justify-center gap-2"><Flame size={28} className="fill-current" /> {currentUserProfile.streak || 0}</div></div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border dark:border-slate-700 text-center shadow-sm"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{t('social.profile.achievements')}</span><div className="text-3xl font-bold text-purple-600 flex items-center justify-center gap-2"><Trophy size={28} /> {(currentUserProfile.achievements || []).length}</div></div>
                    </div>
                </div>
            )}
        </div>
        <div className="flex border-t dark:border-slate-800 bg-white dark:bg-slate-950 p-3 gap-2 flex-shrink-0">
            {(['inbox', 'friends', 'add', 'profile'] as const).map(tab => (
                <button key={tab} onClick={() => setCurrentView(tab)} className={`flex-1 flex flex-col items-center py-3 rounded-2xl transition-all ${currentView === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    {tab === 'inbox' ? <Bell size={20}/> : tab === 'friends' ? <Users size={20}/> : tab === 'add' ? <UserPlus size={20}/> : <User size={20}/>}
                    <span className="text-[9px] font-black uppercase mt-1 tracking-tighter">{t(`social.tabs.${tab === 'profile' ? 'me' : tab}`)}</span>
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SocialModal;