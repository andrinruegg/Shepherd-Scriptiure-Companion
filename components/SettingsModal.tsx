import React, { useState, useEffect, useRef } from 'react';
import { X, Moon, Sun, LogOut, User, Globe, Info, Edit2, Check, AlignLeft, CloudSnow, Sparkles, Droplets, Crown, Heart, Camera, Trash2, Snowflake, AlertCircle, Key, ShieldCheck, ExternalLink } from 'lucide-react';
import { UserPreferences } from '../types';
import { translations } from '../utils/translations';

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
  { id: 'English', name: 'English' },
  { id: 'Romanian', name: 'Română' },
  { id: 'German', name: 'Deutsch' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreference,
  userEmail,
  userId,
  onLogout,
  hasApiKey,
  onSelectApiKey,
  onUpdateManualKey
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(preferences.displayName || '');
  const [tempBio, setTempBio] = useState(preferences.bio || '');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [manualKeyInput, setManualKeyInput] = useState(localStorage.getItem('shepherd_api_key') || '');
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      if (isOpen) {
          setTempBio(preferences.bio || '');
          setManualKeyInput(localStorage.getItem('shepherd_api_key') || '');
          setValidationError(null);
      }
  }, [isOpen, preferences.bio]);

  if (!isOpen) return null;

  const t = translations[preferences.language]?.settings || translations['English'].settings;
  const chatT = translations[preferences.language]?.chat || translations['English'].chat;

  const handleSaveName = () => {
    onUpdatePreference('displayName', tempName);
    setIsEditingName(false);
  };

  const handleSaveBio = () => {
      onUpdatePreference('bio', tempBio);
      setIsEditingBio(false);
  }

  const handleUpdateKey = (e: React.FormEvent) => {
      e.preventDefault();
      const key = manualKeyInput.trim();
      
      // Pattern Validation
      const isValidPattern = key.startsWith('AIzaSy') && key.length >= 38;
      
      if (!isValidPattern && key.length > 0) {
          setValidationError(chatT.invalidKey);
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
          
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            onUpdatePreference('avatar', dataUrl);
          }
        };
        if (event.target?.result) {
            img.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveAvatar = () => {
      onUpdatePreference('avatar', '');
  };

  const isDarkMode = preferences.theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-scale-in border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 font-serif-text">
            {t.title}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Preferences Section */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              {t.preferences}
            </h3>
            
            {/* System Language */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Globe size={16} className="text-indigo-500" />
                {t.language}
              </label>
              <select
                value={preferences.language}
                onChange={(e) => onUpdatePreference('language', e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Appearance */}
            <div className="mb-4">
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  {isDarkMode ? <Moon size={16} className="text-indigo-500"/> : <Sun size={16} className="text-amber-500"/>}
                  {t.appearance}
               </label>
               <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  <button
                    onClick={() => onUpdatePreference('theme', 'light')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${!isDarkMode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                  >
                    <Sun size={14} /> {t.light}
                  </button>
                  <button
                    onClick={() => onUpdatePreference('theme', 'dark')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${isDarkMode ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                  >
                    <Moon size={14} /> {t.dark}
                  </button>
               </div>
            </div>

            {/* API KEY SECTION */}
            <div className="mb-4 space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <Key size={16} className="text-indigo-500" />
                    {t.apiKey.title}
                </label>
                <div className={`p-4 rounded-2xl border transition-all ${hasApiKey ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50 shadow-sm' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'}`}>
                    <form onSubmit={handleUpdateKey} className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${hasApiKey ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                                    {hasApiKey ? chatT.statusActive : chatT.statusMissing}
                                </p>
                            </div>
                            {hasApiKey && (
                                <div className="bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 p-1 rounded-full">
                                    <ShieldCheck size={14} />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 relative">
                            <input 
                                type="password"
                                value={manualKeyInput}
                                onChange={(e) => { setManualKeyInput(e.target.value); if(validationError) setValidationError(null); }}
                                placeholder="AIzaSy..."
                                className={`w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${validationError ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                            />
                            {validationError && (
                                <p className="text-[9px] text-red-500 font-bold mt-1 animate-slide-up flex items-center gap-1">
                                    <AlertCircle size={10} />
                                    {validationError}
                                </p>
                            )}
                            <button
                                type="submit"
                                className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm"
                            >
                                {hasApiKey ? t.apiKey.change : t.apiKey.add}
                            </button>
                        </div>

                        {/* Step by step Help */}
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{t.apiKey.howTo}</p>
                             <ul className="space-y-1.5">
                                <li className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">{t.apiKey.step1}</li>
                                <li className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">{t.apiKey.step2}</li>
                                <li className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">{t.apiKey.step3}</li>
                                <li className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">{t.apiKey.step4}</li>
                             </ul>
                             <a 
                                href="https://aistudio.google.com/api-keys" 
                                target="_blank" 
                                rel="noreferrer"
                                className="mt-3 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 hover:underline"
                            >
                                {chatT.openStudio} <ExternalLink size={10} />
                            </a>
                        </div>
                    </form>
                </div>
            </div>
          </section>
          <hr className="border-slate-100 dark:border-slate-800" />
          {/* Sign Out */}
          <button
            onClick={() => { onLogout(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 p-2.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            {t.signOut}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;