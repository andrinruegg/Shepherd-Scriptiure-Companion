
import React, { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle2, MessageSquare, Loader2 } from 'lucide-react';
import { db } from '../services/db';
import { useTranslation } from 'react-i18next';

const FeedbackModal: React.FC<{ isOpen: boolean, onClose: () => void, language: string }> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [type, setType] = useState('bug');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setLoading(true);
    try {
      await db.saveFeedback(type, subject, message);
      setSuccess(true);
      setTimeout(() => { onClose(); setSuccess(false); setSubject(''); setMessage(''); }, 3000);
    } catch (err) {} finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in border dark:border-slate-800">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold font-serif-text text-slate-800 dark:text-white flex items-center gap-3"><MessageSquare size={24} className="text-indigo-600"/>{t('feedback.title')}</h2>
            <button onClick={onClose} className="p-1 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full"><X size={20} /></button>
          </div>
          {success ? (
            <div className="py-16 text-center animate-fade-in"><div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div><p className="font-bold text-slate-700 dark:text-slate-200">{t('feedback.success')}</p></div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-slate-500 leading-relaxed">{t('feedback.desc')}</p>
              <div><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">{t('feedback.type')}</label><select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl text-sm outline-none text-white appearance-none cursor-pointer"><option value="bug">{t('feedback.bug')}</option><option value="feature">{t('feedback.feature')}</option><option value="suggestion">{t('feedback.suggestion')}</option><option value="other">{t('feedback.other')}</option></select></div>
              <div><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">{t('feedback.subject')}</label><input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t('feedback.subjectPlaceholder')} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl text-sm outline-none text-white focus:ring-2 focus:ring-indigo-500 transition-all" required/></div>
              <div><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">{t('feedback.message')}</label><textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('feedback.messagePlaceholder')} rows={4} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl text-sm outline-none text-white resize-none focus:ring-2 focus:ring-indigo-500 transition-all" required/></div>
              <button type="submit" disabled={loading} className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all mt-4">{loading ? <Loader2 size={24} className="animate-spin" /> : <><Send size={20} /> <span className="text-lg tracking-tight">{t('feedback.submit')}</span></>}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
