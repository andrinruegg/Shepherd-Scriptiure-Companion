
import React, { useRef, useEffect } from 'react';
import { Star, Lock, Check } from 'lucide-react';
import { PathNode } from '../types';
import { useTranslation } from 'react-i18next';
import Mascot from './Mascot';

interface LearningPathProps {
    nodes: PathNode[];
    onNodeClick: (node: PathNode) => void;
    currentXP: number;
}

const Decoration: React.FC<{ type: 'sheep' | 'dove' | 'bush' }> = ({ type }) => {
    if (type === 'sheep') {
        return (
            <svg width="50" height="40" viewBox="0 0 100 80" className="drop-shadow-md transform hover:scale-110 transition-transform cursor-pointer">
                <circle cx="50" cy="45" r="30" fill="#f5f5f5" />
                <circle cx="30" cy="40" r="15" fill="#f5f5f5" />
                <circle cx="70" cy="40" r="15" fill="#f5f5f5" />
                <circle cx="50" cy="25" r="15" fill="#f5f5f5" />
                <circle cx="50" cy="65" r="15" fill="#f5f5f5" />
                <rect x="35" y="70" width="8" height="15" rx="4" fill="#4a4a4a" />
                <rect x="57" y="70" width="8" height="15" rx="4" fill="#4a4a4a" />
                <circle cx="25" cy="45" r="14" fill="#4a4a4a" />
                <circle cx="20" cy="42" r="2" fill="white" />
            </svg>
        );
    }
    if (type === 'dove') {
        return (
            <svg width="40" height="40" viewBox="0 0 100 100" className="drop-shadow-md animate-float cursor-pointer">
                <path d="M20 50 Q 10 30 30 20 Q 50 5 70 20 Q 90 30 80 50 Q 90 70 70 85 Q 50 95 30 85 Q 10 70 20 50" fill="#fff" />
                <circle cx="75" cy="35" r="2" fill="#333" />
                <path d="M80 38 L 90 35 L 82 42" fill="#eab308" />
            </svg>
        );
    }
    if (type === 'bush') {
        return (
            <svg width="40" height="40" viewBox="0 0 100 100" className="drop-shadow-md opacity-80">
                <path d="M50 80 L 50 60" stroke="#78350f" strokeWidth="6" />
                <circle cx="30" cy="50" r="20" fill="#16a34a" />
                <circle cx="70" cy="50" r="20" fill="#16a34a" />
                <circle cx="50" cy="30" r="25" fill="#22c55e" />
                <circle cx="50" cy="50" r="20" fill="#16a34a" />
                <path d="M45 40 Q 50 10 55 40" fill="#ef4444" opacity="0.6" className="animate-pulse" />
            </svg>
        );
    }
    return null;
};

const SpeechBubble: React.FC<{ text: string; side: 'left' | 'right' }> = ({ text, side }) => (
    <div className={`absolute bottom-[100%] mb-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl shadow-lg z-50 animate-pop-in pointer-events-none max-w-[160px] w-max`}>
        <p className="text-[9px] font-bold text-slate-600 dark:text-slate-300 whitespace-normal text-center leading-tight">{text}</p>
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-800 border-r-2 border-b-2 border-slate-200 dark:border-slate-700 transform rotate-45 -translate-y-1.5"></div>
    </div>
);

