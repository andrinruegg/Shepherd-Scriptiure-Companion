import React, { useState, useEffect } from 'react';
import { MessageCircle, Book, Feather, Scroll, Brain, ArrowRight, Flame, Settings, Bell, Headphones, Heart, User, Users, Sparkles } from 'lucide-react';
import { AppView } from '../types.ts';
import { translations } from '../utils/translations.ts';
import { getDailyVerse } from '../services/dailyVerseService.ts';
import ShepherdLogo from './ShepherdLogo.tsx';

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

    const FEATURES = [
        { id: 'bible', label: t.bibleTitle, sub: t.bibleDesc, icon: Book, bg: 'from-emerald-500 to-teal-600', iconColor: 'text-white', delay: '0.1s' },
        { id: 'prayer', label: t.prayerTitle, sub: t.prayerDesc, icon: Feather, bg: 'from-blue-500 to-indigo-600', iconColor: 'text-white', delay: '0.2s' },
        { id: 'stories', label: t.storiesTitle, sub: t.storiesDesc, icon: Scroll, bg: 'from-amber-500 to-orange-600', iconColor: 'text-white', delay: '0.3s' },
        { id: 'quiz', label: t.quizTitle, sub: t.quizDesc, icon: Brain, bg: 'from-purple-500 to-violet-600', iconColor: 'text-white', delay: '0.4s' },
        { id: 'friends', label: t.friendsTitle || 'Friends', sub: t.friendsDesc || 'Connect', icon: Users, bg: 'from-pink-500 to-rose-600', iconColor: 'text-white', delay: '0.5s', action: onOpenFriends },
        { id: 'saved', label: t.favoritesTitle || 'Saved', sub: 'Collection', icon: Heart, bg: 'from-red-500 to-rose-600', iconColor: 'text-white', delay: '0.6s' }
    ];

    return (
        <div className="flex flex-col h-full overflow-y-auto">
            <header className="px-6 py-4 flex items-center justify-between glass-header">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20"><ShepherdLogo className="text-white" size={24} /></div>
                    <div><span className="font-serif-text font-bold text-lg text-slate-800 dark:text-white block leading-none">Shepherd</span>{dailyStreak > 0 && (<div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 mt-0.5"><Flame size={10} className="fill-current animate-pulse" /><span>{dailyStreak} {t.streak}</span></div>)}</div>
                </div>
                <div className="flex items-center gap-2"><button onClick={onOpenSanctuary} className="p-2.5 rounded-full hover:bg-black/5 text-slate-600 dark:text-slate-300 transition-all"><Headphones size={20} /></button><button onClick={onOpenNotifications} className="p-2.5 rounded-full hover:bg-black/5 text-slate-600 dark:text-slate-300 relative"><Bell size={20} />{notificationCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}</button><button onClick={onOpenSettings} className="p-2.5 rounded-full hover:bg-black/5 text-slate-600 dark:text-slate-300 transition-all"><Settings size={20} /></button><button onClick={onOpenProfile} className="ml-1 w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-white shadow-sm">{userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" /> : <User size={20} className="text-slate-400 m-auto mt-1" />}</button></div>
            </header>
            <div className="flex-1 p-6 max-w-5xl mx-auto w-full pb-24">
                <div className="mb-10 animate-fade-in mt-4"><h1 className="text-3xl md:text-5xl font-serif-text font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{displayName || 'Friend'}</span></h1><p className="text-slate-500 dark:text-slate-400 text-lg font-medium opacity-80">Find peace in His word today.</p></div>
                <div onClick={onOpenDailyVerse} className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-xl shadow-emerald-900/5 mb-12 group cursor-pointer animate-scale-in transform transition-transform hover:scale-[1.01] border border-emerald-50 dark:border-white/10"><div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20 dark:to-slate-900 opacity-100"></div><div className="relative p-8 md:p-10 z-10"><div className="flex justify-between items-start mb-6"><span className="bg-emerald-100 dark:bg-white/10 text-emerald-700 dark:text-emerald-300 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><Sparkles size={12} className="text-emerald-600" />{t.dailyVerse}</span></div><h3 className="text-xl md:text-3xl font-serif-text leading-relaxed font-medium mb-6 max-w-3xl">"{dailyVerse.text}"</h3><div className="flex items-center justify-between pt-4 border-t border-emerald-100"><span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm uppercase">{dailyVerse.reference}</span><div className="bg-emerald-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><ArrowRight size={20} /></div></div></div></div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1">{t.jumpTo}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <button onClick={() => onNavigate('chat')} className="col-span-1 md:col-span-2 p-1 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl group hover:shadow-2xl transition-all animate-slide-up"><div className="bg-white dark:bg-slate-900/90 h-full rounded-[20px] p-6 flex items-center justify-between backdrop-blur-xl transition-colors"><div className="flex items-center gap-5"><div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm"><MessageCircle size={28} /></div><div className="text-left"><h4 className="text-xl font-bold text-slate-900 dark:text-white">{t.chatTitle}</h4><p className="text-sm text-slate-500">{t.chatDesc}</p></div></div><div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors"><ArrowRight size={20} /></div></div></button>
                    {FEATURES.map((feature: any) => (<button key={feature.id} onClick={() => feature.action ? feature.action() : onNavigate(feature.id as AppView)} className="glass-panel p-5 rounded-3xl hover:-translate-y-1 transition-all group text-left flex flex-col justify-between h-40 animate-slide-up"><div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.bg} flex items-center justify-center shadow-md mb-3`}><feature.icon size={20} className={feature.iconColor} /></div><div><h4 className="text-base font-bold text-slate-800 dark:text-slate-100">{feature.label}</h4><p className="text-xs text-slate-500 opacity-80">{feature.sub}</p></div></button>))}
                </div>
            </div>
        </div>
    );
};

export default HomeView;