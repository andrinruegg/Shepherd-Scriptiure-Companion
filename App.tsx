
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from './services/supabase';
import { db } from './services/db';
import { sendMessageStream, generateChatTitle } from './services/geminiService';
import { updateStreak, getStreak } from './services/dailyVerseService';
import { Message, ChatSession, UserPreferences, PathNode, AppView, SavedItem, BibleHighlight, QuizSessionType } from './types';
import { v4 as uuidv4 } from 'uuid';
import { NODES as SHARED_NODES } from './data/nodes';

// Components
import Login from './components/Login';
import HomeView from './components/HomeView';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import SocialModal from './components/SocialModal';
import DailyVerseModal from './components/DailyVerseModal';
import VisualComposerModal from './components/VisualComposerModal';
import Sanctuary from './components/Sanctuary';
import BibleReader from './components/BibleReader';
import SavedCollection from './components/SavedCollection';
import RoleplayView from './components/StoriesTab';
import WorldExplorer from './components/WorldExplorer';
import GamificationHeader from './components/GamificationHeader';
import LearningPath from './components/LearningPath';
import LeaderboardView from './components/LeaderboardView';
import QuizMode from './components/QuizMode';
import SetupScreen from './components/SetupScreen';

import PasswordResetModal from './components/PasswordResetModal';
import PrayerList from './components/PrayerList';

// Icons
import { AlertCircle, X, Key, Sparkles, RefreshCw, Play, Trophy, Heart, Check, Lock, Star } from 'lucide-react';

