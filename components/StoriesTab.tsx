import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Scroll, MessageCircle, Send, Plus, Trash2, Edit2, Check, X, User, History, PenLine, Sparkles, BookOpen, AlertTriangle } from 'lucide-react';
import { STORIES_DATA } from '../data/storiesData';
import { useTranslation } from 'react-i18next';
import { Message, BibleStory } from '../types';
import { sendMessageStream } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';

interface Encounter {
    id: string;
    personaId: string;
    title: string;
    messages: Message[];
    timestamp: number;
}

interface RoleplayViewProps {
  language: string;
  onMenuClick: () => void;
  hasApiKey: boolean; 
}

const RoleplayView: React.FC<RoleplayViewProps> = ({ language, onMenuClick, hasApiKey }) => {
  const { t, i18n } = useTranslation();
  const [encounters, setEncounters] = useState<Encounter[]>(() => {
      try {
          const saved = localStorage.getItem('figure_encounters');
          return saved ? JSON.parse(saved) : [];
      } catch (e) {
          console.error("Failed to load encounters", e);
          return [];
      }
  });
  
  const [selectedPersona, setSelectedPersona] = useState<BibleStory | null>(null);
  const [activeEncounterId, setActiveEncounterId] = useState<string | null>(null);
  const [view, setView] = useState<'hub' | 'detail' | 'chat'>('hub');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNoKeyError, setShowNoKeyError] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const langMap: Record<string, string> = { en: 'English', de: 'German', ro: 'Romanian' };
  const dataKey = langMap[i18n.language] || 'English';
  const figures = STORIES_DATA[dataKey] || STORIES_DATA['English'];

  useEffect(() => {
      localStorage.setItem('figure_encounters', JSON.stringify(encounters));
  }, [encounters]);

  useEffect(() => {
    if (view === 'chat') {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [encounters, activeEncounterId, isLoading, view]);

  const activeEncounter = encounters.find(e => e.id === activeEncounterId);
  const currentFigure = activeEncounter ? figures.find(f => f.id === activeEncounter.personaId) : selectedPersona;

  const getTheme = (id?: string) => {
      if (id === 'paul') return {
          bg: 'bg-[#f5f3ff]', 
          header: 'bg-[#ede9fe]', 
          accent: 'text-[#6d28d9]', 
          btn: 'bg-[#6d28d9]', 
          border: 'border-[#ddd6fe]'
      };
      return {
          bg: 'bg-[#f4ebd0]', 
          header: 'bg-[#e5d9b6]', 
          accent: 'text-[#8b7e5a]', 
          btn: 'bg-[#8b7e5a]', 
          border: 'border-[#d4c59e]'
      };
  };

  const theme = getTheme(currentFigure?.id);

  const createEncounter = (persona: BibleStory) => {
    if (!hasApiKey) {
        setShowNoKeyError(true);
        setTimeout(() => setShowNoKeyError(false), 4000);
        return;
    }

    const newId = uuidv4();
    let intro = "";
    
    if (persona.id === 'peter') intro = t('stories.intro.peter');
    else if (persona.id === 'paul') intro = t('stories.intro.paul');
    else intro = "Peace be with you.";

    const firstMsg: Message = {
        id: uuidv4(),
        role: 'model',
        text: intro,
        timestamp: new Date().toISOString()
    };
    
    const encounterTitle = `${t('stories.encounterLabel')} - ${persona.name}`;

    const newEncounter: Encounter = {
        id: newId,
        personaId: persona.id,
        title: encounterTitle,
        messages: [firstMsg],
        timestamp: Date.now()
    };
    
    const updatedEncounters = [newEncounter, ...encounters];
    setEncounters(updatedEncounters);
    setActiveEncounterId(newId);
    setView('chat');
  };

  const deleteEncounter = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!confirm(t('common.confirmDelete'))) return;
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
    if (!inputValue.trim() || isLoading || !activeEncounterId || !currentFigure) return;
    
    if (!hasApiKey) {
        setShowNoKeyError(true);
        setTimeout(() => setShowNoKeyError(false), 4000);
        return;
    }

    const userText = inputValue.trim();
    const userMsg: Message = { id: uuidv4(), role: 'user', text: userText, timestamp: new Date().toISOString() };
    const aiMsgId = uuidv4();
    const initialAiMsg: Message = { id: aiMsgId, role: 'model', text: '', timestamp: new Date().toISOString() };

    setEncounters(prev => prev.map(enc => enc.id === activeEncounterId ? { ...enc, messages: [...enc.messages, userMsg, initialAiMsg] } : enc));
    setInputValue('');
    setIsLoading(true);

    const baseInstruction = `
        TIME: Approx 60 AD. Respond as an eyewitness of the first century.
        NO MODERN AI BEHAVIOR: Never say "Hello Friend!", use emojis, hashtags, or modern slang.
        KNOWLEDGE LIMIT: You only know what ${currentFigure.name} would know up to that point.
        PERSONALITY: ${currentFigure.traits.join(', ')}.
        BIOGRAPHY CONTEXT: ${currentFigure.biography.join(' ')}.
        LANG: ${language}
    `;

    const history = activeEncounter ? [...activeEncounter.messages, userMsg] : [userMsg];

    try {
        let accumulated = "";
        await sendMessageStream(
            history, 
            userText, 
            undefined, 
            'NIV', 
            language, 
            t('common.guest'), 
            (chunk) => {
                accumulated += chunk;
                setEncounters(prev => prev.map(enc => {
                    if (enc.id === activeEncounterId) {
                        return { 
                            ...enc, 
                            messages: enc.messages.map(m => m.id === aiMsgId ? { ...m, text: accumulated } : m) 
                        };
                    }
                    return enc;
                }));
            },
            () => setIsLoading(false),
            (error) => {
                console.error(error);
                setIsLoading(false);
            },
            baseInstruction
        );
    } catch (e) {
        setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[#f8f7f2] dark:bg-slate-950 transition-colors relative`}>
      {showNoKeyError && (
           <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-5 py-3 rounded-2xl flex items-center gap-3 shadow-2xl animate-pop-in">
               <AlertTriangle size={20} />
               <div className="flex flex-col">
                   <span className="text-xs font-bold">{t('common.warning')}</span>
                   <span className="text-xs opacity-90">{t('stories.needKey')}</span>
               </div>
           </div>
      )}

      {/* HUB VIEW */}
      {view === 'hub' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <header className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                      <button onClick={onMenuClick} className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full"><ArrowLeft size={24}/></button>
                      <h1 className="text-2xl font-bold font-serif-text text-slate-800 dark:text-slate-100">{t('stories.title')}</h1>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">{t('stories.subtitle')}</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {figures.map(fig => (
                      <div key={fig.id} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 group hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer" onClick={() => { setSelectedPersona(fig); setView('detail'); }}>
                          <div className="h-48 overflow-hidden relative">
                              <img 
                                src={fig.image} 
                                alt={fig.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                style={{ objectPosition: '50% 10%' }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                              <div className="absolute bottom-4 left-4 text-white">
                                  <h3 className="font-bold text-lg font-serif-text">{fig.name}</h3>
                                  <p className="text-xs opacity-90">{fig.role}</p>
                              </div>
                          </div>
                          <div className="p-5">
                              <div className="flex flex-wrap gap-2 mb-4">
                                  {fig.traits.slice(0, 3).map(trait => (
                                      <span key={trait} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] uppercase font-bold rounded-md">{trait}</span>
                                  ))}
                              </div>
                              <button className="w-full py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                  {t('stories.readMore')}
                              </button>
                          </div>
                      </div>
                  ))}
              </div>

              {encounters.length > 0 && (
                  <div>
                      <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{t('stories.pastConversations')}</h2>
                      <div className="space-y-3">
                          {encounters.map(enc => (
                              <div key={enc.id} onClick={() => { setActiveEncounterId(enc.id); setView('chat'); }} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 cursor-pointer shadow-sm group">
                                  <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
                                          <Scroll size={20} />
                                      </div>
                                      <div>
                                          {editingId === enc.id ? (
                                              <form onSubmit={handleRename} onClick={e => e.stopPropagation()} className="flex items-center gap-2">
                                                  <input autoFocus value={editTitle} onChange={e => setEditTitle(e.target.value)} className="text-sm border rounded px-2 py-1 outline-none bg-slate-50 dark:bg-slate-800 dark:text-white" />
                                                  <button type="submit" className="text-emerald-500"><Check size={14}/></button>
                                                  <button type="button" onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="text-red-500"><X size={14}/></button>
                                              </form>
                                          ) : (
                                              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{enc.title}</h4>
                                          )}
                                          <p className="text-xs text-slate-500">{new Date(enc.timestamp).toLocaleDateString()}</p>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={(e) => startRename(enc, e)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition-colors"><Edit2 size={16} /></button>
                                      <button onClick={(e) => deleteEncounter(enc.id, e)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"><Trash2 size={16} /></button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* DETAIL VIEW */}
      {view === 'detail' && selectedPersona && (
          <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
              <div className="relative h-72 md:h-96">
                  <img 
                    src={selectedPersona.image} 
                    alt={selectedPersona.name} 
                    className="w-full h-full object-cover" 
                    style={{ objectPosition: '50% 10%' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-black/30"></div>
                  <button onClick={() => setView('hub')} className="absolute top-4 left-4 p-2 bg-black/30 text-white rounded-full hover:bg-black/50 backdrop-blur-md transition-colors"><ArrowLeft size={24}/></button>
              </div>
              
              <div className="px-6 md:px-12 -mt-16 relative z-10">
                  <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-slate-100 dark:border-slate-700">
                      <h1 className="text-4xl font-bold font-serif-text text-slate-900 dark:text-white mb-2">{selectedPersona.name}</h1>
                      <p className="text-indigo-600 dark:text-indigo-400 font-bold mb-8 flex items-center gap-2 uppercase tracking-widest text-xs"><Sparkles size={16}/> {selectedPersona.role}</p>
                      
                      <div className="flex flex-wrap gap-3 mb-10">
                          {selectedPersona.traits.map(trait => (
                              <span key={trait} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black uppercase rounded-xl tracking-tighter">{trait}</span>
                          ))}
                      </div>

                      <div className="max-w-none mb-12">
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                              <History size={16} className="text-indigo-400" /> {t('stories.history')}
                          </h3>
                          <div className="space-y-8">
                              {selectedPersona.biography.map((para, i) => (
                                  <p key={i} className="text-slate-700 dark:text-slate-300 leading-[1.8] text-lg font-serif-text italic first-letter:text-4xl first-letter:font-bold first-letter:mr-1 first-letter:float-left first-letter:text-indigo-600 dark:first-letter:text-indigo-400">
                                      {para}
                                  </p>
                              ))}
                          </div>
                      </div>

                      <div className="flex gap-4">
                          <button onClick={() => createEncounter(selectedPersona)} className="flex-1 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all transform active:scale-95 flex items-center justify-center gap-3">
                              <MessageCircle size={22} /> {t('stories.startRoleplay')}
                          </button>
                      </div>
                  </div>
              </div>
              <div className="h-24"></div>
          </div>
      )}

      {/* CHAT VIEW */}
      {view === 'chat' && currentFigure && (
          <div className="flex flex-col h-full bg-[#fdfbf7] dark:bg-slate-950">
              <header className={`px-4 py-3 border-b flex items-center justify-between shadow-sm z-10 ${theme.bg} ${theme.border} dark:bg-slate-900 dark:border-slate-800`}>
                  <div className="flex items-center gap-3">
                      <button onClick={() => setView('hub')} className="p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"><ArrowLeft size={20}/></button>
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm">
                              <img 
                                src={currentFigure.image} 
                                alt={currentFigure.name} 
                                className="w-full h-full object-cover" 
                                style={{ objectPosition: '50% 10%' }}
                              />
                          </div>
                          <div>
                              <h2 className={`font-bold font-serif-text text-slate-900 dark:text-white`}>{currentFigure.name}</h2>
                              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> {t('stories.encounterLabel')}</p>
                          </div>
                      </div>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><BookOpen size={20}/></button>
              </header>

              <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-[url('https://www.transparenttextures.com/patterns/paper.png')] dark:bg-none">
                  <div className="flex justify-center my-4">
                      <div className="bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest shadow-sm flex items-center gap-2 border border-slate-200 dark:border-slate-700">
                          <AlertTriangle size={12} className="text-amber-500" /> {t('stories.disclaimer')}
                      </div>
                  </div>

                  {activeEncounter?.messages.map((msg, idx) => (
                      <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                          <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm relative group ${
                              msg.role === 'user' 
                              ? 'bg-slate-800 text-white rounded-tr-sm' 
                              : `bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-stone-200 dark:border-slate-700 rounded-tl-sm font-serif-text`
                          }`}>
                              {msg.role === 'model' && (
                                  <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden`}>
                                      <img src={currentFigure.image} className="w-full h-full object-cover" style={{ objectPosition: '50% 10%' }} />
                                  </div>
                              )}
                              
                              <div className="markdown-content">
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                              </div>
                              
                              <div className={`text-[10px] mt-2 opacity-50 font-black uppercase tracking-widest text-right ${msg.role === 'user' ? 'text-slate-300' : 'text-slate-400'}`}>
                                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                          </div>
                      </div>
                  ))}
                  
                  {isLoading && (
                      <div className="flex justify-start">
                          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-sm border border-stone-200 dark:border-slate-700 shadow-sm ml-4">
                              <div className="flex gap-1">
                                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                              </div>
                          </div>
                      </div>
                  )}
                  <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                  <form onSubmit={handleSendMessage} className={`flex items-end gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-3xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 ring-indigo-500/20 transition-all`}>
                      <textarea
                          ref={inputRef}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder={t('stories.inputPlaceholder')}
                          className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-2.5 px-4 text-slate-800 dark:text-white placeholder-slate-400"
                          rows={1}
                          onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage();
                              }
                          }}
                      />
                      <button 
                          type="submit" 
                          disabled={isLoading || !inputValue.trim()}
                          className={`p-3 rounded-full text-white shadow-md transition-all transform active:scale-90 ${isLoading || !inputValue.trim() ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                      >
                          <Send size={20} />
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default RoleplayView;