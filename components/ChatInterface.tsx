import React, { useRef, useEffect, useState } from 'react';
import { Send, Menu, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { Message } from '../types';
import ChatMessage from './ChatMessage';
import TopicSelector from './TopicSelector';
import ShepherdLogo from './ShepherdLogo';
import { translations } from '../utils/translations';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string, hiddenContext?: string) => void;
  onMenuClick: () => void;
  onRegenerate: () => void;
  onDeleteCurrentChat?: (e: React.MouseEvent) => void;
  onNewChat: () => void;
  language: string;
  userAvatar?: string;
  onSaveMessage: (message: Message) => void;
  onOpenComposer: (text: string) => void; 
  onOpenSettings: () => void; 
  onNavigateHome: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  isLoading, 
  onSendMessage,
  onMenuClick,
  onRegenerate,
  onDeleteCurrentChat,
  onNewChat,
  language,
  userAvatar,
  onSaveMessage,
  onOpenComposer,
  onOpenSettings,
  onNavigateHome
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesTopRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const t = translations[language]?.chat || translations['English'].chat;
  const commonT = translations[language]?.common || translations['English'].common;

  useEffect(() => {
    const handleResize = () => { setIsMobile(window.innerWidth < 768); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (messages.length <= 1) {
        if (messagesContainerRef.current) messagesContainerRef.current.scrollTop = 0;
    } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isLoading]); 

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue.trim());
    setInputValue('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const safeMessages = messages || [];
  const isInitialState = safeMessages.length === 1 && safeMessages[0].role === 'model';
  const placeholderText = isMobile ? (t.placeholderShort || "Ask Shepherd...") : t.placeholder;

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-transparent">
      {/* Header */}
      <header className="glass-header p-4 pt-safe flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.03)] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border-b border-white/80 dark:border-white/5 relative z-40">
        <div className="flex items-center gap-1">
          {/* Hamburger Menu - ONLY on mobile */}
          <button 
            onClick={onMenuClick} 
            className="p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-black/5 rounded-xl transition-colors md:hidden"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-3 select-none ml-1 md:ml-2">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20 transform hover:scale-105 transition-transform">
                <ShepherdLogo size={24} />
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-slate-800 dark:text-white font-serif-text leading-tight">Shepherd</h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em]">{t.subtitle}</p>
              </div>
              <div className="md:hidden font-serif-text font-bold text-lg text-slate-800 dark:text-white truncate max-w-[100px]">Shepherd</div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2">
            <button 
                onClick={onNewChat}
                className="p-2 md:p-2.5 text-indigo-600 bg-indigo-50/80 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl transition-all flex items-center gap-2 border border-indigo-100/50 dark:border-indigo-800/50 shadow-sm active:scale-95"
                title={commonT.newChat}
            >
                <Plus size={20} strokeWidth={2.5} />
                <span className="text-sm font-bold hidden md:inline">{commonT.newChat}</span>
            </button>
            
            {onDeleteCurrentChat && (
                <button 
                    onClick={onDeleteCurrentChat}
                    className="p-2 md:p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    title="Delete Conversation"
                >
                    <Trash2 size={20} />
                </button>
            )}
        </div>
      </header>

      {/* Messages Area */}
      <main 
         ref={messagesContainerRef}
         className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth pb-10"
      >
        <div ref={messagesTopRef} /> 
        <div className="max-w-3xl mx-auto h-full flex flex-col">
          
          {safeMessages.map((msg, index) => (
            <ChatMessage 
                key={msg.id} 
                message={msg} 
                isLast={index === safeMessages.length - 1}
                onRegenerate={index > 0 ? onRegenerate : undefined}
                isRegenerating={isLoading}
                userAvatar={userAvatar}
                onSave={() => onSaveMessage(msg)}
                language={language}
                onOpenComposer={onOpenComposer}
                onOpenSettings={onOpenSettings} 
            />
          ))}
          
          {isInitialState && !isLoading && (
            <div className="flex-1 flex flex-col justify-center py-6 md:py-10">
               <TopicSelector onSelectTopic={onSendMessage} language={language} />
            </div>
          )}
          
          <div ref={messagesEndRef} className="h-4" /> 
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 md:p-8 pb-8 pb-safe bg-transparent">
        <div className="max-w-3xl mx-auto relative">
          <form 
            onSubmit={handleSubmit} 
            className="relative flex items-end gap-3 bg-white/70 dark:bg-slate-900/80 backdrop-blur-3xl border border-white/90 dark:border-white/10 rounded-[2.25rem] p-2.5 shadow-[0_20px_60px_-15px_rgba(79,70,229,0.12)] dark:shadow-none focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-500 focus-within:bg-white dark:focus-within:bg-slate-900"
          >
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={adjustTextareaHeight}
              onKeyDown={handleKeyDown}
              placeholder={placeholderText}
              className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-[120px] min-h-[48px] py-3.5 px-5 text-slate-800 dark:text-slate-100 placeholder-slate-400 leading-relaxed font-medium"
              rows={1}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className={`
                p-3.5 rounded-full mb-1 flex-shrink-0 transition-all duration-300
                ${isLoading || !inputValue.trim() 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:scale-105 active:scale-95'}
              `}
            >
              <Send size={20} strokeWidth={2.5} />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
};

export default ChatInterface;