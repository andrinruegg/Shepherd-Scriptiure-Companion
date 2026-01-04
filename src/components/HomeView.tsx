
import React, { useState, useEffect } from 'react';
import { MessageCircle, Book, Feather, Brain, ArrowRight, Flame, Settings, Bell, Headphones, Heart, User, Users, Sparkles, MessageSquare, Scroll } from 'lucide-react';
import { AppView } from '../types';
import { getDailyVerse } from '../services/dailyVerseService';
import ShepherdLogo from './ShepherdLogo';
import { useTranslation } from 'react-i18next';

interface HomeViewProps {
    language: string;
    displayName: string;
    userAvatar?: string;
    dailyStreak: number;
    onNavigate: (view: AppView) => void;
    onOpenSettings: () => void;
    onOpenNotifications: () => void;
    onOpenProfile: () => void;
    onOpenFriends: () => void;
    onOpenSanctuary: () => void;
    onOpenFeedback: () => void; 
    notificationCount: number;
    onOpenDailyVerse: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ 
    language, 
    displayName,
    userAvatar,
    dailyStreak, 
    onNavigate,
    onOpenSettings,
    onOpenNotifications,
    onOpenProfile,
    onOpenFriends,
    onOpenSanctuary,
    onOpenFeedback,
    notificationCount,
    onOpenDailyVerse
}) => {
    const { t } = useTranslation();
    const dailyVerse = getDailyVerse(language);
    
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting(t('home.goodMorning'));
        else if (hour < 18) setGreeting(t('home.goodAfternoon'));
        else setGreeting(t('home.goodEvening'));
    }, [language, t]);

    const TOOLS_GRID = [
        { id: 'bible', label: t('home.bibleTitle'), sub: t('home.bibleDesc'), icon: Book, bg: 'from-emerald-500 to-teal-600', iconColor: 'text-white', delay: '0.2s' },
        { id: 'prayer', label: t('home.prayerTitle'), sub: t('home.prayerDesc'), icon: Feather, bg: 'from-blue-500 to-indigo-600', iconColor: 'text-white', delay: '0.25s' },
        { id: 'quiz', label: t('home.quizTitle'), sub: t('home.quizDesc'), icon: Brain, bg: 'from-purple-500 to-violet-600', iconColor: 'text-white', delay: '0.3s' },
        { id: 'friends', label: t('home.friendsTitle'), sub: t('home.friendsDesc'), icon: Users, bg: 'from-pink-500 to-rose-600', iconColor: 'text-white', delay: '0.35s', action: onOpenFriends },
        { id: 'saved', label: t('home.favoritesTitle'), sub: t('home.favoritesDesc'), icon: Heart, bg: 'from-rose-500 to-pink-600', iconColor: 'text-white', delay: '0.4s' }
    ];

    return (
        <div className="flex flex-col h-full overflow-y-auto bg-transparent transition-colors">
            <header className="px-4 md:px-6 py-4 md:py-5 flex items-center justify-between glass-header sticky top-0 z-50 bg-white/60 dark:bg-slate-950/70 backdrop-blur-2xl border-b border-white/50 dark:border-white/5 pt-safe">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg">
                        <ShepherdLogo className="text-white" size={24} />
                    </div>
                    <div>
                        <span className="font-serif-text font-bold text-base md:text-lg text-slate-900 dark:text-white block leading-none">{t('common.shepherd')}</span>
                        {dailyStreak > 0 && (
                            <div className="flex items-center gap-1 text-[9px] md:text-[10px] font-black text-amber-500 mt-1 uppercase tracking-wider">
                                <Flame size={10} className="fill-current animate-pulse" />
                                <span>{dailyStreak} {t('home.streak')}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 md:gap-2">
                    <button onClick={onOpenSanctuary} className="p-2 md:p-2.5 rounded-full hover:bg-white/80 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400" title={t('sidebar.tooltips.sanctuary')}>
                        <Headphones size={20} />
                    </button>
                    <button onClick={onOpenNotifications} className="p-2 md:p-2.5 rounded-full hover:bg-white/80 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 relative" title={t('sidebar.tooltips.inbox')}>
                        <Bell size={20} />
                        {notificationCount > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>}
                    </button>
                    <button onClick={onOpenSettings} className="p-2 md:p-2.5 rounded-full hover:bg-white/80 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400" title={t('sidebar.tooltips.settings')}>
                        <Settings size={20} />
                    </button>
                    <button onClick={onOpenProfile} className="ml-1 w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border-2 border-white dark:border-slate-700 shadow-md transform hover:scale-110 transition-transform">
                        {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" /> : <User size={22} className="text-slate-400 m-auto mt-1 md:mt-1.5" />}
                    </button>
                </div>
            </header>

            <div className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full pb-28 relative z-10">
                <div className="mb-8 md:mb-12 animate-fade-in">
                    <h1 className="text-3xl md:text-6xl font-serif-text font-bold text-slate-900 dark:text-white mb-3 md:mb-4 tracking-tight">
                        {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500">{displayName || t('common.guest')}</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base md:text-xl font-medium opacity-80 leading-relaxed max-w-2xl">
                        {t('home.subtitle')}
                    </p>
                </div>

                <div 
                    onClick={onOpenDailyVerse}
                    className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-xl mb-12 md:mb-16 group cursor-pointer animate-scale-in border border-white dark:border-white/10"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-emerald-50/30 dark:from-emerald-900/10 dark:via-slate-900 dark:to-slate-900 opacity-100"></div>
                    <div className="relative p-8 md:p-14 z-10">
                        <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit mb-6">
                            <Sparkles size={12} fill="white" />
                            {t('home.dailyVerse')}
                        </span>
                        <h3 className="text-xl md:text-4xl font-serif-text leading-snug font-medium mb-8 max-w-4xl text-slate-800 dark:text-emerald-50 italic">
                            "{dailyVerse.text}"
                        </h3>
                        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/10">
                            <span className="font-black text-emerald-600 dark:text-emerald-400 text-[10px] md:text-sm tracking-[0.3em] uppercase">{dailyVerse.reference}</span>
                            <div className="bg-emerald-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <ArrowRight size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <button onClick={() => onNavigate('chat')} className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] shadow-md border dark:border-white/10 flex items-center justify-between hover:shadow-xl transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center"><MessageCircle size={28} /></div>
                            <div className="text-left"><h4 className="font-bold text-slate-900 dark:text-white">{t('home.chatTitle')}</h4><p className="text-xs text-slate-500">{t('home.chatDesc')}</p></div>
                        </div>
                        <ArrowRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </button>
                    <button onClick={() => onNavigate('stories')} className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] shadow-md border dark:border-white/10 flex items-center justify-between hover:shadow-xl transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center"><Scroll size={28} /></div>
                            <div className="text-left"><h4 className="font-bold text-slate-900 dark:text-white">{t('home.roleplayTitle')}</h4><p className="text-xs text-slate-500">{t('home.roleplayDesc')}</p></div>
                        </div>
                        <ArrowRight className="text-slate-300 group-hover:text-amber-500 transition-colors" />
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {TOOLS_GRID.map((tool) => (
                        <button key={tool.id} onClick={() => tool.action ? tool.action() : onNavigate(tool.id as AppView)} className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border dark:border-white/10 hover:-translate-y-1 transition-all group text-left h-44 flex flex-col justify-between shadow-sm hover:shadow-lg">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.bg} flex items-center justify-center shadow-md`}><tool.icon className="text-white" size={24} /></div>
                            <div><h4 className="text-sm font-bold text-slate-800 dark:text-white">{tool.label}</h4><p className="text-[10px] text-slate-400 uppercase tracking-wider font-black">{tool.sub}</p></div>
                        </button>
                    ))}
                </div>

                <div className="mt-16 flex justify-center">
                    <button onClick={onOpenFeedback} className="flex items-center gap-3 px-8 py-3 bg-white/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-400 dark:text-slate-500 hover:text-indigo-600 transition-all text-[10px] font-black uppercase tracking-[0.4em]">
                        <MessageSquare size={16} />
                        {t('home.feedback')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomeView;
