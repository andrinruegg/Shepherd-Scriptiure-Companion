
import React, { useState, useEffect, useRef } from 'react';
import { X, CloudRain, Flame, Waves, Moon, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { translations } from '../utils/translations';

interface SanctuaryProps {
    isOpen: boolean;
    onClose: () => void;
    language: string;
}

// Using reliable MP3 sources
const SOUNDS = [
    { 
        id: 'rain', 
        icon: CloudRain, 
        url: 'https://www.soundjay.com/nature/sounds/rain-03.mp3', 
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
        url: 'https://www.soundjay.com/nature/sounds/ocean-wave-1.mp3', 
        label: 'stream' 
    },
    { 
        id: 'night', 
        icon: Moon, 
        url: 'https://www.soundjay.com/nature/sounds/wind-howl-01.mp3', 
        label: 'night' 
    }
];

const Sanctuary: React.FC<SanctuaryProps> = ({ isOpen, onClose, language }) => {
    const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
    const [volume, setVolume] = useState(0.5);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const t = translations[language]?.sanctuary || translations['English'].sanctuary;

    useEffect(() => {
        let isCancelled = false;

        const playAudio = async () => {
            // 1. Cleanup previous audio safely
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            
            setError(null);

            if (!activeSoundId) return;

            const sound = SOUNDS.find(s => s.id === activeSoundId);
            if (!sound) return;

            // 2. Setup new audio
            const audio = new Audio(sound.url);
            audio.loop = true;
            audio.volume = volume;
            audioRef.current = audio;

            // 3. Play with Promise handling
            try {
                await audio.play();
            } catch (err: any) {
                if (isCancelled) return;
                
                // Ignore "interrupted" errors (happens when switching fast)
                if (err.name !== 'AbortError' && !err.message.includes('interrupted')) {
                    console.error("Audio playback error:", err);
                    setError("Unable to play this sound. Please check connection.");
                    // Don't auto-close, let user see error
                }
            }
        };

        playAudio();

        return () => {
            isCancelled = true;
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [activeSoundId]);

    // Handle volume changes separately without reloading audio
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    if (!isOpen && !activeSoundId) return null;

    // Mini-player view if closed but playing
    if (!isOpen && activeSoundId) {
        return (
            <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white p-3 rounded-full shadow-xl flex items-center gap-3 animate-slide-up border border-slate-700">
                 <div className="animate-pulse text-emerald-400">
                    {(() => {
                        const S = SOUNDS.find(s => s.id === activeSoundId);
                        return S ? <S.icon size={20} /> : <Volume2 size={20}/>
                    })()}
                 </div>
                 <button onClick={() => onClose()} className="hover:text-indigo-300 font-medium text-xs pr-2">
                     Sanctuary Active
                 </button>
                 <button onClick={() => setActiveSoundId(null)} className="bg-slate-700 p-1.5 rounded-full hover:bg-slate-600">
                     <X size={14} />
                 </button>
            </div>
        )
    }

    if (!isOpen) return null;

    return (
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
                     <div className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-4 text-xs flex items-center gap-2">
                         <AlertCircle size={14} /> {error}
                     </div>
                 )}

                 <div className="grid grid-cols-2 gap-4 mb-8">
                     {SOUNDS.map(sound => (
                         <button
                            key={sound.id}
                            onClick={() => setActiveSoundId(activeSoundId === sound.id ? null : sound.id)}
                            className={`
                                p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border
                                ${activeSoundId === sound.id 
                                    ? 'bg-emerald-900/40 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]' 
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750 hover:border-slate-600'}
                            `}
                         >
                             <sound.icon size={32} className={activeSoundId === sound.id ? 'animate-bounce' : ''} />
                             <span className="text-sm font-medium capitalize">{t[sound.label]}</span>
                         </button>
                     ))}
                 </div>

                 {/* Volume Control */}
                 <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                     <div className="flex items-center gap-3 text-slate-400 mb-2">
                         {volume === 0 ? <VolumeX size={16}/> : <Volume2 size={16}/>}
                         <span className="text-xs uppercase tracking-wider font-bold">Volume</span>
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
    );
};

export default Sanctuary;
