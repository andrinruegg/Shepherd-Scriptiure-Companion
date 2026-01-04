import React, { useState, useEffect, useRef } from 'react';
import { X, Moon, Sun, LogOut, User, Globe, Info, Edit2, Check, AlignLeft, CloudSnow, Sparkles, Droplets, Crown, Heart, Camera, Trash2, Snowflake, AlertCircle, Key, ShieldCheck, ExternalLink } from 'lucide-react';
import { UserPreferences } from '../types';
import { useTranslation } from 'react-i18next';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreference: (key: keyof UserPreferences, value: string | boolean) => void;
  userEmail?: string;
  userId?: string; 
  onLogout: () => void;
  hasApiKey: boolean;
  onSelectApiKey: () => void;
  onUpdateManualKey: (key: string) => void;
}

const LANGUAGES = [
  { id: 'en', name: 'English' },
  { id: 'ro', name: 'Română' },
  { id: 'de', name: 'Deutsch' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreference,
  userEmail,
  onLogout,
  hasApiKey,
  onUpdateManualKey
}) => {
  const { t, i18n } = useTranslation();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(preferences.displayName || '');
  const [nameError, setNameError] = useState<string | null>(null);

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState(preferences.bio || '');

  const [manualKeyInput, setManualKeyInput] = useState(localStorage.getItem('shepherd_api_key') || '');
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      if (isOpen) {
          setTempName(preferences.displayName || '');
          setTempBio(preferences.bio || '');
          setManualKeyInput(localStorage.getItem('shepherd_api_key') || '');
          setValidationError(null);
          setNameError(null);
      }
  }, [isOpen, preferences.displayName, preferences.bio]);

  if (!isOpen) return null;

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const code = e.target.value;
      i18n.changeLanguage(code);
      const mapLegacy: Record<string, string> = { 'en': 'English', 'de': 'German', 'ro': 'Romanian' };
      onUpdatePreference('language', mapLegacy[code] || 'English');
  };

  const handleSaveName = () => {
    setNameError(null);
    const trimmed = tempName.trim();
    
    if (trimmed === "") {
        onUpdatePreference('displayName', 'guest');
        setIsEditingName(false);
        return;
    }

    if (trimmed.toLowerCase() === 'guest') {
        setNameError(t('settings.nameInvalid'));
        return;
    }

    if (trimmed.length < 4) {
        setNameError(t('settings.nameMinLength'));
        return;
    }

    onUpdatePreference('displayName', trimmed);
    setIsEditingName(false);
  };

  const handleSaveBio = () => {
      onUpdatePreference('bio', tempBio);
      setIsEditingBio(false);
  };

  const handleUpdateKey = (e: React.FormEvent) => {
      e.preventDefault();
      const key = manualKeyInput.trim();
      if (key.length > 0 && key.length < 30) {
          setValidationError(t('settings.apiKey.invalidLength'));
          return;
      }
      setValidationError(null);
      onUpdateManualKey(key);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 200; 
          let width = img.width, height = img.height;
          if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } }
          else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            onUpdatePreference('avatar', canvas.toDataURL('image/jpeg', 0.8));
          }
        };
        if (event.target?.result) img.src = event.target.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const isDarkMode = preferences.theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white font-serif-text">{t('settings.title')}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"><X size={20} /></button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto no-scrollbar">
          <section>
            <div className="flex flex-col items-center mb-10">
                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-lg mb-4 relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {preferences.avatar ? <img src={preferences.avatar} className="w-full h-full object-cover" /> : <User size={48} className="text-slate-300 m-auto mt-6" />}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera size={24} className="text-white" /></div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                
                {isEditingName ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex gap-2">
                            <input autoFocus value={tempName} onChange={e => setTempName(e.target.value)} className="p-1 bg-slate-50 dark:bg-slate-800 border rounded-lg text-center font-bold outline-none dark:text-white" placeholder="Name" />
                            <button onClick={handleSaveName} className="text-emerald-500"><Check size={20}/></button>
                        </div>
                        {nameError && <p className="text-[10px] text-red-500 font-bold text-center">{nameError}</p>}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 group">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{preferences.displayName || t('common.guest')}</h3>
                        <button onClick={() => setIsEditingName(true)} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 size={14}/></button>
                    </div>
                )}
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">{userEmail}</p>

                {/* BIO SECTION */}
                <div className="mt-4 w-full text-center">
                    {isEditingBio ? (
                        <div className="flex flex-col gap-2">
                            <textarea 
                                value={tempBio} 
                                onChange={e => setTempBio(e.target.value)} 
                                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm outline-none dark:text-white resize-none" 
                                rows={3}
                                placeholder={t('settings.bio')}
                            />
                            <div className="flex gap-2">
                              <button onClick={handleSaveBio} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold">{t('common.save')}</button>
                              <button onClick={() => setIsEditingBio(false)} className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-2 rounded-lg text-xs font-bold">{t('common.cancel')}</button>
                            </div>
                        </div>
                    ) : (
                        <div className="group relative px-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400 italic line-clamp-2">
                                {preferences.bio || t('settings.noBio')}
                            </p>
                            <button onClick={() => setIsEditingBio(true)} className="absolute -top-1 -right-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"><Edit2 size={12}/></button>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center justify-between">
                        <span>{t('settings.apiKey.title')}</span>
                        <span className={hasApiKey ? 'text-emerald-500' : 'text-amber-500'}>{hasApiKey ? t('settings.apiKey.custom') : t('settings.apiKey.missing')}</span>
                    </p>
                    <form onSubmit={handleUpdateKey} className="space-y-3">
                        <div className="flex gap-2">
                            <input type="password" value={manualKeyInput} onChange={e => setManualKeyInput(e.target.value)} placeholder="AIzaSy..." className="flex-1 bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono outline-none dark:text-white" />
                            <button type="submit" className="bg-indigo-600 text-white px-4 rounded-xl font-bold text-xs shadow-sm">{t('settings.apiKey.save')}</button>
                        </div>
                        {validationError && <p className="text-[9px] text-red-500 font-bold px-1">{validationError}</p>}
                        
                        <div className="bg-slate-100 dark:bg-slate-900/50 rounded-xl p-3 mt-4">
                          <p className="text-[10px] font-black text-slate-500 uppercase mb-2">{t('settings.apiKey.howTo')}</p>
                          <ul className="text-[10px] text-slate-500 space-y-1 ml-1">
                            <li>{t('settings.apiKey.step1')}</li>
                            <li>{t('settings.apiKey.step2')}</li>
                            <li>{t('settings.apiKey.step3')}</li>
                            <li>{t('settings.apiKey.step4')}</li>
                          </ul>
                          <div className="pt-3">
                             <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 hover:underline">
                                {t('settings.apiKey.openStudio')} <ExternalLink size={10} />
                            </a>
                          </div>
                        </div>
                    </form>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl">
                    <div className="flex items-center gap-3"><Globe className="text-indigo-500" size={20} /><span className="text-sm font-bold dark:text-white">{t('settings.language')}</span></div>
                    <select value={i18n.language.substring(0, 2)} onChange={handleLanguageChange} className="bg-transparent text-sm font-bold text-indigo-600 outline-none">
                        {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl">
                    <div className="flex items-center gap-3">{isDarkMode ? <Moon className="text-indigo-500" size={20} /> : <Sun className="text-amber-500" size={20} />}<span className="text-sm font-bold dark:text-white">{t('settings.appearance')}</span></div>
                    <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-xl">
                        <button onClick={() => onUpdatePreference('theme', 'light')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${!isDarkMode ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>{t('settings.light')}</button>
                        <button onClick={() => onUpdatePreference('theme', 'dark')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${isDarkMode ? 'bg-slate-900 shadow-sm text-white' : 'text-slate-500'}`}>{t('settings.dark')}</button>
                    </div>
                </div>

                {/* WINTER MODE */}
                <div className="flex flex-col gap-3">
                    <button onClick={() => onUpdatePreference('winterTheme', !preferences.winterTheme)} className={`p-5 rounded-[2rem] border transition-all flex flex-col items-center gap-2 ${preferences.winterTheme ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 text-blue-600' : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-400'}`}>
                        <Snowflake size={24} /><span className="text-[10px] font-black uppercase tracking-widest">{t('settings.winter.title')}</span>
                    </button>
                    
                    {preferences.winterTheme && (
                        <div className="grid grid-cols-3 gap-2 px-2 animate-slide-up">
                            <button onClick={() => onUpdatePreference('winterSnow', !preferences.winterSnow)} className={`py-2 rounded-xl text-[8px] font-black uppercase border transition-all ${preferences.winterSnow ? 'bg-blue-100 border-blue-200 text-blue-600' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>{t('settings.winter.snow')}</button>
                            <button onClick={() => onUpdatePreference('winterLights', !preferences.winterLights)} className={`py-2 rounded-xl text-[8px] font-black uppercase border transition-all ${preferences.winterLights ? 'bg-blue-100 border-blue-200 text-blue-600' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>{t('settings.winter.lights')}</button>
                            <button onClick={() => onUpdatePreference('winterIcicles', !preferences.winterIcicles)} className={`py-2 rounded-xl text-[8px] font-black uppercase border transition-all ${preferences.winterIcicles ? 'bg-blue-100 border-blue-200 text-blue-600' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>{t('settings.winter.icicles')}</button>
                        </div>
                    )}
                </div>

                {/* PRINCESS MODE */}
                <div className="flex flex-col gap-3">
                    <button onClick={() => onUpdatePreference('princessTheme', !preferences.princessTheme)} className={`p-5 rounded-[2rem] border transition-all flex flex-col items-center gap-2 ${preferences.princessTheme ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-400 text-pink-600' : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-400'}`}>
                        <Crown size={24} /><span className="text-[10px] font-black uppercase tracking-widest">{t('settings.princess.title')}</span>
                    </button>

                    {preferences.princessTheme && (
                        <div className="grid grid-cols-2 gap-2 px-2 animate-slide-up">
                            <button onClick={() => onUpdatePreference('princessHearts', !preferences.princessHearts)} className={`py-2 rounded-xl text-[8px] font-black uppercase border transition-all ${preferences.princessHearts ? 'bg-pink-100 border-pink-200 text-pink-600' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>{t('settings.princess.hearts')}</button>
                            <button onClick={() => onUpdatePreference('princessSparkles', !preferences.princessSparkles)} className={`py-2 rounded-xl text-[8px] font-black uppercase border transition-all ${preferences.princessSparkles ? 'bg-pink-100 border-pink-200 text-pink-600' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>{t('settings.princess.aurora')}</button>
                        </div>
                    )}
                </div>
            </div>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          <section>
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Info size={14} /> {t('settings.about')}</h3>
             <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl p-6 text-xs leading-relaxed text-slate-600 dark:text-emerald-400 italic font-serif-text">
                <p>{t('settings.aboutText')}</p>
             </div>
          </section>

          <button onClick={onLogout} className="w-full p-4 text-red-600 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all active:scale-95">
              <LogOut size={16} /> {t('settings.signOut')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