// Progress Ring Component
const ProgressRing: React.FC<{ step: number; status: string }> = ({ step, status }) => {
    const radius = 34; // Radius of the circle
    const circumference = 2 * Math.PI * radius;

    // Logic:
    // status 'completed' = Gold, Full.
    // status 'active' & step >= 4 (Ready for Exam) = Green, Full.
    // status 'active' & step < 4 = Green, Percentage based on step/4.

    let progress = 0;
    let strokeColor = '#e2e8f0'; // slate-200 default for empty track

    if (status === 'completed') {
        progress = 1;
        strokeColor = '#7c4a32'; // Organic Brown (Completed)
    } else if (status === 'active') {
        if (step >= 4) {
            progress = 1;
            strokeColor = '#d2b48c'; // Tan/Amber (Ready for Exam)
        } else {
            progress = step / 4;
            strokeColor = '#d2b48c'; // Tan/Amber (Progress)
        }
    } else {
        // Locked
        progress = 0;
    }

    const strokeDashoffset = circumference - progress * circumference;

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                {/* Background Track */}
                <circle
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    r={radius}
                    cx="40"
                    cy="40"
                    className="text-slate-200 dark:text-slate-800"
                />
                {/* Colored Progress */}
                <circle
                    stroke={strokeColor}
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx="40"
                    cy="40"
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: strokeDashoffset,
                        transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.5s ease'
                    }}
                />
            </svg>
        </div>
    );
};

