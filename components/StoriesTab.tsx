
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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const getLangKey = () => {
        const code = i18n.language.split('-')[0];
        if (code === 'de') return 'German';
        if (code === 'ro') return 'Romanian';
        return 'English';
    };

    const figures = STORIES_DATA[getLangKey()] || STORIES_DATA['English'];

    useEffect(() => localStorage.setItem('figure_encounters', JSON.stringify(encounters)), [encounters]);
    const startEncounter = (persona: BibleStory) => {
        if (!hasApiKey) {
            if (onTriggerKeyWarning) onTriggerKeyWarning();
            return;
        }
        const newId = uuidv4();
        const introKey = persona.id;
        const intro = t(`stories.intro.${introKey}`);
        const newEnc: Encounter = { id: newId, personaId: persona.id, title: `${t('stories.encounterLabel')} - ${persona.name}`, messages: [{ id: uuidv4(), role: 'model', text: intro, timestamp: new Date().toISOString() }], timestamp: Date.now() };
        setEncounters([newEnc, ...encounters]); setActiveChatId(newId); setView('chat');
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading || !activeEncounterId) return;
        if (!hasApiKey) {
            if (onTriggerKeyWarning) onTriggerKeyWarning();
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
        if (id === 'mary') return { gradient: 'from-rose-500 via-pink-500 to-purple-500', accent: 'text-rose-500', bubble: 'border-l-rose-500' };
        if (id === 'matthew') return { gradient: 'from-emerald-600 via-green-600 to-teal-500', accent: 'text-emerald-600', bubble: 'border-l-emerald-500' };
        return { gradient: 'from-indigo-600 to-violet-500', accent: 'text-indigo-600', bubble: 'border-l-indigo-500' };
    };

    return (
        <div className="flex flex-col h-full bg-[#fdfaf5] dark:bg-slate-950 transition-colors relative overflow-hidden">
            {view === 'hub' && (
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10">
                    <header className="mb-10 flex items-center gap-4 animate-fade-in">
                        <button onClick={onMenuClick} className="p-3 bg-white dark:bg-slate-900 shadow-lg text-slate-500 rounded-2xl hover:scale-105 active:scale-95 transition-all"><ArrowLeft size={24} /></button>
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
                                    className="glass-panel rounded-[2.5rem] overflow-hidden group hover:-translate-y-2 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] transition-all duration-500 cursor-pointer animate-slide-up"
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
                                    <div className="p-6 flex flex-wrap gap-2">
                                        {fig.traits.slice(0, 3).map((tr: string) => (
                                            <span key={tr} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-[9px] font-black uppercase tracking-wider rounded-xl dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                                                {tr}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {view === 'detail' && selectedPersona && (
                <div className="flex-1 flex flex-col items-center p-4 sm:p-6 md:p-10 animate-fade-in overflow-y-auto bg-transparent relative z-10">
                    <div className="w-full glass-panel rounded-[3rem] overflow-hidden flex flex-col md:flex-row h-fit md:h-[600px] mt-4 mb-10 shadow-2xl">
                        <div className="w-full md:w-[45%] relative h-64 md:h-full shrink-0">
                            <img src={selectedPersona.image} alt={selectedPersona.name} className="w-full h-full object-cover" style={{ objectPosition: '50% 15%' }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <button onClick={() => setView('hub')} className="absolute top-6 left-6 p-2 bg-white/20 text-white rounded-full hover:bg-white/30 backdrop-blur-md transition-all active:scale-90 shadow-xl border border-white/20">
                                <ArrowLeft size={24} />
                            </button>
                            <div className="absolute bottom-8 left-8 right-8 text-white hidden md:block">
                                <div className={`px-3 py-1 mb-3 rounded-full bg-gradient-to-r ${getPersonaTheme(selectedPersona.id).gradient} text-[10px] font-black uppercase tracking-[0.3em] w-fit shadow-xl`}>{t('stories.biographyLabel')}</div>
                                <p className="text-xs opacity-70 leading-relaxed italic">{selectedPersona.biography[0]}</p>
                            </div>
                        </div>

                        <div className="flex-1 p-8 sm:p-10 flex flex-col h-full overflow-hidden">
                            <div className="mb-8">
                                <h1 className="text-4xl sm:text-5xl font-bold font-serif-text text-slate-900 dark:text-white mb-2 leading-tight tracking-tight">{selectedPersona.name}</h1>
                                <p className={`text-sm font-bold opacity-60 font-serif-text italic ${getPersonaTheme(selectedPersona.id).accent}`}>{selectedPersona.role}</p>
                            </div>

                            <div className="flex-1 overflow-y-auto mb-8 pr-2 no-scrollbar border-l-2 border-slate-50 dark:border-slate-800 pl-6">
                                <div className="space-y-6">
                                    {selectedPersona.biography.slice(0, 2).map((para: string, i: number) => (
                                        <p key={i} className="text-slate-600 dark:text-slate-400 leading-relaxed italic text-base sm:text-lg font-serif-text opacity-90">
                                            {para}
                                        </p>
                                    ))}
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('stories.tip')}</p>
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => startEncounter(selectedPersona)}
                                className={`w-full py-5 bg-gradient-to-r ${getPersonaTheme(selectedPersona.id).gradient} text-white rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-4 shadow-xl transition-all transform active:scale-95 hover:brightness-110`}>
                                <MessageCircle size={24} />
                                <span className="text-sm">{t('stories.startRoleplay')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {view === 'chat' && activeEncounterId && (
                <div className="flex flex-col h-full bg-[#fdfbf7] dark:bg-slate-950 animate-fade-in">
                    <header className="px-6 py-4 border-b border-black/5 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shrink-0">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setView('hub')} className="p-2 text-slate-500 hover:bg-black/5 rounded-xl transition-all"><ArrowLeft size={20} /></button>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md`}>
                                    <img src={figures.find((f: any) => f.id === encounters.find((e: any) => e.id === activeEncounterId)?.personaId)?.image}
                                        className="w-full h-full object-cover"
                                        style={{ objectPosition: '50% 15%' }} />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-900 dark:text-white leading-tight text-base">
                                        {figures.find((f: any) => f.id === encounters.find((e: any) => e.id === activeEncounterId)?.personaId)?.name}
                                    </h2>
                                    <p className="text-[9px] font-black uppercase text-emerald-500 tracking-widest animate-pulse">{t('social.status.online')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-full">
                            <Sparkles size={18} />
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth no-scrollbar">
                        {encounters.find((e: any) => e.id === activeEncounterId)?.messages.map((m: Message) => {
                            const personaId = encounters.find((e: any) => e.id === activeEncounterId)?.personaId || 'peter';
                            const theme = getPersonaTheme(personaId);
                            const isMe = m.role === 'user';

                            return (
                                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-pop-in`}>
                                    <div className={`
                                max-w-[85%] sm:max-w-[75%] p-5 sm:p-6 rounded-[2.25rem] shadow-xl leading-relaxed relative
                                ${isMe
                                            ? 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-tr-none shadow-indigo-500/20'
                                            : `bg-white dark:bg-slate-900 dark:text-slate-100 border dark:border-white/5 font-serif-text italic rounded-tl-none border-l-4 ${theme.bubble}`}
                            `}>
                                        {(!m.text || m.text.trim() === '') && m.role === 'model' ? (
                                            <div className="flex space-x-2 h-6 items-center px-2">
                                                <div className={`w-2.5 h-2.5 rounded-full animate-bounce [animation-delay:-0.3s] ${personaId === 'peter' ? 'bg-blue-400' : 'bg-indigo-400'}`} />
                                                <div className={`w-2.5 h-2.5 rounded-full animate-bounce [animation-delay:-0.15s] ${personaId === 'peter' ? 'bg-blue-400' : 'bg-indigo-400'}`} />
                                                <div className={`w-2.5 h-2.5 rounded-full animate-bounce ${personaId === 'peter' ? 'bg-blue-400' : 'bg-indigo-400'}`} />
                                            </div>
                                        ) : (
                                            <div className="markdown-content prose dark:prose-invert prose-sm max-w-none">
                                                <ReactMarkdown>{m.text}</ReactMarkdown>
                                            </div>
                                        )}
                                        <div className={`text-[8px] font-black uppercase tracking-widest mt-4 opacity-40 text-right ${isMe ? 'text-white' : 'text-slate-400'}`}>
                                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} className="h-4" />
                    </div>

                    <div className="p-4 sm:p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t dark:border-slate-800 flex gap-3 shrink-0">
                        <input value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={t('stories.inputPlaceholder')}
                            className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 outline-none dark:text-white font-bold text-sm shadow-inner focus:ring-2 focus:ring-indigo-500/20"
                            onKeyDown={(e: any) => e.key === 'Enter' && handleSendMessage()} />
                        <button onClick={handleSendMessage}
                            disabled={isLoading || !inputValue.trim()}
                            className="p-4 sm:p-5 bg-indigo-600 text-white rounded-2xl shadow-xl active:scale-90 transition-transform disabled:opacity-50">
                            <Send size={24} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleplayView;
