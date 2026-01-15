import React, { useState } from 'react';
import { X, Copy, Calendar, Check, Image } from 'lucide-react';
import { getDailyVerse } from '../services/dailyVerseService';
import ShepherdLogo from './ShepherdLogo';
import { useTranslation } from 'react-i18next';

interface DailyVerseModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  language: string;
  onOpenComposer: (text: string, ref: string) => void;
}

const DailyVerseModal: React.FC<DailyVerseModalProps> = ({ isOpen, onClose, language, onOpenComposer }) => {
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
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-scale-in border border-slate-100 dark:border-slate-800">
        
        <div className="h-32 bg-emerald-700 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-600/50 to-emerald-800/80"></div>
            <div className="relative z-10 flex flex-col items-center text-white">
                <Calendar className="mb-2 opacity-80" size={24} />
                <h2 className="text-xl font-bold font-serif-text tracking-wide">{t('dailyVerse.title')}</h2>
                <div className="w-12 h-1 bg-white/30 rounded-full mt-2"></div>
            </div>
            
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition-colors backdrop-blur-sm"
            >
                <X size={18} />
            </button>
        </div>

        <div className="p-8 text-center">
            <div className="mb-6">
                <ShepherdLogo className="mx-auto text-emerald-600 dark:text-emerald-400 mb-4 opacity-50" size={32} />
                <blockquote className="text-xl md:text-2xl leading-relaxed font-serif-text text-slate-800 dark:text-slate-100 italic">
                    "{verse.text}"
                </blockquote>
                <p className="mt-4 text-emerald-700 dark:text-emerald-400 font-bold tracking-wide uppercase text-sm">
                    {verse.reference}
                </p>
            </div>

            <div className="flex items-center justify-center gap-3">
                <button 
                    onClick={handleCopy}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-colors text-sm ${copied ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copied ? t('dailyVerse.copied') : t('dailyVerse.copy')}</span>
                </button>

                <button 
                    onClick={() => { onOpenComposer(verse.text, verse.reference); onClose(); }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-colors text-sm bg-[#7c4a32] hover:bg-[#54362d] text-white shadow-lg shadow-[#7c4a32]/30"
                >
                    <Image size={16} />
                    <span>{t('dailyVerse.createImage')}</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DailyVerseModal;