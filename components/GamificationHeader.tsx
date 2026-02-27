
import React from 'react';
import { Trophy, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface GamificationHeaderProps {
    xp: number;
    league: string;
    onOpenLeaderboard?: () => void;
}

const GamificationHeader: React.FC<GamificationHeaderProps> = ({ xp, league, onOpenLeaderboard }) => {
    const { t } = useTranslation();

    const getLeagueColor = () => {
        const l = league.toLowerCase();
        if (l === 'diamond') return 'text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30 border-cyan-200 dark:border-cyan-800';
        if (l === 'obsidian') return 'text-slate-900 bg-slate-200 dark:bg-slate-700 border-slate-400';
        if (l === 'pearl') return 'text-pink-300 bg-pink-50 dark:bg-pink-900/20 border-pink-200';
        if (l === 'amethyst') return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 border-purple-200';
        if (l === 'emerald') return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200';
        if (l === 'ruby') return 'text-red-600 bg-red-100 dark:bg-red-900/30 border-red-200';
        if (l === 'sapphire') return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 border-blue-200';
        if (l === 'gold') return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800';
        if (l === 'silver') return 'text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
        // Bronze default
        return 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800';
    };

    return (
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between shadow-sm">
            <button 
                onClick={onOpenLeaderboard}
                className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold transition-transform active:scale-95 hover:shadow-md ${getLeagueColor()}`}
            >
                <Trophy size={14} />
                <span className="uppercase tracking-wider">{league}</span>
            </button>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-amber-500">
                    <Zap size={18} className="fill-current" />
                    <span className="font-black text-sm">{xp}</span>
                </div>
            </div>
        </div>
    );
};

export default GamificationHeader;
