import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { User, RotateCw } from 'lucide-react';
import ShepherdLogo from './ShepherdLogo';

interface ChatMessageProps {
  message: Message;
  isLast: boolean;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
  userAvatar?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLast, onRegenerate, isRegenerating, userAvatar }) => {
  const isUser = message.role === 'user';

  // "Thinking" state check: If it's the model, text is empty/whitespace, and it's the last message
  const isThinking = !isUser && isLast && (!message.text || message.text.trim() === '') && !message.isError;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-pop-in`}>
      <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] items-end`}>
        
        {/* Shepherd Avatar - Only show if not user */}
        {!isUser && (
          <div className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm mb-1
            bg-emerald-600 text-white transform transition-transform hover:scale-110
          `}>
            <ShepherdLogo size={16} className="text-white" />
          </div>
        )}

        {/* Bubble */}
        <div className={`flex flex-col min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`
            px-4 py-3 shadow-sm text-sm md:text-base leading-relaxed break-words w-full
            ${isUser 
              ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none origin-bottom-right' 
              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-none font-serif-text origin-bottom-left'}
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
                           className="border-l-4 border-indigo-300 dark:border-indigo-500 pl-3 py-1 my-3 bg-indigo-50/10 dark:bg-slate-900/50 italic rounded-r"
                           {...props} 
                        />
                      ),
                      p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold opacity-90" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2 space-y-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2 space-y-1" {...props} />,
                      h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2" {...props} />,
                      // Ensure code blocks from error messages wrap properly
                      code: ({node, ...props}) => <code className="bg-black/10 dark:bg-white/10 px-1 rounded break-all whitespace-pre-wrap" {...props} />
                   }}
                >
                  {message.text}
                </ReactMarkdown>
              </div>
            )}
            
            {/* Timestamp */}
            {!isThinking && (
              <div className={`text-[10px] mt-1 opacity-70 w-full text-right ${isUser ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'}`}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
          
          {/* Regenerate Button */}
          {!isUser && isLast && !isThinking && onRegenerate && (
              <button 
                 onClick={onRegenerate}
                 disabled={isRegenerating}
                 className="mt-1 mr-1 self-end text-xs text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-opacity animate-fade-in"
              >
                 <RotateCw size={12} className={isRegenerating ? 'animate-spin' : ''} />
                 <span>{message.isError ? 'Retry' : 'Regenerate'}</span>
              </button>
          )}
        </div>

        {/* User Avatar - Only show if user */}
        {isUser && (
           <>
              {userAvatar ? (
                  <img 
                    src={userAvatar} 
                    alt="User" 
                    className="flex-shrink-0 w-8 h-8 rounded-full mb-1 shadow-sm object-cover border-2 border-indigo-600 bg-slate-200 transform transition-transform hover:scale-110"
                  />
              ) : (
                <div className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mb-1 shadow-sm
                    bg-indigo-600 text-white transform transition-transform hover:scale-110
                `}>
                    <User size={16} />
                </div>
              )}
           </>
        )}
      </div>
    </div>
  );
};

export default memo(ChatMessage);