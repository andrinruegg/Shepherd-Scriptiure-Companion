
import React, { useState, useEffect, useRef } from 'react';
import { X, CloudRain, Flame, Waves, Volume2, VolumeX, AlertCircle, Loader2 } from 'lucide-react';
import { translations } from '../utils/translations';

interface SanctuaryProps {
    isOpen: boolean;
    onClose: () => void;
    language: string;
}

// DIRECT MP3 SOURCES (100% Reliable - SoundJay)
// Removed Night as requested.
const SOUNDS = [
    { 
        id: 'rain', 
        icon: CloudRain, 
        url: 'https://www.soundjay.com/nature/sounds/rain-01.mp3', 
        label: 'rain' 
    },
    { 
        id: 'fire', 
        icon: Flame, 
        url: 'https://www.soundjay.com/nature/sounds/campfire-1.mp3', 
        label: 'fire' 
    },
    { 
        id: 'stream', 
        icon: Waves, 
        url: 'https://www.soundjay.com/nature/sounds/river-1.mp3', 
        label: 'stream' 
    }
];

const Sanctuary: React.FC<SanctuaryProps> = ({ isOpen, onClose, language }) => {
    const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
    const [volume, setVolume] = useState(0.5);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const t = translations[language]?.sanctuary || translations['English'].sanctuary;

    // Effect: Handle Playback when activeSoundId changes
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // STOPPING
        if (!activeSoundId) {
            audio.pause();
            audio.currentTime = 0;
            setIsLoading(false);
            return;
        }

        const sound = SOUNDS.find(s => s.id === activeSoundId);
        if (sound) {
            // If the src is already correct, don't reload (allows seamless play)
            if (audio.src === sound.url) {
                if (audio.paused) {
                    const playPromise = audio.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(err => {
                            if (err.name !== 'AbortError') console.error("Resume error:", err);
                        });
                    }
                }
                return;
            }

            // New Sound Selected
            audio.pause();
            setError(null);
            setIsLoading(true);
            audio.src = sound.url;
            audio.volume = volume;
            
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => setIsLoading(false))
                    .catch(err => {
                        if (err.name === 'AbortError') {
                            setIsLoading(false);
                            return;
                        }
                        
                        console.error("Play error:", err);
                        setIsLoading(false);
                        if (err.name === 'NotAllowedError') {
                            setError("Tap again to play");
                        } else if (err.name === 'NotSupportedError') {
                            setError("Format not supported");
                        }
                    });
            }
        }
    }, [activeSoundId]);

    // Effect: Handle Volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
        if (!activeSoundId) {
            setIsLoading(false);
            return;
        }

        const target = e.target as HTMLAudioElement;
        const currentSrc = target.getAttribute('src');
        if (!currentSrc || currentSrc === '') return;

        console.error("Audio Error Event:", target.error);
        setIsLoading(false);
        
        if (target.error && target.error.code === 4) {
            setError("Source unavailable");
        } else {
            setError("Unable to play audio");
        }
    };

    if (!isOpen && !activeSoundId) return null;

    return (
        <>
            {/* PERSISTENT AUDIO PLAYER */}
            <audio 
                ref={audioRef}
                loop
                preload="auto"
                onError={handleAudioError}
                onCanPlay={() => setIsLoading(false)}
                onWaiting={() => setIsLoading(true)}
                onPlaying={() => setIsLoading(false)}
            />

            {/* VIEW 1: FULL MODAL */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
                    <div className="relative w-full max-w-sm bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-700 animate-scale-in text-white p-6">
                        
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-serif-text font-bold flex items-center gap-2">
                                <Volume2 className="text-emerald-400" /> {t.title}
                            </h2>
                            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"><X size={20}/></button>
                        </div>

                        {error && (
                            <div className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-4 text-xs flex items-center gap-2 animate-fade-in border border-red-500/30">
                                <AlertCircle size={14} className="shrink-0" /> 
                                <span>{error}</span>
                            </div>
                        )}

                        {/* LIST LAYOUT (Better for 3 items) */}
                        <div className="flex flex-col gap-3 mb-8">
                            {SOUNDS.map(sound => {
                                const isActive = activeSoundId === sound.id;
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
                                        {/* Left: Icon & Label */}
                                        <div className="flex items-center gap-4 z-10">
                                            <div className={`p-2 rounded-full ${isActive ? 'bg-emerald-500/20' : 'bg-slate-900/50'}`}>
                                                <sound.icon size={24} className={isActive && !isLoading ? 'animate-pulse' : ''} />
                                            </div>
                                            <span className={`text-sm font-bold capitalize tracking-wide ${isActive ? 'text-white' : ''}`}>
                                                {t[sound.label]}
                                            </span>
                                        </div>

                                        {/* Right: Status or Loader */}
                                        <div className="z-10">
                                            {isLoading && isActive ? (
                                                <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                                            ) : isActive ? (
                                                // Animated Equalizer Bars
                                                <div className="flex gap-1 items-end h-4">
                                                    <div className="w-1 bg-emerald-400 rounded-full animate-[bounce_1s_infinite]"></div>
                                                    <div className="w-1 bg-emerald-400 rounded-full animate-[bounce_1.2s_infinite]"></div>
                                                    <div className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.8s_infinite]"></div>
                                                </div>
                                            ) : (
                                                // Play Icon (Implicit)
                                                <div className="w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="ml-0.5 border-t-[5px] border-t-transparent border-l-[8px] border-l-slate-400 border-b-[5px] border-b-transparent"></div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Background Fill Animation */}
                                        {isActive && (
                                            <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Volume Control */}
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                            <div className="flex items-center gap-3 text-slate-400 mb-2">
                                {volume === 0 ? <VolumeX size={16}/> : <Volume2 size={16}/>}
                                <span className="text-xs uppercase tracking-wider font-bold">{t.volume}</span>
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

            {/* VIEW 2: MINI PLAYER (Bottom Right) */}
            {!isOpen && activeSoundId && (
                <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white p-3 rounded-full shadow-xl flex items-center gap-3 animate-slide-up border border-slate-700 hover:border-emerald-500/50 transition-colors cursor-pointer" onClick={onClose}>
                     <div className="animate-pulse text-emerald-400">
                        {(() => {
                            const S = SOUNDS.find(s => s.id === activeSoundId);
                            return S ? <S.icon size={20} /> : <Volume2 size={20}/>
                        })()}
                     </div>
                     <span className="hover:text-emerald-300 font-medium text-xs pr-2">
                         {t.title} Active
                     </span>
                     <button 
                        onClick={(e) => { e.stopPropagation(); setActiveSoundId(null); }} 
                        className="bg-slate-700 p-1.5 rounded-full hover:bg-red-500/80 hover:text-white transition-colors"
                     >
                         <X size={14} />
                     </button>
                </div>
            )}
        </>
    );
};

export default Sanctuary;
