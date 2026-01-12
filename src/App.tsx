
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import SetupScreen from './components/SetupScreen';
import SettingsModal from './components/SettingsModal';
import DailyVerseModal from './components/DailyVerseModal';
import BibleReader from './components/BibleReader';
import SavedCollection from './components/SavedCollection';
import PrayerList from './components/PrayerList';
import Sanctuary from './components/Sanctuary';
import WinterOverlay from './components/WinterOverlay';
import PrincessOverlay from './components/PrincessOverlay';
import SocialModal from './components/SocialModal';
import QuizMode from './components/QuizMode';
import RoleplayView from './components/StoriesTab'; 
import PasswordResetModal from './components/PasswordResetModal';
import VisualComposerModal from './components/VisualComposerModal'; 
import HomeView from './components/HomeView'; 
import FeedbackModal from './components/FeedbackModal'; 
import WorldExplorer from './components/WorldExplorer';
import { Message, ChatSession, UserPreferences, AppView, SavedItem, BibleHighlight, SocialTab } from './types';
import { v4 as uuidv4 } from 'uuid';
import { sendMessageStream, generateChatTitle } from './services/geminiService';
import { supabase } from './services/supabase';
import { db } from './services/db';
import { updateStreak } from './services/dailyVerseService';

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [session, setSession] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  const [currentView, setCurrentView] = useState<AppView>('home');
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDailyVerseOpen, setIsDailyVerseOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false); 
  const [isSocialOpen, setIsSocialOpen] = useState(false); 
  const [socialInitialTab, setSocialInitialTab] = useState<SocialTab>('inbox');
  const [isSanctuaryOpen, setIsSanctuaryOpen] = useState(false);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
  
  const [composerData, setComposerData] = useState<{text: string, reference?: string} | null>(null);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [shareId, setShareId] = useState<string>('');
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false); 

  const bibleTranslation = 'NIV';

  const [language, setLanguage] = useState<string>(() => localStorage.getItem('language') || 'English');
  const [displayName, setDisplayName] = useState<string>(() => localStorage.getItem('displayName') || '');
  const [avatar, setAvatar] = useState<string | undefined>(() => localStorage.getItem('userAvatar') || undefined);
  const [bio, setBio] = useState<string | undefined>(() => localStorage.getItem('userBio') || undefined);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') return true;
    if (savedTheme === 'light') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isWinterMode, setIsWinterMode] = useState(() => localStorage.getItem('winterMode') === 'true');
  const [isWinterSnow, setIsWinterSnow] = useState(() => localStorage.getItem('winterSnow') !== 'false');
  const [isWinterLights, setIsWinterLights] = useState(() => localStorage.getItem('winterLights') !== 'false');
  const [isWinterIcicles, setIsWinterIcicles] = useState(() => localStorage.getItem('winterIcicles') !== 'false');

  const [isPrincessMode, setIsPrincessMode] = useState(() => localStorage.getItem('princessMode') === 'true');
  const [isPrincessHearts, setIsPrincessHearts] = useState(() => localStorage.getItem('princessHearts') !== 'false');
  const [isPrincessSparkles, setIsPrincessSparkles] = useState(() => localStorage.getItem('princessSparkles') !== 'false');

  const verifyKey = async () => {
    try {
        const manualKey = localStorage.getItem('shepherd_api_key');
        if (manualKey && manualKey.trim().length > 10) {
            setHasApiKey(true);
            return true;
        }
    } catch (e) {
        console.warn("Could not read from localStorage", e);
    }

    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(hasKey);
      return hasKey;
    }
    
    setHasApiKey(false);
    return false;
  };

  useEffect(() => {
    verifyKey();
    const interval = setInterval(verifyKey, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectApiKey = async () => {
    setIsSettingsOpen(true);
  };

  const handleUpdateManualKey = (key: string) => {
    try {
        if (key.trim()) {
          localStorage.setItem('shepherd_api_key', key.trim());
          setHasApiKey(true);
        } else {
          localStorage.removeItem('shepherd_api_key');
          verifyKey();
        }
    } catch (e) {
        console.error("Failed to save API key", e);
        if (key.trim()) setHasApiKey(true);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
      const langCodeMap: Record<string, string> = { 
          'English': 'en', 
          'German': 'de', 
          'Romanian': 'ro'
      };
      const code = langCodeMap[language] || 'en';
      if (i18n.language !== code) {
          i18n.changeLanguage(code);
      }
  }, [language, i18n]);

  useEffect(() => {
    if (isPrincessMode) {
      document.body.classList.add('princess-mode');
      document.documentElement.classList.add('princess-mode');
    } else {
      document.body.classList.remove('princess-mode');
      document.documentElement.classList.remove('princess-mode');
    }
  }, [isPrincessMode]);

  useEffect(() => {
    const streak = updateStreak();
    setDailyStreak(streak);
    if (session?.user) {
      db.social.updateProfileStats(streak).catch(console.error);
    }
  }, [session]);

  useEffect(() => {
    const initSession = async () => {
      if (!session?.user) return;
      try {
        let existingProfile = null;
        try {
          existingProfile = await db.social.getUserProfile(session.user.id);
        } catch (err) { console.warn(err); }
        
        if (existingProfile && existingProfile.share_id) {
          setShareId(existingProfile.share_id);
          if (existingProfile.display_name) setDisplayName(existingProfile.display_name);
          if (existingProfile.avatar) setAvatar(existingProfile.avatar);
          if (existingProfile.bio) setBio(existingProfile.bio);
        }
        db.social.heartbeat().catch(e => console.warn(e));
      } catch (e) { console.error(e); }

      const meta = session.user.user_metadata || {};
      if (!displayName && meta.full_name) setDisplayName(meta.full_name);
      if (meta.language) setLanguage(meta.language);
      if (meta.theme) setIsDarkMode(meta.theme === 'dark');
    };

    if (session) {
      initSession();
      loadCloudData();
      loadChats(); 
      loadSocialNotifications();
      const pollInterval = setInterval(() => {
        loadSocialNotifications();
        db.social.heartbeat().catch(() => {});
      }, 10000);
      return () => clearInterval(pollInterval);
    } else {
      setChats([]);
      setActiveChatId(null);
      setSavedItems([]);
      setHighlights([]);
    }
  }, [session]);

  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [highlights, setHighlights] = useState<BibleHighlight[]>([]);

  const loadCloudData = async () => {
    try {
      const [cloudSaved, cloudHighlights] = await Promise.all([
        db.getSavedItems(),
        db.getHighlights()
      ]);
      setSavedItems(cloudSaved);
      setHighlights(cloudHighlights);
    } catch (e) { console.error(e); }
  };
  
  const loadSocialNotifications = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    try {
      const [requests, unreadCount] = await Promise.all([
        db.social.getIncomingRequests(),
        db.social.getTotalUnreadCount()
      ]);
      setTotalNotifications(requests.length + unreadCount);
    } catch (e: any) { console.warn(e); }
  };

  const handleOpenSocial = (tab: SocialTab) => {
    setSocialInitialTab(tab);
    setIsSocialOpen(true);
    loadSocialNotifications();
  };

  const handleSaveItem = async (item: SavedItem) => {
    const exists = savedItems.some(i => i.content === item.content && i.type === item.type);
    if (exists) return;
    setSavedItems(prev => [item, ...prev]);
    try { await db.saveItem(item); } catch (e) { console.error(e); }
  };

  const handleSaveMessage = (message: Message) => {
    if (!message.text) return;
    const item: SavedItem = {
      id: uuidv4(),
      type: 'chat',
      content: message.text,
      date: Date.now(),
      metadata: { role: message.role }
    };
    handleSaveItem(item);
  };

  const handleUpdateItem = async (updatedItem: SavedItem) => {
    setSavedItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
    try { await db.updateSavedItem(updatedItem.id, updatedItem); } catch(e) { console.error(e); }
  };

  const handleRemoveSavedItem = async (id: string) => {
    setSavedItems(prev => prev.filter(i => i.id !== id));
    try { await db.deleteSavedItem(id); } catch (e) { console.error(e); }
  };

  const handleAddHighlight = async (highlight: BibleHighlight) => {
    setHighlights(prev => [...prev.filter(h => h.ref !== highlight.ref), highlight]);
    try {
      await db.deleteHighlight(highlight.ref);
      await db.addHighlight(highlight);
    } catch (e) { console.error(e); }
  };

  const handleRemoveHighlight = async (ref: string) => {
    setHighlights(prev => prev.filter(h => h.ref !== ref));
    try { await db.deleteHighlight(ref); } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (isPrincessMode) {
      document.documentElement.classList.remove('dark');
      return;
    }
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode, isPrincessMode]);

  const toggleDarkMode = () => {
    if (isPrincessMode) return; 
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    updateCloudPreference('theme', newMode ? 'dark' : 'light');
  };

  const updateCloudPreference = async (key: string, value: string | boolean) => {
    const client = supabase; 
    if (!session || !client) return;
    try {
      const val = typeof value === 'boolean' ? String(value) : value;
      await client.auth.updateUser({ data: { [key]: val } });
    } catch (e) { console.error(e); }
  };

  const handleUpdatePreference = (key: keyof UserPreferences, value: string | boolean) => {
    if (key === 'theme') {
      const isDark = value === 'dark';
      setIsDarkMode(isDark);
      updateCloudPreference('theme', value as string);
      localStorage.setItem('theme', isDark ? 'dark' : 'light');

      if (isDark && isPrincessMode) {
        setIsPrincessMode(false);
        localStorage.setItem('princessMode', 'false');
        updateCloudPreference('princessMode', false);
      }
    } else if (key === 'winterTheme') {
      const isWinter = value === true;
      setIsWinterMode(isWinter);
      localStorage.setItem('winterMode', String(isWinter));
      updateCloudPreference('winterMode', isWinter);
      
      if (isWinter && isPrincessMode) {
        setIsPrincessMode(false);
        localStorage.setItem('princessMode', 'false');
        updateCloudPreference('princessMode', false);
      }
    } else if (key === 'winterSnow') {
      setIsWinterSnow(value as boolean);
      localStorage.setItem('winterSnow', String(value));
    } else if (key === 'winterLights') {
      setIsWinterLights(value as boolean);
      localStorage.setItem('winterLights', String(value));
    } else if (key === 'winterIcicles') {
      setIsWinterIcicles(value as boolean);
      localStorage.setItem('winterIcicles', String(value));
    } else if (key === 'princessTheme') {
      const isPrincess = value === true;
      
      if (isPrincess && isDarkMode) {
          setIsDarkMode(false);
          localStorage.setItem('theme', 'light');
          updateCloudPreference('theme', 'light');
      }

      setIsPrincessMode(isPrincess);
      localStorage.setItem('princessMode', String(isPrincess));
      updateCloudPreference('princessMode', isPrincess);

      if (isPrincess && isWinterMode) {
          setIsWinterMode(false);
          localStorage.setItem('winterMode', 'false');
          updateCloudPreference('winterMode', false);
      }
    } else if (key === 'princessHearts') {
      setIsPrincessHearts(value as boolean);
      localStorage.setItem('princessHearts', String(value));
    } else if (key === 'princessSparkles') {
      setIsPrincessSparkles(value as boolean);
      localStorage.setItem('princessSparkles', String(value));
    } else if (key === 'language') {
      setLanguage(value as string);
      localStorage.setItem('language', value as string);
      updateCloudPreference('language', value as string);
    } else if (key === 'displayName') {
      setDisplayName(value as string);
      localStorage.setItem('displayName', value as string);
      updateCloudPreference('full_name', value as string);
      db.social.upsertProfile(shareId, value as string, avatar, bio);
    } else if (key === 'avatar') {
      setAvatar(value as string);
      localStorage.setItem('userAvatar', value as string);
      updateCloudPreference('avatar', value as string);
      db.social.upsertProfile(shareId, displayName, value as string, bio);
    } else if (key === 'bio') {
      setBio(value as string);
      localStorage.setItem('userBio', value as string);
      updateCloudPreference('bio', value as string);
      db.social.upsertProfile(shareId, displayName, avatar, value as string);
    }
  };

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingAuth(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'PASSWORD_RECOVERY') setIsPasswordResetOpen(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadChats = async () => {
    try {
      const userChats = await db.getUserChats();
      setChats(userChats);
      if (userChats.length > 0 && !activeChatId) {
        setActiveChatId(userChats[0].id);
      }
    } catch (error) { 
      console.error(error);
      createNewChat(false);
    }
  };

  const createNewChat = useCallback((activateView: boolean = true) => {
    const finalWelcomeText = t('home.welcome', { name: displayName || t('common.guest') });
    const tempId = uuidv4();
    const welcomeMsg: Message = { id: uuidv4(), role: 'model', text: finalWelcomeText, timestamp: new Date().toISOString() };
    const newChat: ChatSession = {
      id: tempId,
      title: t('sidebar.newChat'),
      createdAt: Date.now(),
      messages: [welcomeMsg],
      isTemp: true
    };
    setChats(prevChats => [newChat, ...prevChats]);
    setActiveChatId(tempId);
    if (activateView) setCurrentView('chat');
  }, [displayName, t]);

  const handleDeleteChat = async (chatId: string) => {
    let nextActiveId = activeChatId;
    if (activeChatId === chatId) {
      const remainingChats = chats.filter(c => c.id !== chatId);
      if (remainingChats.length > 0) nextActiveId = remainingChats[0].id;
      else nextActiveId = null; 
    }
    const chatsBackup = [...chats];
    setChats(prev => prev.filter(c => c.id !== chatId));
    setActiveChatId(nextActiveId);
    if (chats.length <= 1 && nextActiveId === null) { 
      setTimeout(() => createNewChat(true), 50);
    }
    try { await db.deleteChat(chatId); } catch (err) { setChats(chatsBackup); setActiveChatId(chatId); }
  };

  const handleRenameChat = async (chatId: string, newTitle: string) => {
    setChats(prev => prev.map(c => {
        if (c.id === chatId) return { ...c, title: newTitle, isTemp: false };
        return c;
    }));
    try { await db.updateChatTitle(chatId, newTitle); } catch (e) { console.error(e); }
  };

  const handleLogout = async () => { 
    if (supabase) await supabase.auth.signOut(); 
    localStorage.clear(); 
    window.location.reload(); 
  };

  const handleSendMessage = async (text: string, hiddenContext?: string) => {
    if (!activeChatId) return;

    if (!hasApiKey) {
      handleSelectApiKey();
      return;
    }

    let currentChatId = activeChatId;
    const currentChat = chats.find(c => c.id === currentChatId);
    if (!currentChat) return;

    const userMessage: Message = { id: uuidv4(), role: 'user', text: text, timestamp: new Date().toISOString(), hiddenContext: hiddenContext };
    const aiMessageId = uuidv4();
    const initialAiMessage: Message = { id: aiMessageId, role: 'model', text: '', timestamp: new Date().toISOString() };

    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === currentChatId) {
        return { ...chat, messages: [...chat.messages, userMessage, initialAiMessage], isTemp: false };
      }
      return chat;
    }));

    setIsLoading(true);

    try {
      if (currentChat.isTemp) {
        await db.createChat(currentChat.title, currentChat.messages[0], currentChatId);
        const smartTitle = await generateChatTitle(text, language);
        handleRenameChat(currentChatId, smartTitle);
      }
      await db.addMessage(currentChatId, userMessage);
      const historyPayload = [...currentChat.messages, userMessage];
      await streamAIResponse(currentChatId, aiMessageId, historyPayload, text, hiddenContext, initialAiMessage);
    } catch (e: any) { 
      console.error(e);
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!activeChatId) return;

    if (!hasApiKey) {
      handleSelectApiKey();
      return;
    }

    const currentChat = chats.find(c => c.id === activeChatId);
    if (!currentChat) return;
    const msgs = currentChat.messages;
    if (msgs.length < 2) return;
    
    const lastMessage = msgs[msgs.length - 1];
    const lastUserMessage = msgs[msgs.length - 2];
    
    if (lastMessage.role !== 'model') return;
    if (!lastUserMessage || lastUserMessage.role !== 'user') return;

    setIsLoading(true);
    const newAiMessageId = uuidv4();
    const newAiMessage: Message = { id: newAiMessageId, role: 'model', text: '', timestamp: new Date().toISOString() };
    
    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId) return { ...chat, messages: [...chat.messages.slice(0, -1), newAiMessage] };
      return chat;
    }));

    try {
        await db.deleteMessage(lastMessage.id);
    } catch(e) { console.error("Failed to delete", e); }

    const historyPayload = msgs.slice(0, -2); 
    const regenContext = lastUserMessage.hiddenContext ? `${lastUserMessage.hiddenContext} (Regen-${uuidv4()})` : undefined;
    await streamAIResponse(activeChatId, newAiMessageId, historyPayload, lastUserMessage.text, regenContext, newAiMessage);
  };

  const streamAIResponse = async (chatId: string, messageId: string, history: Message[], prompt: string, hiddenContext: string | undefined, baseAiMessage: Message) => {
    let accumulatedText = "";
    await sendMessageStream(
      history, prompt, hiddenContext, bibleTranslation, language, displayName, 
      (chunk: string) => {
        accumulatedText += chunk;
        setChats(prevChats => prevChats.map(chat => {
          if (chat.id === chatId) {
            return { ...chat, messages: chat.messages.map(msg => msg.id === messageId ? { ...msg, text: accumulatedText } : msg) };
          }
          return chat;
        }));
      },
      async () => {
        setIsLoading(false);
        const finalAiMessage = { ...baseAiMessage, text: accumulatedText };
        try { await db.addMessage(chatId, finalAiMessage); } catch(e) { console.error(e); }
      },
      (error: any) => {
        setIsLoading(false);
      }
    );
  };

  const handleNavigate = (view: AppView) => {
    if (view === 'chat') {
        // Always open a new temporary chat when navigating to AI as requested
        createNewChat(true);
    } else {
        setCurrentView(view);
    }
  };

  if (!supabase) return <div className={isDarkMode ? 'dark' : ''}><SetupScreen /></div>;

  const activeChat = chats.find(c => c.id === activeChatId);
  const activeMessages = activeChat ? activeChat.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })) : [];
  
  const brandName = "Shepherd";

  return (
    <div className={`${isDarkMode ? 'dark' : ''} animate-fade-in ${session ? 'h-[100dvh] overflow-hidden' : 'min-h-[100dvh]'}`}>
      
      {/* SPLASH SCREEN OVERLAY */}
      <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-black transition-all duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] ${!showSplash ? 'opacity-0 scale-110 pointer-events-none blur-2xl' : 'opacity-100 scale-100 blur-0'}`}>
         <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 animate-aurora opacity-90"></div>
         <div className="absolute inset-0 opacity-60">
             <div className="absolute top-[20%] left-[20%] w-1 h-1 bg-white rounded-full animate-twinkle"></div>
             <div className="absolute top-[60%] left-[80%] w-1.5 h-1.5 bg-amber-200 rounded-full animate-twinkle [animation-delay:1.5s]"></div>
         </div>
         <div className="relative z-10 flex flex-col items-center justify-center mb-8">
            <div className="relative flex items-center justify-center w-64 h-64 perspective-1000 preserve-3d">
                <div className="absolute inset-0 w-full h-full border-[1.5px] border-amber-400/30 rounded-full animate-orbit-x shadow-[0_0_15px_rgba(251,191,36,0.1)]"></div>
                <div className="absolute inset-0 w-full h-full border-[1.5px] border-white/20 rounded-full animate-orbit-y shadow-[0_0_15px_rgba(255,255,255,0.1)]"></div>
                <div className="absolute inset-0 w-full h-full border-[1.5px] border-indigo-400/20 rounded-full animate-orbit-z"></div>
                <div className="relative z-20 animate-cross-pulse">
                    <svg width="100" height="120" viewBox="0 0 100 120" fill="none" className="drop-shadow-[0_0_30px_rgba(255,215,0,0.6)]">
                        <path d="M50 10V110M30 40H70" stroke="url(#crossGradient)" strokeWidth="6" strokeLinecap="round" />
                        <defs><linearGradient id="crossGradient" x1="50" y1="0" x2="50" y2="120" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#FFF" /><stop offset="50%" stopColor="#FDE68A" /><stop offset="100%" stopColor="#D97706" /></linearGradient></defs>
                    </svg>
                </div>
            </div>
         </div>
         <div className="relative z-20 text-center flex flex-col items-center -mt-4">
             <h1 className="text-5xl md:text-8xl font-bold text-white font-serif-text tracking-tight drop-shadow-[0_0_20px_rgba(255,215,0,0.4)] flex gap-1 justify-center mb-2">
                {brandName.split('').map((char, i) => (
                    <span key={i} className="animate-letter-reveal" style={{ animationDelay: `${0.3 + i * 0.08}s` }}>{char}</span>
                ))}
             </h1>
             <div className="flex items-center justify-center gap-4 animate-tracking-expand opacity-0" style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }}>
                <div className="h-[2px] w-8 md:w-24 bg-gradient-to-r from-transparent via-amber-200 to-transparent shadow-[0_0_8px_rgba(253,230,138,0.6)]"></div>
                <p className="text-amber-100 text-base md:text-2xl font-semibold uppercase tracking-[0.25em] font-sans drop-shadow-md whitespace-nowrap">{t('chat.subtitle')}</p>
                <div className="h-[2px] w-8 md:w-24 bg-gradient-to-r from-transparent via-amber-200 to-transparent shadow-[0_0_8px_rgba(253,230,138,0.6)]"></div>
             </div>
         </div>
      </div>

      {isWinterMode && !isPrincessMode && <WinterOverlay showSnow={isWinterSnow} showLights={isWinterLights} showIcicles={isWinterIcicles} />}
      {isPrincessMode && !isWinterMode && <PrincessOverlay showHearts={isPrincessHearts} showSparkles={isPrincessSparkles} />}
      
      {loadingAuth ? (
          <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-40">
               <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-400 text-sm animate-pulse">{t('common.loading')}</p>
               </div>
          </div>
      ) : !session ? ( 
          <Login isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} language={language} onSetLanguage={(lang) => handleUpdatePreference('language', lang)} /> 
      ) : (
        <Suspense fallback={<div className="h-full w-full flex items-center justify-center bg-slate-900 text-white">{t('common.loading')}</div>}>
            <div className="flex h-full overflow-hidden relative z-0">
            {currentView === 'home' && (
                <div className="flex-1 w-full h-full">
                    <HomeView 
                        language={language} displayName={displayName} userAvatar={avatar} dailyStreak={dailyStreak} 
                        onNavigate={handleNavigate} onOpenSettings={() => setIsSettingsOpen(true)}
                        onOpenNotifications={() => handleOpenSocial('inbox')} onOpenProfile={() => handleOpenSocial('profile')}
                        onOpenFriends={() => handleOpenSocial('friends')} onOpenSanctuary={() => setIsSanctuaryOpen(true)}
                        onOpenFeedback={() => setIsFeedbackOpen(true)} notificationCount={totalNotifications}
                        onOpenDailyVerse={() => setIsDailyVerseOpen(true)}
                    />
                </div>
            )}
            {currentView === 'chat' && (
                <div className="flex w-full h-full">
                    <Sidebar 
                        isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} chats={chats}
                        activeChatId={activeChatId} onSelectChat={(id) => { setActiveChatId(id); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                        onNewChat={() => createNewChat(true)} onDeleteChat={(id) => handleDeleteChat(id)}
                        onRenameChat={handleRenameChat} language={language} onNavigateHome={() => { setCurrentView('home'); setIsSidebarOpen(false); }}
                    />
                    <div className="flex-1 h-full w-full relative">
                        <ChatInterface 
                            messages={activeMessages} isLoading={isLoading} onSendMessage={handleSendMessage} 
                            onMenuClick={() => setIsSidebarOpen(true)} onRegenerate={handleRegenerate} 
                            onDeleteCurrentChat={activeChatId ? (e) => handleDeleteChat(activeChatId) : undefined} 
                            onNewChat={() => createNewChat(true)} language={language} userAvatar={avatar}
                            onSaveMessage={handleSaveMessage} onOpenComposer={(text) => setComposerData({ text })}
                            onOpenSettings={() => setIsSettingsOpen(true)} 
                            onNavigateHome={() => setCurrentView('home')}
                            hasApiKey={hasApiKey}
                            onSelectApiKey={handleSelectApiKey}
                            onUpdateManualKey={handleUpdateManualKey}
                        />
                    </div>
                </div>
            )}
            {currentView === 'bible' && ( 
                <div className="flex-1 w-full h-full">
                    <BibleReader 
                        language={language} 
                        onSaveItem={handleSaveItem} 
                        onMenuClick={() => setCurrentView('home')} 
                        highlights={highlights} 
                        onAddHighlight={handleAddHighlight} 
                        onRemoveHighlight={handleRemoveHighlight} 
                        onOpenComposer={(text, ref) => setComposerData({ text, reference: ref })} 
                        hasApiKey={hasApiKey}
                    /> 
                </div>
            )}
            {currentView === 'saved' && ( 
                <div className="flex-1 w-full h-full">
                    <SavedCollection savedItems={savedItems} onRemoveItem={handleRemoveSavedItem} language={language} onMenuClick={() => setCurrentView('home')} onOpenComposer={(text, ref) => setComposerData({ text, reference: ref })} /> 
                </div>
            )}
            {currentView === 'prayer' && ( 
                <div className="flex-1 w-full h-full">
                    <PrayerList savedItems={savedItems} onSaveItem={handleSaveItem} onUpdateItem={handleUpdateItem} onRemoveItem={handleRemoveSavedItem} language={language} onMenuClick={() => setCurrentView('home')} currentUserId={session.user.id} userName={displayName} userAvatar={avatar} /> 
                </div>
            )}
            {currentView === 'quiz' && ( <div className="flex-1 w-full h-full"><QuizMode language={language} onMenuClick={() => setCurrentView('home')} /></div> )}
            {currentView === 'stories' && ( 
                <div className="flex-1 w-full h-full">
                    <RoleplayView 
                        language={language} 
                        onMenuClick={() => setCurrentView('home')} 
                        hasApiKey={hasApiKey}
                    />
                </div> 
            )}
            {currentView === 'explorer' && ( 
                <div className="flex-1 w-full h-full">
                    <WorldExplorer 
                        language={language} 
                        onMenuClick={() => setCurrentView('home')} 
                    />
                </div> 
            )}
            
            <Sanctuary isOpen={isSanctuaryOpen} onClose={() => setIsSanctuaryOpen(false)} language={language} />
            <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} language={language} />
            <VisualComposerModal isOpen={!!composerData} onClose={() => setComposerData(null)} initialText={composerData?.text || ''} initialReference={composerData?.reference} language={language} />
            <SettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
                preferences={{ bibleTranslation, theme: isDarkMode ? 'dark' : 'light', winterTheme: isWinterMode, winterSnow: isWinterSnow, winterLights: isWinterLights, winterIcicles: isWinterIcicles, princessTheme: isPrincessMode, princessHearts: isPrincessHearts, princessSparkles: isPrincessSparkles, language, displayName, avatar, bio }} 
                onUpdatePreference={handleUpdatePreference} 
                userEmail={session.user.email} 
                userId={session.user.id} 
                onLogout={handleLogout} 
                hasApiKey={hasApiKey}
                onSelectApiKey={handleSelectApiKey}
                onUpdateManualKey={handleUpdateManualKey}
            />
            <DailyVerseModal isOpen={isDailyVerseOpen} onClose={() => setIsDailyVerseOpen(false)} isDarkMode={isDarkMode} language={language} onOpenComposer={(text, ref) => setComposerData({ text, reference: ref })} />
            <SocialModal isOpen={isSocialOpen} onClose={() => setIsSocialOpen(false)} initialTab={socialInitialTab} currentUserShareId={shareId} isDarkMode={isDarkMode} onUpdateNotifications={loadSocialNotifications} language={language} />
            <PasswordResetModal isOpen={isPasswordResetOpen} onClose={() => setIsPasswordResetOpen(false)} />
            </div>
        </Suspense>
      )}
    </div>
  );
};

export default App;
