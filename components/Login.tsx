import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase.ts';
import { ArrowRight, Mail, Lock, AlertCircle, CheckCircle2, Moon, Sun, Eye, EyeOff, User, Globe } from 'lucide-react';
import ShepherdLogo from './ShepherdLogo.tsx';
import { translations } from '../utils/translations.ts';

interface LoginProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    language: string;
    onSetLanguage: (lang: string) => void;
}

const Login: React.FC<LoginProps> = ({ isDarkMode, toggleDarkMode, language, onSetLanguage }) => {
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(''); 
  
  const [showPassword, setShowPassword] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const t = translations[language]?.login || translations['English'].login;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
        if (authMode === 'forgot') {
             const { error } = await supabase.auth.resetPasswordForEmail(email, {
                 redirectTo: window.location.origin,
             });
             if (error) throw error;
             setSuccessMsg(t.resetText);
        } else if (authMode === 'signup') {
            const { error, data } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: displayName,
                        language: language
                    }
                }
            });
            if (error) throw error;
            if (data.user && !data.session) {
                setSuccessMsg(t.successCreated);
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
        }
    } catch (error: any) {
        setErrorMsg(error.message || "Authentication failed");
    } finally {
        setLoading(false);
    }
  };

  const LANGUAGES = [
      { id: 'English', label: 'English' },
      { id: 'Romanian', label: 'Română' },
      { id: 'German', label: 'Deutsch' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>

        <div className="absolute top-6 right-6 flex gap-2 z-30">
            <div className="relative">
                <button 
                    onClick={() => setShowLangMenu(!showLangMenu)}
                    className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                >
                    <Globe size={20} />
                    <span className="text-xs font-medium uppercase hidden md:inline">{language.substring(0, 3)}</span>
                </button>
                
                {showLangMenu && (
                    <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-scale-in">
                        {LANGUAGES.map(lang => (
                            <button
                                key={lang.id}
                                onClick={() => { onSetLanguage(lang.id); setShowLangMenu(false); }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 ${language === lang.id ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-300'}`}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-sm hover:shadow-md transition-all"
            >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
        </div>

        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800 relative z-20 animate-scale-in">
            <div className="p-8 text-center">
                 <div className="flex justify-center mb-6">
                     <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <ShepherdLogo size={32} />
                     </div>
                 </div>
                 
                 <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-serif-text">
                     {authMode === 'signin' ? t.welcomeBack : authMode === 'signup' ? t.createAccount : 'Reset Password'}
                 </h1>
                 <p className="text-sm text-slate-500 dark:text-slate-400">
                     {authMode === 'signin' ? t.signInText : authMode === 'signup' ? t.signUpText : t.resetText}
                 </p>
            </div>

            <div className="px-8 pb-8">
                {errorMsg && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-start gap-2 animate-shake">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}
                
                {successMsg && (
                    <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm rounded-xl flex items-start gap-2 animate-fade-in">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                        <span>{successMsg}</span>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    {authMode === 'signup' && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">{t.displayName}</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><User size={18}/></div>
                                <input 
                                    type="text"
                                    required
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
                                    placeholder={t.namePlaceholder || "Your Name"}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">{t.emailPlaceholder}</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Mail size={18}/></div>
                            <input 
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
                                placeholder={t.emailPlaceholderExample || "name@example.com"}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">{t.passwordPlaceholder}</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={18}/></div>
                            <input 
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
                                placeholder={t.passwordPlaceholderExample || "••••••••"}
                                minLength={6}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {authMode === 'signin' && (
                        <div className="flex justify-end">
                            <button 
                                type="button" 
                                onClick={() => { setAuthMode('forgot'); setErrorMsg(null); setSuccessMsg(null); }} 
                                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                {t.forgotPassword}
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>{authMode === 'signin' ? t.signInBtn : authMode === 'signup' ? t.signUpBtn : t.sendReset}</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    {authMode === 'signin' ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t.noAccount}{' '}
                            <button 
                                onClick={() => { setAuthMode('signup'); setErrorMsg(null); setSuccessMsg(null); }} 
                                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                {t.signUpBtn}
                            </button>
                        </p>
                    ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t.hasAccount}{' '}
                            <button 
                                onClick={() => { setAuthMode('signin'); setErrorMsg(null); setSuccessMsg(null); }} 
                                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                {t.signInBtn}
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Login;