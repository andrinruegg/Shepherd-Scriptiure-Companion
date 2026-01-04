
import React, { memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { User, RotateCw, Heart, Languages, Image, Quote } from 'lucide-react';
import ShepherdLogo from './ShepherdLogo';
import { translateContent } from '../services/geminiService';
import { useTranslation } from 'react-i18next';

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
    message, isLast, onRegenerate, isRegenerating, userAvatar, onSave, language, onOpenComposer
}) => {
  const { t } = useTranslation();
  const isUser = message.role === 'user';
  const [isSaved, setIsSaved] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
      if (translatedText) { setTranslatedText(null); return; }
      setIsTranslating(true);
      try { setTranslatedText(await translateContent(message.text, language || 'English')); } catch (e) {} finally { setIsTranslating(false); }
  };

  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'} animate-pop-in group`}>
      <div className="flex gap-3 md:gap-4 max-w-[92%] items-start">
        {!isUser && (<div className="flex-shrink-0 w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg mt-1"><ShepherdLogo size={18} /></div>)}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-6 py-5 shadow-sm text-sm md:text-base leading-relaxed rounded-[1.75rem] transition-all duration-300 ${isUser ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/20' : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-tl-none font-serif-text border dark:border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)]'}`}>
            {(!isUser && isLast && !message.text) ? (<div className="flex space-x-1.5 h-6 items-center px-2"><div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"/><div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"/><div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"/></div>) : (
              <div className="markdown-content">
                <ReactMarkdown components={{ blockquote: props => <blockquote className="border-l-4 border-indigo-400 pl-6 py-3 my-4 bg-indigo-50 dark:bg-indigo-900/20 italic rounded-r-2xl font-serif-text" {...props} /> }}>{message.text}</ReactMarkdown>
                {translatedText && <div className="mt-5 pt-4 border-t dark:border-slate-800 text-sm italic opacity-90"><div className="text-[10px] uppercase font-black mb-1 opacity-60 tracking-widest text-indigo-500">{t('common.translated')}:</div>{translatedText}</div>}
              </div>
            )}
            {message.text && <div className={`text-[10px] mt-4 opacity-60 w-full text-right font-black tracking-widest uppercase ${isUser ? 'text-indigo-100' : 'text-slate-400'}`}>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
          </div>
          <div className="flex items-center gap-3 mt-2 mr-2 self-end opacity-0 group-hover:opacity-100 transition-opacity">
              {message.text && (<button onClick={handleTranslate} className={`p-2 rounded-xl bg-white/60 dark:bg-slate-800 shadow-sm border dark:border-slate-700 transition-all ${isTranslating ? 'text-indigo-500 animate-pulse' : 'text-slate-400 hover:text-indigo-500'}`} title={t('common.translate')}><Languages size={15} /></button>)}
              {!isUser && message.text && (<button onClick={() => onOpenComposer(message.text)} className="p-2 rounded-xl bg-white/60 dark:bg-slate-800 shadow-sm border dark:border-slate-700 transition-all text-slate-400 hover:text-purple-500" title={t('dailyVerse.createImage')}><Image size={15} /></button>)}
              {onSave && (<button onClick={() => { onSave(); setIsSaved(true); setTimeout(() => setIsSaved(false), 2000); }} className={`p-2 rounded-xl bg-white/60 dark:bg-slate-800 shadow-sm border dark:border-slate-700 transition-all ${isSaved ? 'text-rose-500 scale-110' : 'text-slate-400 hover:text-rose-400'}`} title={t('bible.save')}><Heart size={15} className={isSaved ? 'fill-rose-500' : ''} /></button>)}
              {!isUser && isLast && onRegenerate && (<button onClick={onRegenerate} disabled={isRegenerating} className="p-2 rounded-xl bg-white/60 dark:bg-slate-800 shadow-sm border dark:border-slate-700 transition-all text-slate-400 hover:text-indigo-500"><RotateCw size={15} className={isRegenerating ? 'animate-spin' : ''} /></button>)}
          </div>
        </div>
        {isUser && (<div className="flex-shrink-0 w-9 h-9 rounded-2xl mt-1 shadow-md overflow-hidden border-2 border-white dark:border-slate-700">{userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500"><User size={18} /></div>}</div>)}
      </div>
    </div>
  );
};

export default memo(ChatMessage);
