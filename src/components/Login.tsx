
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { ArrowRight, Mail, Lock, AlertCircle, CheckCircle2, Moon, Sun, Eye, EyeOff, User, Globe, BadgeCheck, Inbox, RefreshCw } from 'lucide-react';
import ShepherdLogo from './ShepherdLogo';
import { useTranslation } from 'react-i18next';

interface LoginProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    language: string;
    onSetLanguage: (lang: string) => void;
}

const SUPPORTED_LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'ro', label: 'Română' },
  { id: 'de', label: 'Deutsch' },
  { id: 'es', label: 'Español' },
  { id: 'fr', label: 'Français' },
  { id: 'it', label: 'Italiano' },
  { id: 'pt', label: 'Português' },
  { id: 'zh', label: '中文' },
  { id: 'ja', label: '日本語' },
  { id: 'ko', label: '한국어' }
];

const Login: React.FC<LoginProps> = ({ isDarkMode, toggleDarkMode, language, onSetLanguage }) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(''); 
  const [showPassword, setShowPassword] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
      if (typeof window !== 'undefined' && window.location.hash) {
           const params = new URLSearchParams(window.location.hash.substring(1));
           if (params.get('type') === 'signup' || params.get('access_token')) {
               setIsVerified(true); setAuthMode('signin');
               setSuccessMsg(t('login.successCreated'));
               window.history.replaceState(null, '', window.location.pathname);
           }
      }
  }, [t]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true); setErrorMsg(null); setSuccessMsg(null);
    try {
        if (authMode === 'forgot') {
             const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
             if (error) throw error;
             setSuccessMsg(t('login.resetText')); setIsEmailSent(true);
        } else if (authMode === 'signup') {
            const { error, data } = await supabase.auth.signUp({ email, password, options: { data: { full_name: displayName, language } } });
            if (error) throw error;
            if (data.user && !data.session) { setIsEmailSent(true); setSuccessMsg(t('login.successCreated')); }
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        }
    } catch (error: any) { setErrorMsg(error.message || t('common.error')); }
    finally { setLoading(false); }
  };

  const handleLangSelect = (l: {id: string, label: string}) => {
    i18n.changeLanguage(l.id);
    onSetLanguage(l.label);
    setShowLangMenu(false);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-slate-950 flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden transition-colors">
        <div className="absolute top-6 right-6 flex gap-2 z-30">
            <button onClick={() => setShowLangMenu(!showLangMenu)} className="p-2.5 rounded-full bg-white/60 dark:bg-slate-800 backdrop-blur-md text-slate-500 shadow-sm border dark:border-slate-700 flex items-center gap-2">
                <Globe size={18} />
                <span className="text-xs font-black uppercase">{i18n.language.substring(0, 2)}</span>
            </button>
            {showLangMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border dark:border-slate-700 overflow-y-auto max-h-64 animate-scale-in z-50">
                    {SUPPORTED_LANGUAGES.map(l => (
                        <button key={l.id} onClick={() => handleLangSelect(l)} className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 ${i18n.language.startsWith(l.id) ? 'text-indigo-600 font-bold' : 'text-slate-600 dark:text-slate-300'}`}>{l.label}</button>
                    ))}
                </div>
            )}
            <button onClick={toggleDarkMode} className="p-2.5 rounded-full bg-white/60 dark:bg-slate-800 backdrop-blur-md text-slate-500 shadow-sm border dark:border-slate-700">{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
        </div>

        <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/95 backdrop-blur-3xl rounded-[3rem] shadow-xl overflow-hidden border border-white dark:border-slate-800 relative z-20 animate-scale-in">
            {isEmailSent ? (
                <div className="p-10 text-center animate-fade-in">
                    <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 mx-auto mb-8"><Inbox size={42} className="animate-bounce" /></div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 font-serif-text">{t('login.checkEmail')}</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-8 italic">"{successMsg}"</p>
                    <button onClick={() => setIsEmailSent(false)} className="flex items-center justify-center gap-2 mx-auto text-indigo-600 font-bold hover:underline"><RefreshCw size={14} /> {t('login.hasAccountBtn')}</button>
                </div>
            ) : (
                <div className="p-10">
                    <div className="text-center mb-8">
                        <ShepherdLogo size={64} className="mx-auto mb-4 text-indigo-600" />
                        <h1 className="text-3xl font-bold font-serif-text text-slate-900 dark:text-white">{authMode === 'signin' ? t('login.welcomeBack') : authMode === 'signup' ? t('login.createAccount') : t('login.forgotPassword')}</h1>
                        <p className="text-sm text-slate-500 mt-2">{authMode === 'signin' ? t('login.signInText') : authMode === 'signup' ? t('login.signUpText') : t('login.resetText')}</p>
                    </div>

                    {errorMsg && <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-2xl flex items-start gap-3 border border-red-100"><AlertCircle size={18} className="shrink-0" /><span>{errorMsg}</span></div>}

                    <form onSubmit={handleLogin} className="space-y-4">
                        {authMode === 'signup' && (
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="text" required value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" placeholder={t('login.displayNamePlaceholder')} />
                            </div>
                        )}
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" placeholder={t('login.emailPlaceholderExample')} />
                        </div>
                        {authMode !== 'forgot' && (
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" placeholder={t('login.passwordPlaceholderExample')} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                            </div>
                        )}
                        <button type="submit" disabled={loading} className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-95">
                            {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span className="text-lg">{authMode === 'signin' ? t('login.signInBtn') : authMode === 'signup' ? t('login.signUpBtn') : t('login.sendReset')}</span><ArrowRight size={20} /></>}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')} className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">{authMode === 'signin' ? t('login.noAccount') : t('login.hasAccount')}</button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default Login;
