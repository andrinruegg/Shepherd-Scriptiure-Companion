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
  
  // Navigation State
  const [currentView, setCurrentView] = useState<AppView>('chat');

  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDailyVerseOpen, setIsDailyVerseOpen] = useState(false);
  const [dailyStreak, setDailyStreak] = useState(0);
  
  // Preferences State
  const [bibleTranslation, setBibleTranslation] = useState<string>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('bibleTranslation') || 'NIV';
    return 'NIV';
  });
  const [language, setLanguage] = useState<string>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('language') || 'English';
    return 'English';
  });
  const [displayName, setDisplayName] = useState<string>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('displayName') || '';
    return '';
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  // Saved Items & Highlights State (Loaded from DB)
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [highlights, setHighlights] = useState<BibleHighlight[]>([]);

  // Splash Screen Timer
  useEffect(() => {
    // 5s total duration for a cinematic feel
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000); 
    return () => clearTimeout(timer);
  }, []);

  // Update Streak on Load
  useEffect(() => {
    const streak = updateStreak();
    setDailyStreak(streak);
  }, []);

  // Sync session metadata & Load Cloud Data
  useEffect(() => {
    if (session?.user?.user_metadata) {
        const meta = session.user.user_metadata;
        
        if (meta.full_name) {
            setDisplayName(meta.full_name);
            localStorage.setItem('displayName', meta.full_name);
        }
        
        if (meta.language) {
            setLanguage(meta.language);
            localStorage.setItem('language', meta.language);
        }

        if (meta.bibleTranslation) {
            setBibleTranslation(meta.bibleTranslation);
            localStorage.setItem('bibleTranslation', meta.bibleTranslation);
        }

        if (meta.theme) {
            const isDark = meta.theme === 'dark';
            setIsDarkMode(isDark);
            localStorage.setItem('theme', meta.theme);
        }
    }

    // Load Cloud Data when session is active
    if (session) {
        loadCloudData();
        loadChats();
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

  const handleSaveItem = async (item: SavedItem) => {
      setSavedItems(prev => [item, ...prev]);
      try {
          await db.saveItem(item);
      } catch (e) {
          console.error("Failed to save item to cloud", e);
      }
  };

  const handleRemoveSavedItem = async (id: string) => {
      setSavedItems(prev => prev.filter(i => i.id !== id));
      try {
          await db.deleteSavedItem(id);
      } catch (e) {
          console.error("Failed to delete item from cloud", e);
      }
  };

  const handleAddHighlight = async (highlight: BibleHighlight) => {
      setHighlights(prev => [...prev.filter(h => h.ref !== highlight.ref), highlight]);
      try {
          await db.deleteHighlight(highlight.ref);
          await db.addHighlight(highlight);
      } catch (e) {
          console.error("Failed to save highlight", e);
      }
  };

  const handleRemoveHighlight = async (ref: string) => {
      setHighlights(prev => prev.filter(h => h.ref !== ref));
      try {
          await db.deleteHighlight(ref);
      } catch (e) {
          console.error("Failed to remove highlight", e);
      }
  };

  // Apply Dark Mode Class
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

  const updateCloudPreference = async (key: string, value: string) => {
      if (!session || !supabase) return;
      try {
          await supabase.auth.updateUser({
              data: { [key]: value }
          });
      } catch (e) {
          console.error(`Failed to sync ${key} to cloud`, e);
      }
  };

  const handleUpdatePreference = (key: keyof UserPreferences, value: string) => {
    if (key === 'theme') {
       const isDark = value === 'dark';
       setIsDarkMode(isDark);
       updateCloudPreference('theme', value);
    } else if (key === 'bibleTranslation') {
       setBibleTranslation(value);
       localStorage.setItem('bibleTranslation', value);
       updateCloudPreference('bibleTranslation', value);
    } else if (key === 'language') {
       setLanguage(value);
       localStorage.setItem('language', value);
       updateCloudPreference('language', value);
    } else if (key === 'displayName') {
       setDisplayName(value);
       localStorage.setItem('displayName', value);
       updateCloudPreference('full_name', value);
    }
  };

  // Auth Listener
  useEffect(() => {
    if (!supabase) return;
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadChats = async () => {
    try {
      const userChats = await db.getUserChats();
      // Generate the temp chat object synchronously
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

      // Set all chats at once to avoid black screen flickering
      setChats([tempChat, ...userChats]);
      setActiveChatId(tempId);
      setCurrentView('chat');

    } catch (error) {
      console.error("Failed to load chats:", error);
    }
  };

  const createNewChat = () => {
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

    const newChat: ChatSession = {
        id: tempId,
        title: translations[language]?.sidebar?.newChat || 'New Conversation',
        createdAt: Date.now(),
        messages: [welcomeMsg],
        isTemp: true // MARK AS TEMP
    };
    
    // Add to state, but DO NOT save to DB yet
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(tempId);
    setCurrentView('chat');
  };

  const handleDeleteChat = async (chatId: string) => {
    // Optimistic UI Update
    let nextActiveId = activeChatId;
    if (activeChatId === chatId) {
        const remainingChats = chats.filter(c => c.id !== chatId);
        if (remainingChats.length > 0) {
            nextActiveId = remainingChats[0].id;
        } else {
            nextActiveId = null; 
        }
    }

    const chatsBackup = [...chats];
    setChats(prev => prev.filter(c => c.id !== chatId));
    setActiveChatId(nextActiveId);

    // If we deleted the last chat, create a new temp one immediately
    if (chats.length <= 1) { 
         setTimeout(() => {
             if (nextActiveId === null) createNewChat();
         }, 50);
    }

    // Only attempt DB delete if it's not a temp chat
    const chatToDelete = chatsBackup.find(c => c.id === chatId);
    if (chatToDelete && !chatToDelete.isTemp) {
        try {
            await db.deleteChat(chatId);
        } catch (err: any) {
            console.error("Failed to delete chat", err);
            // Revert on failure
            setChats(chatsBackup);
            setActiveChatId(chatId);
        }
    }
  };

  const handleRenameChat = async (chatId: string, newTitle: string) => {
     setChats(prev => prev.map(c => c.id === chatId ? { ...c, title: newTitle } : c));
     
     const chat = chats.find(c => c.id === chatId);
     if (chat && !chat.isTemp) {
         try {
             await db.updateChatTitle(chatId, newTitle);
         } catch (e) {
             console.error("Failed to rename", e);
         }
     }
  };

  const handleLogout = async () => {
     if (supabase) await supabase.auth.signOut();
  };

  // --- OPTIMISTIC SEND MESSAGE HANDLER ---
  const handleSendMessage = async (text: string, hiddenContext?: string) => {
    if (!activeChatId) return;

    let currentChatId = activeChatId;
    const currentChat = chats.find(c => c.id === currentChatId);

    if (!currentChat) return;

    // 1. IMMEDIATE UI UPDATE
    // We update the local state instantly to show the user's message and the "Thinking" state.
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      text: text,
      timestamp: new Date().toISOString(),
      hiddenContext: hiddenContext
    };

    const aiMessageId = uuidv4();
    const initialAiMessage: Message = {
      id: aiMessageId,
      role: 'model',
      text: '', // Empty text triggers the "Thinking" bubbles
      timestamp: new Date().toISOString(),
    };

    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === currentChatId) {
        return {
          ...chat,
          messages: [...chat.messages, userMessage, initialAiMessage],
          isTemp: false // Mark as real immediately in UI so it persists
        };
      }
      return chat;
    }));

    setIsLoading(true);

    // 2. BACKGROUND SYNC
    // We handle all DB operations asynchronously without blocking the UI rendering.
    (async () => {
        try {
            // If it was a temp chat, create it in DB using the SAME client-side ID.
            // This prevents ID swapping logic which causes black screens/flickering.
            if (currentChat.isTemp) {
                // We pass currentChatId to db.createChat so the DB uses OUR id
                await db.createChat(currentChat.title, currentChat.messages[0], currentChatId);
                
                // Smart Title Generation
                generateChatTitle(text).then(smartTitle => {
                    handleRenameChat(currentChatId, smartTitle);
                });
            }

            // Save the user message to DB
            await db.addMessage(currentChatId, userMessage);

            // 3. START AI STREAM
            const historyPayload = [...currentChat.messages, userMessage];
            
            await streamAIResponse(currentChatId, aiMessageId, historyPayload, text, hiddenContext, initialAiMessage);

        } catch (e) {
            console.error("Critical error in message handling:", e);
            // In a real app, you might show a toast error here
        }
    })();
  };

  const handleRegenerate = async () => {
      if (!activeChatId) return;
      const currentChat = chats.find(c => c.id === activeChatId);
      if (!currentChat) return;

      const messages = currentChat.messages;
      const lastMessage = messages[messages.length - 1];
      
      // Ensure we are regenerating a model message
      if (lastMessage.role !== 'model') return;

      // Ensure there is a preceding user message to act as the prompt
      // SAFETY CHECK: Ensure we don't access undefined if array is too short
      if (messages.length < 2) return;

      const lastUserMessage = messages[messages.length - 2];
      if (!lastUserMessage || lastUserMessage.role !== 'user') {
          // If we can't find the user prompt, we can't regenerate. Abort.
          return;
      }

      setIsLoading(true);

      const newAiMessageId = uuidv4();
      const newAiMessage: Message = {
          id: newAiMessageId,
          role: 'model',
          text: '',
          timestamp: new Date().toISOString()
      };

      setChats(prev => prev.map(chat => {
          if (chat.id === activeChatId) {
              return {
                  ...chat,
                  // Remove the last AI message (error or old) and add the empty new one
                  messages: [...chat.messages.slice(0, -1), newAiMessage]
              };
          }
          return chat;
      }));

      // FIX: The history should NOT include the last User message, because we are sending it as the prompt.
      // previous: messages.slice(0, -1) -> included Welcome, ..., User.
      // fixed: messages.slice(0, -2) -> includes Welcome, ... (User is excluded).
      const historyPayload = messages.slice(0, -2); 
      
      // We also need to preserve the hiddenContext if it exists on the user message
      const regenContext = lastUserMessage.hiddenContext 
        ? `${lastUserMessage.hiddenContext} (Regeneration-${uuidv4()})`
        : undefined;
      
      await streamAIResponse(activeChatId, newAiMessageId, historyPayload, lastUserMessage.text, regenContext, newAiMessage);
  };

  const streamAIResponse = async (
      chatId: string, 
      messageId: string, 
      history: Message[], 
      prompt: string, 
      hiddenContext: string | undefined,
      baseAiMessage: Message
  ) => {
    let accumulatedText = "";

    await sendMessageStream(
      history,
      prompt,
      hiddenContext,
      bibleTranslation,
      language,
      displayName, 
      (chunk) => {
        accumulatedText += chunk;
        setChats(prevChats => prevChats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: chat.messages.map(msg => 
                msg.id === messageId ? { ...msg, text: accumulatedText } : msg
              )
            };
          }
          return chat;
        }));
      },
      async () => {
        setIsLoading(false);
        const finalAiMessage = { ...baseAiMessage, text: accumulatedText };
        try {
            await db.addMessage(chatId, finalAiMessage);
        } catch(e) {
            console.error("Failed to save AI message", e);
        }
      },
      (error) => {
        // DISPLAY RAW ERROR FOR DEBUGGING
        const errorMessage = error?.message || JSON.stringify(error) || "Unknown Error";
        
        const debugMessage = `[DEBUG MODE ERROR]
        
${errorMessage}

(Please refresh the app or check Settings > Diagnostics)`;

        setChats(prevChats => prevChats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: chat.messages.map(msg => 
                msg.id === messageId ? { ...msg, isError: true, text: debugMessage } : msg
              )
            };
          }
          return chat;
        }));
        setIsLoading(false);
      }
    );
  };

  if (!supabase) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
         <SetupScreen />
      </div>
    );
  }

  // Safety: If activeChatId is set but doesn't exist in chats (rare race condition),
  // fallback or render a loading state, but DO NOT CRASH.
  const activeChat = chats.find(c => c.id === activeChatId);
  const activeMessages = activeChat ? activeChat.messages.map(m => ({
    ...m,
    timestamp: new Date(m.timestamp)
  })) : [];

  if (showSplash || loadingAuth) {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-black transition-all duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] ${!showSplash && !loadingAuth ? 'opacity-0 scale-110 pointer-events-none blur-2xl' : 'opacity-100 scale-100 blur-0'}`}>
         
         {/* Divine Background - Deeper blues and golds */}
         <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 animate-aurora opacity-90"></div>
         
         {/* Animated Stars */}
         <div className="absolute inset-0 opacity-60">
             <div className="absolute top-[20%] left-[20%] w-1 h-1 bg-white rounded-full animate-twinkle [animation-delay:0s]"></div>
             <div className="absolute top-[60%] left-[80%] w-1.5 h-1.5 bg-amber-200 rounded-full animate-twinkle [animation-delay:1.5s]"></div>
             <div className="absolute top-[80%] left-[30%] w-1 h-1 bg-white rounded-full animate-twinkle [animation-delay:2.5s]"></div>
             <div className="absolute top-[15%] right-[25%] w-1 h-1 bg-amber-100 rounded-full animate-twinkle [animation-delay:3.5s]"></div>
         </div>
         
         {/* Divine Light Beams (Rotating God Rays) */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(255,215,0,0.05)_40deg,transparent_80deg,rgba(255,255,255,0.05)_160deg,transparent_200deg)] rounded-full blur-3xl animate-spin-slow opacity-80"></div>

         {/* Main Centerpiece (Cross + Rings) */}
         <div className="relative z-10 flex flex-col items-center justify-center scale-100 md:scale-110 mb-8">
            
            {/* 3D Gyroscope Rings centered on Cross */}
            <div className="relative flex items-center justify-center w-64 h-64 perspective-1000 preserve-3d">
                {/* Ring 1 (X Axis) - Gold */}
                <div className="absolute inset-0 w-full h-full border-[1.5px] border-amber-400/30 rounded-full animate-orbit-x shadow-[0_0_15px_rgba(251,191,36,0.1)]"></div>
                {/* Ring 2 (Y Axis) - White */}
                <div className="absolute inset-0 w-full h-full border-[1.5px] border-white/20 rounded-full animate-orbit-y shadow-[0_0_15px_rgba(255,255,255,0.1)]"></div>
                {/* Ring 3 (Z Axis) - Blue */}
                <div className="absolute inset-0 w-full h-full border-[1.5px] border-indigo-400/20 rounded-full animate-orbit-z"></div>

                {/* THE CROSS */}
                <div className="relative z-20 animate-cross-pulse">
                    <svg width="100" height="120" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_30px_rgba(255,215,0,0.6)]">
                         <path d="M50 10V110M30 40H70" stroke="url(#crossGradient)" strokeWidth="6" strokeLinecap="round" />
                         <defs>
                             <linearGradient id="crossGradient" x1="50" y1="0" x2="50" y2="120" gradientUnits="userSpaceOnUse">
                                 <stop offset="0%" stopColor="#FFF" />
                                 <stop offset="50%" stopColor="#FDE68A" />
                                 <stop offset="100%" stopColor="#D97706" />
                             </linearGradient>
                         </defs>
                    </svg>
                </div>
            </div>
         </div>

         {/* Cinematic Typography - Shepherd Above, Lines Next to Companion */}
         <div className="relative z-20 text-center flex flex-col items-center -mt-4">
             {/* SHEPHERD - Big, Bold, White/Gold */}
             <h1 className="text-6xl md:text-8xl font-bold text-white font-serif-text tracking-tight drop-shadow-[0_0_20px_rgba(255,215,0,0.4)] flex gap-1 justify-center mb-2">
                {['S','h','e','p','h','e','r','d'].map((char, i) => (
                    <span 
                        key={i} 
                        className="animate-letter-reveal inline-block" 
                        style={{ animationDelay: `${0.3 + i * 0.08}s` }}
                    >
                        {char}
                    </span>
                ))}
             </h1>
             
             {/* SCRIPTURE COMPANION - With Lines */}
             <div className="flex items-center justify-center gap-4 animate-tracking-expand opacity-0" style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }}>
                <div className="h-[2px] w-12 md:w-24 bg-gradient-to-r from-transparent via-amber-200 to-transparent shadow-[0_0_8px_rgba(253,230,138,0.6)]"></div>
                
                <p className="text-amber-100 text-lg md:text-2xl font-semibold uppercase tracking-[0.25em] font-sans drop-shadow-md whitespace-nowrap">
                    Scripture Companion
                </p>
                
                <div className="h-[2px] w-12 md:w-24 bg-gradient-to-r from-transparent via-amber-200 to-transparent shadow-[0_0_8px_rgba(253,230,138,0.6)]"></div>
             </div>
         </div>

         {/* SHEEP ANIMATION - Larger & Running */}
         <div className="absolute bottom-0 left-0 right-0 h-56 overflow-hidden z-30 pointer-events-none">
             {/* Silhouette Hills */}
             <div className="absolute bottom-[-20px] left-[-10%] right-[-10%] h-28 bg-gradient-to-t from-black via-slate-900 to-transparent opacity-60 blur-sm rounded-[100%] scale-110"></div>
             
             {/* Sheep 1 (Leader) - Significantly Larger */}
             <div className="absolute bottom-10 animate-sheep-run" style={{ animationDuration: '4.5s' }}>
                 <div className="animate-sheep-bounce">
                    <svg width="100" height="75" viewBox="0 0 40 30" fill="white" className="drop-shadow-lg opacity-90">
                        {/* Body */}
                        <rect x="5" y="8" width="25" height="15" rx="8" />
                        {/* Head */}
                        <circle cx="32" cy="12" r="6" />
                        {/* Ear */}
                        <path d="M36 10 L40 12 L36 14 Z" />
                        {/* Legs */}
                        <rect x="8" y="20" width="3" height="8" rx="1.5" />
                        <rect x="22" y="20" width="3" height="8" rx="1.5" />
                    </svg>
                 </div>
             </div>

             {/* Sheep 2 (Follower) - Significantly Larger */}
             <div className="absolute bottom-8 animate-sheep-run" style={{ animationDuration: '4.5s', animationDelay: '0.4s' }}>
                 <div className="animate-sheep-bounce" style={{ animationDelay: '0.1s' }}>
                    <svg width="80" height="60" viewBox="0 0 40 30" fill="white" className="drop-shadow-lg opacity-80">
                         {/* Body */}
                        <rect x="5" y="8" width="25" height="15" rx="8" />
                        {/* Head */}
                        <circle cx="32" cy="12" r="6" />
                        {/* Legs */}
                        <rect x="8" y="20" width="3" height="8" rx="1.5" />
                        <rect x="22" y="20" width="3" height="8" rx="1.5" />
                    </svg>
                 </div>
             </div>
         </div>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'dark' : ''} animate-fade-in`}>
      {!session ? (
         <Login 
            isDarkMode={isDarkMode} 
            toggleDarkMode={toggleDarkMode}
            language={language}
         />
      ) : (
        <div className="flex h-screen bg-slate-200 dark:bg-slate-900 overflow-hidden">
          <Sidebar 
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={(id) => {
              setActiveChatId(id);
              setIsSidebarOpen(false);
            }}
            onNewChat={() => createNewChat()}
            onDeleteChat={(id, e) => handleDeleteChat(id)}
            onRenameChat={handleRenameChat}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenDailyVerse={() => setIsDailyVerseOpen(true)}
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
                    language={language}
                />
            )}
            
            {currentView === 'bible' && (
                <BibleReader 
                    language={language}
                    onSaveItem={handleSaveItem}
                    onMenuClick={() => setIsSidebarOpen(true)}
                    highlights={highlights}
                    onAddHighlight={handleAddHighlight}
                    onRemoveHighlight={handleRemoveHighlight}
                />
            )}
            
            {currentView === 'saved' && (
                <SavedCollection 
                    savedItems={savedItems}
                    onRemoveItem={handleRemoveSavedItem}
                    language={language}
                    onMenuClick={() => setIsSidebarOpen(true)}
                />
            )}
          </div>

          <SettingsModal 
             isOpen={isSettingsOpen}
             onClose={() => setIsSettingsOpen(false)}
             preferences={{
                 bibleTranslation: bibleTranslation,
                 theme: isDarkMode ? 'dark' : 'light',
                 language: language,
                 displayName: displayName
             }}
             onUpdatePreference={handleUpdatePreference}
             userEmail={session.user.email}
             onLogout={handleLogout}
          />
          
          <DailyVerseModal 
             isOpen={isDailyVerseOpen}
             onClose={() => setIsDailyVerseOpen(false)}
             isDarkMode={isDarkMode}
             language={language}
          />
        </div>
      )}
    </div>
  );
};

export default App;