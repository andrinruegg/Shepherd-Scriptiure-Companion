
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MessageCircle, Send, Scroll, Trash2, Edit2, Check, X, Sparkles, BookOpen, AlertTriangle, Key } from 'lucide-react';
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
    onTriggerKeyWarning?: () => void;
}

const RoleplayView: React.FC<RoleplayViewProps> = ({ language, onMenuClick, hasApiKey, onTriggerKeyWarning }) => {
  const { t, i18n } = useTranslation();
  const [encounters, setEncounters] = useState<Encounter[]>(() => JSON.parse(localStorage.getItem('figure_encounters') || '[]'));
  const [selectedPersona, setSelectedPersona] = useState<BibleStory | null>(null);
  const [activeEncounterId, setActiveChatId] = useState<string | null>(null);
  const [view, setView] = useState<'hub' | 'detail' | 'chat'>('hub');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyError, setShowKeyError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const getLangKey = () => {
    const code = i18n.language.split('-')[0];
    const map: Record<string, string> = {
        'de': 'German', 
        'ro': 'Romanian', 
        'es': 'Spanish',
        'fr': 'French',
        'pt': 'Portuguese',
        'it': 'Italian'
    };
    return map[code] || 'English';
  };

  const figures = STORIES_DATA[getLangKey()] || STORIES_DATA['English'];

  useEffect(() => localStorage.setItem('figure_encounters', JSON.stringify(encounters)), [encounters]);
  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [encounters, isLoading]);

  const triggerKeyError = () => {
    setShowKeyError(true);
    setTimeout(() => setShowKeyError(false), 5000);
  };

  const startEncounter = (persona: BibleStory) => {
    if (!hasApiKey) {
      if (onTriggerKeyWarning) onTriggerKeyWarning();
      else triggerKeyError();
      return;
    }
    const newId = uuidv4();
    const introKey = persona.id === 'peter' ? 'peter' : 'paul';
    const intro = t(`stories.intro.${introKey}`);
    const newEnc: Encounter = { id: newId, personaId: persona.id, title: `${t('stories.encounterLabel')} - ${persona.name}`, messages: [{ id: uuidv4(), role: 'model', text: intro, timestamp: new Date().toISOString() }], timestamp: Date.now() };
    setEncounters([newEnc, ...encounters]); setActiveChatId(newId); setView('chat');
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !activeEncounterId) return;
    if (!hasApiKey) {
      if (onTriggerKeyWarning) onTriggerKeyWarning();
      else triggerKeyError();
      return;
    }

    const currentEnc = encounters.find((e: any) => e.id === activeEncounterId);
    const persona = figures.find((f: any) => f.id === currentEnc?.personaId);
    if (!persona) return;
    const userText = inputValue.trim();
    const aiMsgId = uuidv4();

    setEncounters((prev: any[]) => prev.map((e: any) => e.id === activeEncounterId ? { 
        ...e, 
        messages: [...e.messages, 
            { id: uuidv4(), role: 'user', text: userText, timestamp: new Date().toISOString() }, 
            { id: aiMsgId, role: 'model', text: '', timestamp: new Date().toISOString() }
        ] 
    } : e));
    
    setInputValue(''); 
    setIsLoading(true);

    let acc = "";
    await sendMessageStream(
        currentEnc?.messages || [], 
        userText, 
        undefined, 
        'NIV', 
        language, 
        'Witness', 
        (chunk: string) => { 
            acc += chunk; 
            setEncounters((prev: any[]) => prev.map((e: any) => e.id === activeEncounterId ? { ...e, messages: e.messages.map((m: any) => m.id === aiMsgId ? { ...m, text: acc } : m) } : e)); 
        }, 
        () => setIsLoading(false), 
        (error: any) => setIsLoading(false), 
        `Role: ${persona.name}. Speak IMMERSIVE. BE VERY CONCISE. USE SHORT COLORFUL PHRASES. DO NOT WRITE LONG PARAGRAPHS.`
    );
  };

  const getPersonaTheme = (id: string) => {
    if (id === 'peter') return { gradient: 'from-blue-600 via-indigo-600 to-cyan-500', accent: 'text-blue-600', bubble: 'border-l-blue-500' };
    if (id === 'paul') return { gradient: 'from-amber-600 via-orange-600 to-yellow-500', accent: 'text-amber-600', bubble: 'border-l-amber-500' };
    return { gradient: 'from-indigo-600 to-violet-500', accent: 'text-indigo-600', bubble: 'border-l-indigo-500' };
  };

  return (
    <div className="flex flex-col h-full bg-[#fdfaf5] dark:bg-slate-950 transition-colors relative overflow-hidden">
      {showKeyError && (
         <div className="fixed top-6 inset-x-0 flex justify-center z-[100] px-4 pointer-events-none animate-slide-up">
           <div className="bg-red-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-red-500 pointer-events-auto max-w-sm w-full">
             <Key size={20} className="shrink-0" />
             <div className="flex-1 min-w-0">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/90 mb-0.5">{t('chat.missingKeyTitle')}</h4>
                <p className="text-[11px] font-bold leading-tight">{t('chat.keyWarningSubtitle')}</p>
             </div>
             <button onClick={() => setShowKeyError(false)} className="p-1 hover:bg-white/20 rounded-full"><X size={16}/></button>
           </div>
         </div>
      )}

      {view === 'hub' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10">
              <header className="mb-10 flex items-center gap-4 animate-fade-in">
                  <button onClick={onMenuClick} className="p-3 bg-white dark:bg-slate-900 shadow-lg text-slate-500 rounded-2xl hover:scale-105 active:scale-95 transition-all"><ArrowLeft size={24}/></button>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-serif-text text-slate-800 dark:text-white flex items-center gap-2">
                        <Sparkles size={24} className="text-amber-500" />
                        {t('stories.title')}
                    </h1>
                    <p className="text-slate-500 text-xs sm:text-sm font-medium opacity-80">{t('stories.subtitle')}</p>
                  </div>
              </header>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {figures.map((fig: any, idx: number) => {
                      const theme = getPersonaTheme(fig.id);
                      return (
                        <div key={fig.id} 
                             className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] border border-white dark:border-slate-800 group hover:shadow-2xl transition-all cursor-pointer animate-slide-up" 
                             style={{ animationDelay: `${idx * 0.1}s` }}
                             onClick={() => { setSelectedPersona(fig); setView('detail'); }}>
                            <div className="h-56 overflow-hidden relative">
                                <img src={fig.image} alt={fig.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" style={{ objectPosition: '50% 15%' }} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                <div className="absolute bottom-6 left-6 text-white">
                                    <h3 className="font-bold text-xl sm:text-2xl font-serif-text mb-1">{fig.name}</h3>
                                    <div className={`px-2 py-0.5 rounded bg-gradient-to-r ${theme.gradient} text-[8px] font-black uppercase tracking-[0.2em] w-fit`}>{fig.role}</div>
                                </div>
                            </div>
                        </div>
                      );
                  })}
              </div>
          </div>
      )}

      {view === 'detail' && selectedPersona && (
          <div className="flex-1 flex flex-col items-center p-4 sm:p-6 md:p-10 animate-fade-in overflow-y-auto bg-transparent">
              <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-white dark:border-slate-800 overflow-hidden flex flex-col md:flex-row h-fit md:h-[600px] mt-4 mb-10">
                  <div className="w-full md:w-[45%] relative h-64 md:h-full shrink-0">
                      <img src={selectedPersona.image} alt={selectedPersona.name} className="w-full h-full object-cover" style={{ objectPosition: '50% 15%' }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <button onClick={() => setView('hub')} className="absolute top-6 left-6 p-2 bg-white/20 text-white rounded-full hover:bg-white/30 backdrop-blur-md transition-all active:scale-90 shadow-xl border border-white/20">
                          <ArrowLeft size={24}/>
                      </button>
                  </div>
                  
                  <div className="flex-1 p-8 sm:p-10 flex flex-col h-full overflow-hidden">
                      <div className="mb-8">
                        <h1 className="text-4xl sm:text-5xl font-bold font-serif-text text-slate-900 dark:text-white mb-2 leading-tight tracking-tight">{selectedPersona.name}</h1>
                        <p className={`text-sm font-bold opacity-60 font-serif-text italic ${getPersonaTheme(selectedPersona.id).accent}`}>{selectedPersona.role}</p>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto mb-8 pr-2 no-scrollbar border-l-2 border-slate-50 dark:border-slate-800 pl-6 text-slate-600 dark:text-slate-400 italic">
                        {selectedPersona.biography.map((para: string, i: number) => <p key={i} className="mb-4">{para}</p>)}
                      </div>

                      <button onClick={() => startEncounter(selectedPersona)} 
                              className={`w-full py-5 bg-gradient-to-r ${getPersonaTheme(selectedPersona.id).gradient} text-white rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-4 shadow-xl transition-all transform active:scale-95 hover:brightness-110`}>
                          <MessageCircle size={24}/>
                          <span className="text-sm">{t('stories.startRoleplay')}</span>
                      </button>
                  </div>
              </div>
          </div>
      )}

      {view === 'chat' && activeEncounterId && (
          <div className="flex flex-col h-full animate-fade-in">
              <header className="px-6 py-4 border-b border-black/5 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shrink-0">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setView('hub')} className="p-2 text-slate-500 hover:bg-black/5 rounded-xl transition-all"><ArrowLeft size={20}/></button>
                    <h2 className="font-bold text-slate-900 dark:text-white">{figures.find((f: any) => f.id === encounters.find((e: any) => e.id === activeEncounterId)?.personaId)?.name}</h2>
                  </div>
              </header>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth no-scrollbar">
                  {encounters.find((e: any) => e.id === activeEncounterId)?.messages.map((m: Message) => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-pop-in`}>
                        <div className={`max-w-[85%] p-5 rounded-[2rem] shadow-lg ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-900 dark:text-slate-100 border dark:border-white/5 font-serif-text italic rounded-tl-none border-l-4 border-indigo-400'}`}>
                            <ReactMarkdown>{m.text}</ReactMarkdown>
                            <div className="text-[8px] opacity-40 mt-3 text-right">{new Date(m.timestamp).toLocaleTimeString()}</div>
                        </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} className="h-4" />
              </div>
              <div className="p-4 bg-white/95 dark:bg-slate-900/95 border-t dark:border-slate-800 flex gap-3">
                  <input value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder={t('stories.inputPlaceholder')} className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 outline-none dark:text-white" onKeyDown={e => e.key === 'Enter' && handleSendMessage()}/>
                  <button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()} className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl active:scale-90 transition-transform disabled:opacity-50"><Send size={24}/></button>
              </div>
          </div>
      )}
    </div>
  );
};

export default RoleplayView;
