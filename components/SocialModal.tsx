
import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users, Bell, Search, Check, AlertCircle, Copy, User, MessageCircle } from 'lucide-react';
import { UserProfile, FriendRequest, AppUpdate } from '../types';
import { db } from '../services/db';
import FriendChat from './FriendChat';

interface SocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserShareId: string;
  isDarkMode: boolean;
}

const UPDATES_LOG: AppUpdate[] = [
    { version: "1.3.0", date: "2025-12-10", title: "Social Chat", changes: ["Real-time messaging with friends", "Photo sharing", "Voice messages"] },
    { version: "1.2.0", date: "2025-12-09", title: "Winter Update", changes: ["Added festive Winter Mode", "Improved splash screen visuals", "Bug fixes for API connectivity"] },
    { version: "1.1.0", date: "2025-11-20", title: "Bible Reader", changes: ["Added full Bible reader", "Highlighting support", "Save verses to collection"] },
    { version: "1.0.0", date: "2025-10-01", title: "Initial Launch", changes: ["Shepherd AI Chat", "Supabase Integration"] }
];

const SocialModal: React.FC<SocialModalProps> = ({ isOpen, onClose, currentUserShareId, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'friends' | 'add'>('inbox');
  const [activeChatFriend, setActiveChatFriend] = useState<UserProfile | null>(null);

  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<UserProfile | null>(null);
  const [searchError, setSearchError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
      if (isOpen && !activeChatFriend) {
          loadSocialData();
      }
  }, [isOpen, activeTab, activeChatFriend]);

  const loadSocialData = async () => {
      setLoadingData(true);
      try {
          if (activeTab === 'inbox') {
              const reqs = await db.social.getIncomingRequests();
              setRequests(reqs);
          } else if (activeTab === 'friends') {
              const f = await db.social.getFriends();
              setFriends(f);
          }
      } catch (e) {
          console.error("Failed to load social data", e);
      } finally {
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

  const sendRequest = async () => {
      if (!searchResult) return;
      setSearchLoading(true);
      try {
          await db.social.sendFriendRequest(searchResult.id);
          setRequestSent(true);
      } catch (e: any) {
          setSearchError(e.message || "Failed to send request.");
      } finally {
          setSearchLoading(false);
      }
  };

  const handleRespond = async (requestId: string, accept: boolean) => {
      try {
          await db.social.respondToRequest(requestId, accept);
          setRequests(prev => prev.filter(r => r.id !== requestId));
      } catch (e) {
          console.error("Response failed", e);
      }
  };

  const copyMyId = () => {
      navigator.clipboard.writeText(currentUserShareId);
  };

  if (!isOpen) return null;

  // Render Chat Interface if active
  if (activeChatFriend) {
      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
              <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[85vh] animate-scale-in border border-slate-200 dark:border-slate-800">
                  <FriendChat 
                      friend={activeChatFriend} 
                      onBack={() => setActiveChatFriend(null)} 
                      currentUserShareId={currentUserShareId}
                  />
              </div>
          </div>
      );
  }

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
            <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800">
                <X size={20} />
            </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
            <button 
                onClick={() => setActiveTab('inbox')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'inbox' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
                <Bell size={16} />
                Inbox
                {requests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{requests.length}</span>}
            </button>
            <button 
                onClick={() => setActiveTab('friends')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'friends' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
                <Users size={16} />
                Friends
            </button>
            <button 
                onClick={() => setActiveTab('add')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'add' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
                <UserPlus size={16} />
                Add
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900">
            
            {/* INBOX TAB */}
            {activeTab === 'inbox' && (
                <div className="space-y-6">
                    {/* Friend Requests Section */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Friend Requests</h3>
                        {loadingData ? (
                            <div className="text-center py-4 text-slate-400 text-sm">Loading...</div>
                        ) : requests.length === 0 ? (
                            <div className="text-center py-4 text-slate-400 text-sm italic bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">No pending requests</div>
                        ) : (
                            <div className="space-y-2">
                                {requests.map(req => (
                                    <div key={req.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                                {req.requester.avatar ? <img src={req.requester.avatar} className="w-full h-full object-cover" /> : <User size={20} className="text-indigo-600 dark:text-slate-300"/>}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-slate-800 dark:text-white">{req.requester.display_name}</div>
                                                <div className="text-xs text-slate-500">ID: {req.requester.share_id}</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleRespond(req.id, true)} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200"><Check size={16}/></button>
                                            <button onClick={() => handleRespond(req.id, false)} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200"><X size={16}/></button>
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
                                <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
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
                        <div className="text-center py-8 text-slate-400">Loading friends...</div>
                     ) : friends.length === 0 ? (
                        <div className="text-center py-10 opacity-60">
                            <Users size={48} className="mx-auto mb-2 text-slate-300"/>
                            <p className="text-slate-500">You haven't added any friends yet.</p>
                        </div>
                     ) : (
                        friends.map(friend => (
                            <div key={friend.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                        {friend.avatar ? <img src={friend.avatar} className="w-full h-full object-cover"/> : <User size={24} className="text-slate-400"/>}
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-800 dark:text-white">{friend.display_name}</div>
                                        <div className="text-xs text-slate-500">{friend.share_id}</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setActiveChatFriend(friend)}
                                    className="p-2 bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-slate-600 transition-colors"
                                    title="Chat"
                                >
                                    <MessageCircle size={20} />
                                </button>
                            </div>
                        ))
                     )}
                </div>
            )}

            {/* ADD FRIEND TAB */}
            {activeTab === 'add' && (
                <div className="space-y-6">
                    {/* My ID Card */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
                        <div className="text-xs font-medium opacity-80 uppercase tracking-wide mb-1">Your Share ID</div>
                        <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold font-mono tracking-wider">{currentUserShareId}</div>
                            <button onClick={copyMyId} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
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
                                className="flex-1 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white uppercase placeholder:normal-case"
                            />
                            <button 
                                onClick={handleSearch}
                                disabled={searchLoading || !searchId}
                                className="px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50"
                            >
                                <Search size={20} />
                            </button>
                        </div>
                        {searchError && <div className="mt-2 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/> {searchError}</div>}
                    </div>

                    {/* Search Result */}
                    {searchResult && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 animate-scale-in">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                     {searchResult.avatar ? <img src={searchResult.avatar} className="w-full h-full object-cover"/> : <User size={24} className="text-slate-400"/>}
                                </div>
                                <div>
                                    <div className="font-bold text-lg text-slate-800 dark:text-white">{searchResult.display_name}</div>
                                    <div className="text-xs text-slate-500">ID: {searchResult.share_id}</div>
                                </div>
                            </div>
                            
                            {requestSent ? (
                                <div className="w-full py-2 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-lg text-center flex items-center justify-center gap-2">
                                    <Check size={16}/> Request Sent
                                </div>
                            ) : (
                                <button 
                                    onClick={sendRequest} 
                                    disabled={searchLoading}
                                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <UserPlus size={16} /> Send Friend Request
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default SocialModal;
