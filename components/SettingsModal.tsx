

import React, { useState, useEffect, useRef } from 'react';
import { X, Moon, Sun, LogOut, User, Globe, Info, Edit2, Check, Key, ExternalLink, ChevronDown, ChevronUp, Snowflake, Camera, Trash2, AlignLeft, CloudSnow, Sparkles, Droplets, Crown, Heart, Flower } from 'lucide-react';
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
}

const LANGUAGES = [
  { id: 'English', name: 'English' },
  // Temporarily hidden as requested
  // { id: 'Spanish', name: 'Español' },
  // { id: 'French', name: 'Français' },
  // { id: 'German', name: 'Deutsch' },
  // { id: 'Italian', name: 'Italiano' },
  // { id: 'Dutch', name: 'Nederlands' },
  // { id: 'Romanian', name: 'Română' },
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
  
  // Custom API Key State
  const [customKey, setCustomKey] = useState('');
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [showKeyTutorial, setShowKeyTutorial] = useState(false);

  useEffect(() => {
      if (isOpen) {
          const storedKey = localStorage.getItem('custom_api_key') || '';
          setCustomKey(storedKey);
          setTempBio(preferences.bio || '');
      }
  }, [isOpen, preferences.bio]);

  if (!isOpen) return null;

  const t = translations[preferences.language]?.settings || translations['English'].settings;
  // Fallback for winterMode text if translation missing
  const winterText = translations[preferences.language]?.settings?.winterMode || "Winter Mode";

  const handleSaveName = () => {
    onUpdatePreference('displayName', tempName);
    setIsEditingName(false);
  };

  const handleSaveBio = () => {
      onUpdatePreference('bio', tempBio);
      setIsEditingBio(false);
  }

  const handleSaveKey = () => {
      localStorage.setItem('custom_api_key', customKey.trim());
      setIsEditingKey(false);
  };

  const handleClearKey = () => {
      localStorage.removeItem('custom_api_key');
      setCustomKey('');
      setIsEditingKey(false);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Compress and resize image
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 200; // Resize to 200x200 max
          
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
            // Export as JPEG with 0.8 quality
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

            {/* Winter Mode Toggle */}
            <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${preferences.winterTheme ? 'bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-200 text-slate-400 dark:bg-slate-700'}`}>
                            <Snowflake size={18} />
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                                {winterText}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                Festive animations
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

                {/* Sub-toggles for Winter Mode */}
                {preferences.winterTheme && (
                    <div className="pl-14 space-y-2 animate-slide-up">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                <CloudSnow size={12} className="text-slate-400"/> Falling Snow
                            </label>
                            <input 
                                type="checkbox" 
                                checked={preferences.winterSnow ?? true} 
                                onChange={(e) => onUpdatePreference('winterSnow', e.target.checked)}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                <Sparkles size={12} className="text-amber-400"/> Christmas Lights
                            </label>
                            <input 
                                type="checkbox" 
                                checked={preferences.winterLights ?? true} 
                                onChange={(e) => onUpdatePreference('winterLights', e.target.checked)}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                <Droplets size={12} className="text-blue-400"/> Icicles
                            </label>
                            <input 
                                type="checkbox" 
                                checked={preferences.winterIcicles ?? true} 
                                onChange={(e) => onUpdatePreference('winterIcicles', e.target.checked)}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* PRINCESS MODE TOGGLE */}
            <div className="mb-2 space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-pink-50 dark:bg-slate-800/50 border border-pink-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${preferences.princessTheme ? 'bg-pink-100 text-pink-500 dark:bg-pink-900/30 dark:text-pink-400' : 'bg-slate-200 text-slate-400 dark:bg-slate-700'}`}>
                            <Crown size={18} />
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                                Princess Mode
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                Hearts, pink themes & magic
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

                {/* Sub-toggles for Princess Mode */}
                {preferences.princessTheme && (
                    <div className="pl-14 space-y-2 animate-slide-up">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                <Heart size={12} className="text-pink-400 fill-pink-400"/> Floating Hearts
                            </label>
                            <input 
                                type="checkbox" 
                                checked={preferences.princessHearts ?? true} 
                                onChange={(e) => onUpdatePreference('princessHearts', e.target.checked)}
                                className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 accent-pink-500"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                <Sparkles size={12} className="text-yellow-400"/> Magic Aurora
                            </label>
                            <input 
                                type="checkbox" 
                                checked={preferences.princessSparkles ?? true} 
                                onChange={(e) => onUpdatePreference('princessSparkles', e.target.checked)}
                                className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 accent-pink-500"
                            />
                        </div>
                    </div>
                )}
            </div>

          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* ADVANCED: CUSTOM API KEY */}
          <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                 <Key size={12} />
                 Unlimited Access
              </h3>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                      For unlimited high-speed messaging, you can provide your own <strong>free</strong> Google Gemini API Key.
                  </p>

                  {isEditingKey ? (
                      <div className="flex gap-2 mb-3">
                           <input 
                              type="password"
                              value={customKey}
                              onChange={(e) => setCustomKey(e.target.value)}
                              placeholder="Paste API Key here..."
                              className="flex-1 p-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded outline-none text-slate-800 dark:text-slate-200"
                           />
                           <button onClick={handleSaveKey} className="p-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">
                               <Check size={14} />
                           </button>
                           <button onClick={() => { setIsEditingKey(false); setCustomKey(localStorage.getItem('custom_api_key') || ''); }} className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-600 rounded">
                               <X size={14} />
                           </button>
                      </div>
                  ) : (
                      <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${customKey ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                             <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                 {customKey ? 'Custom Key Active' : 'Using Shared Key'}
                             </span>
                          </div>
                          <div className="flex gap-2">
                              {customKey && (
                                  <button onClick={handleClearKey} className="text-xs text-red-500 hover:text-red-600 underline">Remove</button>
                              )}
                              <button onClick={() => setIsEditingKey(true)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                                  {customKey ? 'Change Key' : 'Add Key'}
                              </button>
                          </div>
                      </div>
                  )}
                  
                  {/* Tutorial Dropdown */}
                  <div className="mt-2">
                      <button 
                        onClick={() => setShowKeyTutorial(!showKeyTutorial)}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-500 font-medium transition-colors"
                      >
                         {showKeyTutorial ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                         How to get a free API Key
                      </button>
                      
                      {showKeyTutorial && (
                          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950 p-3 rounded border border-slate-100 dark:border-slate-800 animate-fade-in">
                              <ol className="list-decimal ml-4 space-y-2">
                                  <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline inline-flex items-center gap-0.5">Google AI Studio <ExternalLink size={10}/></a>.</li>
                                  <li>Click the blue <strong>"Create API Key"</strong> button.</li>
                                  <li><strong>Important:</strong> Select <strong>"Create API key in new project"</strong>.</li>
                                  <li className="text-slate-400 italic">Note: Do not re-use the same project, or the limits will be shared!</li>
                                  <li>Copy the key (starts with AIza...) and paste it above.</li>
                              </ol>
                          </div>
                      )}
                  </div>
              </div>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Account Section */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              {t.account}
            </h3>
            
            <div className="flex items-start gap-4 mb-4">
                 {/* Profile Picture Upload */}
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
                     {/* Name */}
                     <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Display Name</label>
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

                     {/* BIO SECTION */}
                     <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                            <AlignLeft size={10} /> Bio / Description
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
                                    {preferences.bio || "No description yet."}
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

          {/* About Section */}
          <section>
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
               <Info size={12} />
               {t.about}
             </h3>
             <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-lg p-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300 italic">
                <p>
                  "Shepherd Scripture Companion was developed by <strong className="text-emerald-700 dark:text-emerald-400 not-italic">Andrin Rüegg</strong>, an 18-year-old developer from Switzerland."
                </p>
                <p className="mt-2">
                  "As a Christian, he built this tool to help himself and his girlfriend, <strong className="text-emerald-700 dark:text-emerald-400 not-italic">Alexia</strong>, grow closer to God through Scripture. It stands as a testament to his love for her and the eternal truth that Jesus loves her."
                </p>
             </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
