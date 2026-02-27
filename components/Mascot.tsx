
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface MascotProps {
    mood: 'happy' | 'sad' | 'neutral' | 'encouraging';
    message?: string;
}

const Mascot: React.FC<MascotProps> = ({ mood, message }) => {
    const { t } = useTranslation();
    const [visibleMessage, setVisibleMessage] = useState(message || t('game.mascot.welcome'));

    useEffect(() => {
        if (message) setVisibleMessage(message);
    }, [message]);

    const getEyes = () => {
        if (mood === 'sad') return (
            <g>
                <path d="M35 45 Q 40 40 45 45" stroke="#45322e" strokeWidth="2" fill="none" />
                <path d="M55 45 Q 60 40 65 45" stroke="#45322e" strokeWidth="2" fill="none" />
                <circle cx="33" cy="50" r="1.5" fill="#a8e6cf" />
            </g>
        );
        if (mood === 'happy' || mood === 'encouraging') return (
            <g>
                <circle cx="40" cy="42" r="3" fill="#45322e" />
                <circle cx="60" cy="42" r="3" fill="#45322e" />
                <path d="M35 38 Q 40 35 45 38" stroke="#45322e" strokeWidth="1" fill="none" opacity="0.5" />
                <path d="M55 38 Q 60 35 65 38" stroke="#45322e" strokeWidth="1" fill="none" opacity="0.5" />
            </g>
        );
        return (
            <g>
                <circle cx="40" cy="42" r="3" fill="#45322e" />
                <circle cx="60" cy="42" r="3" fill="#45322e" />
            </g>
        );
    };

    const getMouth = () => {
        if (mood === 'sad') return <path d="M45 55 Q 50 52 55 55" stroke="#45322e" strokeWidth="2" fill="none" />;
        if (mood === 'happy') return <path d="M42 52 Q 50 60 58 52" stroke="#45322e" strokeWidth="2" fill="none" />;
        return <path d="M45 55 Q 50 58 55 55" stroke="#45322e" strokeWidth="2" fill="none" />;
    };

    return (
        <div className="flex items-end gap-3 p-4 animate-pop-in">
            <div className="relative w-24 h-24 shrink-0 transition-transform hover:scale-110 duration-300 cursor-pointer" onClick={() => setVisibleMessage(t('game.mascot.encouragement'))}>
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
                    {/* Wool/Body */}
                    <path d="M20 50 Q 10 30 30 20 Q 50 5 70 20 Q 90 30 80 50 Q 90 70 70 85 Q 50 95 30 85 Q 10 70 20 50" fill="#fdfbf7" stroke="#d2b48c" strokeWidth="3" />
                    <circle cx="25" cy="30" r="8" fill="#fdfbf7" stroke="#d2b48c" strokeWidth="2" />
                    <circle cx="75" cy="30" r="8" fill="#fdfbf7" stroke="#d2b48c" strokeWidth="2" />
                    <circle cx="20" cy="50" r="8" fill="#fdfbf7" stroke="#d2b48c" strokeWidth="2" />
                    <circle cx="80" cy="50" r="8" fill="#fdfbf7" stroke="#d2b48c" strokeWidth="2" />
                    <circle cx="30" cy="75" r="8" fill="#fdfbf7" stroke="#d2b48c" strokeWidth="2" />
                    <circle cx="70" cy="75" r="8" fill="#fdfbf7" stroke="#d2b48c" strokeWidth="2" />
                    
                    {/* Face */}
                    <rect x="30" y="30" width="40" height="35" rx="15" fill="#d2b48c" />
                    
                    {/* Ears */}
                    <ellipse cx="25" cy="40" rx="8" ry="12" fill="#7c4a32" transform="rotate(-20 25 40)" />
                    <ellipse cx="75" cy="40" rx="8" ry="12" fill="#7c4a32" transform="rotate(20 75 40)" />

                    {getEyes()}
                    {getMouth()}
                    
                    {/* Halo for Holy Vibe */}
                    <ellipse cx="50" cy="15" rx="20" ry="5" stroke="#fbbf24" strokeWidth="2" fill="none" className="animate-pulse" opacity="0.8" />
                </svg>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-bl-none shadow-lg border border-slate-200 dark:border-slate-700 max-w-[200px] mb-4 relative animate-scale-in">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-snug">
                    {visibleMessage}
                </p>
                <div className="absolute top-full left-0 w-3 h-3 bg-white dark:bg-slate-800 border-r border-b border-slate-200 dark:border-slate-700 transform rotate-45 -translate-y-1.5 translate-x-4"></div>
            </div>
        </div>
    );
};

export default Mascot;
