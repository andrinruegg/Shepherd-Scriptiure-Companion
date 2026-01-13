import React, { useRef, useEffect, useState } from 'react';
import { Send, Menu, Trash2, Plus, Key, ExternalLink, Sparkles, Check, AlertCircle } from 'lucide-react';
import { Message } from '../types';
import ChatMessage from './ChatMessage';
import TopicSelector from './TopicSelector';
import ShepherdLogo from './ShepherdLogo';
import { useTranslation } from 'react-i18next';

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
  messages, isLoading, onSendMessage, onMenuClick, onRegenerate, onDeleteCurrentChat, onNewChat, language, userAvatar, onSaveMessage, onOpenComposer, onOpenSettings, hasApiKey, onUpdateManualKey
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [keyInputValue, setKeyInputValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-transparent">
      <header className="glass-header p-4 flex items-center justify-between bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border-b dark:border-white/5 z-40">
        <div className="flex items-center gap-1">
          <button onClick={onMenuClick} className="p-2 -ml-2 text-slate-600 dark:text-slate-400 md:hidden"><Menu size={24} /></button>
          <div className="flex items-center gap-3 select-none ml-1 md:ml-2">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl text-white shadow-lg"><ShepherdLogo size={24} /></div>
              <div className="hidden md:block"><h1 className="text-xl font-bold text-slate-800 dark:text-white font-serif-text leading-tight">{t('common.shepherd')}</h1><p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em]">{t('chat.subtitle')}</p></div>
              <div className="md:hidden font-serif-text font-bold text-lg text-slate-800 dark:text-white truncate max-w-[100px]">{t('common.shepherd')}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={onNewChat} className="p-2 md:p-2.5 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl transition-all flex items-center gap-2 border border-indigo-100 shadow-sm"><Plus size={20} strokeWidth={2.5} /><span className="text-sm font-bold hidden md:inline">{t('common.newChat')}</span></button>
            {onDeleteCurrentChat && <button onClick={onDeleteCurrentChat} className="p-2 text-slate-400 hover:text-red-500 rounded-xl transition-colors"><Trash2 size={20} /></button>}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-10">
        <div className="max-w-3xl mx-auto h-full flex flex-col">
          {!hasApiKey ? (
              <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
                  <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-3xl p-8 rounded-[3rem] border dark:border-slate-800 shadow-xl max-w-xl w-full text-center relative overflow-hidden">
                      <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-[2rem] flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-6"><Key size={28} /></div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-serif-text">{t('chat.missingKeyTitle')}</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">{t('chat.missingKeyDesc')}</p>
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-8 text-left border dark:border-slate-700">
                         <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2"><Sparkles size={12} className="text-indigo-400" />{t('chat.instructions')}</h4>
                         <ul className="space-y-4">
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-xs font-black">1</span>
                                <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noreferrer" className="text-sm text-slate-600 dark:text-slate-300 font-bold hover:underline flex items-center gap-1.5">
                                    {t('chat.howTo.step1')} <ExternalLink size={14} />
                                </a>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-xs font-black">2</span>
                                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{t('chat.howTo.step2')}</p>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-xs font-black">3</span>
                                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{t('chat.howTo.step3')}</p>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-xs font-black">4</span>
                                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{t('chat.howTo.step4')}</p>
                            </li>
                         </ul>
                      </div>
                      <form onSubmit={(e)=>{e.preventDefault(); if(keyInputValue.length < 30) setValidationError(t('chat.invalidKey')); else onUpdateManualKey(keyInputValue.trim());}} className="space-y-4">
                          <input type="password" value={keyInputValue} onChange={e=>setKeyInputValue(e.target.value)} placeholder="AIzaSy..." className="w-full p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl text-center focus:ring-2 focus:ring-indigo-500 outline-none text-white"/>
                          {validationError && <p className="text-red-500 text-xs font-bold">{validationError}</p>}
                          <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg transition-transform active:scale-95">{t('chat.activateBtn')}</button>
                      </form>
                  </div>
              </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <ChatMessage key={msg.id} message={msg} isLast={index === messages.length - 1} onRegenerate={onRegenerate} isRegenerating={isLoading} userAvatar={userAvatar} onSave={() => onSaveMessage(msg)} language={language} onOpenComposer={onOpenComposer} onOpenSettings={onOpenSettings} />
              ))}
              {messages.length === 1 && !isLoading && <div className="flex-1 flex flex-col justify-center"><TopicSelector onSelectTopic={onSendMessage} language={language} /></div>}
            </>
          )}
          <div ref={messagesEndRef} className="h-4" /> 
        </div>
      </main>

      <footer className="p-4 md:p-8 pb-safe">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex items-end gap-3 bg-white/70 dark:bg-slate-900/80 backdrop-blur-3xl border border-white/80 dark:border-white/10 rounded-[2.25rem] p-2.5 shadow-xl">
            <textarea value={inputValue} onChange={e=>setInputValue(e.target.value)} placeholder={window.innerWidth < 768 ? t('chat.placeholderShort') : t('chat.placeholder')} className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-[120px] min-h-[48px] py-3.5 px-5 text-slate-800 dark:text-slate-100" rows={1} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault(); handleSubmit();}}}/>
            <button type="submit" disabled={isLoading || !inputValue.trim()} className={`p-3.5 rounded-full transition-all ${isLoading || !inputValue.trim() ? 'bg-slate-100 dark:bg-slate-800 text-slate-300' : 'bg-indigo-600 text-white hover:scale-105 active:scale-95'}`}><Send size={20} strokeWidth={2.5} /></button>
        </form>
      </footer>
    </div>
  );
};

export default ChatInterface;