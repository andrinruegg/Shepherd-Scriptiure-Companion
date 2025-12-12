
import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import SetupScreen from './components/SetupScreen';
import ShepherdLogo from './components/ShepherdLogo';
import SettingsModal from './components/SettingsModal';
import DailyVerseModal from './components/DailyVerseModal';
import BibleReader from './components/BibleReader';
import SavedCollection from './components/SavedCollection';
import PrayerList from './components/PrayerList';
import Sanctuary from './components/Sanctuary';
import WinterOverlay from './components/WinterOverlay';
import SocialModal from './components/SocialModal';
import QuizMode from './components/QuizMode';
import PasswordResetModal from './components/PasswordResetModal';
import { Message, ChatSession, UserPreferences, AppView, SavedItem, BibleHighlight } from './types';
import { v4 as uuidv4 } from 'uuid';
import { sendMessageStream, generateChatTitle } from './services/geminiService';
import { supabase } from './services/supabase';
import { db } from './services/db';
import { updateStreak } from './services/dailyVerseService';
import { translations } from './utils/translations';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  const [currentView, setCurrentView] = useState<AppView>('chat');
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDailyVerseOpen, setIsDailyVerseOpen] = useState(false);
  const [isSocialOpen, setIsSocialOpen] = useState(false); 
  const [isSanctuaryOpen, setIsSanctuaryOpen] = useState(false);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
  const [dailyStreak, setDailyStreak] = useState(0);
  
  const [shareId, setShareId] = useState<string>('');
  const [totalNotifications, setTotalNotifications] = useState(0);

  // Hardcoded to NIV for AI as requested
  const bibleTranslation = 'NIV';

  const [language, setLanguage] = useState<string>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('language') || 'English';
    return 'English';
  });
  const [displayName, setDisplayName] = useState<string>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('displayName') || '';
    return '';
  });
  const [avatar, setAvatar] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('userAvatar') || undefined;
    return undefined;
  });
  const [bio, setBio] = useState<string | undefined>(() => {
      if (typeof window !== 'undefined') return localStorage.getItem('userBio') || undefined;
      return undefined;
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('theme') === 'dark';
    return false;
  });
  
  const [isWinterMode, setIsWinterMode] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('winterMode') === 'true';
    return false;
  });
  
  // Granular Winter Settings (Default true if not set)
  const [isWinterSnow, setIsWinterSnow] = useState(() => {
      const val = localStorage.getItem('winterSnow');
      return val === null ? true : val === 'true';
  });
  const [isWinterLights, setIsWinterLights] = useState(() => {
      const val = localStorage.getItem('winterLights');
      return val === null ? true : val === 'true';
  });
  const [isWinterIcicles, setIsWinterIcicles] = useState(() => {
      const val = localStorage.getItem('winterIcicles');
      return val === null ? true : val === 'true';
  });

  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [highlights, setHighlights] = useState<BibleHighlight[]>([]);

  useEffect(() => {
    // STARTUP CLEANUP: Aggressively remove legacy modes from DOM and LocalStorage
    document.body.classList.remove('princess-mode');
    document.documentElement.classList.remove('princess-mode');
    localStorage.removeItem('princessMode');
    localStorage.removeItem('princessTheme');
    
    // Also check for legacy 'theme' values
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme !== 'dark' && currentTheme !== 'light') {
        localStorage.setItem('theme', 'light');
    }

    const timer = setTimeout(() => { setShowSplash(false); }, 5000); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const streak = updateStreak();
    setDailyStreak(streak);
    // Sync streak to cloud so friends can see it
    if (session?.user) {
        // Safe fire-and-forget update
        db.social.updateProfileStats(streak).catch(console.error);
    }
  }, [session]);

  // Sync session metadata & Load Cloud Data
  useEffect(() => {
    const initSession = async () => {
        if (!session?.user) return;
        
        try {
            // 1. Fetch Existing Profile (Safe Fetch)
            let existingProfile = null;
            try {
                existingProfile = await db.social.getUserProfile(session.user.id);
            } catch (err) {
                console.warn("Profile fetch warning:", err);
            }
            
            if (existingProfile && existingProfile.share_id) {
                setShareId(existingProfile.share_id);
                // Sync local state from DB
                if (existingProfile.display_name) setDisplayName(existingProfile.display_name);
                if (existingProfile.avatar) setAvatar(existingProfile.avatar);
                if (existingProfile.bio) setBio(existingProfile.bio);
            }

            // 2. Heartbeat (Fire and forget)
            db.social.heartbeat().catch(e => console.warn("Heartbeat failed", e));

        } catch (e) {
            // Global safety net - ensure chat can still load even if profile fails
            console.error("Initialization critical error (bypassed):", e);
        }

        // Load Preferences
        const meta = session.user.user_metadata || {};
        
        // --- SANITIZATION: Remove 'princessMode' from Supabase if present ---
        if (meta.princessMode !== undefined || meta.princessTheme !== undefined) {
             console.log("Sanitizing profile: Removing deprecated modes from cloud");
             const updates: any = {
                 princessMode: null,
                 princessTheme: null
             };
             // Fire and forget update
             supabase.auth.updateUser({ data: updates }).catch(e => console.warn("Sanitization failed", e));
        }
        // -----------------------------------------------------

        if (!displayName && meta.full_name) {
            setDisplayName(meta.full_name);
        }
        if (meta.language) setLanguage(meta.language);
        if (meta.theme) setIsDarkMode(meta.theme === 'dark');
        if (meta.winterMode !== undefined) setIsWinterMode(meta.winterMode === 'true' || meta.winterMode === true);
        
        // Winter Sub-settings
        if (meta.winterSnow !== undefined) setIsWinterSnow(meta.winterSnow === 'true' || meta.winterSnow === true);
        if (meta.winterLights !== undefined) setIsWinterLights(meta.winterLights === 'true' || meta.winterLights === true);
        if (meta.winterIcicles !== undefined) setIsWinterIcicles(meta.winterIcicles === 'true' || meta.winterIcicles === true);
    };

    if (session) {
        initSession();
        // Load chats independently to ensure they load even if profile fails
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

  const loadCloudData = async () => {
      try {
          const [cloudSaved, cloudHighlights] = await Promise.all([
              db.getSavedItems(),
              db.getHighlights()
          ]);
          setSavedItems(cloudSaved);
          setHighlights(cloudHighlights);
      } catch (e) {
          console.error("Failed to load cloud data", e);
      }
  };
  
  const loadSocialNotifications = async () => {
      // Don't spam logs if offline
      if (typeof navigator !== 'undefined' && !navigator.onLine) return;

      try {
          const [requests, unreadCount] = await Promise.all([
              db.social.getIncomingRequests(),
              db.social.getTotalUnreadCount()
          ]);
          setTotalNotifications(requests.length + unreadCount);
      } catch (e: any) {
          // Suppress known fetch errors to avoid console noise
          if (e.message && e.message.includes('Failed to fetch')) return;
          console.warn("Failed to load requests (minor)", e);
      }
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
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
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
    } else if (key === 'winterTheme') {
       const isWinter = value === true;
       setIsWinterMode(isWinter);
       localStorage.setItem('winterMode', String(isWinter));
       updateCloudPreference('winterMode', isWinter);
    } else if (key === 'winterSnow') {
        const val = value === true;
        setIsWinterSnow(val);
        localStorage.setItem('winterSnow', String(val));
        updateCloudPreference('winterSnow', val);
    } else if (key === 'winterLights') {
        const val = value === true;
        setIsWinterLights(val);
        localStorage.setItem('winterLights', String(val));
        updateCloudPreference('winterLights', val);
    } else if (key === 'winterIcicles') {
        const val = value === true;
        setIsWinterIcicles(val);
        localStorage.setItem('winterIcicles', String(val));
        updateCloudPreference('winterIcicles', val);
    } else if (key === 'language') {
       setLanguage(value as string);
       localStorage.setItem('language', value as string);
       updateCloudPreference('language', value as string);
    } else if (key === 'displayName') {
       setDisplayName(value as string);
       localStorage.setItem('displayName', value as string);
       updateCloudPreference('full_name', value as string);
       if (shareId) db.social.upsertProfile(shareId, value as string, avatar, bio);
    } else if (key === 'avatar') {
       setAvatar(value as string);
       if (value) localStorage.setItem('userAvatar', value as string);
       else localStorage.removeItem('userAvatar');
       updateCloudPreference('avatar', value as string);
       if (shareId) db.social.upsertProfile(shareId, displayName, value as string, bio);
    } else if (key === 'bio') {
        setBio(value as string);
        localStorage.setItem('userBio', value as string);
        updateCloudPreference('bio', value as string);
        if (shareId) db.social.upsertProfile(shareId, displayName, avatar, value as string);
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
      if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordResetOpen(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadChats = async () => {
    try {
      const userChats = await db.getUserChats();
      const langData = translations[language] || translations['English'];
      const messages = langData.welcomeMessages || translations['English'].welcomeMessages;
      const randomTemplate = messages[Math.floor(Math.random() * messages.length)];
      const finalWelcomeText = randomTemplate.replace('{name}', displayName || (language === 'Romanian' ? 'Prieten' : 'Friend'));

      const tempId = uuidv4();
      const welcomeMsg: Message = {
        id: uuidv4(),
        role: 'model',
        text: finalWelcomeText,
        timestamp: new Date().toISOString()
      };

      const tempChat: ChatSession = {
          id: tempId,
          title: translations[language]?.sidebar?.newChat || 'New Conversation',
          createdAt: Date.now(),
          messages: [welcomeMsg],
          isTemp: true 
      };

      // Always ensure at least one chat exists
      setChats([tempChat, ...userChats]);
      setActiveChatId(tempId);
      setCurrentView('chat');
    } catch (error) { 
        console.error("Failed to load chats:", error);
        // Fallback: Create a local chat so the user isn't stuck on blank screen
        createNewChat();
    }
  };

  const createNewChat = () => {
    const langData = translations[language] || translations['English'];
    const messages = langData.welcomeMessages || translations['English'].welcomeMessages;
    const randomTemplate = messages[Math.floor(Math.random() * messages.length)];
    const finalWelcomeText = randomTemplate.replace('{name}', displayName || (language === 'Romanian' ? 'Prieten' : 'Friend'));

    const tempId = uuidv4();
    const welcomeMsg: Message = { id: uuidv4(), role: 'model', text: finalWelcomeText, timestamp: new Date().toISOString() };

    const newChat: ChatSession = {
        id: tempId,
        title: translations[language]?.sidebar?.newChat || 'New Conversation',
        createdAt: Date.now(),
        messages: [welcomeMsg],
        isTemp: true
    };
    
    setChats(prevChats => [newChat, ...prevChats]);
    setActiveChatId(tempId);
    setCurrentView('chat');
  };

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

    if (chats.length <= 1) { 
         setTimeout(() => { if (nextActiveId === null) createNewChat(); }, 50);
    }

    const chatToDelete = chatsBackup.find(c => c.id === chatId);
    if (chatToDelete && !chatToDelete.isTemp) {
        try { await db.deleteChat(chatId); } catch (err) { setChats(chatsBackup); setActiveChatId(chatId); }
    }
  };

  const handleRenameChat = async (chatId: string, newTitle: string) => {
     setChats(prev => prev.map(c => c.id === chatId ? { ...c, title: newTitle } : c));
     const chat = chats.find(c => c.id === chatId);
     if (chat && !chat.isTemp) {
         try { await db.updateChatTitle(chatId, newTitle); } catch (e) { console.error(e); }
     }
  };

  const handleLogout = async () => { 
      if (supabase) await supabase.auth.signOut(); 
      localStorage.clear(); 
      window.location.reload(); 
  };

  const handleSendMessage = async (text: string, hiddenContext?: string) => {
    if (!activeChatId) return;
    let currentChatId = activeChatId;
    const currentChat = chats.find(c => c.id === currentChatId);
    if (!currentChat) return;

    const userMessage: Message = {
      id: uuidv4(), role: 'user', text: text, timestamp: new Date().toISOString(), hiddenContext: hiddenContext
    };
    const aiMessageId = uuidv4();
    const initialAiMessage: Message = {
      id: aiMessageId, role: 'model', text: '', timestamp: new Date().toISOString(),
    };

    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === currentChatId) {
        return {
          ...chat,
          messages: [...chat.messages, userMessage, initialAiMessage],
          isTemp: false
        };
      }
      return chat;
    }));

    setIsLoading(true);

    (async () => {
        try {
            // DATABASE OPERATIONS (FAIL-SAFE)
            // If saving to DB fails, we still want the AI to reply.
            try {
                if (currentChat.isTemp) {
                    await db.createChat(currentChat.title, currentChat.messages[0], currentChatId);
                    generateChatTitle(text).then(smartTitle => { handleRenameChat(currentChatId, smartTitle); });
                }
                await db.addMessage(currentChatId, userMessage);
            } catch (dbError) {
                console.error("DB Save failed, continuing locally:", dbError);
                // DO NOT THROW. Continue to AI response.
            }

            // AI GENERATION (CRITICAL PATH)
            const historyPayload = [...currentChat.messages, userMessage];
            await streamAIResponse(currentChatId, aiMessageId, historyPayload, text, hiddenContext, initialAiMessage);
        } catch (e) { 
            console.error("Message send critical failure:", e);
            setIsLoading(false); // Ensure loading state is turned off on error
        }
    })();
  };

  const handleRegenerate = async () => {
      if (!activeChatId) return;
      const currentChat = chats.find(c => c.id === activeChatId);
      if (!currentChat) return;
      const messages = currentChat.messages;
      if (messages.length < 2) return;
      
      const lastUserMessage = messages[messages.length - 2];
      if (!lastUserMessage || lastUserMessage.role !== 'user') return;

      setIsLoading(true);
      const newAiMessageId = uuidv4();
      const newAiMessage: Message = { id: newAiMessageId, role: 'model', text: '', timestamp: new Date().toISOString() };

      setChats(prev => prev.map(chat => {
          if (chat.id === activeChatId) {
              return { ...chat, messages: [...chat.messages.slice(0, -1), newAiMessage] };
          }
          return chat;
      }));
      const historyPayload = messages.slice(0, -2); 
      const regenContext = lastUserMessage.hiddenContext ? `${lastUserMessage.hiddenContext} (Regeneration-${uuidv4()})` : undefined;
      await streamAIResponse(activeChatId, newAiMessageId, historyPayload, lastUserMessage.text, regenContext, newAiMessage);
  };

  const streamAIResponse = async (chatId: string, messageId: string, history: Message[], prompt: string, hiddenContext: string | undefined, baseAiMessage: Message) => {
    let accumulatedText = "";
    await sendMessageStream(
      history, prompt, hiddenContext, bibleTranslation, language, displayName, 
      (chunk) => {
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
        try { await db.addMessage(chatId, finalAiMessage); } catch(e) { console.error("Failed to save AI response", e); }
      },
      (error) => {
        const rawMsg = error?.message || "Unknown Error";
        let friendlyMessage = rawMsg;
        
        if (rawMsg.includes('429') || rawMsg.includes('Quota')) {
            friendlyMessage = "⚠️ **High Traffic / Daily Limit Reached**\n\nPlease wait a moment or add your own free API Key in Settings.";
        } else if (rawMsg.includes('Failed to fetch')) {
            friendlyMessage = "⚠️ **Connection Error**\n\nPlease check your internet connection.";
        } else {
             friendlyMessage = `⚠️ **Error Details:**\n\n\`${rawMsg}\`\n\n(Please verify your API Key or Network)`;
        }
        
        setChats(prevChats => prevChats.map(chat => {
          if (chat.id === chatId) {
            return { ...chat, messages: chat.messages.map(msg => msg.id === messageId ? { ...msg, isError: true, text: friendlyMessage } : msg) };
          }
          return chat;
        }));
        setIsLoading(false);
      }
    );
  };

  if (!supabase) return <div className={isDarkMode ? 'dark' : ''}><SetupScreen /></div>;

  const activeChat = chats.find(c => c.id === activeChatId);
  const activeMessages = activeChat ? activeChat.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })) : [];

  if (showSplash) {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-black transition-all duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] ${!showSplash ? 'opacity-0 scale-110 pointer-events-none blur-2xl' : 'opacity-100 scale-100 blur-0'}`}>
         
         {/* Aurora Background */}
         <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 animate-aurora opacity-90"></div>
         
         {/* Stars/Twinkle */}
         <div className="absolute inset-0 opacity-60">
             <div className="absolute top-[20%] left-[20%] w-1 h-1 bg-white rounded-full animate-twinkle"></div>
             <div className="absolute top-[60%] left-[80%] w-1.5 h-1.5 bg-amber-200 rounded-full animate-twinkle [animation-delay:1.5s]"></div>
         </div>

         {/* 3D Orbiting Rings & Cross */}
         <div className="relative z-10 flex flex-col items-center justify-center scale-100 md:scale-110 mb-8">
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

         {/* Central Content */}
         <div className="relative z-20 text-center flex flex-col items-center -mt-4">
             <h1 className="text-6xl md:text-8xl font-bold text-white font-serif-text tracking-tight drop-shadow-[0_0_20px_rgba(255,215,0,0.4)] flex gap-1 justify-center mb-2">
                {['S','h','e','p','h','e','r','d'].map((char, i) => (
                    <span key={i} className="animate-letter-reveal inline-block" style={{ animationDelay: `${0.3 + i * 0.08}s` }}>{char}</span>
                ))}
             </h1>
             
             <div className="flex items-center justify-center gap-4 animate-tracking-expand opacity-0" style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }}>
                <div className="h-[2px] w-12 md:w-24 bg-gradient-to-r from-transparent via-amber-200 to-transparent shadow-[0_0_8px_rgba(253,230,138,0.6)]"></div>
                <p className="text-amber-100 text-lg md:text-2xl font-semibold uppercase tracking-[0.25em] font-sans drop-shadow-md whitespace-nowrap">
                    Scripture Companion
                </p>
                <div className="h-[2px] w-12 md:w-24 bg-gradient-to-r from-transparent via-amber-200 to-transparent shadow-[0_0_8px_rgba(253,230,138,0.6)]"></div>
             </div>
         </div>

         {/* Running Sheep Animation at bottom */}
         <div className="absolute bottom-0 left-0 right-0 h-56 overflow-hidden z-30 pointer-events-none">
             <div className="absolute bottom-[-20px] left-[-10%] right-[-10%] h-28 bg-gradient-to-t from-black via-slate-900 to-transparent opacity-60 blur-sm rounded-[100%] scale-110"></div>
             <div className="absolute bottom-10 animate-sheep-run" style={{ animationDuration: '4.5s' }}><div className="animate-sheep-bounce"><svg width="100" height="75" viewBox="0 0 40 30" fill="white" className="drop-shadow-lg opacity-90"><rect x="5" y="8" width="25" height="15" rx="8" /><circle cx="32" cy="12" r="6" /><path d="M36 10 L40 12 L36 14 Z" /><rect x="8" y="20" width="3" height="8" rx="1.5" /><rect x="22" y="20" width="3" height="8" rx="1.5" /></svg></div></div>
             <div className="absolute bottom-8 animate-sheep-run" style={{ animationDuration: '4.5s', animationDelay: '0.4s' }}><div className="animate-sheep-bounce" style={{ animationDelay: '0.1s' }}><svg width="80" height="60" viewBox="0 0 40 30" fill="white" className="drop-shadow-lg opacity-80"><rect x="5" y="8" width="25" height="15" rx="8" /><circle cx="32" cy="12" r="6" /><rect x="8" y="20" width="3" height="8" rx="1.5" /><rect x="22" y="20" width="3" height="8" rx="1.5" /></svg></div></div>
         </div>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'dark' : ''} animate-fade-in`}>
      {isWinterMode && (
          <WinterOverlay 
            showSnow={isWinterSnow}
            showLights={isWinterLights}
            showIcicles={isWinterIcicles}
          />
      )}
      
      {loadingAuth ? (
          <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50">
               <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-400 text-sm animate-pulse">Connecting...</p>
               </div>
          </div>
      ) : !session ? ( 
          <Login isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} language={language} /> 
      ) : (
        <div className="flex h-screen bg-slate-200 dark:bg-slate-900 overflow-hidden relative z-0">
          <Sidebar 
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={(id) => { setActiveChatId(id); setIsSidebarOpen(false); }}
            onNewChat={() => createNewChat()}
            onDeleteChat={(id, e) => handleDeleteChat(id)}
            onRenameChat={handleRenameChat}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenDailyVerse={() => setIsDailyVerseOpen(true)}
            onOpenSocial={() => { setIsSocialOpen(true); loadSocialNotifications(); }}
            onOpenSanctuary={() => setIsSanctuaryOpen(true)}
            pendingRequestsCount={totalNotifications}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            language={language}
            dailyStreak={dailyStreak}
            currentView={currentView}
            onChangeView={setCurrentView}
          />
          <div className="flex-1 flex flex-col h-full relative w-full overflow-hidden">
            {currentView === 'chat' && (
                <ChatInterface 
                    messages={activeMessages} 
                    isLoading={isLoading} 
                    onSendMessage={handleSendMessage} 
                    onMenuClick={() => setIsSidebarOpen(true)} 
                    onRegenerate={handleRegenerate} 
                    onDeleteCurrentChat={activeChatId ? () => handleDeleteChat(activeChatId) : undefined} 
                    onNewChat={createNewChat} 
                    language={language} 
                    userAvatar={avatar}
                    onSaveMessage={handleSaveMessage}
                />
            )}
            {currentView === 'bible' && ( <BibleReader language={language} onSaveItem={handleSaveItem} onMenuClick={() => setIsSidebarOpen(true)} highlights={highlights} onAddHighlight={handleAddHighlight} onRemoveHighlight={handleRemoveHighlight} /> )}
            {currentView === 'saved' && ( <SavedCollection savedItems={savedItems} onRemoveItem={handleRemoveSavedItem} language={language} onMenuClick={() => setIsSidebarOpen(true)} /> )}
            {currentView === 'prayer' && ( 
                <PrayerList 
                    savedItems={savedItems} 
                    onSaveItem={handleSaveItem} 
                    onUpdateItem={handleUpdateItem} 
                    onRemoveItem={handleRemoveSavedItem} 
                    language={language} 
                    onMenuClick={() => setIsSidebarOpen(true)} 
                    currentUserId={session.user.id} 
                    userName={displayName}
                    userAvatar={avatar}
                /> 
            )}
            {currentView === 'quiz' && ( <QuizMode language={language} onMenuClick={() => setIsSidebarOpen(true)} /> )}
          </div>

          <Sanctuary isOpen={isSanctuaryOpen} onClose={() => setIsSanctuaryOpen(false)} language={language} />

          <SettingsModal 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)} 
            preferences={{ 
                bibleTranslation, 
                theme: isDarkMode ? 'dark' : 'light', 
                winterTheme: isWinterMode, 
                winterSnow: isWinterSnow,
                winterLights: isWinterLights,
                winterIcicles: isWinterIcicles,
                language, 
                displayName, 
                avatar, 
                bio 
            }} 
            onUpdatePreference={handleUpdatePreference} 
            userEmail={session.user.email} 
            userId={session.user.id} 
            onLogout={handleLogout} 
          />
          <DailyVerseModal isOpen={isDailyVerseOpen} onClose={() => setIsDailyVerseOpen(false)} isDarkMode={isDarkMode} language={language} />
          
          <SocialModal 
            isOpen={isSocialOpen} 
            onClose={() => setIsSocialOpen(false)} 
            currentUserShareId={shareId} 
            isDarkMode={isDarkMode} 
            onUpdateNotifications={loadSocialNotifications}
          />
          
          {/* PASSWORD RESET MODAL */}
          <PasswordResetModal 
            isOpen={isPasswordResetOpen}
            onClose={() => setIsPasswordResetOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default App;
