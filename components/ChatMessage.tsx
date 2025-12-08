import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { User, RotateCw } from 'lucide-react';
import ShepherdLogo from './ShepherdLogo';

interface ChatMessageProps {
  message: Message;
  isLast: boolean;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLast, onRegenerate, isRegenerating }) => {
  const isUser = message.role === 'user';

  // "Thinking" state check: If it's the model, text is empty/whitespace, and it's the last message
  const isThinking = !isUser && isLast && (!message.text || message.text.trim() === '') && !message.isError;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] items-end`}>
        
        {/* Shepherd Avatar - Only show if not user */}
        {!isUser && (
          <div className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm mb-1
            bg-emerald-600 text-white
          `}>
            <ShepherdLogo size={16} className="text-white" />
          </div>
        )}

        {/* Bubble */}
        <div className={`flex flex-col min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`
            px-4 py-3 shadow-sm text-sm md:text-base leading-relaxed break-words w-full
            ${isUser 
              ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none' 
              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-none font-serif-text'}
            ${message.isError ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border-red-200 dark:border-red-800' : ''}
          `}>
            {message.isError ? (
              <div className="flex flex-col gap-2">
                <p>I apologize, but I encountered a connection error.</p>
              </div>
            ) : isThinking ? (
              <div className="flex items-center space-x-1.5 h-6 px-2">
                 <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                 <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></div>
              </div>
            ) : (
              <div className={`markdown-content ${isUser ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
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
                 className="mt-1 mr-1 self-end text-xs text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-opacity"
              >
                 <RotateCw size={12} className={isRegenerating ? 'animate-spin' : ''} />
                 <span>{message.isError ? 'Retry' : 'Regenerate'}</span>
              </button>
          )}
        </div>

        {/* User Avatar - Only show if user */}
        {isUser && (
          <div className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mb-1 shadow-sm
            bg-indigo-600 text-white
          `}>
            <User size={16} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;