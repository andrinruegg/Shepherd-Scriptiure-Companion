import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Image as ImageIcon, Mic, Languages, Trash2, X, AlertCircle, Loader2, User, Palette } from 'lucide-react';
import { UserProfile, DirectMessage } from '../types';
import { db } from '../services/db';
import { useTranslation } from 'react-i18next';
import DrawingCanvas from './DrawingCanvas';

const FriendChat: React.FC<{ friend: UserProfile, onBack: () => void, currentUserShareId: string, onMessagesRead?: () => void }> = ({ friend, onBack, currentUserShareId, onMessagesRead }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showGraffiti, setShowGraffiti] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch = () => db.social.getMessages(friend.id).then(setMessages);
    fetch();
    const interval = setInterval(fetch, 3000);
    return () => clearInterval(interval);
  }, [friend.id]);

  useEffect(() => { 
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
    if (onMessagesRead) onMessagesRead();
  }, [messages]);

  const getStatusText = () => {
      if (!friend.last_seen) return t('social.status.offline');
      const diff = Date.now() - new Date(friend.last_seen).getTime();
      return diff < 300000 ? t('social.status.online') : t('social.status.offline');
  };

  const handleSend = async () => {
      if (!inputText.trim()) return;
      setLoading(true);
      try {
          await db.social.sendMessage(friend.id, inputText);
          setInputText('');
          const msgs = await db.social.getMessages(friend.id);
          setMessages(msgs);
      } catch (e) {
          console.error("Failed to send text", e);
      } finally { setLoading(false); }
  };

  const handleSendGraffiti = async (blob: Blob) => {
      setUploading(true);
      setShowGraffiti(false);
      try {
          const url = await db.social.uploadGraffiti(friend.id, blob);
          await db.social.sendMessage(friend.id, url, 'image');
          const msgs = await db.social.getMessages(friend.id);
          setMessages(msgs);
      } catch (e) {
          console.error("Graffiti upload failed", e);
          alert("Failed to send drawing. Check your connection.");
      } finally {
          setUploading(false);
      }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      {showGraffiti && (
        <DrawingCanvas 
            onClose={() => setShowGraffiti(false)} 
            onSend={handleSendGraffiti}
            width={window.innerWidth}
            height={window.innerHeight}
            isSaving={uploading}
        />
      )}

      <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-950 border-b dark:border-slate-800 shadow-sm z-30 shrink-0">
         <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><ArrowLeft size={20} /></button>
         <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border dark:border-slate-700">
            {friend.avatar ? <img src={friend.avatar} className="w-full h-full object-cover" /> : <User size={20} className="m-auto mt-2 text-slate-400" />}
         </div>
         <div className="flex-1">
            <h3 className="font-bold text-slate-800 dark:text-white leading-tight">{friend.display_name}</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{getStatusText()}</p>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-24 no-scrollbar">
        {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender_id === friend.id ? 'justify-start' : 'justify-end'} animate-pop-in`}>
                <div className={`max-w-[80%] rounded-[1.5rem] p-3 shadow-sm text-sm leading-relaxed ${msg.sender_id !== friend.id ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border dark:border-slate-700'}`}>
                    {msg.message_type === 'image' ? (
                        <div className="rounded-xl overflow-hidden bg-white/10">
                            <img src={msg.content} alt="Graffiti" className="max-w-full h-auto min-w-[150px] min-h-[100px]" loading="lazy" />
                        </div>
                    ) : (
                        <p>{msg.content}</p>
                    )}
                    <div className={`text-[9px] mt-2 opacity-50 text-right font-black uppercase tracking-widest`}>
                        {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                </div>
            </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t dark:border-slate-800 flex items-center gap-3 z-30 shrink-0">
         <button 
            onClick={() => setShowGraffiti(true)}
            className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full hover:scale-110 active:scale-95 transition-all"
            title={t('social.chat.paintMode')}
         >
            <Palette size={20} />
         </button>
         <div className="flex-1 relative">
            <input 
                type="text" 
                value={inputText} 
                onChange={e => setInputText(e.target.value)} 
                placeholder={t('social.chat.placeholder')} 
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full px-5 py-3.5 outline-none dark:text-white text-sm" 
                onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
         </div>
         <button 
            onClick={handleSend} 
            disabled={loading || !inputText.trim()} 
            className="p-3.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-90 flex items-center justify-center disabled:opacity-50"
         >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20}/>}
         </button>
      </div>
    </div>
  );
};

export default FriendChat;