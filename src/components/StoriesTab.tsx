
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MessageCircle, Send, Scroll, Trash2, Edit2, Check, X, Sparkles, BookOpen, AlertTriangle } from 'lucide-react';
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

const RoleplayView: React.FC<{ language: string, onMenuClick: () => void, hasApiKey: boolean }> = ({ language, onMenuClick, hasApiKey }) => {
  const { t, i18n } = useTranslation();
  const [encounters, setEncounters] = useState<Encounter[]>(() => JSON.parse(localStorage.getItem('figure_encounters') || '[]'));
  const [selectedPersona, setSelectedPersona] = useState<BibleStory | null>(null);
  const [activeEncounterId, setActiveChatId] = useState<string | null>(null);
  const [view, setView] = useState<'hub' | 'detail' | 'chat'>('hub');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const getLangKey = () => {
    const code = i18n.language.split('-')[0];
    if (code === 'de') return 'German';
    if (code === 'ro') return 'Romanian';
    return 'English';
  };

  const figures = STORIES_DATA[getLangKey()] || STORIES_DATA['English'];

  useEffect(() => localStorage.setItem('figure_encounters', JSON.stringify(encounters)), [encounters]);
  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [encounters, isLoading]);

  const startEncounter = (persona: BibleStory) => {
    if (!hasApiKey) return alert(t('stories.needKey'));
    const newId = uuidv4();
    const introKey = persona.id === 'peter' ? 'peter' : 'paul';
    const intro = t(`stories.intro.${introKey}`);
    const newEnc: Encounter = { id: newId, personaId: persona.id, title: `${t('stories.encounterLabel')} - ${persona.name}`, messages: [{ id: uuidv4(), role: 'model', text: intro, timestamp: new Date().toISOString() }], timestamp: Date.now() };
    setEncounters([newEnc, ...encounters]); setActiveChatId(newId); setView('chat');
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !activeEncounterId) return;
    const currentEnc = encounters.find((e) => e.id === activeEncounterId);
    const persona = figures.find((f) => f.id === currentEnc?.personaId);
    if (!persona) return;
    const userText = inputValue.trim();
    const aiMsgId = uuidv4();
    setEncounters((prev) => prev.map((e) => e.id === activeEncounterId ? { ...e, messages: [...e.messages, { id: uuidv4(), role: 'user', text: userText, timestamp: new Date().toISOString() }, { id: aiMsgId, role: 'model', text: '', timestamp: new Date().toISOString() }] } : e));
    setInputValue(''); setIsLoading(true);
    let acc = "";
    await sendMessageStream(currentEnc?.messages || [], userText, undefined, 'NIV', language, 'Witness', (chunk: string) => { acc += chunk; setEncounters((prev) => prev.map((e) => e.id === activeEncounterId ? { ...e, messages: e.messages.map((m) => m.id === aiMsgId ? { ...m, text: acc } : m) } : e)); }, () => setIsLoading(false), (error: any) => setIsLoading(false), `Role: ${persona.name}. Persona Info: ${persona.traits.join(',')}. Language: ${language}. Time: 1st Century.`);
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f7f2] dark:bg-slate-950 transition-colors">
      {view === 'hub' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <header className="mb-8 flex items-center gap-3">
                  <button onClick={onMenuClick} className="p-2 -ml-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full"><ArrowLeft size={24}/></button>
                  <div><h1 className="text-2xl font-bold font-serif-text text-slate-800 dark:text-slate-100">{t('stories.title')}</h1><p className="text-slate-600 dark:text-slate-400 text-sm">{t('stories.subtitle')}</p></div>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {figures.map((fig) => (
                      <div key={fig.id} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border dark:border-slate-800 group hover:shadow-xl transition-all cursor-pointer" onClick={() => { setSelectedPersona(fig); setView('detail'); }}>
                          <div className="h-48 overflow-hidden relative">
                              <img src={fig.image} alt={fig.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" style={{ objectPosition: '50% 10%' }} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" /><div className="absolute bottom-4 left-4 text-white"><h3 className="font-bold text-lg font-serif-text">{fig.name}</h3><p className="text-xs opacity-90">{fig.role}</p></div>
                          </div>
                          <div className="p-5 flex flex-wrap gap-2">{fig.traits.slice(0,3).map((tr: string) => <span key={tr} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase rounded-md dark:text-slate-400">{tr}</span>)}</div>
                      </div>
                  ))}
              </div>
          </div>
      )}
      {view === 'detail' && selectedPersona && (
          <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
              <div className="relative h-72 md:h-96">
                  <img src={selectedPersona.image} alt={selectedPersona.name} className="w-full h-full object-cover" style={{ objectPosition: '50% 10%' }} />
                  <button onClick={() => setView('hub')} className="absolute top-4 left-4 p-2 bg-black/30 text-white rounded-full hover:bg-black/50 backdrop-blur-md"><ArrowLeft size={24}/></button>
              </div>
              <div className="px-6 md:px-12 -mt-16 relative z-10">
                  <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-2xl border dark:border-slate-700">
                      <h1 className="text-4xl font-bold font-serif-text mb-2 text-slate-900 dark:text-white">{selectedPersona.name}</h1>
                      <div className="space-y-8 my-8">{selectedPersona.biography.map((para: string, i: number) => <p key={i} className="text-slate-700 dark:text-slate-300 leading-relaxed italic text-lg font-serif-text">{para}</p>)}</div>
                      <button onClick={() => startEncounter(selectedPersona)} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl"><MessageCircle size={22}/>{t('stories.startRoleplay')}</button>
                  </div>
              </div>
          </div>
      )}
      {view === 'chat' && activeEncounterId && (
          <div className="flex flex-col h-full bg-[#fdfbf7] dark:bg-slate-950">
              <header className="px-4 py-3 border-b dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-3"><button onClick={() => setView('hub')} className="p-2 text-slate-600 dark:text-slate-400"><ArrowLeft size={20}/></button><h2 className="font-bold text-slate-900 dark:text-white">{figures.find((f) => f.id === encounters.find((e) => e.id === activeEncounterId)?.personaId)?.name}</h2></div>
              </header>
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {encounters.find((e) => e.id === activeEncounterId)?.messages.map((m: Message) => (
                      <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-5 rounded-2xl ${m.role === 'user' ? 'bg-slate-800 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 dark:text-white border shadow-sm font-serif-text italic rounded-tl-none'}`}><ReactMarkdown>{m.text}</ReactMarkdown></div>
                      </div>
                  ))}
                  <div ref={messagesEndRef} />
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border-t dark:border-slate-800 flex gap-2">
                  <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={t('stories.inputPlaceholder')} className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full px-5 outline-none dark:text-white" onKeyDown={(e: any) => e.key === 'Enter' && handleSendMessage()}/>
                  <button onClick={handleSendMessage} disabled={isLoading} className="p-3 bg-indigo-600 text-white rounded-full shadow-lg"><Send size={20}/></button>
              </div>
          </div>
      )}
    </div>
  );
};

export default RoleplayView;
