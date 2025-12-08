
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
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
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
      // Optimistic update
      setSavedItems(prev => [item, ...prev]);
      // alert("Item saved to collection!"); // Removed alert for smoother UX
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
      // Optimistic
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

  if (!supabase) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
         <SetupScreen />
      </div>
    );
  }

  const loadChats = async () => {
    try {
      const userChats = await db.getUserChats();
      setChats(userChats);
      if (userChats.length > 0) {
        setActiveChatId(userChats[0].id);
      } else {
        createNewChat();
      }
    } catch (error) {
      console.error("Failed to load chats:", error);
    }
  };

  const createNewChat = async () => {
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
        messages: [welcomeMsg]
    };
    
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(tempId);
    setCurrentView('chat');

    try {
        const savedChat = await db.createChat(newChat.title, welcomeMsg);
        setChats(prev => prev.map(c => c.id === tempId ? savedChat : c));
        setActiveChatId(savedChat.id);
        return savedChat.id;
    } catch (e) {
        console.error("Error creating chat in DB", e);
        return null;
    }
  };

  const handleDeleteChat = async (chatId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
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

    if (chats.length <= 1) { 
         setTimeout(() => {
             if (nextActiveId === null) createNewChat();
         }, 50);
    }

    try {
        await db.deleteChat(chatId);
    } catch (err: any) {
        console.error("Failed to delete chat", err);
        alert("Could not delete chat from server. Restoring.");
        setChats(chatsBackup);
        setActiveChatId(chatId);
    }
  };

  const handleRenameChat = async (chatId: string, newTitle: string) => {
     setChats(prev => prev.map(c => c.id === chatId ? { ...c, title: newTitle } : c));
     try {
         await db.updateChatTitle(chatId, newTitle);
     } catch (e) {
         console.error("Failed to rename", e);
     }
  };

  const handleLogout = async () => {
     if (supabase) await supabase.auth.signOut();
  };

  const handleSendMessage = async (text: string, hiddenContext?: string) => {
    if (!activeChatId) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      text: text,
      timestamp: new Date().toISOString(),
      hiddenContext: hiddenContext
    };

    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          messages: [...chat.messages, userMessage]
        };
      }
      return chat;
    }));

    setIsLoading(true);

    const currentChat = chats.find(c => c.id === activeChatId);
    
    if (currentChat && currentChat.messages.length <= 1) {
        generateChatTitle(text).then(smartTitle => {
            handleRenameChat(activeChatId, smartTitle);
        });
    }

    try {
        await db.addMessage(activeChatId, userMessage);
    } catch (e) {
        console.error("Failed to save user message", e);
    }

    const aiMessageId = uuidv4();
    const initialAiMessage: Message = {
      id: aiMessageId,
      role: 'model',
      text: '',
      timestamp: new Date().toISOString(),
    };

    setChats(prevChats => prevChats.map(chat => 
      chat.id === activeChatId 
        ? { ...chat, messages: [...chat.messages, initialAiMessage] } 
        : chat
    ));

    const historyPayload = currentChat 
        ? [...currentChat.messages, userMessage] 
        : [userMessage]; 

    await streamAIResponse(activeChatId, aiMessageId, historyPayload, text, hiddenContext, initialAiMessage);
  };

  const handleRegenerate = async () => {
      if (!activeChatId) return;
      const currentChat = chats.find(c => c.id === activeChatId);
      if (!currentChat) return;

      const messages = currentChat.messages;
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage.role !== 'model') return;

      const lastUserMessage = messages[messages.length - 2];
      if (!lastUserMessage || lastUserMessage.role !== 'user') return;

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
                  messages: [...chat.messages.slice(0, -1), newAiMessage]
              };
          }
          return chat;
      }));

      const historyPayload = messages.slice(0, -1); 
      const regenContext = `Regeneration-${uuidv4()} ${lastUserMessage.hiddenContext || ''}`;
      
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
        const errorMsg = "I apologize, but I encountered a connection error. Please try again.";
        setChats(prevChats => prevChats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: chat.messages.map(msg => 
                msg.id === messageId ? { ...msg, isError: true, text: errorMsg } : msg
              )
            };
          }
          return chat;
        }));
        setIsLoading(false);
      }
    );
  };

  const activeChat = chats.find(c => c.id === activeChatId);
  const activeMessages = activeChat ? activeChat.messages.map(m => ({
    ...m,
    timestamp: new Date(m.timestamp)
  })) : [];

  if (showSplash || loadingAuth) {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-indigo-600 transition-opacity duration-500 ${!showSplash && !loadingAuth ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
         <div className="animate-scale-in">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl mb-6">
                <ShepherdLogo size={64} className="text-indigo-600" />
            </div>
         </div>
         <div className="text-center animate-slide-up">
            <h1 className="text-3xl font-bold text-white font-serif-text mb-2">Shepherd</h1>
            <p className="text-indigo-200 text-sm font-medium tracking-widest uppercase">Scripture Companion</p>
         </div>
         <div className="absolute bottom-12">
            <div className="flex gap-2">
               <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
               <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
               <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
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
            onDeleteChat={handleDeleteChat}
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
