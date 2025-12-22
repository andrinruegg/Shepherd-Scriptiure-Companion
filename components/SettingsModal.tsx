import React, { useState, useEffect, useRef } from 'react';
import { X, Moon, Sun, LogOut, User, Globe, Info, Edit2, Check, Key, ExternalLink, ChevronDown, ChevronUp, Snowflake, Camera, Trash2, AlignLeft, CloudSnow, Sparkles, Droplets, Crown, Heart } from 'lucide-react';
import { UserPreferences } from '../types.ts';
import { translations } from '../utils/translations.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreference: (key: keyof UserPreferences, value: string | boolean) => void;
  userEmail?: string;
  userId?: string; 
  onLogout: () => void;
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
  onLogout
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(preferences.displayName || '');
  const [tempBio, setTempBio] = useState(preferences.bio || '');
  const [isEditingBio, setIsEditingBio] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      if (isOpen) {
          setTempBio(preferences.bio || '');
      }
  }, [isOpen, preferences.bio]);

  if (!isOpen) return null;

  const t = translations[preferences.language]?.settings || translations['English'].settings;

  const handleSaveName = () => {
    onUpdatePreference('displayName', tempName);
    setIsEditingName(false);
  };

  const handleSaveBio = () => {
      onUpdatePreference('bio', tempBio);
      setIsEditingBio(false);
  }

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-scale-in border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
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
        <div className="p-6 space-y-6 overflow-y-auto">
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              {t.preferences}
            </h3>
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
            <div className="mb-4">
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  {preferences.theme === 'dark' ? <Moon size={16} className="text-indigo-500"/> : <Sun size={16} className="text-amber-500"/>}
                  {t.appearance}
               </label>
               <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  <button
                    onClick={() => onUpdatePreference('theme', 'light')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${preferences.theme === 'light' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                  >
                    <Sun size={14} /> {t.light}
                  </button>
                  <button
                    onClick={() => onUpdatePreference('theme', 'dark')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${preferences.theme === 'dark' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                  >
                    <Moon size={14} /> {t.dark}
                  </button>
               </div>
            </div>
            <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${preferences.winterTheme ? 'bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-200 text-slate-400 dark:bg-slate-700'}`}>
                            <Snowflake size={18} />
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                                {t.winter.title}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                {t.winter.desc}
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={() => onUpdatePreference('winterTheme', !preferences.winterTheme)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${preferences.winterTheme ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${preferences.winterTheme ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                </div>
                {preferences.winterTheme && (
                    <div className="pl-14 space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="winter-snow" className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                                <CloudSnow size={12} className="text-slate-400"/> {t.winter.snow}
                            </label>
                            <input 
                                id="winter-snow"
                                type="checkbox" 
                                checked={preferences.winterSnow ?? true} 
                                onChange={(e) => onUpdatePreference('winterSnow', e.target.checked)}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 cursor-pointer"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="winter-lights" className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                                <Sparkles size={12} className="text-amber-400"/> {t.winter.lights}
                            </label>
                            <input 
                                id="winter-lights"
                                type="checkbox" 
                                checked={preferences.winterLights ?? true} 
                                onChange={(e) => onUpdatePreference('winterLights', e.target.checked)}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 cursor-pointer"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="winter-icicles" className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                                <Droplets size={12} className="text-blue-400"/> {t.winter.icicles}
                            </label>
                            <input 
                                id="winter-icicles"
                                type="checkbox" 
                                checked={preferences.winterIcicles ?? true} 
                                onChange={(e) => onUpdatePreference('winterIcicles', e.target.checked)}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 cursor-pointer"
                            />
                        </div>
                    </div>
                )}
            </div>
            <div className="mb-2 space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-pink-50 dark:bg-slate-800/50 border border-pink-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${preferences.princessTheme ? 'bg-pink-100 text-pink-500 dark:bg-pink-900/30 dark:text-pink-400' : 'bg-slate-200 text-slate-400 dark:bg-slate-700'}`}>
                            <div className="w-[18px] h-[18px] flex items-center justify-center">
                                <Crown size={18} />
                            </div>
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                                {t.princess.title}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                {t.princess.desc}
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={() => onUpdatePreference('princessTheme', !preferences.princessTheme)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${preferences.princessTheme ? 'bg-pink-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${preferences.princessTheme ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                </div>
                {preferences.princessTheme && (
                    <div className="pl-14 space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="princess-hearts" className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                                <Heart size={12} className="text-pink-400 fill-pink-400"/> {t.princess.hearts}
                            </label>
                            <input 
                                id="princess-hearts"
                                type="checkbox" 
                                checked={preferences.princessHearts ?? true} 
                                onChange={(e) => onUpdatePreference('princessHearts', e.target.checked)}
                                className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 accent-pink-500 cursor-pointer"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="princess-aurora" className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                                <Sparkles size={12} className="text-yellow-400"/> {t.princess.aurora}
                            </label>
                            <input 
                                id="princess-aurora"
                                type="checkbox" 
                                checked={preferences.princessSparkles ?? true} 
                                onChange={(e) => onUpdatePreference('princessSparkles', e.target.checked)}
                                className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 accent-pink-500 cursor-pointer"
                            />
                        </div>
                    </div>
                )}
            </div>
          </section>
          <hr className="border-slate-100 dark:border-slate-800" />
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              {t.account}
            </h3>
            <div className="flex items-start gap-4 mb-4">
                 <div className="relative group cursor-pointer mt-1" onClick={triggerFileUpload}>
                     <div className={`w-16 h-16 rounded-full flex items-center justify-center overflow-hidden border-2 ${preferences.avatar ? 'border-indigo-600' : 'border-slate-200 dark:border-slate-700 bg-indigo-100 dark:bg-slate-700 text-indigo-600 dark:text-slate-300'}`}>
                         {preferences.avatar ? (
                             <img src={preferences.avatar} alt="Avatar" className="w-full h-full object-cover" />
                         ) : (
                             <User size={32} />
                         )}
                     </div>
                     <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Camera size={20} className="text-white" />
                     </div>
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                     />
                 </div>
                 <div className="flex-1 space-y-3">
                     <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t.displayName}</label>
                        <div className="flex gap-2">
                            {isEditingName ? (
                                <>
                                    <input 
                                        type="text" 
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        className="flex-1 p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-800 dark:text-slate-200 outline-none"
                                    />
                                    <button onClick={handleSaveName} className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                                        <Check size={14} />
                                    </button>
                                    <button onClick={() => setIsEditingName(false)} className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                                        <X size={14} />
                                    </button>
                                </>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{preferences.displayName || 'Guest User'}</span>
                                    <button onClick={() => { setTempName(preferences.displayName || ''); setIsEditingName(true); }} className="text-slate-400 hover:text-indigo-500">
                                        <Edit2 size={12} />
                                    </button>
                                </div>
                            )}
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                            <AlignLeft size={10} /> {t.bio}
                        </label>
                        {isEditingBio ? (
                            <div className="flex flex-col gap-2">
                                <textarea
                                    value={tempBio}
                                    onChange={(e) => setTempBio(e.target.value)}
                                    placeholder="Share a bit about yourself..."
                                    rows={3}
                                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-800 dark:text-slate-200 outline-none resize-none"
                                />
                                <div className="flex justify-end gap-2">
                                     <button onClick={() => setIsEditingBio(false)} className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">Cancel</button>
                                     <button onClick={handleSaveBio} className="text-xs px-2 py-1 bg-indigo-600 text-white rounded">Save</button>
                                </div>
                            </div>
                        ) : (
                            <div className="group relative">
                                <p className="text-sm text-slate-700 dark:text-slate-300 italic min-h-[1.5rem] p-2 bg-slate-50 dark:bg-slate-800/50 rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                                    {preferences.bio || t.noBio}
                                </p>
                                <button 
                                    onClick={() => { setTempBio(preferences.bio || ''); setIsEditingBio(true); }}
                                    className="absolute top-2 right-2 p-1 text-slate-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Edit2 size={12} />
                                </button>
                            </div>
                        )}
                     </div>
                     <div className="text-xs text-slate-500">{userEmail || 'Not logged in'}</div>
                     {preferences.avatar && (
                         <button onClick={(e) => { e.stopPropagation(); handleRemoveAvatar(); }} className="mt-2 text-[10px] text-red-500 hover:underline flex items-center gap-1">
                             <Trash2 size={10} /> Remove Picture
                         </button>
                     )}
                 </div>
            </div>
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut size={16} />
              {t.signOut}
            </button>
          </section>
          <hr className="border-slate-100 dark:border-slate-800" />
          <section>
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
               <Info size={12} />
               {t.about}
             </h3>
             <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-lg p-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300 italic">
                <p className="whitespace-pre-wrap">
                  {t.aboutText}
                </p>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;