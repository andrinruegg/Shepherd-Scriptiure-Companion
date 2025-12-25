import React, { useRef, useEffect, useState } from 'react';
import { Send, Menu, Trash2, Plus, ArrowLeft, Key, ExternalLink, ShieldCheck, Sparkles, BookOpen, Lock, Check, AlertCircle } from 'lucide-react';
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
  hasApiKey: boolean;
  onSelectApiKey: () => void;
  onUpdateManualKey: (key: string) => void;
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
  onNavigateHome,
  hasApiKey,
  onSelectApiKey,
  onUpdateManualKey
}) => {
  const [inputValue, setInputValue] = useState('');
  const [keyInputValue, setKeyInputValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
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

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const key = keyInputValue.trim();
    
    // Pattern Validation for Gemini Keys (AIzaSy...)
    const isValidPattern = key.startsWith('AIzaSy') && key.length >= 38;
    
    if (!isValidPattern) {
        setValidationError(t.invalidKey);
        return;
    }

    setValidationError(null);
    onUpdateManualKey(key);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    if (!hasApiKey) {
        onSelectApiKey();
        return;
    }
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
          
          {!hasApiKey ? (
              <div className="flex-1 flex flex-col items-center justify-center py-6 animate-fade-in">
                  <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-3xl p-8 md:p-12 rounded-[3rem] border border-white dark:border-slate-800 shadow-[0_40px_100px_-20px_rgba(79,70,229,0.1)] max-w-xl w-full text-center relative overflow-hidden group">
                      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700"></div>
                      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full group-hover:bg-purple-500/20 transition-all duration-700"></div>

                      <div className="relative z-10">
                          <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20 rounded-[2rem] flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-6 shadow-inner border border-indigo-100/50 dark:border-white/5 animate-float">
                              <Key size={28} strokeWidth={1.5} />
                          </div>

                          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 font-serif-text tracking-tight">
                            {t.missingKeyTitle}
                          </h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed font-medium">
                            {t.missingKeyDesc}
                          </p>

                          {/* Simplified Instructions */}
                          <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-100 dark:border-slate-700 text-left">
                             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                                <Sparkles size={12} className="text-indigo-400" />
                                {t.instructions}
                             </h4>
                             <ul className="space-y-4">
                                <li className="flex gap-4">
                                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-xs font-black">1</span>
                                    <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noreferrer" className="text-sm text-slate-600 dark:text-slate-300 font-bold hover:text-indigo-600 hover:underline transition-colors flex items-center gap-1.5">
                                        {t.howTo.step1} <ExternalLink size={14} className="opacity-50" />
                                    </a>
                                </li>
                                <li className="flex gap-4">
                                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-xs font-black">2</span>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{t.howTo.step2}</p>
                                </li>
                                <li className="flex gap-4">
                                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-xs font-black">3</span>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{t.howTo.step3}</p>
                                </li>
                             </ul>
                          </div>

                          <form onSubmit={handleSaveKey} className="space-y-4 mb-10">
                              <div className="relative">
                                  <input 
                                    type="password"
                                    value={keyInputValue}
                                    onChange={(e) => { setKeyInputValue(e.target.value); if(validationError) setValidationError(null); }}
                                    placeholder="AIzaSy..."
                                    className={`w-full p-4 bg-white dark:bg-slate-800 border rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 dark:text-white transition-all text-center font-mono shadow-sm ${validationError ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200 dark:border-slate-700'}`}
                                  />
                                  {validationError && (
                                      <div className="absolute top-full mt-2 left-0 right-0 flex items-center justify-center gap-1.5 text-red-500 text-xs font-bold animate-slide-up">
                                          <AlertCircle size={14} />
                                          {validationError}
                                      </div>
                                  )}
                              </div>
                              <button 
                                type="submit"
                                disabled={!keyInputValue.trim()}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl font-bold shadow-[0_20px_40px_-10px_rgba(79,70,229,0.3)] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:transform-none mt-6"
                              >
                                  <Check size={20} strokeWidth={2.5} />
                                  <span className="text-base tracking-tight">{t.activateBtn}</span>
                              </button>
                          </form>
                          
                          <div className="flex items-center justify-center gap-2 text-slate-400">
                            <Lock size={12} />
                            <p className="text-[10px] uppercase font-black tracking-widest italic opacity-60">
                                {t.disclaimer}
                            </p>
                          </div>
                      </div>
                  </div>
              </div>
          ) : (
            <>
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
            </>
          )}
          
          <div ref={messagesEndRef} className="h-4" /> 
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 md:p-8 pb-8 pb-safe bg-transparent">
        <div className="max-w-3xl auto relative">
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
              disabled={isLoading || (!inputValue.trim() && hasApiKey)}
              className={`
                p-3.5 rounded-full mb-1 flex-shrink-0 transition-all duration-300
                ${isLoading || (!inputValue.trim() && hasApiKey) 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:scale-105 active:scale-95'}
              `}
            >
              {hasApiKey ? <Send size={20} strokeWidth={2.5} /> : <Key size={20} strokeWidth={2.5} />}
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
};

export default ChatInterface;