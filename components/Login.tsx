
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { ArrowRight, Mail, Lock, AlertCircle, CheckCircle2, Moon, Sun, Eye, EyeOff, User } from 'lucide-react';
import ShepherdLogo from './ShepherdLogo';
import { translations } from '../utils/translations';

interface LoginProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    language: string;
}

const Login: React.FC<LoginProps> = ({ isDarkMode, toggleDarkMode, language }) => {
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(''); 
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const t = translations[language]?.login || translations['English'].login;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        setErrorMsg(t.errorMissing);
        return;
    }

    if (authMode === 'signup' && !displayName.trim()) {
        setErrorMsg("Please enter your name.");
        return;
    }
    
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
        if (authMode === 'signup') {
            console.log("Attempting Signup:", { email, name: displayName });
            const { data, error } = await supabase!.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: displayName.trim(),
                    }
                }
            });
            
            if (error) {
                console.error("Signup API Error:", error);
                throw error;
            }
            
            console.log("Signup Success:", data);
            setSuccessMsg("Account created! You can now Sign In.");
            setAuthMode('signin');
        } else {
            const { error } = await supabase!.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
        }
    } catch (error: any) {
        console.error("Auth Exception:", error);
        
        // Friendly error mapping
        if (error.message?.includes('Database error')) {
            setErrorMsg("System Error: Please ask the developer to run the 'Total Reset' SQL script.");
        } else if (error.message?.includes('Invalid login')) {
             setErrorMsg("Incorrect email or password.");
        } else {
             setErrorMsg(error.message || "Authentication failed.");
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors relative">
      
      {/* Dark Mode Toggle - Top Right */}
      <button 
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 p-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-md border border-slate-200 dark:border-slate-700 transition-colors z-20"
        aria-label="Toggle Dark Mode"
      >
        {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800 relative z-10">
        <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />
          
          <div className="relative z-10">
            <div className="mx-auto bg-white/20 w-16 h-16 rounded-xl flex items-center justify-center backdrop-blur-sm mb-4 shadow-inner">
                <ShepherdLogo className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-1 font-serif-text">Shepherd</h1>
            <p className="text-indigo-100 text-sm font-medium opacity-90">Scripture Companion</p>
          </div>
        </div>
        
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                {authMode === 'signin' ? t.welcomeBack : t.createAccount}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
                {authMode === 'signin' ? t.signInText : t.signUpText}
            </p>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg flex items-start gap-2 border border-red-100 dark:border-red-900/50">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-lg flex items-start gap-2 border border-emerald-100 dark:border-emerald-900/50">
                <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            
            {/* Name Input - Only for Sign Up */}
            {authMode === 'signup' && (
                <div className="relative animate-fade-in">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User size={18} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Your Name (e.g. Alexia)"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required={authMode === 'signup'}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400"
                    />
                </div>
            )}

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={18} />
                </div>
                <input 
                    type="email" 
                    placeholder={t.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400"
                />
            </div>
            
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                </div>
                <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors z-10"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            {/* Remember Me */}
             <div className="flex items-center gap-2">
                 <button 
                    type="button"
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${rememberMe ? 'bg-indigo-600 border-indigo-600' : 'bg-transparent border-slate-300 dark:border-slate-600'}`}
                    aria-checked={rememberMe}
                 >
                    {rememberMe && <CheckCircle2 size={12} className="text-white" />}
                 </button>
                 <button type="button" onClick={() => setRememberMe(!rememberMe)} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                     {t.rememberMe}
                 </button>
             </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-md transform active:scale-95"
            >
                <span>{loading ? 'Processing...' : (authMode === 'signin' ? t.signInBtn : t.signUpBtn)}</span>
                {!loading && <ArrowRight size={16} />}
            </button>
          </form>
          
          <div className="mt-4 text-center">
             <button onClick={() => {
                 setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                 setErrorMsg(null);
                 setSuccessMsg(null);
             }} className="text-xs text-indigo-600 hover:underline font-medium">
                {authMode === 'signin' ? t.noAccount : t.hasAccount}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