const LearningPath: React.FC<LearningPathProps> = ({ nodes, onNodeClick }) => {
    const { t } = useTranslation();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            const active = document.getElementById('active-node');
            if (active) {
                // Slight delay to ensure layout is ready
                setTimeout(() => {
                    active.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        }
    }, []);

    const getNodeStyle = (status: string, step: number) => {
        switch (status) {
            case 'completed':
                // GOLDEN when exam passed (Step 5+)
                return 'bg-amber-500 border-amber-600 text-white shadow-[0_4px_0_rgb(217,119,6)]';
            case 'active':
                if (step >= 4) {
                    // AMBER when 4 exercises are done (Ready for Exam)
                    return 'bg-amber-500 border-amber-600 text-white animate-pulse-slow shadow-[0_4px_0_rgb(217,119,6)] ring-4 ring-amber-200 dark:ring-amber-900/40';
                }
                if (step === 0) {
                    // Level 0 (Start): White button, Grey Star
                    return 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-300 dark:text-slate-500 shadow-[0_4px_0_rgb(203,213,225)] hover:bg-slate-50 dark:hover:bg-slate-700';
                }
                // IN PROGRESS (1-3): White button, Amber ring (handled by ring component)
                return 'bg-white dark:bg-slate-800 border-amber-100 dark:border-amber-900/30 text-amber-500 shadow-[0_4px_0_rgb(254,243,199)] hover:bg-amber-50 dark:hover:bg-slate-700';
            default:
                // LOCKED
                return 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 shadow-[0_4px_0_rgb(203,213,225)] dark:shadow-[0_4px_0_rgb(51,65,85)]';
        }
    };

    const renderConnectorPath = () => {
        const NODE_HEIGHT = 120;
        let pathD = "";
        nodes.forEach((node, i) => {
            const x = node.position === 'center' ? 50 : node.position === 'left' ? 20 : 80;
            const y = (i * NODE_HEIGHT) + 60;
            if (i === 0) pathD += `M ${x} ${y}`;
            else {
                const prevNode = nodes[i - 1];
                const prevX = prevNode.position === 'center' ? 50 : prevNode.position === 'left' ? 20 : 80;
                const prevY = ((i - 1) * NODE_HEIGHT) + 60;
                const cp1x = prevX;
                const cp1y = prevY + (NODE_HEIGHT / 2);
                const cp2x = x;
                const cp2y = y - (NODE_HEIGHT / 2);
                pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
            }
        });

        return (
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" viewBox={`0 0 100 ${nodes.length * 120 + 200}`} preserveAspectRatio="none" style={{ minHeight: nodes.length * 120 + 200 }}>
                <path d={pathD} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="16" vectorEffect="non-scaling-stroke" strokeLinecap="round" className="translate-y-1" />
                <path d={pathD} fill="none" stroke="currentColor" strokeWidth="12" vectorEffect="non-scaling-stroke" className="text-slate-300 dark:text-slate-700" strokeLinecap="round" strokeDasharray="20,10" />
            </svg>
        );
    };

    const messages = t('mascotMessages', { returnObjects: true }) as string[];
    const getMessage = (index: number) => {
        if (!Array.isArray(messages) || messages.length === 0) return "Keep Going!";
        return messages[index % messages.length];
    };

    return (
        <div className="flex flex-col flex-1 bg-[#e8e8e5] dark:bg-slate-950 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto pb-32 pt-6 px-4 relative z-10 scroll-smooth no-scrollbar overflow-x-hidden w-full">
                <div className="relative mb-6 w-full flex justify-center">
                    <Mascot mood="happy" />
                </div>
                <div className="relative flex flex-col w-full min-h-screen" style={{ minHeight: nodes.length * 120 + 200 }}>
                    {renderConnectorPath()}
                    {nodes.map((node, index) => {
                        const isLeft = node.position === 'left';
                        const isRight = node.position === 'right';
                        const isCenter = node.position === 'center';
                        const showSheep = index % 5 === 2;
                        const showDove = index % 7 === 0 && index > 0;
                        const showBush = index % 4 === 3;
                        const step = node.current_step || 0;
                        const isCompleted = node.status === 'completed';
                        const isExamReady = node.status === 'active' && step >= 4;

                        return (
                            <div key={node.id} className="absolute w-full h-20" style={{ top: index * 120 }}>
                                <div className="absolute top-0 flex flex-col items-center z-10" style={{ left: isLeft ? '20%' : isRight ? '80%' : '50%', transform: 'translateX(-50%)' }}>
                                    <div className="relative w-24 h-24 flex items-center justify-center">
                                        <ProgressRing step={step} status={node.status} />
                                        <button
                                            id={node.status === 'active' ? 'active-node' : undefined}
                                            onClick={() => onNodeClick(node)}
                                            disabled={node.status === 'locked'}
                                            className={`
                                                w-20 h-20 rounded-full border-b-8 active:border-b-0 active:translate-y-[8px] transition-all flex flex-col items-center justify-center relative group z-10
                                                ${getNodeStyle(node.status, step)}
                                            `}
                                        >
                                            {isCompleted ? (
                                                <Check size={32} strokeWidth={4} />
                                            ) : isExamReady ? (
                                                <Star size={32} strokeWidth={4} fill="currentColor" />
                                            ) : node.status === 'locked' ? (
                                                <Lock size={24} className="opacity-50" />
                                            ) : (
                                                // Always show Star for active levels 0-3, just change color via getNodeStyle
                                                <Star size={32} strokeWidth={4} fill="currentColor" className="opacity-100" />
                                            )}
                                        </button>
                                    </div>

                                    <div className="absolute top-20 mt-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-black uppercase tracking-widest py-1.5 px-3 rounded-lg shadow-sm whitespace-nowrap border border-slate-200 dark:border-slate-700 transition-transform group-hover:scale-110 z-20 flex flex-col items-center">
                                        <span>{t(`game.nodes.${node.id}`) || node.title}</span>
                                        {node.status === 'active' && (
                                            <span className={`text-[9px] font-bold ${isExamReady ? 'text-emerald-500' : 'text-blue-500'}`}>
                                                {isExamReady ? t('game.finalExam').toUpperCase() : `${t('game.level')} ${step}/4`}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {showSheep && <div className="absolute top-4 z-40" style={{ left: isLeft ? '70%' : isRight ? '30%' : '20%', transform: 'translateX(-50%)' }}><Decoration type="sheep" /><SpeechBubble text={getMessage(index)} side={isLeft ? 'left' : 'right'} /></div>}
                                {showDove && <div className="absolute -top-6 z-20" style={{ left: isRight ? '30%' : '80%', transform: 'translateX(-50%)' }}><Decoration type="dove" /></div>}
                                {showBush && !showSheep && <div className="absolute top-8 z-0 opacity-80" style={{ left: isCenter ? '80%' : '50%', transform: 'translateX(-50%)' }}><Decoration type="bush" /></div>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LearningPath;
