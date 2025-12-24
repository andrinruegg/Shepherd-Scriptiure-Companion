
import React, { useState, useEffect } from 'react';
import { MessageCircle, Book, Feather, Brain, ArrowRight, Flame, Settings, Bell, Headphones, Heart, User, Users, Sparkles, MessageSquare, Scroll, Compass } from 'lucide-react';
import { AppView } from '../types';
import { translations } from '../utils/translations';
import { getDailyVerse } from '../services/dailyVerseService';
import ShepherdLogo from './ShepherdLogo';

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
    const t = translations[language]?.home || translations['English'].home;
    const tSidebar = translations[language]?.sidebar || translations['English'].sidebar; 
    const dailyVerse = getDailyVerse(language);
    
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting(t.goodMorning);
        else if (hour < 18) setGreeting(t.goodAfternoon);
        else setGreeting(t.goodEvening);
    }, [language, t]);

    const TOOLS_GRID = [
        { id: 'bible', label: t.bibleTitle, sub: t.bibleDesc, icon: Book, bg: 'from-emerald-500 to-teal-600', iconColor: 'text-white', delay: '0.2s' },
        { id: 'prayer', label: t.prayerTitle, sub: t.prayerDesc, icon: Feather, bg: 'from-blue-500 to-indigo-600', iconColor: 'text-white', delay: '0.25s' },
        { id: 'quiz', label: t.quizTitle, sub: t.quizDesc, icon: Brain, bg: 'from-purple-500 to-violet-600', iconColor: 'text-white', delay: '0.3s' },
        { id: 'friends', label: t.friendsTitle || 'Friends', sub: t.friendsDesc || 'Connect', icon: Users, bg: 'from-pink-500 to-rose-600', iconColor: 'text-white', delay: '0.35s', action: onOpenFriends },
        { id: 'saved', label: t.favoritesTitle || 'Favorites', sub: t.favoritesDesc || 'Saved Verses', icon: Heart, bg: 'from-rose-500 to-pink-600', iconColor: 'text-white', delay: '0.4s' }
    ];

    return (
        <div className="flex flex-col h-full overflow-y-auto bg-transparent transition-colors">
            {/* Soft Ambient Blobs for Home View Light Mode */}
            <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-100/30 blur-[120px] rounded-full pointer-events-none z-0 dark:hidden"></div>
            <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-50/30 blur-[120px] rounded-full pointer-events-none z-0 dark:hidden"></div>

            <header className="px-6 py-5 flex items-center justify-between glass-header sticky top-0 z-50 bg-white/60 dark:bg-slate-950/70 backdrop-blur-2xl border-b border-white/50 dark:border-white/5">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transform hover:scale-105 transition-transform">
                        <ShepherdLogo className="text-white" size={24} />
                    </div>
                    <div>
                        <span className="font-serif-text font-bold text-lg text-slate-900 dark:text-white block leading-none">Shepherd</span>
                        {dailyStreak > 0 && (
                            <div className="flex items-center gap-1 text-[10px] font-black text-amber-500 mt-1 uppercase tracking-wider">
                                <Flame size={10} className="fill-current animate-pulse" />
                                <span>{dailyStreak} {t.streak}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1.5 md:gap-2">
                    <button onClick={onOpenSanctuary} className="p-2.5 rounded-full hover:bg-white/80 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-all" title={tSidebar.tooltips?.sanctuary}>
                        <Headphones size={20} />
                    </button>
                    <button onClick={onOpenNotifications} className="p-2.5 rounded-full hover:bg-white/80 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-all relative" title={tSidebar.tooltips?.inbox}>
                        <Bell size={20} />
                        {notificationCount > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></span>}
                    </button>
                    <button onClick={onOpenSettings} className="p-2.5 rounded-full hover:bg-white/80 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-all" title={tSidebar.tooltips?.settings}>
                        <Settings size={20} />
                    </button>
                    <button onClick={onOpenProfile} className="ml-1 w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border-2 border-white dark:border-slate-700 shadow-md transform hover:scale-110 transition-transform" title={tSidebar.tooltips?.profile}>
                        {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" /> : <User size={22} className="text-slate-400 m-auto mt-1.5" />}
                    </button>
                </div>
            </header>

            <div className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full pb-28 relative z-10">
                <div className="mb-12 animate-fade-in mt-2">
                    <h1 className="text-4xl md:text-6xl font-serif-text font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                        {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500">{displayName || 'Friend'}</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium opacity-80 leading-relaxed max-w-2xl">
                        {t.subtitle}
                    </p>
                </div>

                {/* FEATURED: VERSE OF THE DAY */}
                <div 
                    onClick={onOpenDailyVerse}
                    className="relative overflow-hidden rounded-[3rem] bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-[0_30px_70px_-20px_rgba(0,0,0,0.06)] dark:shadow-none mb-16 group cursor-pointer animate-scale-in transform transition-all hover:scale-[1.01] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] border border-white dark:border-white/10"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-emerald-50/30 dark:from-emerald-900/20 dark:via-slate-900 dark:to-slate-900 opacity-100"></div>
                    <div className="relative p-10 md:p-14 z-10">
                        <div className="flex justify-between items-start mb-10">
                            <span className="bg-emerald-500 text-white dark:bg-white/10 dark:text-emerald-300 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 dark:shadow-none border border-transparent dark:border-white/10 flex items-center gap-2">
                                <Sparkles size={12} fill="white" />
                                {t.dailyVerse}
                            </span>
                        </div>
                        <h3 className="text-2xl md:text-4xl font-serif-text leading-snug font-medium mb-10 max-w-4xl text-slate-800 dark:text-emerald-50 italic">
                            "{dailyVerse.text}"
                        </h3>
                        <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-white/10">
                            <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs md:text-sm tracking-[0.3em] uppercase">{dailyVerse.reference}</span>
                            <div className="bg-emerald-600 dark:bg-white text-white dark:text-slate-900 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                                <ArrowRight size={24} strokeWidth={3} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* LIBRARY SECTION */}
                <div className="flex items-center gap-6 mb-10 ml-1 animate-slide-up">
                    <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">{t.jumpTo}</h3>
                    <div className="h-px bg-slate-200/50 dark:bg-slate-800 flex-1"></div>
                </div>

                {/* AI TOOLS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <button 
                        onClick={() => onNavigate('chat')}
                        className="p-1 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-indigo-500/10 group hover:shadow-2xl transition-all animate-slide-up"
                    >
                        <div className="bg-white/95 dark:bg-slate-900/95 h-full rounded-[2.1rem] p-8 flex items-center justify-between backdrop-blur-2xl transition-all group-hover:bg-white/80 dark:group-hover:bg-slate-800">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                    <MessageCircle size={32} />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t.chatTitle}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t.chatDesc}</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full border-2 border-indigo-100 dark:border-slate-800 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                <ArrowRight size={20} />
                            </div>
                        </div>
                    </button>

                    <button 
                        onClick={() => onNavigate('stories')}
                        className="p-1 rounded-[2.5rem] bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 shadow-xl shadow-amber-500/10 group hover:shadow-2xl transition-all animate-slide-up"
                    >
                        <div className="bg-white/95 dark:bg-slate-900/95 h-full rounded-[2.1rem] p-8 flex items-center justify-between backdrop-blur-2xl transition-all group-hover:bg-white/80 dark:group-hover:bg-slate-800">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                    <Scroll size={32} className="animate-pulse" />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t.roleplayTitle}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t.roleplayDesc}</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full border-2 border-amber-100 dark:border-slate-800 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                <ArrowRight size={20} />
                            </div>
                        </div>
                    </button>
                </div>

                {/* LIBRARY TOOLS GRID */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                    {TOOLS_GRID.map((feature: any) => (
                        <button 
                            key={feature.id}
                            onClick={() => feature.action ? feature.action() : onNavigate(feature.id as AppView)}
                            className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] hover:-translate-y-2 transition-all group text-left flex flex-col justify-between h-52 animate-slide-up border border-white dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-500/30 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.04)] hover:shadow-2xl"
                            style={{ animationDelay: feature.delay }}
                        >
                            <div className={`w-14 h-14 rounded-3xl bg-gradient-to-br ${feature.bg} flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform mb-4`}>
                                <feature.icon size={28} className={feature.iconColor} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight mb-1">{feature.label}</h4>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] line-clamp-2">{feature.sub}</p>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-24 mb-12 flex justify-center">
                    <button 
                        onClick={onOpenFeedback}
                        className="flex items-center gap-3 px-10 py-4 bg-white/50 dark:bg-slate-900 border border-white dark:border-slate-800 rounded-full text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 transition-all text-xs font-black uppercase tracking-[0.4em] shadow-sm hover:shadow-xl backdrop-blur-xl"
                    >
                        <MessageSquare size={16} strokeWidth={3} />
                        {t.feedback}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomeView;
