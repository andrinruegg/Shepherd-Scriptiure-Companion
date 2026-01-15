
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { ArrowLeft, Send, Image as ImageIcon, Mic, Loader2, Trash2, Check, CheckCheck, Palette, X, AlertCircle, User, Languages } from 'lucide-react';
import { UserProfile, DirectMessage } from '../types';
import { db } from '../services/db';
import DrawingCanvas from './DrawingCanvas';
import { translateContent } from '../services/geminiService';
import { useTranslation } from 'react-i18next';

const FriendChat: React.FC<{friend: UserProfile, onBack: () => void, currentUserShareId: string, onMessagesRead?: () => void}> = ({ friend, onBack, currentUserShareId, onMessagesRead }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [translationsMap, setTranslationsMap] = useState<Record<string, string>>({});
  const [showGraffitiCanvas, setShowGraffitiCanvas] = useState(false);
  const [graffitiUrl, setGraffitiUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [friend.id]);

  const fetchMessages = async () => {
    try {
      const msgs = await db.social.getMessages(friend.id);
      setMessages(msgs);
    } catch (e) { console.error(e); }
  };

  const handleSendText = async () => {
      if (!inputText.trim()) return;
      setLoading(true);
      try {
          await db.social.sendMessage(friend.id, inputText, 'text');
          setInputText('');
          fetchMessages();
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      <header className="flex items-center gap-3 p-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm shrink-0 z-30">
         <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><ArrowLeft size={20} /></button>
         <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
             {friend.avatar ? <img src={friend.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400"><User size={20}/></div>}
         </div>
         <h3 className="font-bold text-slate-800 dark:text-white">{friend.display_name}</h3>
      </header>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 no-scrollbar">
        {messages.map(msg => {
            const isMe = msg.sender_id !== friend.id;
            return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-pop-in`}>
                    <div className={`max-w-[75%] rounded-2xl p-3 shadow-sm ${
                        isMe 
                        ? 'bg-gradient-to-br from-[#7c4a32] to-[#54362d] text-white rounded-tr-none' 
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                    }`}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <div className={`text-[10px] mt-1 flex items-center gap-2 ${isMe ? 'justify-end text-[#d2b48c]' : 'justify-start text-slate-400'}`}>
                            <span>{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            {isMe && <span>{msg.read_at ? <CheckCheck size={14} className="text-emerald-400"/> : <Check size={14} className="opacity-70"/>}</span>}
                        </div>
                    </div>
                </div>
            )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 z-30 shrink-0">
          <button onClick={() => setShowGraffitiCanvas(true)} className="p-2.5 bg-amber-100 text-amber-600 rounded-full"><Palette size={20} /></button>
          <div className="flex-1 relative">
             <input value={inputText} onChange={e => setInputText(e.target.value)} placeholder="Message..." className="w-full bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2.5 outline-none dark:text-white text-sm" onKeyDown={e => e.key === 'Enter' && handleSendText()} />
          </div>
          <button onClick={handleSendText} disabled={loading || !inputText.trim()} className="p-2.5 bg-[#7c4a32] text-white rounded-full disabled:opacity-50 shadow-md">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
      </div>
    </div>
  );
};

export default FriendChat;
