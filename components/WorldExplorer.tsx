
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, MessageCircle, Compass, X, Send, User, Ship, Landmark, Trees as TreeIcon, Tent, Store, Signpost, Waves, Sparkle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ShepherdLogo from './ShepherdLogo';
import { sendMessageStream } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../types';
import ReactMarkdown from 'react-markdown';

interface NPC {
    id: string;
    name: string;
    x: number;
    y: number;
    color: string;
    icon: React.ReactNode;
    persona: string;
    descriptionKey: string; 
}

interface Decor {
    id: number;
    x: number;
    y: number;
    type: 'tree' | 'rock' | 'bush' | 'crate' | 'tent' | 'flower' | 'wheat' | 'glint' | 'ripple' | 'barrel' | 'speck';
    scale: number;
    opacity: number;
}

const WORLD_SIZE = 1200;
const VIEWPORT_SIZE = 500;

const WorldExplorer: React.FC<{ language: string, onMenuClick: () => void }> = ({ language, onMenuClick }) => {
    const { t } = useTranslation();
    const [playerPos, setPlayerPos] = useState({ x: 600, y: 600 });
    const [activeNPC, setActiveNPC] = useState<NPC | null>(null);
    const [isTalking, setIsTalking] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentRegion, setCurrentRegion] = useState('');
    
    const viewportRef = useRef<HTMLDivElement>(null);
    const talkBoxRef = useRef<HTMLDivElement>(null);
    
    const NPCs: NPC[] = [
      { 
          id: 'peter', 
          name: 'Simon Peter', 
          x: 200, 
          y: 220, 
          color: 'bg-blue-600', 
          icon: <Ship size={14} className="text-white" />,
          persona: 'SIMON PETER. Fisherman, humble, eyewitness. Speak of the sea and the Master.',
          descriptionKey: 'Galilee Fisherman'
      },
      { 
          id: 'scholar', 
          name: 'Elder Gamaliel', 
          x: 950, 
          y: 950, 
          color: 'bg-amber-700', 
          icon: <Landmark size={14} className="text-white" />,
          persona: 'WISE SCHOLAR in Jerusalem. Measured, knowledgeable of the law.',
          descriptionKey: 'Jerusalem Scholar'
      },
      { 
          id: 'traveler', 
          name: 'Miriam', 
          x: 550, 
          y: 400, 
          color: 'bg-emerald-600', 
          icon: <User size={14} className="text-white" />,
          persona: 'A TRAVELER seeking hope. Friendly, weary.',
          descriptionKey: 'Weary Traveler'
      }
    ];

    const worldDecor = useMemo(() => {
        const items: Decor[] = [];
        for (let i = 0; i < 450; i++) {
            const x = Math.random() * (WORLD_SIZE - 40) + 20;
            const y = Math.random() * (WORLD_SIZE - 40) + 20;
            
            let type: Decor['type'] = 'speck';
            
            const isInWater = x < 500 && y < 450;
            const isInJerusalem = x > 800 && y > 800;
            const isInWilderness = x < 400 && y > 800;
            const isNearRoad = (x > 500 && x < 650) || (y > 400 && y < 550);

            if (isInWater) {
                const rand = Math.random();
                if (rand > 0.85) type = 'glint';
                else if (rand > 0.7) type = 'ripple';
                else continue;
            } else if (isInJerusalem) {
                const rand = Math.random();
                if (rand > 0.96) type = 'crate';
                else if (rand > 0.93) type = 'barrel';
                else if (rand > 0.5) type = 'speck';
                else type = 'rock'; 
            } else if (isInWilderness) {
                const rand = Math.random();
                if (rand > 0.98) type = 'tent';
                else if (rand > 0.6) type = 'speck';
                else if (rand > 0.3) type = 'rock';
                else type = 'bush'; 
            } else {
                const rand = Math.random();
                if (isNearRoad && rand > 0.3) {
                    type = 'speck';
                } else {
                    if (rand > 0.96) type = 'tree';
                    else if (rand > 0.85) type = 'flower';
                    else if (rand > 0.7) type = 'wheat';
                    else if (rand > 0.4) type = 'speck';
                    else type = 'bush';
                }
            }
            
            items.push({ 
                id: i, x, y, type, 
                scale: type === 'speck' ? 0.3 + Math.random() * 0.4 : 0.6 + Math.random() * 0.7,
                opacity: type === 'speck' ? 0.1 + Math.random() * 0.2 : 0.4 + Math.random() * 0.4
            });
        }
        return items;
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isTalking) return;
            const step = 25;
            setPlayerPos(prev => {
                let nextX = prev.x;
                let nextY = prev.y;
                if (e.key === 'ArrowUp' || e.key === 'w') nextY = Math.max(50, prev.y - step);
                if (e.key === 'ArrowDown' || e.key === 's') nextY = Math.min(WORLD_SIZE - 50, prev.y + step);
                if (e.key === 'ArrowLeft' || e.key === 'a') nextX = Math.max(50, prev.x - step);
                if (e.key === 'ArrowRight' || e.key === 'd') nextX = Math.min(WORLD_SIZE - 50, prev.x + step);
                return { x: nextX, y: nextY };
            });
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isTalking]);

    useEffect(() => {
        const near = NPCs.find(npc => {
            const dist = Math.sqrt(Math.pow(npc.x - playerPos.x, 2) + Math.pow(npc.y - playerPos.y, 2));
            return dist < 60;
        });
        setActiveNPC(near || null);

        if (playerPos.x < 500 && playerPos.y < 450) setCurrentRegion(t('explorer.galilee'));
        else if (playerPos.x > 800 && playerPos.y > 800) setCurrentRegion(t('explorer.jerusalem'));
        else if (playerPos.x < 400 && playerPos.y > 800) setCurrentRegion(t('explorer.wilderness'));
        else setCurrentRegion(t('explorer.highway'));
    }, [playerPos, t]);

    const startTalk = () => {
        if (!activeNPC) return;
        setMessages([{
            id: uuidv4(),
            role: 'model',
            text: `Peace be with you. I am ${activeNPC.name}. What brings you to ${currentRegion}?`,
            timestamp: new Date().toISOString()
        }]);
        setIsTalking(true);
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isLoading || !activeNPC) return;
        const userText = inputValue;
        const userMsg: Message = { id: uuidv4(), role: 'user', text: userText, timestamp: new Date().toISOString() };
        const aiMsgId = uuidv4();
        setMessages(prev => [...prev, userMsg, { id: aiMsgId, role: 'model', text: '', timestamp: new Date().toISOString() }]);
        setInputValue('');
        setIsLoading(true);

        const systemPrompt = `ROLEPLAY: You are ${activeNPC.persona}. TONE: 1st Century eyewitness. LANGUAGE: ${language}. Current Location: ${currentRegion}.`;
        try {
            let accumulated = "";
            await sendMessageStream(messages, userText, undefined, 'NIV', language, 'Traveler', (chunk) => {
                accumulated += chunk;
                setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: accumulated } : m));
            }, () => setIsLoading(false), () => setIsLoading(false), systemPrompt);
        } catch (e) { setIsLoading(false); }
    };

    const camX = Math.max(0, Math.min(WORLD_SIZE - VIEWPORT_SIZE, playerPos.x - VIEWPORT_SIZE / 2));
    const camY = Math.max(0, Math.min(WORLD_SIZE - VIEWPORT_SIZE, playerPos.y - VIEWPORT_SIZE / 2));

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] overflow-hidden text-white font-serif-text select-none">
            <header className="p-4 bg-slate-900 border-b border-white/10 flex items-center justify-between z-10 shadow-2xl relative">
                <div className="flex items-center gap-3">
                    <button onClick={onMenuClick} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors"><ArrowLeft size={24} /></button>
                    <Compass className="text-emerald-400 animate-spin-slow" size={20} />
                    <h1 className="text-lg font-bold tracking-tight">{t('explorer.title')}</h1>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-4 animate-fade-in text-center">
                    <div className="px-4 py-1 bg-black/60 rounded-full border border-white/10 backdrop-blur-md">
                        <span className="text-[10px] uppercase font-black tracking-[0.3em] text-amber-400">{currentRegion}</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 relative flex items-center justify-center p-4">
                <div 
                    ref={viewportRef}
                    className="relative w-full max-w-[500px] aspect-square bg-[#e2d1a4] rounded-[2.5rem] border-[12px] border-slate-800 shadow-[0_0_80px_rgba(0,0,0,0.7)] overflow-hidden"
                >
                    <div 
                        className="absolute"
                        style={{ 
                            width: WORLD_SIZE, 
                            height: WORLD_SIZE, 
                            transform: `translate(-${camX}px, -${camY}px)`,
                            backgroundImage: `
                              radial-gradient(#d4c396 2px, transparent 2px),
                              linear-gradient(to right, #d4c396 1px, transparent 1px),
                              linear-gradient(to bottom, #d4c396 1px, transparent 1px)
                            `,
                            backgroundSize: '30px 30px, 120px 120px, 120px 120px'
                        }}
                    >
                        {/* SEA OF GALILEE */}
                        <div className="absolute top-0 left-0 w-[500px] h-[450px] bg-blue-600/40 rounded-br-[120px] border-r-8 border-b-8 border-blue-400/20 overflow-hidden">
                           <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/water.png')] animate-waves"></div>
                        </div>

                        {/* JERUSALEM */}
                        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-[#f9f1d7] border-t-8 border-l-8 border-amber-900/10 rounded-tl-[150px]">
                            <div className="absolute top-20 left-20 grid grid-cols-6 gap-3 opacity-30">
                                {[...Array(30)].map((_, i) => (
                                    <div key={i} className="w-6 h-6 bg-amber-100 border border-amber-800/20 rounded-sm shadow-inner flex items-center justify-center">
                                        <Store size={10} className="text-amber-700" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* WILDERNESS */}
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#eed9a7] border-t-4 border-r-4 border-amber-700/5 rounded-tr-full">
                             <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/5 to-transparent"></div>
                        </div>

                        {/* WORLD CLUTTER */}
                        {worldDecor.filter(item => {
                            const buffer = 80;
                            return item.x > camX - buffer && item.x < camX + VIEWPORT_SIZE + buffer &&
                                   item.y > camY - buffer && item.y < camY + VIEWPORT_SIZE + buffer;
                        }).map(item => (
                            <div 
                                key={item.id} 
                                className="absolute pointer-events-none" 
                                style={{ 
                                    left: item.x, 
                                    top: item.y, 
                                    transform: `scale(${item.scale})`,
                                    opacity: item.opacity 
                                }}
                            >
                                {item.type === 'tree' && <TreeIcon className="text-emerald-700/60" size={24} />}
                                {item.type === 'rock' && <div className="w-4 h-4 bg-slate-400/60 rounded-full shadow-inner"></div>}
                                {item.type === 'bush' && <div className="w-3 h-2 bg-emerald-800/30 rounded-full"></div>}
                                {item.type === 'crate' && <div className="w-5 h-5 bg-amber-900/20 border border-amber-900/30 rounded-sm"></div>}
                                {item.type === 'barrel' && <div className="w-4 h-5 bg-amber-800/40 rounded-sm border-x-2 border-amber-950/20"></div>}
                                {item.type === 'tent' && <Tent className="text-amber-800/20" size={32} />}
                                {item.type === 'flower' && <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></div>}
                                {item.type === 'wheat' && <div className="w-1 h-3 bg-amber-400/40 rounded-full origin-bottom rotate-12"></div>}
                                {item.type === 'glint' && <Sparkle className="text-white animate-pulse" size={10} />}
                                {item.type === 'ripple' && <div className="w-4 h-1 bg-blue-100/20 rounded-full animate-ping"></div>}
                                {item.type === 'speck' && <div className="w-0.5 h-0.5 bg-current rounded-full opacity-40"></div>}
                            </div>
                        ))}

                        {/* NPCs */}
                        {NPCs.map(npc => (
                            <div key={npc.id} className="absolute group cursor-pointer" style={{ left: npc.x, top: npc.y }}>
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-white/10 shadow-2xl z-50 whitespace-nowrap">
                                    <div className="text-[10px] font-black uppercase text-amber-400">{npc.name}</div>
                                    <div className="text-[8px] text-slate-400 italic">{t('explorer.eyewitness')}</div>
                                </div>
                                <div className={`w-12 h-12 rounded-2xl ${npc.color} flex items-center justify-center shadow-2xl border-2 border-black/10 animate-pixel-bob`}>
                                    {npc.icon}
                                </div>
                            </div>
                        ))}

                        {/* PLAYER */}
                        <div 
                            className="absolute z-40"
                            style={{ left: playerPos.x - 22, top: playerPos.y - 22 }}
                        >
                             <div className="relative group">
                                <div className="absolute inset-0 bg-indigo-600/30 blur-xl rounded-full scale-150 animate-pulse"></div>
                                <div className="w-12 h-12 bg-white rounded-2xl shadow-2xl border-[3px] border-indigo-600 flex items-center justify-center transform group-hover:rotate-6 transition-transform">
                                     <ShepherdLogo size={24} className="text-indigo-600" />
                                </div>
                             </div>
                        </div>
                    </div>

                    {activeNPC && !isTalking && (
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-pop-in z-50">
                            <button onClick={startTalk} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl text-xs font-black shadow-2xl border-b-4 border-indigo-800 flex items-center gap-3 transform active:translate-y-1 transition-all">
                                <MessageCircle size={18} />
                                {t('explorer.talk', { name: activeNPC.name })}
                            </button>
                        </div>
                    )}
                </div>

                {isTalking && activeNPC && (
                    <div className="absolute inset-x-4 bottom-10 top-10 md:inset-x-auto md:w-[500px] bg-slate-900 rounded-[2.5rem] shadow-2xl border-4 border-white/10 overflow-hidden flex flex-col z-[60] animate-pop-in">
                        <div className="p-5 bg-white/5 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl ${activeNPC.color} flex items-center justify-center border-2 border-white/20 shadow-xl`}>
                                    {activeNPC.icon}
                                </div>
                                <div>
                                    <h2 className="font-black text-white text-lg leading-none mb-1">{activeNPC.name}</h2>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">{activeNPC.descriptionKey}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsTalking(false)} className="p-2 text-slate-500 hover:text-white rounded-full bg-black/20 hover:rotate-90 transition-all"><X size={24} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')]" ref={talkBoxRef}>
                            {messages.map(m => (
                                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] px-5 py-4 rounded-3xl text-sm leading-relaxed border shadow-md ${m.role === 'user' ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 italic rounded-tl-none font-serif-text'}`}>
                                        {m.text === '' && m.role === 'model' && isLoading ? (
                                            <div className="flex items-center space-x-1.5 h-6 px-2">
                                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                            </div>
                                        ) : (
                                            <ReactMarkdown>{m.text}</ReactMarkdown>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 bg-slate-800/80 flex gap-3 border-t border-white/5 backdrop-blur-xl">
                            <input autoFocus value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={t('explorer.placeholder')} className="flex-1 bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                            <button type="submit" disabled={isLoading || !inputValue.trim()} className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-2xl disabled:opacity-50 shadow-xl active:scale-90 transition-transform"><Send size={20} /></button>
                        </form>
                    </div>
                )}
            </div>

            {!isTalking && (
                <div className="flex flex-col items-center gap-3 mb-10 opacity-90 pb-4">
                    <div className="flex gap-3">
                        <button className="bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center active:bg-indigo-600 border-b-4 border-slate-950 active:translate-y-1 transition-all" onTouchStart={() => window.dispatchEvent(new KeyboardEvent('keydown', {key: 'w'}))}>W</button>
                    </div>
                    <div className="flex gap-3">
                        <button className="bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center active:bg-indigo-600 border-b-4 border-slate-950 active:translate-y-1 transition-all" onTouchStart={() => window.dispatchEvent(new KeyboardEvent('keydown', {key: 'a'}))}>A</button>
                        <button className="bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center active:bg-indigo-600 border-b-4 border-slate-950 active:translate-y-1 transition-all" onTouchStart={() => window.dispatchEvent(new KeyboardEvent('keydown', {key: 's'}))}>S</button>
                        <button className="bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center active:bg-indigo-600 border-b-4 border-slate-950 active:translate-y-1 transition-all" onTouchStart={() => window.dispatchEvent(new KeyboardEvent('keydown', {key: 'd'}))}>D</button>
                    </div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2 animate-pulse">{t('explorer.instructions')}</p>
                </div>
            )}
        </div>
    );
};

export default WorldExplorer;
