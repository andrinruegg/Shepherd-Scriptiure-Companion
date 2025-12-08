import React, { useRef, useEffect, useState } from 'react';
import { Send, Menu, Trash2 } from 'lucide-react';
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
  onDeleteCurrentChat?: () => void; 
  language: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  isLoading, 
  onSendMessage,
  onMenuClick,
  onRegenerate,
  onDeleteCurrentChat,
  language
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Translations
  const t = translations[language]?.chat || translations['English'].chat;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    onSendMessage(inputValue.trim());
    setInputValue('');
    
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
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

  // Determine if we are in the "Empty State" (just the welcome message)
  const isInitialState = messages.length === 1 && messages[0].role === 'model';

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between z-10 shadow-sm sticky top-0 transition-colors">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <div className="bg-emerald-600 p-2 rounded-lg text-white">
            <ShepherdLogo size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight font-serif-text">Shepherd</h1>
            <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400 font-medium">{t.subtitle}</p>
          </div>
        </div>
        
        {onDeleteCurrentChat && (
            <button 
                onClick={onDeleteCurrentChat}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete Conversation"
            >
                <Trash2 size={20} />
            </button>
        )}
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
        <div className="max-w-3xl mx-auto h-full flex flex-col">
          
          {messages.map((msg, index) => (
            <ChatMessage 
                key={msg.id} 
                message={msg} 
                isLast={index === messages.length - 1}
                onRegenerate={onRegenerate}
                isRegenerating={isLoading}
            />
          ))}
          
          {/* Topic Selector for Initial State */}
          {isInitialState && !isLoading && (
            <div className="flex-1 flex flex-col justify-center pb-10">
               <TopicSelector onSelectTopic={onSendMessage} language={language} />
            </div>
          )}
          
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-3xl mx-auto relative">
          <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-3xl p-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all shadow-inner">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={adjustTextareaHeight}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-[120px] min-h-[44px] py-2.5 px-3 text-slate-800 dark:text-slate-100 placeholder-slate-400"
              rows={1}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className={`
                p-2.5 rounded-full mb-0.5 flex-shrink-0 transition-all duration-200
                ${isLoading || !inputValue.trim() 
                  ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transform hover:scale-105'}
              `}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
};

export default ChatInterface;