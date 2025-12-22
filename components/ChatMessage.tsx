
import React, { memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { User, RotateCw, Heart, Languages, Image } from 'lucide-react';
import ShepherdLogo from './ShepherdLogo';
import { translateContent } from '../services/geminiService';
import { translations } from '../utils/translations';

interface ChatMessageProps {
  message: Message;
  isLast: boolean;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
  userAvatar?: string;
  onSave?: () => void;
  language: string;
  onOpenComposer: (text: string) => void;
  onOpenSettings?: () => void; 
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
    message, 
    isLast, 
    onRegenerate, 
    isRegenerating, 
    userAvatar, 
    onSave, 
    language, 
    onOpenComposer,
    onOpenSettings 
}) => {
  const isUser = message.role === 'user';
  const [isSaved, setIsSaved] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const isThinking = !isUser && isLast && (!message.text || message.text.trim() === '') && !message.isError;

  const handleSave = () => {
      if (onSave) {
          onSave();
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 2000);
      }
  };

  const handleTranslate = async () => {
      if (translatedText) {
          setTranslatedText(null); 
          return;
      }
      setIsTranslating(true);
      try {
          const targetLang = language || 'English';
          const result = await translateContent(message.text, targetLang);
          setTranslatedText(result);
      } catch (e) {
          console.error("Translation failed", e);
      } finally {
          setIsTranslating(false);
      }
  };

  // SMART VERSE EXTRACTION: Find markdown blockquotes or text in quotes
  const handleOpenComposer = () => {
      let textToUse = message.text;
      
      if (!isUser) {
          // 1. Look for markdown blockquotes (preferred)
          const blockquoteMatches = message.text.match(/^> .+/gm);
          if (blockquoteMatches && blockquoteMatches.length > 0) {
              textToUse = blockquoteMatches.map(m => m.replace(/^> /, '')).join('\n');
          } 
          // 2. Look for text in large double quotes if no blockquote
          else {
              const quoteMatches = message.text.match(/"([^"]{30,})"/);
              if (quoteMatches) textToUse = quoteMatches[1];
          }
      }
      
      onOpenComposer(textToUse);
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-pop-in group`}>
      <div className={`flex gap-4 max-w-[85%] md:max-w-[80%] items-end`}>
        
        {!isUser && (
          <div className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg mb-2
            bg-gradient-to-br from-emerald-500 to-teal-600 text-white transform transition-transform hover:scale-110
          `}>
            <ShepherdLogo size={16} className="text-white" />
          </div>
        )}

        <div className={`flex flex-col min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`
            px-5 py-4 shadow-sm text-sm md:text-base leading-relaxed break-words w-full relative
            ${isUser 
              ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-[20px] rounded-tr-none shadow-indigo-500/30' 
              : 'glass-panel text-slate-800 dark:text-slate-100 rounded-[20px] rounded-tl-none font-serif-text border-white/60 dark:border-white/10'}
            ${message.isError ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border-red-200 dark:border-red-800' : ''}
            transition-all duration-300 hover:shadow-md
          `}>
            {isThinking ? (
              <div className="flex items-center space-x-1.5 h-6 px-2">
                 <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                 <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></div>
              </div>
            ) : (
              <div className={`markdown-content ${isUser ? 'text-white' : 'text-slate-800 dark:text-slate-100'} ${message.isError ? 'font-sans text-xs' : ''}`}>
                <ReactMarkdown
                   components={{
                      blockquote: ({node, ...props}) => (
                        <blockquote 
                           className="border-l-4 border-indigo-300 dark:border-indigo-500 pl-4 py-1 my-3 bg-indigo-50/50 dark:bg-indigo-900/20 italic rounded-r-lg"
                           {...props} 
                        />
                      ),
                      p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold opacity-100" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-3 space-y-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-3 space-y-1" {...props} />,
                      h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2 mt-4" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2 mt-3" {...props} />,
                      code: ({node, ...props}) => <code className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono break-all whitespace-pre-wrap" {...props} />
                   }}
                >
                  {message.text}
                </ReactMarkdown>
                
                {translatedText && (
                    <div className="mt-3 pt-3 border-t border-white/20 dark:border-white/10 text-sm italic opacity-90">
                        <div className="text-[10px] uppercase font-bold mb-1 opacity-70">Translated:</div>
                        {translatedText}
                    </div>
                )}
              </div>
            )}
            
            {!isThinking && (
              <div className={`text-[10px] mt-2 opacity-70 w-full text-right ${isUser ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'}`}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 mt-1 mr-1 self-end opacity-0 group-hover:opacity-100 transition-opacity">
              {!isThinking && message.text && (
                  <button
                      onClick={handleTranslate}
                      disabled={isTranslating}
                      className={`text-xs flex items-center gap-1 transition-all ${isTranslating ? 'text-indigo-400 animate-pulse' : 'text-slate-400 dark:text-slate-500 hover:text-indigo-500'}`}
                      title="Translate"
                  >
                      <Languages size={14} />
                  </button>
              )}

              {!isThinking && !isUser && message.text && (
                  <button
                      onClick={handleOpenComposer}
                      className="text-xs flex items-center gap-1 transition-all text-slate-400 dark:text-slate-500 hover:text-purple-500"
                      title="Create Image"
                  >
                      <Image size={14} />
                  </button>
              )}

              {!isThinking && onSave && (
                  <button
                      onClick={handleSave}
                      className={`text-xs flex items-center gap-1 transition-all ${isSaved ? 'text-rose-500 scale-110' : 'text-slate-400 dark:text-slate-500 hover:text-rose-400'}`}
                      title="Save to Collection"
                  >
                      <Heart size={14} className={isSaved ? 'fill-rose-500' : ''} />
                  </button>
              )}

              {!isUser && isLast && !isThinking && onRegenerate && (
                  <button 
                     onClick={onRegenerate}
                     disabled={isRegenerating}
                     className="text-xs text-slate-400 dark:text-slate-500 hover:text-indigo-500 flex items-center gap-1 transition-opacity"
                  >
                     <RotateCw size={14} className={isRegenerating ? 'animate-spin' : ''} />
                  </button>
              )}
          </div>
        </div>

        {isUser && (
           <div className="flex-shrink-0 w-8 h-8 rounded-full mb-2 shadow-md overflow-hidden border-2 border-white dark:border-slate-700 bg-slate-200">
              {userAvatar ? (
                  <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                    <User size={16} />
                </div>
              )}
           </div>
        )}
      </div>
    </div>
  );
};

export default memo(ChatMessage);
