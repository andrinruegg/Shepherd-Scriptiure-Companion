import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { ArrowLeft, Send, Image as ImageIcon, Mic, Loader2, Trash2, Check, CheckCheck, Palette, X, AlertCircle, ExternalLink, Languages } from 'lucide-react';
import { UserProfile, DirectMessage } from '../types.ts';
import { db } from '../services/db.ts';
import DrawingCanvas from './DrawingCanvas.tsx';
import { translateContent } from '../services/geminiService.ts';
import { translations } from '../utils/translations.ts';

interface FriendChatProps {
  friend: UserProfile;
  onBack: () => void;
  currentUserShareId: string;
  onMessagesRead?: () => void; 
}

const FriendChat: React.FC<FriendChatProps> = ({ friend, onBack, currentUserShareId, onMessagesRead }) => {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [requestingMic, setRequestingMic] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [translationsMap, setTranslationsMap] = useState<Record<string, string>>({});
  const [translatingIds, setTranslatingIds] = useState<Set<string>>(new Set());
  const [showGraffitiCanvas, setShowGraffitiCanvas] = useState(false);
  const [graffitiUrl, setGraffitiUrl] = useState<string | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  const isDrawingRef = useRef(false);
  const lastUploadTimeRef = useRef(0);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const hasScrolledRef = useRef(false);
  const [friendStatus, setFriendStatus] = useState<UserProfile | null>(null);
  const deletedIdsRef = useRef<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<any>(null);
  const safeShareId = currentUserShareId || 'unknown';
  const currentLang = localStorage.getItem('language') || 'English';
  const t = translations[currentLang]?.social || translations['English'].social;

  const markAsRead = async () => {
      try {
        await db.social.markMessagesRead(friend.id);
        if (onMessagesRead) onMessagesRead();
      } catch (e) { }
  };

  useEffect(() => {
    setInitialLoadDone(false);
    hasScrolledRef.current = false;
    setMessages([]); 
    deletedIdsRef.current.clear();
    setFriendStatus(friend); 
    setGraffitiUrl(null); 
    lastUploadTimeRef.current = 0;
    fetchMessages(true); 
    fetchFriendStatus(); 
    loadGraffiti(); 
    markAsRead();
    db.social.heartbeat();
    const interval = setInterval(() => {
        fetchMessages(false);
        fetchFriendStatus();
        if (!isDrawingRef.current && (Date.now() - lastUploadTimeRef.current > 10000)) loadGraffiti(); 
        markAsRead();
        db.social.heartbeat();
    }, 3000);
    return () => clearInterval(interval);
  }, [friend.id]);

  useLayoutEffect(() => {
      if (!initialLoadDone || messages.length === 0 || hasScrolledRef.current) return;
      const container = messagesContainerRef.current;
      if (!container) return;
      const performScroll = () => {
          const firstUnread = messages.find(m => m.sender_id === friend.id && !m.read_at);
          if (firstUnread) {
              const el = document.getElementById(`msg-${firstUnread.id}`);
              if (el) { el.scrollIntoView({ behavior: 'auto', block: 'center' }); hasScrolledRef.current = true; return; }
          }
          container.scrollTop = container.scrollHeight;
      };
      performScroll();
      requestAnimationFrame(() => { performScroll(); hasScrolledRef.current = true; });
  }, [initialLoadDone, messages, friend.id]); 

  const fetchFriendStatus = async () => {
      try { const profile = await db.social.getUserProfile(friend.id); if (profile) setFriendStatus(profile); }
      catch (e) { }
  }

  const loadGraffiti = async () => {
      try { const url = await db.social.getGraffitiUrl(friend.id); if (url) setGraffitiUrl(url); }
      catch (e) { }
  }

  const fetchMessages = async (isInitial: boolean = false) => {
      try {
          const msgs = await db.social.getMessages(friend.id);
          const filteredMsgs = msgs.filter(m => !deletedIdsRef.current.has(m.id));
          setMessages(prev => (prev.length !== filteredMsgs.length || prev.some((m, i) => m.id !== filteredMsgs[i].id)) ? filteredMsgs : prev);
          if (isInitial) setTimeout(() => setInitialLoadDone(true), 0);
      } catch (e) { }
  };

  const handleSendText = async () => {
      if (!inputText.trim()) return;
      setLoading(true);
      try { await db.social.sendMessage(friend.id, inputText, 'text'); setInputText(''); fetchMessages(false); }
      catch (e) { } finally { setLoading(false); }
  };

  const handleDeleteMessage = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setMessages(prev => prev.filter(m => m.id !== id));
      deletedIdsRef.current.add(id);
      try { await db.social.deleteDirectMessage(id); } catch (error) { }
  }

  const handleTranslate = async (id: string, text: string) => {
    if (translationsMap[id]) { const newMap = { ...translationsMap }; delete newMap[id]; setTranslationsMap(newMap); return; }
    setTranslatingIds(prev => new Set(prev).add(id));
    try {
        const targetLang = localStorage.getItem('language') || 'English';
        const translated = await translateContent(text, targetLang);
        setTranslationsMap(prev => ({ ...prev, [id]: translated }));
    } catch (e) { } finally { setTranslatingIds(prev => { const next = new Set(prev); next.delete(id); return next; }); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
          const fileName = `${safeShareId}-${Date.now()}.jpg`;
          const url = await db.social.uploadMedia(file, fileName);
          await db.social.sendMessage(friend.id, url, 'image');
          fetchMessages(false);
      } catch (e: any) { setErrorMessage("Upload failed."); } finally { setUploading(false); }
  };

  const startGraffiti = () => { if (messagesContainerRef.current) { setCanvasDimensions({ width: messagesContainerRef.current.scrollWidth, height: Math.max(messagesContainerRef.current.scrollHeight, window.innerHeight) }); setShowGraffitiCanvas(true); isDrawingRef.current = true; } };
  const closeGraffiti = () => { setShowGraffitiCanvas(false); isDrawingRef.current = false; }

  const handleSaveGraffiti = async (blob: Blob) => {
      if (uploading) return;
      setUploading(true);
      try {
          const url = await db.social.uploadGraffiti(friend.id, blob);
          lastUploadTimeRef.current = Date.now();
          setGraffitiUrl(url); 
          closeGraffiti(); 
      } catch (e: any) { setErrorMessage("Save drawing failed."); } finally { setUploading(false); }
  };
  
  const startRecording = async () => {
      setErrorMessage(null);
      setRequestingMic(true);
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const recorder = new MediaRecorder(stream);
          const chunks: BlobPart[] = [];
          recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
          recorder.onstop = async () => {
              const blob = new Blob(chunks, { type: recorder.mimeType });
              stream.getTracks().forEach(track => track.stop());
              if (blob.size < 500) return;
              setUploading(true);
              try {
                  const url = await db.social.uploadMedia(blob, `voice-${safeShareId}-${Date.now()}.webm`);
                  await db.social.sendMessage(friend.id, url, 'audio');
                  fetchMessages(false);
              } catch (e: any) { setErrorMessage("Voice send failed."); } finally { setUploading(false); }
          };
          recorder.start();
          setMediaRecorder(recorder);
          setIsRecording(true);
          setRequestingMic(false);
          setRecordingTime(0);
          timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);
      } catch (e: any) { setRequestingMic(false); setErrorMessage("Mic Access Error."); }
  };

  const stopRecording = () => { if (mediaRecorder && isRecording) { mediaRecorder.stop(); setIsRecording(false); clearInterval(timerRef.current); } };
  const handleBack = async () => { await markAsRead(); onBack(); };
  const getStatusText = () => { if (!friendStatus || !friendStatus.last_seen) return t.status.offline; const diff = Date.now() - new Date(friendStatus.last_seen).getTime(); if (diff < 5 * 60 * 1000) return t.status.online; return t.status.offline; };
  const isOnline = getStatusText() === t.status.online;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      {errorMessage && (<div className="absolute top-16 left-4 right-4 z-50 bg-red-100 text-red-700 p-4 rounded-xl shadow-xl flex items-center gap-3 animate-slide-up"><AlertCircle size={20} /><div className="flex-1 text-sm font-medium">{errorMessage}</div><button onClick={() => setErrorMessage(null)} className="p-1 hover:bg-red-200/50 rounded-full"><X size={18}/></button></div>)}
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm z-30 shrink-0">
         <button onClick={handleBack} className="p-2 rounded-full hover:bg-slate-100 text-slate-500"><ArrowLeft size={20} /></button>
         <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden relative">{friend.avatar ? <img src={friend.avatar} className="w-full h-full object-cover" /> : null}{isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>}</div>
         <div className="flex-1"><h3 className="font-bold text-slate-800 dark:text-white leading-tight">{friend.display_name}</h3><p className={`text-xs ${isOnline ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>{isOnline ? t.status.activeNow : getStatusText()}</p></div>
      </div>
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 relative p-4 space-y-4 pb-20 scroll-smooth">
        {graffitiUrl && !showGraffitiCanvas && (<img src={graffitiUrl} className="absolute top-0 left-0 w-full pointer-events-none z-20 opacity-80 mix-blend-multiply dark:mix-blend-screen" style={{ height: 'auto', minHeight: '100%', objectFit: 'cover' }} crossOrigin="anonymous"/>)}
        {messages.map(msg => { const isMe = msg.sender_id !== friend.id; return (<div key={msg.id} id={`msg-${msg.id}`} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group relative z-10`}><div className={`max-w-[75%] rounded-2xl p-3 shadow-sm animate-pop-in ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'}`}>{msg.message_type === 'text' && (<><p>{msg.content}</p>{translationsMap[msg.id] && (<div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs italic opacity-80">{translationsMap[msg.id]}</div>)}</>)}{msg.message_type === 'image' && (<img src={msg.content} className="rounded-lg max-h-48 object-cover cursor-pointer bg-slate-950" crossOrigin="anonymous" onClick={() => window.open(msg.content, '_blank')}/>)}{msg.message_type === 'audio' && (<audio controls src={msg.content} className="h-10 w-[200px]" />)}<div className={`text-[10px] mt-1 flex items-center gap-2 ${isMe ? 'justify-end text-indigo-200' : 'justify-start text-slate-400'}`}><span>{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>{!isMe && msg.message_type === 'text' && (<button onClick={() => handleTranslate(msg.id, msg.content)} className="p-1 hover:text-indigo-500">{translatingIds.has(msg.id) ? <Loader2 size={10} className="animate-spin" /> : <Languages size={10} />}</button>)}{isMe && (<div className="flex items-center gap-1">{msg.read_at ? (<CheckCheck size={14} className="text-blue-300" />) : (<Check size={14} className="opacity-70" />)}<button onClick={(e) => handleDeleteMessage(msg.id, e)} className="ml-2 p-1.5 bg-red-600/20 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100"><Trash2 size={12} /></button></div>)}</div></div></div>); })}
        <div ref={messagesEndRef} />
        {showGraffitiCanvas && (<DrawingCanvas initialImage={graffitiUrl} onClose={closeGraffiti} onSend={handleSaveGraffiti} width={canvasDimensions.width} height={canvasDimensions.height} isSaving={uploading}/>)}
      </div>
      <div className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 z-30 relative shrink-0">
         {isRecording ? (<div className="flex-1 flex items-center justify-between bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-full border border-red-200 animate-pulse"><div className="flex items-center gap-2 text-red-600"><div className="w-3 h-3 bg-red-600 rounded-full animate-bounce"></div><span className="font-mono font-bold">{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span></div><button onClick={stopRecording} className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg"><Send size={18} /></button></div>) : (<><button onClick={startGraffiti} className="p-2.5 bg-pink-100 dark:bg-pink-900/30 text-pink-500 rounded-full" title={t.chat.paintMode}><Palette size={20} /></button><label className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 cursor-pointer"><input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} /><ImageIcon size={20} /></label><div className="flex-1"><input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder={t.chat.placeholder} className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" onKeyDown={(e) => e.key === 'Enter' && handleSendText()}/></div>{inputText.trim() ? (<button onClick={handleSendText} disabled={loading} className="p-2.5 bg-indigo-600 text-white rounded-full">{loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}</button>) : (<button onClick={startRecording} disabled={requestingMic} className={`p-2.5 rounded-full transition-all ${requestingMic ? 'bg-indigo-100' : 'bg-slate-200'}`}>{requestingMic ? <Loader2 size={20} className="animate-spin" /> : <Mic size={20} />}</button>)}</>)}
      </div>
      {uploading && (<div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50"><div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl flex items-center gap-3"><Loader2 className="animate-spin text-indigo-600" /><span className="text-sm font-medium dark:text-white">Sending...</span></div></div>)}
    </div>
  );
};

export default FriendChat;