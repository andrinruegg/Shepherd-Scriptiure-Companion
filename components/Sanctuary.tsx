import React, { useState, useEffect, useRef } from 'react';
import { X, CloudRain, Flame, Waves, Volume2, VolumeX, AlertCircle, Loader2 } from 'lucide-react';
import { translations } from '../utils/translations.ts';

interface SanctuaryProps {
    isOpen: boolean;
    onClose: () => void;
    language: string;
}

const SOUNDS = [
    { id: 'rain', icon: CloudRain, url: 'https://www.soundjay.com/nature/sounds/rain-01.mp3', label: 'rain' },
    { id: 'fire', icon: Flame, url: 'https://www.soundjay.com/nature/sounds/campfire-1.mp3', label: 'fire' },
    { id: 'stream', icon: Waves, url: 'https://www.soundjay.com/nature/sounds/river-1.mp3', label: 'stream' }
];

const Sanctuary: React.FC<SanctuaryProps> = ({ isOpen, onClose, language }) => {
    const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
    const [volume, setVolume] = useState(0.5);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const t = translations[language]?.sanctuary || translations['English'].sanctuary;

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.loop = true;
        }
        const audio = audioRef.current;
        const handleCanPlay = () => { setIsLoading(false); setError(null); };
        const handleLoadStart = () => { setIsLoading(true); setError(null); };
        const handleError = () => { setIsLoading(false); setError("Playback error."); setActiveSoundId(null); };
        
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('error', handleError);
        
        return () => {
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('error', handleError);
        };
    }, []);

    useEffect(() => {
        if (!audioRef.current) return;
        const audio = audioRef.current;
        if (activeSoundId) {
            const sound = SOUNDS.find(s => s.id === activeSoundId);
            if (sound) {
                if (audio.src !== sound.url) {
                    audio.src = sound.url;
                    audio.load();
                }
                audio.play().catch(err => {
                    if (err.name !== 'AbortError') setError("Blocked. Interact first.");
                });
            }
        } else {
            audio.pause();
            setIsLoading(false);
        }
    }, [activeSoundId]);

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

    if (!isOpen && !activeSoundId) return null;

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
                    <div className="relative w-full max-w-sm bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-700 animate-scale-in text-white p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-serif-text font-bold flex items-center gap-2">
                                <Volume2 className="text-emerald-400" /> {t.title}
                            </h2>
                            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
                                <X size={20}/>
                            </button>
                        </div>
                        
                        {error && (
                            <div className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-4 text-xs flex items-center gap-2 border border-red-500/30">
                                <AlertCircle size={14} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="flex flex-col gap-3 mb-8">
                            {SOUNDS.map(sound => {
                                const isActive = activeSoundId === sound.id;
                                const Icon = sound.icon;
                                return (
                                    <button 
                                        key={sound.id} 
                                        onClick={() => setActiveSoundId(isActive ? null : sound.id)} 
                                        className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all border relative overflow-hidden group ${isActive ? 'bg-emerald-900/60 border-emerald-500/50 text-emerald-400 shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                                    >
                                        <div className="flex items-center gap-4 z-10">
                                            <div className={`p-2 rounded-full ${isActive ? 'bg-emerald-500/20' : 'bg-slate-900/50'}`}>
                                                <Icon size={24} className={isActive && !isLoading ? 'animate-pulse' : ''} />
                                            </div>
                                            <span className="text-sm font-bold capitalize">{t[sound.label]}</span>
                                        </div>
                                        <div className="z-10">
                                            {isLoading && isActive ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : isActive ? (
                                                <div className="flex gap-1 items-end h-4">
                                                    <div className="w-1 bg-emerald-400 rounded-full animate-bounce"></div>
                                                    <div className="w-1 bg-emerald-400 rounded-full animate-[bounce_1.2s_infinite]"></div>
                                                    <div className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.8s_infinite]"></div>
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                    <div className="ml-0.5 border-t-[5px] border-t-transparent border-l-[8px] border-l-slate-400 border-b-[5px] border-b-transparent"></div>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                            <div className="flex items-center gap-3 text-slate-400 mb-2">
                                {volume === 0 ? <VolumeX size={16}/> : <Volume2 size={16}/>}
                                <span className="text-xs font-bold uppercase">{t.volume}</span>
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
                    className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white p-3 rounded-full shadow-xl flex items-center gap-3 border border-slate-700 cursor-pointer" 
                    onClick={onClose}
                >
                    <div className="animate-pulse text-emerald-400">
                        {(() => {
                            const found = SOUNDS.find(s => s.id === activeSoundId);
                            if (!found) return <Volume2 size={20}/>;
                            const Icon = found.icon;
                            return <Icon size={20} />;
                        })()}
                    </div>
                    <span className="text-xs pr-2">{t.title} Active</span>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setActiveSoundId(null); }} 
                        className="bg-slate-700 p-1.5 rounded-full"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}
        </>
    );
};

export default Sanctuary;