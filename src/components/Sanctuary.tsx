
import React, { useState, useEffect, useRef } from 'react';
import { X, CloudRain, Flame, Waves, Volume2, VolumeX, AlertCircle, Loader2, ChevronUp, ChevronDown, Play, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SanctuaryProps {
    isOpen: boolean;
    onClose: () => void;
    language: string;
}

const SOUNDS = [
    { 
        id: 'rain', 
        icon: CloudRain, 
        url: 'https://cdn.pixabay.com/audio/2021/09/06/audio_012e8b0903.mp3', 
        labelKey: 'rain' 
    },
    { 
        id: 'fire', 
        icon: Flame, 
        url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808d05b08.mp3', 
        labelKey: 'fire' 
    },
    { 
        id: 'stream', 
        icon: Waves, 
        url: 'https://cdn.pixabay.com/audio/2023/04/23/audio_821a8a252a.mp3', 
        labelKey: 'stream' 
    }
];

const Sanctuary: React.FC<SanctuaryProps> = ({ isOpen, onClose, language }) => {
    const { t } = useTranslation();
    const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
    const [volume, setVolume] = useState(0.5);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isMiniPanelExpanded, setIsMiniPanelExpanded] = useState(false);
    
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (!activeSoundId) {
            audio.pause();
            audio.currentTime = 0;
            setIsLoading(false);
            return;
        }

        const sound = SOUNDS.find(s => s.id === activeSoundId);
        if (sound) {
            // CRITICAL: Pull the pre-cached blob URL from the global window object
            const cachedUrl = (window as any)[`cached_audio_${sound.id}`];
            const finalUrl = cachedUrl || sound.url;

            if (audio.src === finalUrl) {
                if (audio.paused) {
                    audio.play().catch(() => {});
                }
                return;
            }

            audio.pause();
            setError(null);
            
            // If it's a blob, it should be ready, but we check if we need to show loader
            if (!cachedUrl) setIsLoading(true);
            
            audio.src = finalUrl;
            audio.volume = volume;
            audio.loop = true;
            
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsLoading(false);
                        setError(null);
                    })
                    .catch(err => {
                        if (err.name === 'AbortError') return;
                        setIsLoading(false);
                        console.error("Playback error:", err);
                        setError(err.name === 'NotAllowedError' ? "Click to enable audio" : "Source unavailable");
                    });
            }
        }
    }, [activeSoundId]);

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

    if (!isOpen && !activeSoundId) return null;

    return (
        <>
            <audio 
                ref={audioRef}
                loop
                preload="auto"
                onError={() => activeSoundId && setError("Source unavailable")}
                onCanPlay={() => setIsLoading(false)}
            />

            {isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
                    <div className="relative w-full max-w-sm bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-700 animate-scale-in text-white p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-serif-text font-bold flex items-center gap-2">
                                <Volume2 className="text-emerald-400" /> {t('sanctuary.title')}
                            </h2>
                            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-transform active:scale-90"><X size={20}/></button>
                        </div>

                        {error && (
                            <div className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-4 text-xs flex items-center gap-2 animate-fade-in border border-red-500/30">
                                <AlertCircle size={14} className="shrink-0" /> 
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="flex flex-col gap-3 mb-8">
                            {SOUNDS.map(sound => {
                                const isActive = activeSoundId === sound.id;
                                const isCached = !!(window as any)[`cached_audio_${sound.id}`];
                                return (
                                    <button
                                        key={sound.id}
                                        onClick={() => setActiveSoundId(isActive ? null : sound.id)}
                                        className={`
                                            w-full p-4 rounded-2xl flex items-center justify-between transition-all border relative overflow-hidden group
                                            ${isActive 
                                                ? 'bg-gradient-to-r from-emerald-900/60 to-slate-800 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-900/20' 
                                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750 hover:border-slate-600'}
                                        `}
                                    >
                                        <div className="flex items-center gap-4 z-10">
                                            <div className={`p-2 rounded-full ${isActive ? 'bg-emerald-500/20' : 'bg-slate-900/50'}`}>
                                                <sound.icon size={24} className={isActive && !isLoading ? 'animate-pulse' : ''} />
                                            </div>
                                            <div className="text-left">
                                                <span className={`text-sm font-bold capitalize tracking-wide block ${isActive ? 'text-white' : ''}`}>
                                                    {t(`sanctuary.${sound.labelKey}`)}
                                                </span>
                                                {isCached && !isActive && <span className="text-[8px] font-black uppercase text-emerald-500/60 tracking-widest">Instant Ready</span>}
                                            </div>
                                        </div>

                                        <div className="z-10">
                                            {isLoading && isActive ? (
                                                <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                                            ) : isActive ? (
                                                <Square size={16} fill="currentColor" />
                                            ) : (
                                                <Play size={16} fill="currentColor" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                            <div className="flex items-center justify-between text-slate-400 mb-2">
                                <div className="flex items-center gap-3">
                                    {volume === 0 ? <VolumeX size={16}/> : <Volume2 size={16}/>}
                                    <span className="text-xs uppercase tracking-wider font-bold">{t('sanctuary.volume')}</span>
                                </div>
                                <span className="text-[10px] font-mono">{Math.round(volume * 100)}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.01" 
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                        </div>
                    </div>
                </div>
            )}

            {!isOpen && activeSoundId && (
                <div 
                    className={`
                        fixed bottom-4 right-4 z-50 bg-slate-900 text-white rounded-[2rem] shadow-2xl border border-slate-700/50 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                        ${isMiniPanelExpanded ? 'w-64 p-5' : 'w-48 p-3 flex items-center gap-3 cursor-pointer'}
                    `}
                    onClick={() => { if(!isMiniPanelExpanded) setIsMiniPanelExpanded(true); }}
                >
                     {isMiniPanelExpanded ? (
                         <div className="animate-fade-in">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="animate-pulse text-emerald-400">
                                        {(() => {
                                            const S = SOUNDS.find(s => s.id === activeSoundId);
                                            return S ? <S.icon size={18} /> : <Volume2 size={18}/>
                                        })()}
                                    </div>
                                    <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">Playing</span>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setIsMiniPanelExpanded(false); }}
                                    className="p-1 hover:bg-slate-800 rounded-full text-slate-500"
                                >
                                    <ChevronDown size={18} />
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-5">
                                {SOUNDS.map(s => {
                                    const isActive = activeSoundId === s.id;
                                    return (
                                        <button 
                                            key={s.id}
                                            onClick={(e) => { e.stopPropagation(); setActiveSoundId(isActive ? null : s.id); }}
                                            className={`p-3 rounded-xl border flex items-center justify-center transition-all ${isActive ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                                            title={t(`sanctuary.${s.labelKey}`)}
                                        >
                                            <s.icon size={18} />
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1 text-[9px] font-black uppercase text-slate-500 tracking-wider">
                                    <span>Volume</span>
                                    <span>{Math.round(volume * 100)}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.01" 
                                    value={volume}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-slate-700 rounded-full appearance-none accent-emerald-500 cursor-pointer"
                                />
                            </div>

                            <button 
                                onClick={(e) => { e.stopPropagation(); setActiveSoundId(null); setIsMiniPanelExpanded(false); }}
                                className="w-full mt-4 py-2 bg-red-900/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-red-900/30 hover:bg-red-900/30 transition-all"
                            >
                                Stop Audio
                            </button>
                         </div>
                     ) : (
                         <>
                            <div className="animate-pulse text-emerald-400">
                                {(() => {
                                    const S = SOUNDS.find(s => s.id === activeSoundId);
                                    return S ? <S.icon size={20} /> : <Volume2 size={20}/>
                                })()}
                            </div>
                            <span className="hover:text-emerald-300 font-bold text-[10px] uppercase tracking-widest flex-1">Sanctuary</span>
                            <div className="p-1 bg-slate-800 rounded-full text-slate-400"><ChevronUp size={14} /></div>
                         </>
                     )}
                </div>
            )}
        </>
    );
};

export default Sanctuary;
