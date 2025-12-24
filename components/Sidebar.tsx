import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, X, Edit2, Check, ArrowLeft } from 'lucide-react';
import { ChatSession } from '../types';
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
  language: string;
  onNavigateHome: () => void; 
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
  language,
  onNavigateHome
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const t = translations[language]?.sidebar || translations['English'].sidebar;
  const commonT = translations[language]?.common || translations['English'].common;

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
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50
        w-72 flex flex-col h-full
        glass-panel border-r-0 md:border-r rounded-r-3xl md:rounded-none
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:flex-shrink-0
      `}>
        {/* Header - Fixed area at the top */}
        <div className="p-5 border-b border-black/5 dark:border-white/5 pt-safe flex-shrink-0">
          <div className="flex items-center justify-between mb-6">
             <button 
                onClick={onNavigateHome}
                className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-bold"
             >
                 <ArrowLeft size={18} strokeWidth={2.5} />
                 {t.home}
             </button>
             <button onClick={onClose} className="md:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-2 -mr-2">
                <X size={24} />
             </button>
          </div>

          <button
              onClick={() => {
                  onNewChat();
                  if (window.innerWidth < 768) onClose();
              }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white p-4 rounded-2xl transition-all font-bold shadow-lg shadow-indigo-500/20 active:scale-95 active:shadow-none"
          >
              <Plus size={20} strokeWidth={2.5} />
              <span>{commonT.newChat}</span>
          </button>
        </div>

        {/* Chat List - Scrollable area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
            <h3 className="px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                {t.history}
            </h3>
            
            {chats.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-400 dark:text-slate-600 text-sm italic font-medium">
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
                    group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all relative border
                    ${activeChatId === chat.id 
                    ? 'bg-indigo-50 dark:bg-white/10 border-indigo-100 dark:border-white/10 text-indigo-900 dark:text-white font-bold shadow-sm' 
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'}
                `}
                >
                {deleteConfirmId === chat.id ? (
                    <Trash2 size={18} className="flex-shrink-0 text-red-500 animate-pulse" />
                ) : (
                    <MessageSquare size={18} className={`flex-shrink-0 ${activeChatId === chat.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 opacity-70 group-hover:opacity-100'}`} />
                )}
                
                <div className="flex-1 min-w-0">
                    {editingId === chat.id ? (
                    <form onSubmit={saveEdit} className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <input
                        autoFocus
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-white dark:bg-black/20 text-slate-900 dark:text-white text-sm rounded px-1 py-0.5 border border-indigo-500 focus:outline-none"
                        />
                        <button type="submit" className="text-emerald-500 hover:text-emerald-600 p-0.5"><Check size={14}/></button>
                        <button type="button" onClick={cancelEdit} className="text-red-500 hover:text-red-600 p-0.5"><X size={14}/></button>
                    </form>
                    ) : deleteConfirmId === chat.id ? (
                        <div className="text-sm font-bold text-red-500">{t.deleteConfirm}</div>
                    ) : (
                    <>
                        <p className="truncate text-sm pr-14 font-medium">
                        {chat.title}
                        </p>
                        <p className="text-[10px] font-black opacity-60 uppercase tracking-tighter">
                        {new Date(chat.createdAt).toLocaleDateString()}
                        </p>
                    </>
                    )}
                </div>

                {editingId !== chat.id && (
                    <div className={`
                        absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-lg px-1 py-0.5 shadow-sm transition-opacity border border-black/5 dark:border-white/10
                        ${activeChatId === chat.id || deleteConfirmId === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                    `}>
                    {deleteConfirmId === chat.id ? (
                        <>
                            <button
                                onClick={(e) => onConfirmDelete(chat.id, e)}
                                className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors shadow-sm"
                                title={t.delete}
                            >
                                <Check size={13} />
                            </button>
                            <button
                                onClick={onCancelDelete}
                                className="p-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-600 dark:text-slate-300 rounded transition-colors"
                                title="Cancel"
                            >
                                <X size={13} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={(e) => startEditing(chat, e)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-500 rounded transition-colors text-slate-400"
                                title={t.rename}
                            >
                                <Edit2 size={13} />
                            </button>
                            <button
                                onClick={(e) => onRequestDelete(chat.id, e)}
                                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded transition-colors text-slate-400"
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
    </>
  );
};

export default Sidebar;