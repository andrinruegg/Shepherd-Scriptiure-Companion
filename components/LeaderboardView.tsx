
import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Trophy, Shield, Crown, User, Lock, Flame, Medal, Star } from 'lucide-react';
import { db } from '../services/db';
import { LeaderboardEntry } from '../types';
import { useTranslation } from 'react-i18next';

const LEAGUE_KEYS = [
    'bronze', 'silver', 'gold', 'sapphire', 'ruby', 
    'emerald', 'amethyst', 'pearl', 'obsidian', 'diamond'
];

interface LeaderboardViewProps {
    onBack: () => void;
    currentLeague: string;
}

const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onBack, currentLeague }) => {
    const { t } = useTranslation();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await db.social.getLeaderboard();
                setEntries(data);
            } catch (e) {
                console.error("Leaderboard load error", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const getCurrentLeagueIndex = () => {
        const currentNormalized = currentLeague.toLowerCase();
        const idx = LEAGUE_KEYS.findIndex(l => l === currentNormalized);
        return idx === -1 ? 0 : idx; // Default to Bronze if not found
    };

    const currentLeagueIndex = getCurrentLeagueIndex();

    // Auto-scroll to current league on mount
    useEffect(() => {
        if (scrollRef.current) {
            const activeEl = document.getElementById('active-league');
            if (activeEl) {
                activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, []);

    const getLeagueColor = (index: number) => {
        const colors = [
            'text-amber-700 bg-amber-100 border-amber-300', // Bronze
            'text-slate-500 bg-slate-100 border-slate-300', // Silver
            'text-yellow-600 bg-yellow-100 border-yellow-300', // Gold
            'text-blue-600 bg-blue-100 border-blue-300', // Sapphire
            'text-red-600 bg-red-100 border-red-300', // Ruby
            'text-emerald-600 bg-emerald-100 border-emerald-300', // Emerald
            'text-purple-600 bg-purple-100 border-purple-300', // Amethyst
            'text-pink-500 bg-pink-100 border-pink-300', // Pearl
            'text-slate-900 bg-slate-300 border-slate-500', // Obsidian
            'text-cyan-600 bg-cyan-100 border-cyan-300' // Diamond
        ];
        return colors[index] || colors[0];
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <div className="w-8 h-8 flex items-center justify-center bg-yellow-100 rounded-full border-2 border-yellow-400 text-yellow-600 shadow-sm"><Crown size={16} fill="currentColor"/></div>;
        if (rank === 2) return <div className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full border-2 border-slate-300 text-slate-500 shadow-sm"><Medal size={16}/></div>;
        if (rank === 3) return <div className="w-8 h-8 flex items-center justify-center bg-amber-100 rounded-full border-2 border-amber-400 text-amber-700 shadow-sm"><Medal size={16}/></div>;
        return <div className="w-8 h-8 flex items-center justify-center text-slate-400 font-black text-sm">{rank}</div>;
    };

    return (
        <div className="flex flex-col h-full bg-[#fdfbf7] dark:bg-slate-950 overflow-hidden relative">
            <header className="px-4 py-4 flex items-center gap-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-10 shrink-0 sticky top-0 shadow-sm">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex-1 text-center pr-10">
                    <h1 className="text-lg font-bold text-slate-800 dark:text-white font-serif-text uppercase tracking-widest flex items-center justify-center gap-2">
                        <Trophy size={18} className="text-amber-500" />
                        {t(`leagues.${currentLeague.toLowerCase()}`)}
                    </h1>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
                {/* Fixed League Carousel */}
                <div 
                    ref={scrollRef}
                    className="flex items-center gap-4 py-8 px-6 overflow-x-auto no-scrollbar snap-x snap-mandatory"
                >
                    {LEAGUE_KEYS.map((leagueKey, idx) => {
                        const isUnlocked = idx <= currentLeagueIndex;
                        const isCurrent = idx === currentLeagueIndex;
                        const leagueName = t(`leagues.${leagueKey}`);
                        
                        return (
                            <div 
                                key={leagueKey} 
                                id={isCurrent ? 'active-league' : undefined}
                                className={`flex-shrink-0 snap-center flex flex-col items-center gap-3 transition-all duration-300 ${isCurrent ? 'scale-110 opacity-100' : 'scale-90 opacity-60 grayscale'}`}
                            >
                                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center border-4 shadow-xl relative overflow-hidden transition-colors ${isUnlocked ? getLeagueColor(idx) : 'bg-slate-200 border-slate-300 text-slate-400 dark:bg-slate-800 dark:border-slate-700'}`}>
                                    <div className="absolute inset-0 bg-white/20 dark:bg-black/10"></div>
                                    {isUnlocked ? <Trophy size={40} fill="currentColor" className="drop-shadow-sm" /> : <Lock size={32} />}
                                    {isCurrent && <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/50 backdrop-blur-sm"></div>}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isCurrent ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>
                                    {leagueName}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Cohort List Container */}
                <div className="max-w-md mx-auto px-4 space-y-3">
                    <div className="bg-indigo-600 rounded-xl p-4 flex items-center justify-between mb-6 shadow-lg shadow-indigo-500/20 text-white">
                        <div className="text-xs font-bold uppercase tracking-wider opacity-90">{t('leaderboard.promotionZone')}</div>
                        <div className="flex items-center gap-1 text-xs font-bold bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm">
                            <ArrowLeft size={12} className="rotate-90" /> {t('leaderboard.top10')}
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-slate-400 animate-pulse flex flex-col items-center gap-3">
                            <Shield size={48} className="opacity-20"/>
                            <span className="text-xs font-bold uppercase tracking-wider">{t('leaderboard.loading')}</span>
                        </div>
                    ) : (
                        entries.map((entry, index) => (
                            <React.Fragment key={entry.user_id}>
                                {index === 10 && (
                                    <div className="my-6 border-t-2 border-dashed border-slate-200 dark:border-slate-800 relative">
                                        <span className="absolute left-1/2 -top-2.5 -translate-x-1/2 bg-[#fdfbf7] dark:bg-slate-950 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('leaderboard.promotionLine')}</span>
                                    </div>
                                )}
                                <div 
                                    className={`
                                        flex items-center gap-4 p-4 rounded-2xl border transition-all animate-slide-up relative overflow-hidden group
                                        ${entry.is_current_user 
                                            ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/30 z-10 transform scale-[1.02]' 
                                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}
                                    `}
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    {entry.is_current_user && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500"></div>}
                                    
                                    <div className="shrink-0 font-bold w-8 text-center">
                                        {getRankIcon(entry.rank)}
                                    </div>
                                    
                                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center shrink-0 border-2 border-slate-100 dark:border-slate-600 shadow-sm relative">
                                        {entry.avatar ? <img src={entry.avatar} className="w-full h-full object-cover" /> : <User size={24} className="text-slate-400" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-slate-800 dark:text-slate-100 truncate text-sm flex items-center gap-2">
                                            {entry.display_name} 
                                            {entry.is_current_user && <span className="text-[9px] bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded font-black uppercase tracking-wider">You</span>}
                                        </div>
                                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                            {t('game.xp')} {t('leaderboard.earned')}
                                        </div>
                                    </div>

                                    <div className="text-right flex flex-col items-end">
                                        <div className="font-black text-amber-500 text-base flex items-center gap-1">
                                            {entry.weekly_xp} <span className="text-[10px] text-slate-400 font-bold">XP</span>
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        ))
                    )}
                    
                    {!loading && entries.length === 0 && (
                        <div className="text-center py-10 text-slate-400">
                            <Shield size={48} className="mx-auto mb-2 opacity-50"/>
                            <p>{t('leaderboard.empty')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeaderboardView;
