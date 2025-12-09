
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Image as ImageIcon, Mic, X, Loader2, Play, Pause } from 'lucide-react';
import { UserProfile, DirectMessage } from '../types';
import { db } from '../services/db';
import { supabase } from '../services/supabase';
import { v4 as uuidv4 } from 'uuid';

interface FriendChatProps {
  friend: UserProfile;
  onBack: () => void;
  currentUserShareId: string;
}

const FriendChat: React.FC<FriendChatProps> = ({ friend, onBack, currentUserShareId }) => {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 3 seconds (simple real-time)
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [friend.id]);

  useEffect(() => {
      scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
      try {
          const msgs = await db.social.getMessages(friend.id);
          setMessages(msgs);
      } catch (e) {
          console.error("Failed to fetch messages", e);
      }
  };

  const handleSendText = async () => {
      if (!inputText.trim()) return;
      setLoading(true);
      try {
          await db.social.sendMessage(friend.id, inputText, 'text');
          setInputText('');
          fetchMessages();
      } catch (e) {
          console.error("Failed to send", e);
      } finally {
          setLoading(false);
      }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      setUploading(true);
      try {
          const fileName = `${currentUserShareId}-${Date.now()}.jpg`;
          const url = await db.social.uploadMedia(file, fileName);
          await db.social.sendMessage(friend.id, url, 'image');
          fetchMessages();
      } catch (e) {
          alert("Failed to upload image");
      } finally {
          setUploading(false);
      }
  };

  const startRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const recorder = new MediaRecorder(stream);
          const chunks: BlobPart[] = [];

          recorder.ondataavailable = (e) => chunks.push(e.data);
          recorder.onstop = async () => {
              const blob = new Blob(chunks, { type: 'audio/webm' });
              setUploading(true);
              try {
                  const fileName = `voice-${currentUserShareId}-${Date.now()}.webm`;
                  const url = await db.social.uploadMedia(blob, fileName);
                  await db.social.sendMessage(friend.id, url, 'audio');
                  fetchMessages();
              } catch (e) {
                  alert("Failed to send voice message");
              } finally {
                  setUploading(false);
              }
              // Stop all tracks
              stream.getTracks().forEach(track => track.stop());
          };

          recorder.start();
          setMediaRecorder(recorder);
          setIsRecording(true);
          setRecordingTime(0);
          timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);
      } catch (e) {
          alert("Microphone access denied");
      }
  };

  const stopRecording = () => {
      if (mediaRecorder && isRecording) {
          mediaRecorder.stop();
          setIsRecording(false);
          clearInterval(timerRef.current);
      }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm">
         <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
             <ArrowLeft size={20} />
         </button>
         <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
             {friend.avatar ? <img src={friend.avatar} className="w-full h-full object-cover" /> : null}
         </div>
         <div>
             <h3 className="font-bold text-slate-800 dark:text-white">{friend.display_name}</h3>
             <p className="text-xs text-slate-500">{friend.share_id}</p>
         </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => {
              const isMe = msg.sender_id !== friend.id;
              return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl p-3 ${
                          isMe 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                      }`}>
                          {msg.message_type === 'text' && <p>{msg.content}</p>}
                          
                          {msg.message_type === 'image' && (
                              <img src={msg.content} alt="Sent image" className="rounded-lg max-h-48 object-cover cursor-pointer" onClick={() => window.open(msg.content, '_blank')} />
                          )}

                          {msg.message_type === 'audio' && (
                              <audio controls src={msg.content} className="h-8 max-w-[200px]" />
                          )}
                          
                          <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                              {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                      </div>
                  </div>
              )
          })}
          <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
         {isRecording ? (
             <div className="flex-1 flex items-center justify-between bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-full border border-red-200 dark:border-red-900">
                 <div className="flex items-center gap-2 text-red-600 animate-pulse">
                     <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                     <span className="font-mono">{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
                 </div>
                 <button onClick={stopRecording} className="p-1 bg-red-600 text-white rounded-full">
                     <Send size={16} />
                 </button>
             </div>
         ) : (
             <>
                 <label className="p-2 text-slate-400 hover:text-indigo-500 cursor-pointer">
                     <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                     <ImageIcon size={22} />
                 </label>
                 
                 <div className="flex-1 relative">
                    <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Message..."
                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                        onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                    />
                 </div>

                 {inputText.trim() ? (
                     <button onClick={handleSendText} disabled={loading} className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700">
                         {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                     </button>
                 ) : (
                     <button onClick={startRecording} className="p-2.5 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full hover:bg-slate-300 dark:hover:bg-slate-700">
                         <Mic size={20} />
                     </button>
                 )}
             </>
         )}
      </div>
      {uploading && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl flex items-center gap-3">
                  <Loader2 className="animate-spin text-indigo-600" />
                  <span className="text-sm font-medium">Sending media...</span>
              </div>
          </div>
      )}
    </div>
  );
};

export default FriendChat;
