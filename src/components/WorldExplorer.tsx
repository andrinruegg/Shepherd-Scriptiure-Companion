
import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Compass, X, Send, User, Ship, Landmark } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ShepherdLogo from './ShepherdLogo';
import { sendMessageStream } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../types';
import ReactMarkdown from 'react-markdown';

const WorldExplorer: React.FC<{ language: string, onMenuClick: () => void }> = ({ language, onMenuClick }) => {
    const { t } = useTranslation();
    const [playerPos, setPlayerPos] = useState({ x: 600, y: 600 });
    const [activeNPC, setActiveNPC] = useState<any>(null);
    const [isTalking, setIsTalking] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentRegion, setCurrentRegion] = useState('');
    
    const NPCs = [
      { id: 'peter', name: 'Simon Peter', x: 200, y: 220, color: 'bg-blue-600', icon: <Ship size={14} className="text-white" />, persona: 'SIMON PETER. Fisherman, eyewitness.' },
      { id: 'scholar', name: 'Elder Gamaliel', x: 950, y: 950, color: 'bg-amber-700', icon: <Landmark size={14} className="text-white" />, persona: 'WISE SCHOLAR. Knowledgeable of the law.' }
    ];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isTalking) return;
            const step = 25;
            setPlayerPos(prev => {
                let nx = prev.x, ny = prev.y;
                if (e.key === 'ArrowUp' || e.key === 'w') ny = Math.max(50, prev.y - step);
                if (e.key === 'ArrowDown' || e.key === 's') ny = Math.min(1200 - 50, prev.y + step);
                if (e.key === 'ArrowLeft' || e.key === 'a') nx = Math.max(50, prev.x - step);
                if (e.key === 'ArrowRight' || e.key === 'd') nx = Math.min(1200 - 50, prev.x + step);
                return { x: nx, y: ny };
            });
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isTalking]);

    useEffect(() => {
        const near = NPCs.find((n: any) => Math.sqrt(Math.pow(n.x - playerPos.x, 2) + Math.pow(n.y - playerPos.y, 2)) < 60);
        setActiveNPC(near || null);
        if (playerPos.x < 500 && playerPos.y < 450) setCurrentRegion(t('explorer.galilee'));
        else if (playerPos.x > 800 && playerPos.y > 800) setCurrentRegion(t('explorer.jerusalem'));
        else setCurrentRegion(t('explorer.highway'));
    }, [playerPos, t]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading || !activeNPC) return;
        const userText = inputValue; const aiMsgId = uuidv4();
        setMessages(prev => [...prev, {id:uuidv4(), role:'user', text:userText, timestamp:new Date().toISOString()}, {id:aiMsgId, role:'model', text:'', timestamp:new Date().toISOString()}]);
        setInputValue(''); setIsLoading(true);
        let acc = "";
        await sendMessageStream(messages, userText, undefined, 'NIV', language, 'Traveler', (chunk: string) => { acc += chunk; setMessages(prev => prev.map((m: any) => m.id === aiMsgId ? {...m, text: acc} : m)); }, () => setIsLoading(false), (error: any) => setIsLoading(false), `Role: ${activeNPC.persona}. Lang: ${language}`);
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] overflow-hidden text-white font-serif-text">
            <header className="p-5 bg-slate-900 border-b border-white/5 flex items-center justify-between z-10 shadow-2xl">
                <div className="flex items-center gap-3"><button onClick={onMenuClick} className="p-2 -ml-2 text-slate-400 hover:text-white"><ArrowLeft size={24} /></button><h1 className="text-lg font-bold tracking-tight">{t('explorer.title')}</h1></div>
                <div className="bg-black/60 px-4 py-1 rounded-full border border-white/10"><span className="text-[10px] uppercase font-black tracking-[0.3em] text-amber-400">{currentRegion}</span></div>
            </header>
            <div className="flex-1 relative flex items-center justify-center p-4">
                <div className="relative w-full max-w-[500px] aspect-square bg-[#e2d1a4] rounded-[3rem] border-[12px] border-slate-800 overflow-hidden shadow-2xl">
                    <div className="absolute transition-transform duration-300 ease-out" style={{ width: 1200, height: 1200, transform: `translate(-${Math.max(0, Math.min(700, playerPos.x - 250))}px, -${Math.max(0, Math.min(700, playerPos.y - 250))}px)`, backgroundImage: 'radial-gradient(#d4c396 2px, transparent 2px)', backgroundSize: '40px 40px' }}>
                        <div className="absolute top-0 left-0 w-[500px] h-[450px] bg-blue-600/20 rounded-br-[150px] border-r-4 border-b-4 border-blue-400/10"/>
                        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-[#f9f1d7] rounded-tl-[150px] border-t-4 border-l-4 border-amber-900/5"/>
                        {NPCs.map(npc => (
                            <div key={npc.id} className="absolute" style={{ left: npc.x, top: npc.y }}><div className={`w-14 h-14 rounded-[1.25rem] ${npc.color} flex items-center justify-center shadow-xl border-2 border-white/20`}>{npc.icon}</div></div>
                        ))}
                        <div className="absolute z-40 transition-all duration-300" style={{ left: playerPos.x - 24, top: playerPos.y - 24 }}><div className="w-12 h-12 bg-white rounded-2xl shadow-2xl border-[4px] border-indigo-600 flex items-center justify-center"><ShepherdLogo size={24} className="text-indigo-600" /></div></div>
                    </div>
                    {activeNPC && !isTalking && (
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 animate-pop-in"><button onClick={() => { setIsTalking(true); setMessages([{id:uuidv4(), role:'model', text:`Peace be with you. I am ${activeNPC.name}. What brings you here?`, timestamp:new Date().toISOString()}]); }} className="bg-indigo-600 text-white px-10 py-4 rounded-3xl text-xs font-black shadow-2xl uppercase tracking-widest transition-transform active:scale-95">{t('explorer.talk', { name: activeNPC.name })}</button></div>
                    )}
                </div>
                {isTalking && (
                    <div className="absolute inset-x-4 bottom-10 top-10 md:w-[500px] bg-slate-900 rounded-[3rem] shadow-2xl border-4 border-white/10 flex flex-col z-[60] animate-pop-in overflow-hidden">
                        <div className="p-6 flex items-center justify-between border-b border-white/5 bg-white/5"><h2 className="font-black text-white text-lg">{activeNPC?.name}</h2><button onClick={() => setIsTalking(false)} className="p-2 text-slate-500 hover:text-white"><X size={28}/></button></div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">{messages.map((m: any) => (<div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] px-5 py-4 rounded-[2rem] text-sm leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/20' : 'bg-slate-800 text-slate-100 border border-white/5 rounded-tl-none italic'}`}><ReactMarkdown>{m.text}</ReactMarkdown></div></div>))}</div>
                        <form onSubmit={(e)=>{e.preventDefault(); handleSendMessage();}} className="p-4 bg-slate-800 flex gap-3 border-t border-white/5 backdrop-blur-xl"><input autoFocus value={inputValue} onChange={e=>setInputValue(e.target.value)} placeholder={t('explorer.placeholder')} className="flex-1 bg-slate-950 border-none rounded-2xl px-5 text-sm py-4 outline-none focus:ring-2 focus:ring-indigo-500"/><button type="submit" disabled={isLoading || !inputValue.trim()} className="bg-indigo-600 p-4 rounded-2xl shadow-lg active:scale-90 transition-transform"><Send size={20}/></button></form>
                    </div>
                )}
            </div>
            {!isTalking && <div className="mb-10 text-center animate-pulse"><p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">{t('explorer.instructions')}</p></div>}
        </div>
    );
};

export default WorldExplorer;
