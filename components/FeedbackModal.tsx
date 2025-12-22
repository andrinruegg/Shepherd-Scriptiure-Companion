import React, { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle2, MessageSquare, Loader2, Mail } from 'lucide-react';
import { db } from '../services/db';
import { translations } from '../utils/translations';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, language }) => {
  const [type, setType] = useState('bug');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const t = translations[language]?.feedback || translations['English'].feedback;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setServerError(null);

    // Manual Validation for localized messages
    if (!subject.trim() || !message.trim()) {
        setValidationError(t.requiredField);
        return;
    }

    setLoading(true);

    try {
      // Save to database, including the target mail context as requested
      await db.saveFeedback(type, subject, `${message}\n\n[Route to: andrinruegg732@gmail.com]`);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setSubject('');
        setMessage('');
      }, 3000);
    } catch (err: any) {
      setServerError(t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-scale-in border border-slate-100 dark:border-slate-800">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
                <MessageSquare size={24} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white font-serif-text">{t.title}</h2>
            </div>
            <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <X size={20} />
            </button>
          </div>

          {success ? (
            <div className="py-12 text-center animate-fade-in">
              <div className="inline-flex p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 mb-4">
                <CheckCircle2 size={48} />
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-medium">{t.success}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t.desc}</p>
              
              {(validationError || serverError) && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-2 animate-shake">
                  <AlertCircle size={16} /> {validationError || serverError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">{t.type}</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white appearance-none cursor-pointer"
                >
                  <option value="bug">{t.bug}</option>
                  <option value="feature">{t.feature}</option>
                  <option value="suggestion">{t.suggestion}</option>
                  <option value="other">{t.other}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">{t.subject}</label>
                <input 
                  type="text"
                  value={subject}
                  onChange={(e) => {setSubject(e.target.value); if(validationError) setValidationError(null);}}
                  placeholder={t.subjectPlaceholder}
                  className={`w-full bg-slate-50 dark:bg-slate-800 border ${validationError && !subject ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-colors`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">{t.message}</label>
                <textarea 
                  value={message}
                  onChange={(e) => {setMessage(e.target.value); if(validationError) setValidationError(null);}}
                  placeholder={t.messagePlaceholder}
                  rows={4}
                  className={`w-full bg-slate-50 dark:bg-slate-800 border ${validationError && !message ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white resize-none transition-colors`}
                  required
                />
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium px-1">
                 <Mail size={12}/>
                 <span>{t.targetEmail}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <><Send size={18} /> {t.submit}</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;