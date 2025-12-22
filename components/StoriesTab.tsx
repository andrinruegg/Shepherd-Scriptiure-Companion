
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Scroll, MessageCircle, Send, Plus, Trash2, Edit2, Check, X, User, History, PenLine } from 'lucide-react';
import { STORIES_DATA } from '../data/storiesData';
import { translations } from '../utils/translations';
import { Message } from '../types';
import { sendMessageStream } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';

interface Encounter {
    id: string;
    title: string;
    messages: Message[];
    timestamp: number;
}

interface RoleplayViewProps {
  language: string;
  onMenuClick: () => void;
}

const RoleplayView: React.FC<RoleplayViewProps> = ({ language, onMenuClick }) => {
  const [encounters, setEncounters] = useState<Encounter[]>(() => {
      const saved = localStorage.getItem('petrus_encounters');
      return saved ? JSON.parse(saved) : [];
  });
  const [activeEncounterId, setActiveEncounterId] = useState<string | null>(null);
  const [view, setView] = useState<'hub' | 'chat'>('hub');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const petrus = (STORIES_DATA[language] || STORIES_DATA['English'])[0];
  const t = translations[language]?.stories || translations['English'].stories;

  useEffect(() => {
      localStorage.setItem('petrus_encounters', JSON.stringify(encounters));
  }, [encounters]);

  useEffect(() => {
    if (view === 'chat') {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [encounters, activeEncounterId, isLoading, view]);

  const activeEncounter = encounters.find(e => e.id === activeEncounterId);

  const createEncounter = () => {
    const newId = uuidv4();
    const firstMsg: Message = {
        id: uuidv4(),
        role: 'model',
        text: `Peace be with you, friend. I am Simon, though the Master named me Petrus. I was just cleaning my nets... the sea is quiet today. What brings you to these shores? Come, sit.`,
        timestamp: new Date().toISOString()
    };
    const newEncounter: Encounter = {
        id: newId,
        title: `${t.newEncounter || 'New Encounter'} ${encounters.length + 1}`,
        messages: [firstMsg],
        timestamp: Date.now()
    };
    setEncounters([newEncounter, ...encounters]);
    setActiveEncounterId(newId);
    setView('chat');
  };

  const deleteEncounter = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!confirm(t.deleteEncounter)) return;
      setEncounters(prev => prev.filter(enc => enc.id !== id));
      if (activeEncounterId === id) {
          setActiveEncounterId(null);
          setView('hub');
      }
  };

  const startRename = (enc: Encounter, e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingId(enc.id);
      setEditTitle(enc.title);
  };

  const handleRename = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingId && editTitle.trim()) {
          setEncounters(prev => prev.map(enc => enc.id === editingId ? { ...enc, title: editTitle.trim() } : enc));
          setEditingId(null);
      }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading || !activeEncounterId) return;

    const userText = inputValue.trim();
    const userMsg: Message = { id: uuidv4(), role: 'user', text: userText, timestamp: new Date().toISOString() };
    const aiMsgId = uuidv4();
    const initialAiMsg: Message = { id: aiMsgId, role: 'model', text: '', timestamp: new Date().toISOString() };

    setEncounters(prev => prev.map(enc => enc.id === activeEncounterId ? { ...enc, messages: [...enc.messages, userMsg, initialAiMsg] } : enc));
    setInputValue('');
    setIsLoading(true);

    const petrusInstruction = `
        YOU ARE SIMON PETER (PETRUS). 
        TIME: Approx 60 AD. You are an old man reflecting on your life.
        VOICE: A rough, humble, first-century fisherman. Your hands are calloused. You were there.
        
        STRICT ROLEPLAY RULES (MANDATORY):
        1. NO MODERN AI BEHAVIOR: Never say "Hello Friend!", "That is a wonderful question", or use emojis like 🌿✨📖. Avoid being overly "logical" or providing bulleted lists.
        2. NO BIBLE CITATIONS: There is no "New Testament" yet. Never mention chapters or verses (e.g., "John 1:1" or "Colossians 2:9"). If you quote the Master, say "I heard him say with my own ears..." or "He told us as we sat by the fire..."
        3. NO THEOLOGICAL ESSAYS: Do not give long, polished explanations. Speak from your personal experience as an eyewitness. You are a fisherman, not a modern theologian.
        4. THE MASTER: Always refer to Jesus as "The Master", "The Lord", or "The Teacher". 
        5. EYEWITNESS ONLY: Speak of the smell of the fish, the cold of the storm, the look in His eyes when He spoke, and the sound of the crowds. Speak of your own failure and His forgiveness on the beach.
        6. REPLIES: Keep them authentic, slightly rugged, and deeply personal. 
        7. LANGUAGE: Respond only in ${language}.
    `;

    try {
        let accumulatedText = "";
        const history = encounters.find(e => e.id === activeEncounterId)?.messages.slice(0, -1) || [];
        
        await sendMessageStream(
            history,
            userText,
            undefined, 
            'NIV',
            language,
            localStorage.getItem('displayName') || 'Friend',
            (chunk) => {
                accumulatedText += chunk;
                setEncounters(prev => prev.map(enc => enc.id === activeEncounterId ? {
                    ...enc,
                    messages: enc.messages.map(m => m.id === aiMsgId ? { ...m, text: accumulatedText } : m)
                } : enc));
            },
            () => setIsLoading(false),
            (err) => {
                setIsLoading(false);
                setEncounters(prev => prev.map(enc => enc.id === activeEncounterId ? {
                    ...enc,
                    messages: enc.messages.map(m => m.id === aiMsgId ? { ...m, text: "Forgive me, friend... my thoughts are heavy. Could you say that again?", isError: true } : m)
                } : enc));
            },
            petrusInstruction 
        );
    } catch (error) {
        setIsLoading(false);
    }
  };

  if (view === 'chat' && activeEncounter) {
      return (
          <div className="flex flex-col h-full bg-[#f4ebd0] dark:bg-slate-950 animate-fade-in font-serif-text">
              <header className="p-4 bg-[#e5d9b6] dark:bg-slate-900 border-b border-[#d4c59e] dark:border-slate-800 flex items-center justify-between shadow-md z-30">
                  <div className="flex items-center gap-3">
                      <button onClick={() => setView('hub')} className="p-2 -ml-2 text-[#5d5335] dark:text-slate-400 hover:bg-black/5 rounded-lg transition-colors">
                          <ArrowLeft size={24} />
                      </button>
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#8b7e5a] shadow-lg">
                          <img src={petrus.image} className="w-full h-full object-cover" />
                      </div>
                      <div>
                          <h2 className="font-bold text-[#5d5335] dark:text-slate-200 text-lg leading-tight">{petrus.name}</h2>
                          <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                              <span className="text-[10px] uppercase font-bold text-[#8b7e5a] tracking-widest">Encounter</span>
                          </div>
                      </div>
                  </div>
              </header>

              <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-10 bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')] scroll-smooth">
                  {activeEncounter.messages.map((msg) => (
                      <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-pop-in`}>
                          <div className={`flex gap-4 max-w-[92%] md:max-w-[80%] items-start`}>
                              {msg.role === 'model' && (
                                  <div className="w-10 h-10 rounded-full bg-[#e5d9b6] flex items-center justify-center shrink-0 mt-1 shadow-md border border-[#8b7e5a] overflow-hidden">
                                      <img src={petrus.image} className="w-full h-full object-cover" />
                                  </div>
                              )}
                              <div className={`
                                px-6 py-5 rounded-2xl shadow-lg relative border
                                ${msg.role === 'user' 
                                    ? 'bg-slate-800 text-slate-100 border-slate-700 rounded-tr-none' 
                                    : 'bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 border-[#d4c59e] dark:border-slate-800 italic rounded-tl-none'}
                                `}>
                                  {msg.text === '' && isLoading ? (
                                      <div className="flex gap-1.5 h-4 items-center px-2">
                                          <div className="w-2 h-2 bg-[#8b7e5a] rounded-full animate-bounce"></div>
                                          <div className="w-2 h-2 bg-[#8b7e5a] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                          <div className="w-2 h-2 bg-[#8b7e5a] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                      </div>
                                  ) : (
                                      <div className="prose dark:prose-invert prose-slate max-w-none text-lg leading-relaxed">
                                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                                      </div>
                                  )}
                              </div>
                              {msg.role === 'user' && (
                                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mt-1 shadow-md border border-slate-600">
                                      <User size={20} className="text-slate-300" />
                                  </div>
                              )}
                          </div>
                      </div>
                  ))}
                  <div ref={messagesEndRef} className="h-24" />
              </main>

              <footer className="p-4 md:p-6 bg-[#e5d9b6]/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-[#d4c59e] dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                  <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-end gap-3">
                      <textarea
                          ref={inputRef}
                          value={inputValue}
                          onChange={(e) => {
                              setInputValue(e.target.value);
                              e.target.style.height = 'auto';
                              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                          }}
                          onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                          placeholder={`Speak to the fisherman...`}
                          rows={1}
                          className="flex-1 bg-white/80 dark:bg-slate-800/80 border border-[#d4c59e] dark:border-slate-700 rounded-2xl px-5 py-3.5 text-lg focus:ring-2 focus:ring-[#8b7e5a] outline-none resize-none dark:text-white placeholder-[#8b7e5a]/40 shadow-inner"
                      />
                      <button 
                        type="submit" 
                        disabled={isLoading || !inputValue.trim()}
                        className="p-5 bg-[#8b7e5a] hover:bg-[#5d5335] text-white rounded-2xl disabled:opacity-50 transition-all shadow-xl active:scale-95 flex items-center justify-center"
                      >
                          <Send size={24} />
                      </button>
                  </form>
                  <p className="text-[10px] text-center text-[#8b7e5a] mt-4 uppercase tracking-[0.2em] font-bold opacity-70">
                      {t.disclaimer}
                  </p>
              </footer>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden font-serif-text">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 shadow-sm flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
              <button onClick={onMenuClick} className="p-2 -ml-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <ArrowLeft size={24} />
              </button>
              <div className="bg-amber-100 dark:bg-amber-900/30 p-2.5 rounded-2xl text-amber-600 dark:text-amber-400 shadow-sm">
                  <Scroll size={24} />
              </div>
              <div>
                  <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t.title}</h1>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{t.subtitle}</p>
              </div>
          </div>
          <button 
            onClick={createEncounter}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-600/20 hover:bg-amber-500 transition-all active:scale-95"
          >
              <Plus size={18} /> {t.newEncounter || 'New Encounter'}
          </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
              
              {/* PETRUS FEATURE CARD */}
              <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden mb-12 border border-slate-100 dark:border-slate-800 group relative">
                  <div className="h-72 w-full relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent z-10"></div>
                      <img src={petrus.image} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[4s]" />
                      <div className="absolute bottom-8 left-8 z-20">
                          <span className="px-4 py-1.5 bg-amber-600/90 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-widest mb-3 inline-block shadow-xl">{petrus.role}</span>
                          <h2 className="text-5xl font-bold text-white drop-shadow-2xl">Simon Petrus</h2>
                      </div>
                  </div>
                  <div className="p-10">
                      <div className="space-y-6 mb-10">
                         {petrus.biography.map((p, i) => (
                             <p key={i} className="text-xl leading-relaxed text-slate-600 dark:text-slate-300 italic border-l-4 border-amber-100 dark:border-amber-900/30 pl-6">
                                "{p}"
                             </p>
                         ))}
                      </div>
                      <button 
                        onClick={createEncounter}
                        className="w-full py-5 bg-amber-600 hover:bg-amber-500 text-white rounded-[1.5rem] font-bold text-xl shadow-2xl shadow-amber-600/30 transition-all flex items-center justify-center gap-4 group"
                      >
                          <MessageCircle size={28} className="group-hover:scale-110 transition-transform" />
                          {t.startRoleplay}
                      </button>
                  </div>
              </div>

              {/* ENCOUNTERS LIST */}
              {encounters.length > 0 && (
                  <div className="w-full max-w-2xl animate-slide-up">
                      <div className="flex items-center justify-between mb-6 px-2">
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                              <History size={16}/> {t.history || 'Previous Encounters'}
                          </h3>
                          <span className="text-[10px] font-bold text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{encounters.length}</span>
                      </div>
                      
                      <div className="space-y-4">
                          {encounters.map((enc) => (
                              <div 
                                key={enc.id}
                                onClick={() => { setActiveEncounterId(enc.id); setView('chat'); }}
                                className={`
                                    flex items-center justify-between p-5 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden
                                    ${activeEncounterId === enc.id 
                                        ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' 
                                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-amber-200 shadow-md hover:shadow-xl hover:-translate-y-0.5'}
                                `}
                              >
                                  <div className="flex items-center gap-5 flex-1 min-w-0 z-10">
                                      <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 shrink-0 border border-amber-100 dark:border-amber-800 group-hover:scale-110 transition-transform">
                                          <Scroll size={24} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          {editingId === enc.id ? (
                                              <form onSubmit={handleRename} className="flex gap-2" onClick={e => e.stopPropagation()}>
                                                  <input 
                                                    autoFocus
                                                    value={editTitle}
                                                    onChange={e => setEditTitle(e.target.value)}
                                                    className="flex-1 bg-white dark:bg-slate-800 border-amber-500 border-2 rounded-xl px-3 py-1.5 text-base font-bold outline-none"
                                                  />
                                                  <button type="submit" className="p-2 bg-emerald-500 text-white rounded-xl shadow-sm"><Check size={20}/></button>
                                                  <button type="button" onClick={() => setEditingId(null)} className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-500 rounded-xl"><X size={20}/></button>
                                              </form>
                                          ) : (
                                              <>
                                                  <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate text-lg group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">{enc.title}</h4>
                                                  <div className="flex items-center gap-3 mt-1">
                                                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{new Date(enc.timestamp).toLocaleDateString()}</p>
                                                      <span className="text-[10px] text-slate-300">•</span>
                                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{enc.messages.length} lines</p>
                                                  </div>
                                              </>
                                          )}
                                      </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 z-10">
                                      <button 
                                        onClick={(e) => startRename(enc, e)} 
                                        className="p-2.5 text-slate-400 hover:text-amber-600 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
                                        title="Rename"
                                      >
                                          <PenLine size={18} />
                                      </button>
                                      <button 
                                        onClick={(e) => deleteEncounter(enc.id, e)} 
                                        className="p-2.5 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                        title="Delete"
                                      >
                                          <Trash2 size={18} />
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
          <div className="h-24"></div>
      </main>
    </div>
  );
};

export default RoleplayView;
