import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Menu, Scroll, Clock, User, Heart, BookOpen, Baby, Users, Crown, Quote, MessageCircle, Send, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { STORIES_DATA } from '../data/storiesData';
import { translations } from '../utils/translations';
import { BibleStory, Message } from '../types';
import { sendMessageStream } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import ShepherdLogo from './ShepherdLogo';

interface PersonaTabProps {
  language: string;
  onMenuClick: () => void;
}

const PersonaTab: React.FC<PersonaTabProps> = ({ language, onMenuClick }) => {
  const [selectedPersona, setSelectedPersona] = useState<BibleStory | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'list' | 'detail' | 'chat'>('list');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const personas = STORIES_DATA[language] || STORIES_DATA['English'];
  const t = translations[language]?.stories || translations['English'].stories;

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (view === 'chat') {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isLoading, view]);

  const handleStartChat = (persona: BibleStory) => {
    setSelectedPersona(persona);
    setChatMessages([
        {
            id: uuidv4(),
            role: 'model',
            text: `Peace be with you. I am ${persona.name}. How can I encourage your heart today?`,
            timestamp: new Date().toISOString()
        }
    ]);
    setView('chat');
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading || !selectedPersona) return;

    const userText = inputValue.trim();
    const userMsg: Message = { id: uuidv4(), role: 'user', text: userText, timestamp: new Date().toISOString() };
    const aiMsgId = uuidv4();
    const initialAiMsg: Message = { id: aiMsgId, role: 'model', text: '', timestamp: new Date().toISOString() };

    setChatMessages(prev => [...prev, userMsg, initialAiMsg]);
    setInputValue('');
    setIsLoading(true);

    const personaInstruction = `
        You are roleplaying as the biblical figure: ${selectedPersona.name}.
        Your Role/Context: ${selectedPersona.role}.
        Biographical Context: ${selectedPersona.biography.join(' ')}.
        
        INSTRUCTIONS:
        1. Speak in the first person ("I").
        2. Stay true to your biblical character, wisdom, and period.
        3. Use a tone that is consistent with how you are described in the Bible.
        4. Refer to your own experiences (e.g., if you are Peter, refer to the fishing or the denial/restoration).
        5. Always point back to God's grace and truth.
        6. Keep responses relatively concise but deeply meaningful.
        7. RESPONSE LANGUAGE: You must respond exclusively in ${language}.
    `;

    try {
        let accumulatedText = "";
        await sendMessageStream(
            chatMessages,
            userText,
            personaInstruction,
            'NIV',
            language,
            localStorage.getItem('displayName') || 'Friend',
            (chunk) => {
                accumulatedText += chunk;
                setChatMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: accumulatedText } : m));
            },
            () => setIsLoading(false),
            (err) => {
                setChatMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: "I am sorry, my friend. I cannot find the words right now.", isError: true } : m));
                setIsLoading(false);
            }
        );
    } catch (error) {
        setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (view === 'chat' && selectedPersona) {
      return (
          <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 animate-fade-in">
              <header className="glass-header p-4 flex items-center justify-between shadow-sm z-30">
                  <div className="flex items-center gap-3">
                      <button onClick={() => setView('detail')} className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:bg-black/5 rounded-lg transition-colors">
                          <ArrowLeft size={24} />
                      </button>
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-500 shadow-sm">
                          <img src={selectedPersona.image} className="w-full h-full object-cover" />
                      </div>
                      <div>
                          <h2 className="font-bold text-slate-800 dark:text-white leading-tight">{selectedPersona.name}</h2>
                          <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">Roleplay Active</span>
                      </div>
                  </div>
              </header>

              <main className="flex-1 overflow-y-auto p-4 space-y-6">
                  {chatMessages.map((msg) => (
                      <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-pop-in`}>
                          <div className={`flex gap-3 max-w-[85%] items-end`}>
                              {msg.role === 'model' && (
                                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mb-1">
                                      <img src={selectedPersona.image} className="w-full h-full object-cover rounded-full" />
                                  </div>
                              )}
                              <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700'}`}>
                                  {msg.text === '' && isLoading ? (
                                      <div className="flex gap-1 h-4 items-center">
                                          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                                          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                      </div>
                                  ) : (
                                      <div className="prose prose-sm dark:prose-invert">
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                      </div>
                                  )}
                              </div>
                          </div>
                      </div>
                  ))}
                  <div ref={messagesEndRef} className="h-4" />
              </main>

              <footer className="p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">
                  <div className="max-w-2xl mx-auto mb-3 flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-100 dark:border-amber-900/30">
                      <AlertTriangle size={12} className="text-amber-600 shrink-0" />
                      <p className="text-[10px] text-amber-800 dark:text-amber-200 leading-tight">
                          {t.disclaimer}
                      </p>
                  </div>
                  <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto flex items-end gap-2">
                      <textarea
                          ref={inputRef}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={`Speak to ${selectedPersona.name}...`}
                          rows={1}
                          className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none dark:text-white"
                      />
                      <button 
                        type="submit" 
                        disabled={isLoading || !inputValue.trim()}
                        className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md active:scale-95"
                      >
                          <Send size={18} />
                      </button>
                  </form>
              </footer>
          </div>
      );
  }

  if (view === 'detail' && selectedPersona) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 animate-fade-in relative">
        <div className="absolute top-0 left-0 right-0 p-4 z-30 flex justify-between items-center">
            <button 
                onClick={() => setView('list')}
                className="p-2 bg-black/30 backdrop-blur-md hover:bg-black/50 text-white rounded-full transition-all shadow-lg border border-white/10"
            >
                <ArrowLeft size={24} />
            </button>
        </div>

        <div className="relative h-[45vh] w-full shrink-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-black/60 dark:from-slate-900 z-10"></div>
            <img src={selectedPersona.image} className="w-full h-full object-cover animate-scale-in" alt={selectedPersona.name} />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 bg-indigo-600/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg border border-indigo-400/30">
                        {selectedPersona.role}
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white font-serif-text drop-shadow-md leading-none mb-1">
                    {selectedPersona.name}
                </h1>
                {selectedPersona.meaningOfName && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium italic opacity-90">"{selectedPersona.meaningOfName}"</p>
                )}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 -mt-4 rounded-t-3xl relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            <div className="max-w-3xl mx-auto p-6 md:p-8 space-y-8 pb-32">
                <div className="prose dark:prose-invert max-w-none">
                    {selectedPersona.biography.map((para, i) => (
                        <p key={i} className={`text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-serif-text ${i === 0 ? 'first-letter:text-5xl first-letter:font-bold first-letter:text-indigo-600 first-letter:mr-2 first-letter:float-left' : ''}`}>
                            {para}
                        </p>
                    ))}
                </div>

                {selectedPersona.keyVerses && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <BookOpen size={16} className="text-amber-500"/> Key Scripture
                        </h3>
                        <div className="grid gap-4">
                            {selectedPersona.keyVerses.map((verse, idx) => (
                                <div key={idx} className="relative bg-amber-50 dark:bg-amber-900/10 p-5 rounded-xl border border-amber-100 dark:border-amber-900/30">
                                    <Quote size={20} className="absolute top-4 left-4 text-amber-500/20 rotate-180" />
                                    <p className="text-slate-700 dark:text-slate-200 font-serif-text italic text-center px-4 mb-3">"{verse.text}"</p>
                                    <p className="text-center text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wide">— {verse.ref}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="fixed bottom-0 left-0 right-0 p-6 z-40 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent dark:from-slate-900 dark:via-slate-900/90 pointer-events-none">
                 <div className="max-w-3xl mx-auto flex justify-center pointer-events-auto">
                    <button 
                        onClick={() => handleStartChat(selectedPersona)}
                        className="w-full max-w-sm py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/30 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
                    >
                        <MessageCircle size={22} className="group-hover:animate-bounce" />
                        {t.startRoleplay}
                    </button>
                 </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
              <button onClick={onMenuClick} className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 rounded-lg">
                  <Menu size={24} />
              </button>
              <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                  <Users size={20} />
              </div>
              <div>
                  <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-serif-text">{t.title}</h1>
                  <p className="text-xs text-slate-500">{t.subtitle}</p>
              </div>
          </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
              {personas.map((persona) => (
                  <button 
                      key={persona.id}
                      onClick={() => {setSelectedPersona(persona); setView('detail');}}
                      className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden text-left flex flex-col h-80 border border-slate-100 dark:border-slate-700"
                  >
                      <div className="h-56 w-full relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                          <img src={persona.image} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" alt={persona.name} />
                          <div className="absolute bottom-3 left-4 z-20">
                              <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-md uppercase tracking-wider mb-1 inline-block">{persona.role}</span>
                              <h3 className="text-xl font-bold text-white font-serif-text drop-shadow-sm">{persona.name}</h3>
                          </div>
                      </div>
                      <div className="flex-1 p-4 bg-white dark:bg-slate-800 relative z-20 flex flex-col justify-between">
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{persona.biography[0]}</p>
                          <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mt-2 group-hover:translate-x-1 transition-transform">
                             Speak with {persona.name.split(' ')[0]} <Sparkles size={14} className="ml-2" />
                          </div>
                      </div>
                  </button>
              ))}
          </div>
      </main>
    </div>
  );
};

export default PersonaTab;