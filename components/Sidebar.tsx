import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, X, Edit2, Check, ArrowLeft } from 'lucide-react';
import { ChatSession } from '../types';
import { useTranslation } from 'react-i18next';

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
  isOpen, onClose, chats, activeChatId, onSelectChat, onNewChat, onDeleteChat, onRenameChat, onNavigateHome
}) => {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const startEditing = (chat: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation(); setEditingId(chat.id); setEditTitle(chat.title); setDeleteConfirmId(null);
  };

  const saveEdit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (editingId && editTitle.trim()) {
      onRenameChat(editingId, editTitle.trim());
      setEditingId(null);
    }
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity" onClick={onClose} />}
      <div className={`fixed md:relative inset-y-0 left-0 z-50 w-72 flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-r-0 md:border-r rounded-r-3xl md:rounded-none shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} md:flex-shrink-0`}>
        <div className="p-5 border-b border-slate-100 dark:border-white/5 pt-safe flex-shrink-0">
          <div className="flex items-center justify-between mb-6">
            <button onClick={onNavigateHome} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-bold"><ArrowLeft size={18} />{t('sidebar.home')}</button>
            <button onClick={onClose} className="md:hidden text-slate-500 p-2"><X size={24} /></button>
          </div>
          <button onClick={() => { onNewChat(); if (window.innerWidth < 768) onClose(); }} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white p-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 active:scale-95"><Plus size={20} /><span>{t('common.newChat')}</span></button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 no-scrollbar">
          <h3 className="px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">{t('sidebar.history')}</h3>
          {chats.length === 0 ? (<div className="px-4 py-8 text-center text-slate-400 text-xs italic font-medium">{t('sidebar.noChats')}</div>) : (
            chats.map((chat) => (
              <div key={chat.id} onClick={() => { if (editingId !== chat.id && deleteConfirmId !== chat.id) { onSelectChat(chat.id); if (window.innerWidth < 768) onClose(); } }} className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all relative border ${activeChatId === chat.id ? 'bg-indigo-50 dark:bg-white/10 border-indigo-100 dark:border-white/10 text-indigo-900 dark:text-white font-bold' : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                {deleteConfirmId === chat.id ? <Trash2 size={18} className="flex-shrink-0 text-red-500 animate-pulse" /> : <MessageSquare size={18} className={`flex-shrink-0 ${activeChatId === chat.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 opacity-70 group-hover:opacity-100'}`} />}
                <div className="flex-1 min-w-0">
                  {editingId === chat.id ? (
                    <form onSubmit={saveEdit} className="flex items-center gap-1" onClick={e => e.stopPropagation()}><input autoFocus type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-white dark:bg-slate-700 text-sm rounded px-1 py-0.5 border border-indigo-500 outline-none text-slate-900 dark:text-white" /><button type="submit" className="text-emerald-500"><Check size={14} /></button></form>
                  ) : deleteConfirmId === chat.id ? (<div className="text-xs font-bold text-red-500">{t('sidebar.deleteConfirm')}</div>) : (<><p className="truncate text-sm pr-14 font-medium">{chat.title}</p><p className="text-[10px] font-black opacity-60 uppercase tracking-tighter">{new Date(chat.createdAt).toLocaleDateString()}</p></>)}
                </div>
                {editingId !== chat.id && (
                  <div className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 transition-opacity ${activeChatId === chat.id || deleteConfirmId === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {deleteConfirmId === chat.id ? (<><button onClick={e => { e.stopPropagation(); onDeleteChat(chat.id, e); setDeleteConfirmId(null); }} className="p-1 bg-red-500 text-white rounded"><Check size={12} /></button><button onClick={e => { e.stopPropagation(); setDeleteConfirmId(null); }} className="p-1 bg-slate-200 dark:bg-slate-700 rounded"><X size={12} /></button></>) : (<><button onClick={e => startEditing(chat, e)} className="p-1 text-slate-400 hover:text-indigo-500"><Edit2 size={12} /></button><button onClick={e => { e.stopPropagation(); setDeleteConfirmId(chat.id); }} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={12} /></button></>)}
                  </div>
                )}
              </div>
            )))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;