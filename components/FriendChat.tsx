import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { ArrowLeft, Send, Image as ImageIcon, Mic, Loader2, Trash2, Check, CheckCheck, Palette, X, AlertCircle, User, Languages } from 'lucide-react';
import { UserProfile, DirectMessage } from '../types';
import { db } from '../services/db';
import DrawingCanvas from './DrawingCanvas';
import { translateContent } from '../services/geminiService';
import { useTranslation } from 'react-i18next';

interface FriendChatProps {
  friend: UserProfile;
  onBack: () => void;
  currentUserShareId: string;
  onMessagesRead?: () => void; 
}

const FriendChat: React.FC<FriendChatProps> = ({ friend, onBack, currentUserShareId, onMessagesRead }) => {
  const { t } = useTranslation();
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

  const markAsRead = async () => {
      try {
        await db.social.markMessagesRead(friend.id);
        if (onMessagesRead) onMessagesRead();
      } catch (e) { console.error("Failed to mark read", e); }
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
        if (!isDrawingRef.current && (Date.now() - lastUploadTimeRef.current > 10000)) {
            loadGraffiti(); 
        }
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
              if (el) {
                  el.scrollIntoView({ behavior: 'auto', block: 'center' });
                  hasScrolledRef.current = true;
                  return;
              }
          }
          container.scrollTop = container.scrollHeight;
      };
      performScroll();
      requestAnimationFrame(() => { performScroll(); hasScrolledRef.current = true; });
  }, [initialLoadDone, messages, friend.id]); 

  useEffect(() => {
      if (initialLoadDone && hasScrolledRef.current && messages.length > 0) {
          const lastMsg = messages[messages.length - 1];
          const isMe = lastMsg.sender_id !== friend.id;
          if (isMe) {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
          } else {
              const container = messagesContainerRef.current;
              if (container) {
                  const dist = container.scrollHeight - container.scrollTop - container.clientHeight;
                  if (dist < 300) {
                      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                  }
              }
          }
      }
  }, [messages.length, initialLoadDone]);

  const fetchFriendStatus = async () => {
      try {
          const profile = await db.social.getUserProfile(friend.id);
          if (profile) setFriendStatus(profile);
      } catch (e) { console.error(e); }
  }

  const loadGraffiti = async () => {
      try {
          const url = await db.social.getGraffitiUrl(friend.id);
          if (url) setGraffitiUrl(url);
      } catch (e) { console.error("Error loading graffiti", e); }
  }

  const fetchMessages = async (isInitial: boolean = false) => {
      try {
          const msgs = await db.social.getMessages(friend.id);
          const filteredMsgs = msgs.filter(m => !deletedIdsRef.current.has(m.id));
          
          setMessages(prev => {
              const isDifferent = 
                  prev.length !== filteredMsgs.length || 
                  prev.some((m, i) => m.id !== filteredMsgs[i].id || m.read_at !== filteredMsgs[i].read_at);
              return isDifferent ? filteredMsgs : prev;
          });

          if (isInitial) setTimeout(() => setInitialLoadDone(true), 0);
      } catch (e) { console.error("Failed to fetch messages", e); }
  };

  const handleSendText = async () => {
      if (!inputText.trim()) return;
      setLoading(true);
      db.social.heartbeat(); 
      try {
          await db.social.sendMessage(friend.id, inputText, 'text');
          setInputText('');
          fetchMessages(false);
          setTimeout(() => {
               messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
          }, 100);
      } catch (e) { console.error("Failed to send", e); } finally { setLoading(false); }
  };

  const handleDeleteMessage = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation(); e.preventDefault();
      setMessages(prev => prev.filter(m => m.id !== id));
      deletedIdsRef.current.add(id);
      try { await db.social.deleteDirectMessage(id); } catch (error: any) { console.error("[UI] Background delete failed:", error); }
  }

  const handleTranslate = async (id: string, text: string) => {
    if (translationsMap[id]) {
        const newMap = { ...translationsMap };
        delete newMap[id];
        setTranslationsMap(newMap);
        return;
    }

    setTranslatingIds(prev => new Set(prev).add(id));
    try {
        const targetLang = localStorage.getItem('language') || 'English';
        const translated = await translateContent(text, targetLang);
        setTranslationsMap(prev => ({ ...prev, [id]: translated }));
    } catch (e) {
        console.error("Translation failed", e);
    } finally {
        setTranslatingIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    }
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
          setTimeout(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, 500);
      } catch (e: any) { 
          handleUploadError(e, "Image Upload Failed");
      } finally { setUploading(false); }
  };

  const startGraffiti = () => {
      if (messagesContainerRef.current) {
          const w = messagesContainerRef.current.scrollWidth || window.innerWidth;
          const h = Math.max(messagesContainerRef.current.scrollHeight, window.innerHeight);
          setCanvasDimensions({ width: w, height: h });
          setShowGraffitiCanvas(true);
          isDrawingRef.current = true; 
      }
  };

  const closeGraffiti = () => {
      setShowGraffitiCanvas(false);
      isDrawingRef.current = false; 
  }

  const handleSaveGraffiti = async (blob: Blob) => {
      if (uploading) return;
      if (!friend || !friend.id) {
          setErrorMessage("Error: Friend data missing. Restart app.");
          return;
      }
      setUploading(true);
      
      try {
          const url = await Promise.race([
              db.social.uploadGraffiti(friend.id, blob),
              new Promise((_, reject) => setTimeout(() => reject(new Error("Upload timed out. Check connection.")), 10000))
          ]) as string;
          
          lastUploadTimeRef.current = Date.now();
          setGraffitiUrl(url); 
          closeGraffiti(); 
      } catch (e: any) {
          handleUploadError(e, "Could not save drawing");
      } finally {
          setUploading(false);
      }
  };
  
  const startRecording = async () => {
      setErrorMessage(null);
      setRequestingMic(true);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setRequestingMic(false);
          setErrorMessage("Microphone API not supported on this browser.");
          return;
      }

      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const recorder = new MediaRecorder(stream);
          const chunks: BlobPart[] = [];
          
          recorder.ondataavailable = (e) => {
              if (e.data.size > 0) chunks.push(e.data);
          };
          
          recorder.onstop = async () => {
              const detectedType = recorder.mimeType || (typeof window !== 'undefined' && (window as any).webkitAudioContext ? 'audio/mp4' : 'audio/webm');
              const blob = new Blob(chunks, { type: detectedType });
              stream.getTracks().forEach(track => track.stop());

              if (blob.size < 500) { 
                  console.warn("Audio too short, discarded.");
                  return;
              }

              setUploading(true);
              try {
                  let ext = 'webm';
                  if (detectedType.includes('mp4')) ext = 'mp4';
                  if (detectedType.includes('aac')) ext = 'm4a';
                  if (detectedType.includes('ogg')) ext = 'ogg';
                  if (detectedType.includes('wav')) ext = 'wav';

                  const fileName = `voice-${safeShareId}-${Date.now()}.${ext}`;
                  const url = await db.social.uploadMedia(blob, fileName);
                  await db.social.sendMessage(friend.id, url, 'audio');
                  fetchMessages(false);
                  setTimeout(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, 200);
              } catch (e: any) { 
                  handleUploadError(e, "Voice Send Failed");
              } finally { 
                  setUploading(false); 
              }
          };
          
          recorder.start();
          setMediaRecorder(recorder);
          setIsRecording(true);
          setRequestingMic(false);
          
          setRecordingTime(0);
          timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);

      } catch (e: any) { 
          setRequestingMic(false);
          console.error("Mic Access Error:", e);
          if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
              setErrorMessage("Mic Blocked: Click the Lock icon 🔒 in your address bar.");
          } else if (e.name === 'NotFoundError') {
              setErrorMessage("No microphone found on this device.");
          } else if (e.name === 'NotReadableError') {
              setErrorMessage("Microphone is busy. Close other apps using it.");
          } else {
              setErrorMessage(`Mic Error: ${e.message || "Unknown"}`);
          }
      }
  };

  const stopRecording = () => {
      if (mediaRecorder && isRecording) {
          if (mediaRecorder.state !== 'inactive') {
              mediaRecorder.stop();
          }
          setIsRecording(false);
          clearInterval(timerRef.current);
      }
  };

  const handleUploadError = (e: any, context: string) => {
      const msg = e.message || "Unknown error";
      if (msg.includes('Failed to fetch') || msg.includes('token <') || msg.includes('html')) {
          setErrorMessage(`${context}: Server Connection Failed. Please try again later or Run SQL Fix.`);
      } else if (msg.includes('row-level security') || msg.includes('new row violates')) {
          setErrorMessage(`${context}: Permission Denied. Please run the SQL Repair in Settings.`);
      } else {
          setErrorMessage(`${context}: ${msg}`);
      }
      setTimeout(() => setErrorMessage(null), 5000);
  };

  const handleBack = async () => { await markAsRead(); onBack(); };

  const getStatusText = () => {
      if (!friendStatus || !friendStatus.last_seen) return t('social.status.offline');
      const last = new Date(friendStatus.last_seen).getTime();
      const diff = Date.now() - last;
      if (diff < 5 * 60 * 1000) return t('social.status.online');
      if (diff < 60 * 60 * 1000) return `${t('social.status.lastSeen')} ${Math.floor(diff / 60000)}m ${t('social.status.ago')}`;
      return t('social.status.offline');
  };
  const isOnlineStatus = getStatusText() === t('social.status.online');

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      {errorMessage && (
          <div className="absolute top-16 left-4 right-4 z-50 bg-red-100 dark:bg-red-900/90 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-100 p-4 rounded-xl shadow-xl flex flex-col items-start gap-2 animate-slide-up backdrop-blur-md">
              <div className="flex items-center gap-3 w-full">
                  <AlertCircle size={20} className="mt-0.5 shrink-0 animate-pulse" />
                  <div className="flex-1 text-sm font-medium">{errorMessage}</div>
                  <button onClick={() => setErrorMessage(null)} className="p-1 hover:bg-red-200/50 rounded-full"><X size={18}/></button>
              </div>
          </div>
      )}

      <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm z-30 relative shrink-0">
         <button onClick={handleBack} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500" title={t('stories.back')}>
             <ArrowLeft size={20} />
         </button>
         <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden relative">
             {friend.avatar ? <img src={friend.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400"><User size={20}/></div>}
             {isOnlineStatus && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></div>}
         </div>
         <div className="flex-1">
             <h3 className="font-bold text-slate-800 dark:text-white leading-tight">{friend.display_name}</h3>
             <div className="flex items-center gap-1.5">
                <p className={`text-xs ${isOnlineStatus ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                    {isOnlineStatus ? t('social.status.activeNow') : getStatusText()}
                </p>
             </div>
         </div>
      </div>

      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 relative p-4 space-y-4 pb-20 scroll-smooth no-scrollbar"
      >
        {graffitiUrl && !showGraffitiCanvas && (
            <img 
                src={graffitiUrl} 
                className="absolute top-0 left-0 w-full pointer-events-none z-20 opacity-80 mix-blend-multiply dark:mix-blend-screen" 
                style={{ height: 'auto', minHeight: '100%', objectFit: 'cover' }}
                alt="Graffiti"
                crossOrigin="anonymous"
            />
        )}

        {messages.map(msg => {
            const isMe = msg.sender_id !== friend.id;
            const translatedText = translationsMap[msg.id];
            const isTranslating = translatingIds.has(msg.id);

            return (
                <div 
                    key={msg.id} 
                    id={`msg-${msg.id}`}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} group relative z-10`} 
                >
                    <div className={`max-w-[75%] rounded-2xl p-3 relative shadow-sm animate-pop-in ${
                        isMe 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                    }`}>
                        {msg.message_type === 'text' && (
                            <>
                                <p>{msg.content}</p>
                                {translatedText && (
                                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                                        <p className="text-xs italic opacity-80">{translatedText}</p>
                                    </div>
                                )}
                            </>
                        )}
                        
                        {msg.message_type === 'image' && (
                            <img 
                                src={msg.content} 
                                alt="Sent image" 
                                className="rounded-lg max-h-48 object-cover cursor-pointer bg-slate-950" 
                                onClick={() => window.open(msg.content, '_blank')}
                                crossOrigin="anonymous"
                            />
                        )}

                        {msg.message_type === 'audio' && (
                            <audio controls src={msg.content} className="h-10 w-[200px]" />
                        )}
                        
                        <div className={`text-[10px] mt-1 flex items-center gap-2 ${isMe ? 'justify-end text-indigo-200' : 'justify-start text-slate-400'}`}>
                            <span>{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            
                            {!isMe && msg.message_type === 'text' && (
                                <button
                                    onClick={() => handleTranslate(msg.id, msg.content)}
                                    disabled={isTranslating}
                                    className="p-1 hover:text-indigo-500 transition-colors"
                                    title={t('common.translate')}
                                >
                                    {isTranslating ? <Loader2 size={10} className="animate-spin" /> : <Languages size={10} />}
                                </button>
                            )}

                            {isMe && (
                                <div className="flex items-center gap-1">
                                    {msg.read_at ? (
                                        <span title="Seen"><CheckCheck size={14} className="text-blue-300" /></span>
                                    ) : (
                                        <span title="Delivered"><Check size={14} className="opacity-70" /></span>
                                    )}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.id, e); }}
                                        className="ml-2 p-1.5 bg-red-600/20 hover:bg-red-600 text-white rounded-full transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                                        title={t('common.delete')}
                                        type="button"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )
        })}
        <div ref={messagesEndRef} />

        {showGraffitiCanvas && (
            <DrawingCanvas 
               initialImage={graffitiUrl}
               onClose={closeGraffiti}
               onSend={handleSaveGraffiti}
               width={canvasDimensions.width}
               height={canvasDimensions.height}
               isSaving={uploading}
            />
        )}
      </div>

      <div className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 z-30 relative shrink-0">
         {isRecording ? (
             <div className="flex-1 flex items-center justify-between bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-full border border-red-200 dark:border-red-900 transition-all animate-pulse">
                 <div className="flex items-center gap-2 text-red-600">
                     <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce"></div>
                     <span className="font-mono font-bold">{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
                 </div>
                 <button onClick={stopRecording} className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg" title={t('common.done')}>
                     <Send size={18} />
                 </button>
             </div>
         ) : (
             <>
                 <button 
                    onClick={startGraffiti}
                    className="p-2.5 bg-pink-100 dark:bg-pink-900/30 text-pink-500 hover:bg-pink-200 dark:hover:bg-pink-900/50 rounded-full transition-colors"
                    title={t('social.chat.paintMode')}
                 >
                     <Palette size={20} />
                 </button>

                 <label className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors" title={t('common.upload')}>
                     <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                     <ImageIcon size={20} />
                 </label>
                 
                 <div className="flex-1 relative">
                    <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={t('social.chat.placeholder')}
                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                        onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                    />
                 </div>

                 {inputText.trim() ? (
                     <button onClick={handleSendText} disabled={loading} className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700" title={t('common.shepherd')}>
                         {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                     </button>
                 ) : (
                     <button 
                        onClick={startRecording} 
                        disabled={requestingMic}
                        className={`p-2.5 rounded-full transition-all ${requestingMic ? 'bg-indigo-100 text-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 active:scale-95'}`}
                        title={t('common.mic')}
                     >
                         {requestingMic ? <Loader2 size={20} className="animate-spin" /> : <Mic size={20} />}
                     </button>
                 )}
             </>
         )}
      </div>

      {uploading && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl flex items-center gap-3">
                  <Loader2 className="animate-spin text-indigo-600" />
                  <span className="text-sm font-medium dark:text-white">{t('common.loading')}</span>
              </div>
          </div>
      )}
    </div>
  );
};

export default FriendChat;