const App: React.FC = () => {
    const { t, i18n } = useTranslation();

    // Auth State
    const [session, setSession] = useState<any>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

    // Splash Screen State (Restored to 6s duration)
    const [showSplash, setShowSplash] = useState(true);

    // App State
    const [currentView, setCurrentView] = useState<AppView>('home');
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'English');
    const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');

    // User Profile
    const [displayName, setDisplayName] = useState('');
    const [avatar, setAvatar] = useState('');
    const [shareId, setShareId] = useState('');
    const [dailyStreak, setDailyStreak] = useState(0);
    const [totalNotifications, setTotalNotifications] = useState(0);

    // Chat State
    const [chats, setChats] = useState<ChatSession[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasApiKey, setHasApiKey] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showKeyWarning, setShowKeyWarning] = useState(false);

    // Modals
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSocialOpen, setIsSocialOpen] = useState(false);
    const [socialTab, setSocialTab] = useState<'inbox' | 'friends' | 'add' | 'profile'>('inbox');
    const [isDailyVerseOpen, setIsDailyVerseOpen] = useState(false);
    const [isSanctuaryOpen, setIsSanctuaryOpen] = useState(false);
    const [composerData, setComposerData] = useState<{ text: string, ref?: string } | null>(null);

    // Review/Selection Mode Modal State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewNode, setReviewNode] = useState<PathNode | null>(null);

    // Gamification State
    const [xp, setXp] = useState(0);
    const [league, setLeague] = useState('Bronze');
    const [pathNodes, setPathNodes] = useState<PathNode[]>(SHARED_NODES);
    const [activePathNode, setActivePathNode] = useState<PathNode | null>(null);
    const [nodeProgress, setNodeProgress] = useState<Record<string, number>>({}); // Map: NodeID -> Step (0-5)
    const [readChapters, setReadChapters] = useState<Record<string, number[]>>({}); // Map: BookID -> Array of read chapters
    const [currentQuizSession, setCurrentQuizSession] = useState<QuizSessionType>('practice');
    const [currentPracticeNumber, setCurrentPracticeNumber] = useState<number>(1); // 1-4 for Practice, 5 for Exam

    // Bible/Prayer/Saved Data
    const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
    const [highlights, setHighlights] = useState<BibleHighlight[]>([]);

    // Preferences
    const [preferences, setPreferences] = useState<UserPreferences>({
        bibleTranslation: 'NIV',
        theme: isDarkMode ? 'dark' : 'light',
        language: language,

        displayName: '',
        avatar: '',
        bio: ''
    });

    const brandName = "Shepherd";

    // --- Initialization ---

    useEffect(() => {
        // Splash Screen Timer - Restored to 6000ms
        const timer = setTimeout(() => setShowSplash(false), 6000);

        // Check API Key
        const key = localStorage.getItem('shepherd_api_key') || process.env.API_KEY;
        if (key && key.length > 20) setHasApiKey(true);

        // Check Session
        if (!supabase) {
            setLoadingAuth(false);
            return () => clearTimeout(timer);
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoadingAuth(false);
            if (session) loadUserData(session.user.id);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                loadUserData(session.user.id);
                if (_event === 'PASSWORD_RECOVERY') setIsResetPasswordOpen(true);
            }
        });

        return () => {
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    // Enforce theme on mount and change
    useEffect(() => {
        if (isDarkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [isDarkMode]);

    const loadUserData = async (userId: string) => {
        try {
            const [profile, userChats, saved, userHighlights] = await Promise.all([
                db.social.getUserProfile(userId),
                db.getUserChats(),
                db.getSavedItems(),
                db.getHighlights()
            ]);

            if (profile) {
                setDisplayName(profile.display_name);
                setAvatar(profile.avatar || '');
                setShareId(profile.share_id || '');

                setPreferences(prev => ({
                    ...prev,
                    displayName: profile.display_name,
                    avatar: profile.avatar || '',
                    bio: profile.bio || ''
                }));

                setXp(profile.xp || 0);
                setLeague(profile.league || 'Bronze');

                setNodeProgress(profile.node_progress || {});
                setReadChapters(profile.read_chapters || {});
                setPathNodes(computeNodesState(profile.node_progress || {}));

                const streak = getStreak();
                setDailyStreak(streak);
                if (streak !== profile.streak) db.social.updateProfileStats(streak);
            } else {
                const newShareId = `USER-${userId.substring(0, 4).toUpperCase()}`;
                await db.social.upsertProfile(newShareId, 'Traveler');
                setShareId(newShareId);
            }

            setChats(userChats);
            setSavedItems(saved);
            setHighlights(userHighlights);

            const unread = await db.social.getTotalUnreadCount();
            setTotalNotifications(unread);

        } catch (e) {
            console.error("Error loading user data", e);
        }
    };

    const computeNodesState = (progressMap: Record<string, number>): PathNode[] => {
        let firstLockedFound = false;
        return SHARED_NODES.map(node => {
            const step = progressMap[node.id] || 0;
            if (step >= 5) {
                return { ...node, status: 'completed', current_step: 5 };
            } else if (!firstLockedFound) {
                firstLockedFound = true;
                return { ...node, status: 'active', current_step: step };
            } else {
                return { ...node, status: 'locked', current_step: 0 };
            }
        });
    };

    const syncGamificationToDb = async (x: number, progressMap: Record<string, number>) => {
        if (session) {
            const completedIds = Object.keys(progressMap).filter(k => progressMap[k] >= 5);
            await db.social.updateGamificationStats(x, completedIds, progressMap);
        }
    };

    // --- Handlers ---

    const handleUpdatePreference = (key: keyof UserPreferences, value: any) => {
        setPreferences(prev => ({ ...prev, [key]: value }));

        if (key === 'language') {
            setLanguage(value as string);
            localStorage.setItem('language', value as string);
            i18n.changeLanguage(value === 'Romanian' ? 'ro' : value === 'German' ? 'de' : 'en');
        }

        if (key === 'theme') {
            const isDark = value === 'dark';
            setIsDarkMode(isDark);
            localStorage.setItem('theme', value as string);
        }

        if (['displayName', 'avatar', 'bio'].includes(key) && session) {
            const currentName = key === 'displayName' ? value : preferences.displayName;
            const currentAvatar = key === 'avatar' ? value : preferences.avatar;
            const currentBio = key === 'bio' ? value : preferences.bio;
            db.social.upsertProfile(shareId, currentName, currentAvatar, currentBio);
            if (key === 'displayName') setDisplayName(value);
            if (key === 'avatar') setAvatar(value);
        }
    };

    const toggleDarkMode = () => {
        handleUpdatePreference('theme', isDarkMode ? 'light' : 'dark');
    };

    const handleNavigate = (view: AppView) => {
        setCurrentView(view);
        setIsSidebarOpen(false);
    };

    const handleOpenSocial = (tab: 'inbox' | 'friends' | 'add' | 'profile') => {
        setSocialTab(tab);
        setIsSocialOpen(true);
    };

    // Chat Handlers
    const handleSendMessage = async (text: string, hiddenContext?: string) => {
        const activeChat = chats.find(c => c.id === activeChatId);
        let chatId = activeChatId;
        let newChatMessages: Message[] = [];

        if (!chatId || !activeChat) {
            const title = await generateChatTitle(text, language);
            const newSession = await db.createChat(title);
            chatId = newSession.id;
            setChats(prev => [newSession, ...prev]);
            setActiveChatId(chatId);
        } else {
            newChatMessages = activeChat.messages;
        }

        const userMsg: Message = { id: uuidv4(), role: 'user', text, timestamp: new Date().toISOString(), hiddenContext };
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, messages: [...c.messages, userMsg] } : c));
        setIsLoading(true);
        await db.addMessage(chatId!, userMsg);

        let aiText = '';
        const aiMsgId = uuidv4();
        const aiPlaceholder: Message = { id: aiMsgId, role: 'model', text: '', timestamp: new Date().toISOString() };
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, messages: [...c.messages, aiPlaceholder] } : c));

        await sendMessageStream(
            [...newChatMessages, userMsg],
            text,
            hiddenContext,
            preferences.bibleTranslation,
            language,
            displayName,
            (chunk) => {
                aiText += chunk;
                setChats(prev => prev.map(c => c.id === chatId ? {
                    ...c,
                    messages: c.messages.map(m => m.id === aiMsgId ? { ...m, text: aiText } : m)
                } : c));
            },
            async () => {
                setIsLoading(false);
                await db.addMessage(chatId!, { ...aiPlaceholder, text: aiText });
            },
            (error) => {
                console.error(error);
                setIsLoading(false);
                setChats(prev => prev.map(c => c.id === chatId ? {
                    ...c,
                    messages: c.messages.map(m => m.id === aiMsgId ? { ...m, text: "I'm having trouble connecting right now.", isError: true } : m)
                } : c));
            }
        );
    };

    const createNewChat = async (setActive = true) => {
        // Generate Welcome Message
        const welcomeMessages = t('welcomeMessages', { returnObjects: true }) as string[];
        const randomMsg = Array.isArray(welcomeMessages) ? welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)] : "Welcome!";
        const welcomeText = randomMsg.replace('{name}', displayName || t('common.guest'));

        const initialMsg: Message = {
            id: uuidv4(),
            role: 'model',
            text: welcomeText,
            timestamp: new Date().toISOString()
        };

        const newChat = await db.createChat(t('common.newChat'), initialMsg);
        setChats(prev => [newChat, ...prev]);

        if (setActive) {
            setActiveChatId(newChat.id);
            setCurrentView('chat');
            if (window.innerWidth < 768) setIsSidebarOpen(false);
        }
    };

    const handleDeleteChat = async (id: string) => {
        // 1. Optimistic update
        const remainingChats = chats.filter(c => c.id !== id);
        setChats(remainingChats);

        // 2. Database call
        db.deleteChat(id).catch(e => console.error("Failed to delete chat", e));

        // 3. Switch active chat if the deleted one was active
        if (activeChatId === id) {
            if (remainingChats.length > 0) {
                setActiveChatId(remainingChats[0].id);
            } else {
                setActiveChatId(null);
            }
        }
    };

    const handleRenameChat = async (id: string, newTitle: string) => {
        await db.updateChatTitle(id, newTitle);
        setChats(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
    };

    const handleRegenerate = () => {
        const chat = chats.find(c => c.id === activeChatId);
        if (!chat) return;
        const lastUserMsgIndex = chat.messages.map(m => m.role).lastIndexOf('user');
        if (lastUserMsgIndex !== -1) {
            const lastUserMsg = chat.messages[lastUserMsgIndex];
            const newHistory = chat.messages.slice(0, lastUserMsgIndex);
            setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: newHistory } : c));
            handleSendMessage(lastUserMsg.text, lastUserMsg.hiddenContext);
        }
    };

    const handleSaveMessage = (msg: Message) => {
        const item: SavedItem = {
            id: uuidv4(),
            type: 'chat',
            content: msg.text,
            date: Date.now(),
            user_id: session?.user?.id
        };
        db.saveItem(item);
        setSavedItems(prev => [item, ...prev]);
    };

    // Gamification Handlers
    const handleQuizResult = (success: boolean) => {
        if (!activePathNode) return;

        // Fail Logic
        if (!success) {
            return;
        }

        // Success Logic
        let earnedXp = 0;

        // Calculate XP based on session type
        if (currentQuizSession === 'practice') {
            earnedXp = 15;
        } else if (currentQuizSession === 'exam') {
            earnedXp = 50;
        }

        const newXpVal = xp + earnedXp;
        setXp(newXpVal);

        // --- Progress Logic ---
        const currentStep = nodeProgress[activePathNode.id] || 0;
        let nextStep = currentStep;

        // Logic: Only advance step if the user successfully completed the NEXT required task.
        // E.g., if at step 0 (need Practice 1), and user does Practice 1 (which is index 1 in UI), advance to 1.
        // `currentPracticeNumber` holds what the user just clicked (1, 2, 3, 4, or 5).

        // Step Mapping:
        // Step 0: Needs Practice 1 (Index 1)
        // Step 1: Needs Practice 2 (Index 2)
        // Step 2: Needs Practice 3 (Index 3)
        // Step 3: Needs Practice 4 (Index 4)
        // Step 4: Needs Exam (Index 5)
        // Step 5: Completed.

        // If user did the required next step:
        if (currentPracticeNumber === currentStep + 1) {
            nextStep = Math.min(5, currentStep + 1);
        }
        // If user replayed an old step, do not increment 'nextStep' (stays same).

        const newProgress = { ...nodeProgress, [activePathNode.id]: nextStep };
        setNodeProgress(newProgress);
        setPathNodes(computeNodesState(newProgress));

        syncGamificationToDb(newXpVal, newProgress);
        setCurrentView('learn');
        setActivePathNode(null);
    };

    const handleNodeClick = (node: PathNode) => {
        // Open selection modal for any active or completed node
        // Locked nodes are handled in UI (usually disabled)
        if (node.status !== 'locked') {
            setReviewNode(node);
            setShowReviewModal(true);
        }
    };

    const handleStartSession = (node: PathNode, practiceIndex: number) => {
        // practiceIndex: 1, 2, 3, 4 for practices, 5 for Exam
        setActivePathNode(node);
        setCurrentPracticeNumber(practiceIndex);
        setCurrentQuizSession(practiceIndex === 5 ? 'exam' : 'practice');
        setShowReviewModal(false);
        setCurrentView('quiz');
    };

    const handleChapterRead = (bookId: string, chapter: number) => {
        setReadChapters(prev => {
            const current = prev[bookId] || [];
            if (current.includes(chapter)) return prev;
            return { ...prev, [bookId]: [...current, chapter] };
        });
    };

    const handleSelectApiKey = () => {
        if (window.aistudio) {
            window.aistudio.openSelectKey().then(() => setHasApiKey(true));
        } else {
            window.open('https://aistudio.google.com/api-keys', '_blank');
        }
    };

    const handleUpdateManualKey = (key: string) => {
        localStorage.setItem('shepherd_api_key', key);
        setHasApiKey(true);
    };

    const activeMessages = chats.find(c => c.id === activeChatId)?.messages || [];

    if (!supabase) return <SetupScreen />;

    return (
        <div className={`${isDarkMode ? 'dark' : ''} animate-fade-in ${session ? 'h-[100dvh] overflow-hidden' : 'min-h-[100dvh]'} relative`}>

            {/* RESTORED ANIMATED SPLASH SCREEN */}
            <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#070403] transition-all duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] ${!showSplash ? 'opacity-0 scale-110 pointer-events-none blur-2xl' : 'opacity-100 scale-100 blur-0'}`}>
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a110e] via-[#0c0705] to-[#070403] animate-aurora opacity-90"></div>
                <div className="absolute inset-0 opacity-60">
                    <div className="absolute top-[20%] left-[20%] w-1 h-1 bg-[#f5f1e8] rounded-full animate-twinkle"></div>
                    <div className="absolute top-[60%] left-[80%] w-1.5 h-1.5 bg-[#d2b48c] rounded-full animate-twinkle [animation-delay:1.5s]"></div>
                    <div className="absolute top-[30%] left-[70%] w-1 h-1 bg-[#f5f1e8] rounded-full animate-twinkle [animation-delay:0.5s]"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] border border-white/5 rounded-[100%] rotate-45 animate-pulse"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center mb-12">
                    <div className="relative flex items-center justify-center w-80 h-80 perspective-1000 preserve-3d">
                        <div className="absolute inset-0 w-full h-full border-[3px] border-[#7c4a32]/20 rounded-full shadow-[0_0_30px_rgba(124,74,50,0.1)]"></div>
                        <div className="absolute inset-0 w-full h-full border-[1px] border-[#7c4a32]/60 rounded-full animate-orbit-x"></div>

                        <svg className="absolute inset-0 w-full h-full animate-orbit-y rotate-12" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="48" fill="none" stroke="#d2b48c" strokeWidth="0.5" strokeDasharray="1, 8" className="animate-dash-move opacity-80" />
                        </svg>

                        <div className="absolute inset-4 border-[0.5px] border-[#f5f1e8]/40 rounded-full animate-orbit-rev"></div>

                        <div className="absolute w-24 h-24 bg-[#d2b48c]/10 blur-3xl rounded-full animate-pulse"></div>

                        <div className="relative z-20 animate-cross-pulse scale-125">
                            <svg width="100" height="120" viewBox="0 0 100 120" fill="none" className="drop-shadow-[0_0_35px_rgba(210,180,140,0.6)]">
                                <path d="M50 10V110M30 40H70" stroke="url(#crossGradient)" strokeWidth="6" strokeLinecap="round" />
                                <defs>
                                    <linearGradient id="crossGradient" x1="50" y1="0" x2="50" y2="120" gradientUnits="userSpaceOnUse">
                                        <stop offset="0%" stopColor="#f5f1e8" />
                                        <stop offset="50%" stopColor="#d2b48c" />
                                        <stop offset="100%" stopColor="#7c4a32" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="relative z-20 text-center flex flex-col items-center">
                    <h1 className="text-5xl md:text-8xl font-bold text-white font-serif-text tracking-tight drop-shadow-[0_0_30px_rgba(210,180,140,0.5)] flex gap-1 justify-center mb-4">
                        {brandName.split('').map((char, i) => (
                            <span key={i} className="animate-letter-reveal" style={{ animationDelay: `${0.4 + i * 0.1}s` }}>{char}</span>
                        ))}
                    </h1>
                    <div className="flex items-center justify-center gap-6 animate-tracking-expand opacity-0" style={{ animationDelay: '1.5s', animationFillMode: 'forwards' }}>
                        <div className="h-[1px] w-12 md:w-32 bg-gradient-to-r from-transparent via-[#d2b48c]/60 to-transparent"></div>
                        <p className="text-[#f5f1e8]/80 text-xs md:text-xl font-medium uppercase tracking-[0.4em] font-sans drop-shadow-md whitespace-nowrap">{t('chat.subtitle')}</p>
                        <div className="h-[1px] w-12 md:w-32 bg-gradient-to-r from-transparent via-[#d2b48c]/60 to-transparent"></div>
                    </div>
                </div>
            </div>

            {/* Overlays */}

            {/* Warning Overlay for API Key */}
            {showKeyWarning && (
                <div className="fixed top-6 inset-x-0 flex justify-center z-[300] px-4 pointer-events-none animate-pop-in">
                    <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-2xl p-4 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center gap-4 border border-white/50 dark:border-white/5 pointer-events-auto max-w-sm w-full">
                        <div className="bg-amber-700 p-2.5 rounded-full text-white shadow-lg shadow-amber-500/30">
                            <Key size={20} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-0.5">{t('chat.missingKeyTitle')}</h4>
                            <p className="text-[11px] font-bold text-stone-600 dark:text-stone-300 leading-tight">{t('chat.keyWarningSubtitle')}</p>
                        </div>
                        <button onClick={() => { setIsSettingsOpen(true); setShowKeyWarning(false); }} className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-amber-100 transition-colors shrink-0">
                            {t('common.fix')}
                        </button>
                        <button onClick={() => setShowKeyWarning(false)} className="p-1 text-stone-400 hover:text-stone-600 transition-colors shrink-0">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                preferences={preferences}
                onUpdatePreference={handleUpdatePreference}
                userEmail={session?.user?.email}
                onLogout={() => supabase?.auth.signOut()}
                hasApiKey={hasApiKey}
                onSelectApiKey={handleSelectApiKey}
                onUpdateManualKey={handleUpdateManualKey}
            />
            <SocialModal
                isOpen={isSocialOpen}
                onClose={() => setIsSocialOpen(false)}
                initialTab={socialTab}
                currentUserShareId={session ? (shareId || session.user?.user_metadata?.share_id || 'UNKNOWN') : ''}
                isDarkMode={isDarkMode}
                language={language}
                onUpdateNotifications={() => db.social.getTotalUnreadCount().then(setTotalNotifications)}
            />
            <DailyVerseModal
                isOpen={isDailyVerseOpen}
                onClose={() => setIsDailyVerseOpen(false)}
                isDarkMode={isDarkMode}
                language={language}
                onOpenComposer={(text, ref) => setComposerData({ text, ref })}
            />
            {composerData && (
                <VisualComposerModal
                    isOpen={!!composerData}
                    onClose={() => setComposerData(null)}
                    initialText={composerData.text}
                    initialReference={composerData.ref}
                    language={language}
                />
            )}
            <Sanctuary isOpen={isSanctuaryOpen} onClose={() => setIsSanctuaryOpen(false)} language={language} />
            <PasswordResetModal isOpen={isResetPasswordOpen} onClose={() => setIsResetPasswordOpen(false)} />

            {/* Enhanced Selection Modal */}
            {showReviewModal && reviewNode && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-700 animate-scale-in flex flex-col max-h-[85vh] overflow-hidden">
                        <div className="text-center mb-6 shrink-0">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-900/20 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-500 mb-3 shadow-inner">
                                <Trophy size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white font-serif-text">{t(`game.nodes.${reviewNode.id}`) || reviewNode.title}</h3>
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">{t('game.selectSession')}</p>
                        </div>

                        <div className="space-y-3 overflow-y-auto pr-1 pb-4 custom-scrollbar">
                            {/* Practices 1-4 */}
                            {[1, 2, 3, 4].map((num) => {
                                // Determine status
                                const currentStep = reviewNode.current_step || 0;
                                const isCompleted = currentStep >= num; // e.g. Step 1 means Practice 1 done.
                                const isUnlocked = currentStep >= num - 1; // e.g. Step 0 means P1 unlocked.
                                const isNext = currentStep === num - 1;

                                return (
                                    <button
                                        key={num}
                                        onClick={() => isUnlocked ? handleStartSession(reviewNode, num) : null}
                                        disabled={!isUnlocked}
                                        className={`
                                    w-full p-4 rounded-2xl flex items-center justify-between group transition-all border
                                    ${isCompleted
                                                ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 text-slate-700 dark:text-slate-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/20'
                                                : isNext
                                                    ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-900 ring-1 ring-indigo-500/20 shadow-md transform hover:scale-[1.02]'
                                                    : 'bg-slate-100 dark:bg-slate-800/50 border-transparent text-slate-400 cursor-not-allowed opacity-70'}
                                `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`
                                          w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm
                                          ${isCompleted ? 'bg-emerald-500 text-white' : isNext ? 'bg-indigo-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-500'}
                                      `}>
                                                {isCompleted ? <Check size={14} strokeWidth={3} /> : num}
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <span className="font-bold text-sm">{t('game.practiceSession', { num })}</span>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isCompleted ? 'text-emerald-500' : isNext ? 'text-indigo-500' : 'text-slate-400'}`}>
                                                    {isCompleted ? t('game.completed') : isNext ? t('game.start') : t('game.locked')}
                                                </span>
                                            </div>
                                        </div>
                                        {isNext && <Play size={16} className="text-indigo-500 fill-indigo-500" />}
                                        {!isUnlocked && <Lock size={14} />}
                                    </button>
                                );
                            })}

                            {/* Final Exam */}
                            {(() => {
                                const currentStep = reviewNode.current_step || 0;
                                const isUnlocked = currentStep >= 4; // Step 4 means P4 done, ready for exam.
                                const isCompleted = currentStep >= 5; // Step 5 means Exam done.

                                return (
                                    <button
                                        onClick={() => isUnlocked ? handleStartSession(reviewNode, 5) : null}
                                        disabled={!isUnlocked}
                                        className={`
                                    w-full p-4 rounded-2xl flex items-center justify-between group transition-all border mt-2
                                    ${isCompleted
                                                ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30 text-amber-900 dark:text-amber-100'
                                                : isUnlocked
                                                    ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 border-amber-300 dark:border-amber-700 shadow-lg'
                                                    : 'bg-slate-100 dark:bg-slate-800/50 border-transparent text-slate-400 cursor-not-allowed opacity-70'}
                                `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`
                                          w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm
                                          ${isCompleted ? 'bg-amber-500 text-white' : isUnlocked ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-300 dark:bg-slate-700 text-slate-500'}
                                      `}>
                                                <Star size={14} fill="currentColor" />
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <span className="font-bold text-sm">{t('game.finalExam')}</span>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isCompleted ? 'text-amber-600' : isUnlocked ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                                                    {isCompleted ? t('game.mastered') : isUnlocked ? '+50 XP' : t('game.locked')}
                                                </span>
                                            </div>
                                        </div>
                                        {isUnlocked && !isCompleted && <Play size={16} className="text-amber-500 fill-amber-500" />}
                                        {!isUnlocked && <Lock size={14} />}
                                    </button>
                                );
                            })()}
                        </div>

                        <button onClick={() => setShowReviewModal(false)} className="w-full mt-4 py-3 text-slate-400 font-bold hover:text-slate-600 dark:hover:text-slate-200 text-sm">
                            {t('common.cancel')}
                        </button>
                    </div>
                </div>
            )}

            {loadingAuth ? (
                <div className="fixed inset-0 bg-stone-950 flex items-center justify-center z-40">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-stone-400 text-sm animate-pulse">{t('common.loading')}</p>
                    </div>
                </div>
            ) : !session ? (
                <Login isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} language={language} onSetLanguage={(lang: string) => handleUpdatePreference('language', lang)} />
            ) : (
                <Suspense fallback={<div className="h-full w-full flex items-center justify-center bg-stone-900 text-white">{t('common.loading')}</div>}>
                    <div className={`flex h-full overflow-hidden relative z-0 transition-all duration-500`}>

                        {/* Conditional Rendering of Views */}
                        {currentView === 'home' && (
                            <div className="flex-1 w-full h-full">
                                <HomeView
                                    language={language} displayName={displayName} userAvatar={avatar} dailyStreak={dailyStreak}
                                    onNavigate={handleNavigate} onOpenSettings={() => setIsSettingsOpen(true)}
                                    onOpenNotifications={() => handleOpenSocial('inbox')} onOpenProfile={() => handleOpenSocial('profile')}
                                    onOpenFriends={() => handleOpenSocial('friends')} onOpenSanctuary={() => setIsSanctuaryOpen(true)}
                                    notificationCount={totalNotifications}
                                    onOpenDailyVerse={() => setIsDailyVerseOpen(true)}
                                />
                            </div>
                        )}

                        {currentView === 'learn' && (
                            <div className="flex-1 w-full h-full flex flex-col">
                                <GamificationHeader
                                    xp={xp}
                                    league={league}
                                    onOpenLeaderboard={() => setCurrentView('leaderboard')}
                                />
                                <LearningPath
                                    nodes={pathNodes}
                                    currentXP={xp}
                                    onNodeClick={handleNodeClick}
                                />
                                <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-t border-slate-200 dark:border-slate-800">
                                    <button onClick={() => setCurrentView('home')} className="w-full py-3 bg-slate-200 dark:bg-slate-700 rounded-2xl font-bold">{t('stories.back')}</button>
                                </div>
                            </div>
                        )}

                        {currentView === 'leaderboard' && (
                            <div className="flex-1 w-full h-full">
                                <LeaderboardView
                                    currentLeague={league}
                                    onBack={() => setCurrentView('learn')}
                                />
                            </div>
                        )}

                        {currentView === 'quiz' && (
                            <div className="flex-1 w-full h-full">
                                <QuizMode
                                    language={language}
                                    onMenuClick={() => {
                                        setActivePathNode(null);
                                        setCurrentView('learn');
                                    }}
                                    contextNode={activePathNode || undefined}
                                    sessionType={currentQuizSession}
                                    onComplete={handleQuizResult}
                                />
                            </div>
                        )}

                        {currentView === 'chat' && (
                            <div className="flex w-full h-full">
                                <Sidebar
                                    isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} chats={chats}
                                    activeChatId={activeChatId} onSelectChat={(id: string) => { setActiveChatId(id); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                                    onNewChat={() => createNewChat(true)} onDeleteChat={(id: string, e: React.MouseEvent) => handleDeleteChat(id)}
                                    onRenameChat={handleRenameChat} language={language} onNavigateHome={() => { setCurrentView('home'); setIsSidebarOpen(false); }}
                                />
                                <div className="flex-1 h-full w-full relative">
                                    <ChatInterface
                                        messages={activeMessages} isLoading={isLoading} onSendMessage={handleSendMessage}
                                        onMenuClick={() => setIsSidebarOpen(true)} onRegenerate={handleRegenerate}
                                        onDeleteCurrentChat={activeChatId ? (e: React.MouseEvent) => handleDeleteChat(activeChatId) : undefined}
                                        onNewChat={() => createNewChat(true)} language={language} userAvatar={avatar}
                                        onSaveMessage={handleSaveMessage} onOpenComposer={(text: string) => setComposerData({ text })}
                                        onOpenSettings={() => setIsSettingsOpen(true)}
                                        onNavigateHome={() => setCurrentView('home')}
                                        hasApiKey={hasApiKey}
                                        onSelectApiKey={handleSelectApiKey}
                                        onUpdateManualKey={handleUpdateManualKey}
                                    />
                                </div>
                            </div>
                        )}

                        {currentView === 'stories' && (
                            <div className="flex-1 w-full h-full">
                                <RoleplayView
                                    language={language}
                                    onMenuClick={() => setCurrentView('home')}
                                    hasApiKey={hasApiKey}
                                    onTriggerKeyWarning={() => setShowKeyWarning(true)}
                                />
                            </div>
                        )}

                        {currentView === 'explorer' && (
                            <div className="flex-1 w-full h-full">
                                <WorldExplorer language={language} onMenuClick={() => setCurrentView('home')} />
                            </div>
                        )}

                        {currentView === 'bible' && (
                            <div className="flex-1 w-full h-full">
                                <BibleReader
                                    language={language}
                                    onSaveItem={(item) => { db.saveItem(item); setSavedItems([item, ...savedItems]); }}
                                    onMenuClick={() => setCurrentView('home')}
                                    highlights={highlights}
                                    onAddHighlight={(h) => { db.addHighlight(h); setHighlights([...highlights, h]); }}
                                    onRemoveHighlight={(ref) => { db.deleteHighlight(ref); setHighlights(highlights.filter(h => h.ref !== ref)); }}
                                    onOpenComposer={(text, ref) => setComposerData({ text, ref })}
                                    hasApiKey={hasApiKey}
                                    onTriggerKeyWarning={() => setShowKeyWarning(true)}
                                    readChapters={readChapters}
                                    onChapterRead={handleChapterRead}
                                />
                            </div>
                        )}

                        {currentView === 'saved' && (
                            <div className="flex-1 w-full h-full">
                                <SavedCollection
                                    savedItems={savedItems}
                                    onRemoveItem={(id) => { db.deleteSavedItem(id); setSavedItems(savedItems.filter(i => i.id !== id)); }}
                                    language={language}
                                    onMenuClick={() => setCurrentView('home')}
                                    onOpenComposer={(text, ref) => setComposerData({ text, ref })}
                                />
                            </div>
                        )}

                        {currentView === 'prayer' && (
                            <div className="flex-1 w-full h-full">
                                <PrayerList
                                    savedItems={savedItems}
                                    onSaveItem={(item) => { db.saveItem(item); setSavedItems([item, ...savedItems]); }}
                                    onUpdateItem={(item) => { db.updateSavedItem(item.id, item); setSavedItems(savedItems.map(i => i.id === item.id ? item : i)); }}
                                    onRemoveItem={(id) => { db.deleteSavedItem(id); setSavedItems(savedItems.filter(i => i.id !== id)); }}
                                    language={language}
                                    onMenuClick={() => setCurrentView('home')}
                                    currentUserId={session?.user?.id}
                                    userName={displayName}
                                    userAvatar={avatar}
                                />
                            </div>
                        )}

                    </div>
                </Suspense>
            )}
        </div>
    );
};

export default App;
