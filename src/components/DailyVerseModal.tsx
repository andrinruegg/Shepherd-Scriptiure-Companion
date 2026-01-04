
import React, { useState } from 'react';
import { X, Copy, Calendar, Check, Image } from 'lucide-react';
import { getDailyVerse } from '../services/dailyVerseService';
import ShepherdLogo from './ShepherdLogo';
import { useTranslation } from 'react-i18next';

const DailyVerseModal: React.FC<{ isOpen: boolean, onClose: () => void, isDarkMode: boolean, language: string, onOpenComposer: (text: string, ref: string) => void }> = ({ isOpen, onClose, language, onOpenComposer }) => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();
  if (!isOpen) return null;
  const verse = getDailyVerse(language);

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${verse.text}" - ${verse.reference}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in border dark:border-slate-800">
        <div className="h-32 bg-emerald-600 flex flex-col items-center justify-center text-white relative overflow-hidden"><div className="absolute inset-0 bg-black/10 animate-aurora"/><Calendar size={28} className="mb-2 opacity-80 relative z-10" /><h2 className="text-2xl font-bold font-serif-text relative z-10">{t('dailyVerse.title')}</h2><button onClick={onClose} className="absolute top-6 right-6 p-2 bg-black/20 rounded-full hover:bg-black/40 relative z-20"><X size={20} /></button></div>
        <div className="p-10 text-center">
            <div className="mb-10"><ShepherdLogo className="mx-auto text-emerald-600 opacity-50 mb-6" size={48} /><blockquote className="text-2xl md:text-3xl leading-relaxed font-serif-text text-slate-800 dark:text-slate-100 italic">"{verse.text}"</blockquote><p className="mt-6 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-[0.3em] text-sm">{verse.reference}</p></div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button onClick={handleCopy} className={`w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>{copied ? <Check size={20} /> : <Copy size={20} />}<span>{copied ? t('dailyVerse.copied') : t('dailyVerse.copy')}</span></button>
                <button onClick={() => { onOpenComposer(verse.text, verse.reference); onClose(); }} className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all transform active:scale-95"><Image size={20} /><span>{t('dailyVerse.createImage')}</span></button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DailyVerseModal;
