
import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, X, Edit2, Check, Settings, Calendar, Flame, Book, Heart, MessageCircle, Bell } from 'lucide-react';
import { ChatSession, AppView } from '../types';
import ShepherdLogo from './ShepherdLogo';
import { translations } from '../utils/translations';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chats: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string, e: React.MouseEvent) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onOpenSettings: () => void;
  onOpenDailyVerse: () => void;
  onOpenSocial: () => void; // New Prop
  pendingRequestsCount: number; // New Prop
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  language: string;
  dailyStreak?: number;
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onOpenSettings,
  onOpenDailyVerse,
  onOpenSocial,
  pendingRequestsCount,
  language,
  dailyStreak = 0,
  currentView,
  onChangeView
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const t = translations[language]?.sidebar || translations['English'].sidebar;

  const startEditing = (chat: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingId(chat.id);
    setEditTitle(chat.title);
    setDeleteConfirmId(null); 
  };

  const saveEdit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (editingId && editTitle.trim()) {
      onRenameChat(editingId, editTitle.trim());
      setEditingId(null);
      setEditTitle('');
    }
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingId(null);
  };

  const onRequestDelete = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setDeleteConfirmId(chatId);
    setEditingId(null);
  };

  const onConfirmDelete = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    onDeleteChat(chatId, e);
    setDeleteConfirmId(null);
  };

  const onCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(null);
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="absolute inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <div className={`
        absolute md:relative inset-y-0 left-0 z-30
        w-72 bg-slate-900 dark:bg-slate-950 text-slate-100 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:flex-shrink-0 border-r border-slate-800
      `}>
        {/* Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-serif-text">
                <ShepherdLogo className="text-emerald-500" size={28} />
                <span className="font-semibold text-lg">Shepherd</span>
            </div>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => { onOpenSocial(); if(window.innerWidth < 768) onClose(); }} 
                    className="relative p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Inbox & Friends"
                >
                    <Bell size={20} />
                    {pendingRequestsCount > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>
                    )}
                </button>
                <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
                    <X size={20} />
                </button>
            </div>
          </div>

          {/* MAIN TABS */}
          <div className="flex bg-slate-800 rounded-lg p-1">
             <button 
                onClick={() => onChangeView('chat')}
                className={`flex-1 flex items-center justify-center py-2 rounded-md transition-all text-xs font-medium gap-1 ${currentView === 'chat' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
             >
                <MessageCircle size={14} /> {t.tabs.chat}
             </button>
             <button 
                onClick={() => onChangeView('bible')}
                className={`flex-1 flex items-center justify-center py-2 rounded-md transition-all text-xs font-medium gap-1 ${currentView === 'bible' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
             >
                <Book size={14} /> {t.tabs.bible}
             </button>
             <button 
                onClick={() => onChangeView('saved')}
                className={`flex-1 flex items-center justify-center py-2 rounded-md transition-all text-xs font-medium gap-1 ${currentView === 'saved' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
             >
                <Heart size={14} /> {t.tabs.saved}
             </button>
          </div>
        </div>

        {/* Action Buttons: New Chat & Daily Verse */}
        <div className="p-4 space-y-2">
            <button
                onClick={() => {
                    onChangeView('chat'); // Force switch to chat
                    onNewChat();
                    if (window.innerWidth < 768) onClose();
                }}
                className="w-full flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg transition-colors font-medium shadow-md"
            >
                <Plus size={20} />
                <span>{t.newChat}</span>
            </button>
            
            <button
                onClick={() => {
                    onOpenDailyVerse();
                    if (window.innerWidth < 768) onClose();
                }}
                className="w-full flex items-center justify-between bg-emerald-700/50 hover:bg-emerald-700 text-emerald-100 p-2.5 rounded-lg transition-colors font-medium text-sm border border-emerald-800"
            >
                <div className="flex items-center gap-2">
                   <Calendar size={18} />
                   <span>Daily Verse</span>
                </div>
                {dailyStreak > 0 && (
                  <div className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-full text-xs">
                     <Flame size={12} className="text-orange-400 fill-orange-400" />
                     <span className="text-orange-100 font-bold">{dailyStreak}</span>
                  </div>
                )}
            </button>
        </div>

        {/* Chat List (Only visible if Chat View is active) */}
        {currentView === 'chat' && (
            <div className="flex-1 overflow-y-auto px-2 py-2">
            <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {t.history}
            </h3>
            
            <div className="space-y-1">
                {chats.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-500 text-sm italic">
                    {t.noChats}
                </div>
                ) : (
                chats.map((chat) => (
                    <div
                    key={chat.id}
                    onClick={() => {
                        if (editingId !== chat.id && deleteConfirmId !== chat.id) {
                        onSelectChat(chat.id);
                        if (window.innerWidth < 768) onClose();
                        }
                    }}
                    className={`
                        group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all relative
                        ${activeChatId === chat.id 
                        ? 'bg-slate-800 dark:bg-slate-900 text-white shadow-sm ring-1 ring-slate-700' 
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
                    `}
                    >
                    {deleteConfirmId === chat.id ? (
                        <Trash2 size={18} className="flex-shrink-0 text-red-500 animate-pulse" />
                    ) : (
                        <MessageSquare size={18} className="flex-shrink-0" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                        {editingId === chat.id ? (
                        <form onSubmit={saveEdit} className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <input
                            autoFocus
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full bg-slate-950 text-white text-sm rounded px-1 py-0.5 border border-indigo-500 focus:outline-none"
                            />
                            <button type="submit" className="text-emerald-500 hover:text-emerald-400 p-0.5"><Check size={14}/></button>
                            <button type="button" onClick={cancelEdit} className="text-red-500 hover:text-red-400 p-0.5"><X size={14}/></button>
                        </form>
                        ) : deleteConfirmId === chat.id ? (
                            <div className="text-sm font-medium text-red-400">{t.deleteConfirm}</div>
                        ) : (
                        <>
                            <p className="truncate text-sm font-medium pr-14">
                            {chat.title}
                            </p>
                            <p className="text-[10px] opacity-60">
                            {new Date(chat.createdAt).toLocaleDateString()}
                            </p>
                        </>
                        )}
                    </div>

                    {editingId !== chat.id && (
                        <div className={`
                            absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-slate-800/90 rounded px-1 shadow-sm transition-opacity
                            ${activeChatId === chat.id || deleteConfirmId === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                        `}>
                        {deleteConfirmId === chat.id ? (
                            <>
                                <button
                                    onClick={(e) => onConfirmDelete(chat.id, e)}
                                    className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                                    title={t.delete}
                                >
                                    <Check size={13} />
                                </button>
                                <button
                                    onClick={onCancelDelete}
                                    className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
                                    title="Cancel"
                                >
                                    <X size={13} />
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={(e) => startEditing(chat, e)}
                                    className="p-1.5 hover:bg-slate-700 hover:text-indigo-400 rounded transition-colors"
                                    title={t.rename}
                                >
                                    <Edit2 size={13} />
                                </button>
                                <button
                                    onClick={(e) => onRequestDelete(chat.id, e)}
                                    className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded transition-colors"
                                    title={t.delete}
                                >
                                    <Trash2 size={13} />
                                </button>
                            </>
                        )}
                        </div>
                    )}
                    </div>
                ))
                )}
            </div>
            </div>
        )}

        {/* Placeholder for Bible/Saved view in Sidebar if needed, currently just empty to keep layout consistent */}
        {currentView !== 'chat' && <div className="flex-1"></div>}

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 space-y-3">
           <button 
             onClick={onOpenSettings}
             className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-sm font-medium shadow-sm"
           >
             <span className="flex items-center gap-2">
                 <Settings size={18} />
                 <span>{t.settings}</span>
             </span>
             <span className="text-xs bg-slate-700 px-1.5 py-0.5 rounded text-slate-400">Pref</span>
           </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
