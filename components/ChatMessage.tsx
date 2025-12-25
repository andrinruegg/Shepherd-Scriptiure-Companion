import React, { memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { User, RotateCw, Heart, Languages, Image, Quote } from 'lucide-react';
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

  const handleOpenComposer = () => {
      let textToUse = message.text;
      if (!isUser) {
          const blockquoteMatches = message.text.match(/^> .+/gm);
          if (blockquoteMatches && blockquoteMatches.length > 0) {
              textToUse = blockquoteMatches.map(m => m.replace(/^> /, '')).join('\n');
          } else {
              const quoteMatches = message.text.match(/"([^"]{30,})"/);
              if (quoteMatches) textToUse = quoteMatches[1];
          }
      }
      onOpenComposer(textToUse);
  };

  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'} animate-pop-in group`}>
      <div className={`flex gap-3 md:gap-4 max-w-[92%] md:max-w-[85%] items-start`}>
        
        {!isUser && (
          <div className={`
            flex-shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg mt-1
            bg-gradient-to-br from-indigo-500 to-indigo-600 text-white transform transition-transform hover:scale-110
          `}>
            <ShepherdLogo size={18} />
          </div>
        )}

        <div className={`flex flex-col min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`
            px-6 py-5 shadow-[0_10px_30px_-10px_rgba(79,70,229,0.08)] text-sm md:text-base leading-relaxed break-words w-full relative
            ${isUser 
              ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-[1.75rem] rounded-tr-none shadow-indigo-500/20' 
              : 'bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 rounded-[1.75rem] rounded-tl-none font-serif-text border border-white/60 dark:border-white/10 backdrop-blur-md shadow-[0_15px_30px_-10px_rgba(0,0,0,0.04)] dark:shadow-none border-b-indigo-100/50 dark:border-b-indigo-900/30'}
            ${message.isError ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border-red-100' : ''}
            transition-all duration-300
          `}>
            {isThinking ? (
              <div className="flex items-center space-x-1.5 h-6 px-2">
                 <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                 <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce"></div>
              </div>
            ) : (
              <div className={`markdown-content ${isUser ? 'text-white' : 'text-slate-800 dark:text-slate-100'} ${message.isError ? 'font-sans text-xs' : ''}`}>
                <ReactMarkdown
                   components={{
                      blockquote: ({node, ...props}) => (
                        <blockquote 
                           className="border-l-4 border-indigo-400 dark:border-indigo-500 pl-6 py-3 my-4 bg-indigo-50/40 dark:bg-indigo-900/20 italic rounded-r-2xl font-serif-text relative"
                           {...props} 
                        >
                            <Quote size={12} className="absolute left-2 top-2 text-indigo-300 dark:text-indigo-600 opacity-50" />
                            {props.children}
                        </blockquote>
                      ),
                      p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold opacity-100" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc ml-5 mb-4 space-y-1.5" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal ml-5 mb-4 space-y-1.5" {...props} />,
                      h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-3 mt-4" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-3 mt-3" {...props} />,
                      code: ({node, ...props}) => <code className="bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono break-all whitespace-pre-wrap" {...props} />
                   }}
                >
                  {message.text}
                </ReactMarkdown>
                
                {translatedText && (
                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/10 text-sm italic opacity-90">
                        <div className="text-[10px] uppercase font-black mb-1 opacity-60 tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Translated:</div>
                        {translatedText}
                    </div>
                )}
              </div>
            )}
            
            {!isThinking && (
              <div className={`text-[10px] mt-4 opacity-60 w-full text-right ${isUser ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'} font-black tracking-widest uppercase`}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 mt-2 mr-2 self-end opacity-0 group-hover:opacity-100 transition-opacity">
              {!isThinking && message.text && (
                  <button
                      onClick={handleTranslate}
                      disabled={isTranslating}
                      className={`p-2 rounded-xl bg-white/60 dark:bg-slate-800 shadow-sm border border-white/60 dark:border-slate-700 backdrop-blur-md transition-all ${isTranslating ? 'text-indigo-400 animate-pulse' : 'text-slate-400 dark:text-slate-500 hover:text-indigo-500'}`}
                      title="Translate"
                  >
                      <Languages size={15} />
                  </button>
              )}

              {!isThinking && !isUser && message.text && (
                  <button
                      onClick={handleOpenComposer}
                      className="p-2 rounded-xl bg-white/60 dark:bg-slate-800 shadow-sm border border-white/60 dark:border-slate-700 backdrop-blur-md transition-all text-slate-400 dark:text-slate-500 hover:text-purple-500"
                      title="Create Image"
                  >
                      <Image size={15} />
                  </button>
              )}

              {!isThinking && onSave && (
                  <button
                      onClick={handleSave}
                      className={`p-2 rounded-xl bg-white/60 dark:bg-slate-800 shadow-sm border border-white/60 dark:border-slate-700 backdrop-blur-md transition-all ${isSaved ? 'text-rose-500 scale-110' : 'text-slate-400 dark:text-slate-500 hover:text-rose-400'}`}
                      title="Save to Collection"
                  >
                      <Heart size={15} className={isSaved ? 'fill-rose-500' : ''} />
                  </button>
              )}

              {!isUser && isLast && !isThinking && onRegenerate && (
                  <button 
                     onClick={onRegenerate}
                     disabled={isRegenerating}
                     className="p-2 rounded-xl bg-white/60 dark:bg-slate-800 shadow-sm border border-white/60 dark:border-slate-700 backdrop-blur-md transition-all text-slate-400 dark:text-slate-500 hover:text-indigo-500"
                  >
                     <RotateCw size={15} className={isRegenerating ? 'animate-spin' : ''} />
                  </button>
              )}
          </div>
        </div>

        {isUser && (
           <div className="flex-shrink-0 w-9 h-9 rounded-2xl mt-1 shadow-md overflow-hidden border-2 border-white dark:border-slate-700 bg-slate-200">
              {userAvatar ? (
                  <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-600">
                    <User size={18} />
                </div>
              )}
           </div>
        )}
      </div>
    </div>
  );
};

export default memo(ChatMessage);