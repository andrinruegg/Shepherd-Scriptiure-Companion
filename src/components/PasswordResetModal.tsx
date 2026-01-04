
import React, { useState } from 'react';
import { Lock, CheckCircle2, X } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useTranslation } from 'react-i18next';

const PasswordResetModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border dark:border-slate-800 shadow-2xl animate-scale-in text-center">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8"><Lock size={40} className="text-indigo-600"/></div>
            <h2 className="text-2xl font-bold font-serif-text text-slate-800 dark:text-white mb-4">{t('login.setNewPassword')}</h2>
            {success ? (
                <div className="py-8 animate-fade-in"><div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600"><CheckCircle2 size={32}/></div><p className="font-bold text-slate-900 dark:text-white text-lg">{t('login.passwordUpdated')}</p><p className="text-sm text-slate-500 mt-2">{t('login.loggingOut')}</p></div>
            ) : (
                <form onSubmit={e=>{e.preventDefault(); if(password.length>=6) supabase?.auth.updateUser({password}).then(()=>setSuccess(true));}} className="space-y-4">
                    <input autoFocus type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={t('login.newPassword')} className="w-full p-5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl outline-none text-white text-center text-xl font-mono tracking-widest focus:ring-4 focus:ring-indigo-500/10"/>
                    <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl active:scale-95 transition-all text-lg">{t('login.updatePassword')}</button>
                </form>
            )}
        </div>
    </div>
  );
};

export default PasswordResetModal;
