import React, { useState } from 'react';
import { X, Book, Moon, Sun, LogOut, User, Globe, Info, Edit2, Check, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { UserPreferences } from '../types';
import { translations } from '../utils/translations';
import { diagnoseConnection } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreference: (key: keyof UserPreferences, value: string) => void;
  userEmail?: string;
  onLogout: () => void;
}

const TRANSLATIONS = [
  { id: 'NIV', name: 'New International Version (NIV)' },
  { id: 'ESV', name: 'English Standard Version (ESV)' },
  { id: 'KJV', name: 'King James Version (KJV)' },
  { id: 'NKJV', name: 'New King James Version (NKJV)' },
  { id: 'NLT', name: 'New Living Translation (NLT)' },
  { id: 'CSB', name: 'Christian Standard Bible (CSB)' },
  { id: 'NASB', name: 'New American Standard Bible (NASB)' },
  { id: 'WEB', name: 'World English Bible (WEB)' },
];

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
  onLogout
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(preferences.displayName || '');
  
  // Diagnostics State
  const [diagStatus, setDiagStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [diagMessage, setDiagMessage] = useState('');

  if (!isOpen) return null;

  const t = translations[preferences.language]?.settings || translations['English'].settings;

  const handleSaveName = () => {
    onUpdatePreference('displayName', tempName);
    setIsEditingName(false);
  };

  const runDiagnostics = async () => {
      setDiagStatus('loading');
      setDiagMessage('Testing connection to Google Gemini...');
      const result = await diagnoseConnection();
      if (result.status === 'ok') {
          setDiagStatus('success');
          setDiagMessage(result.message);
      } else {
          setDiagStatus('error');
          setDiagMessage(`Error: ${result.message}`);
      }
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

            {/* Bible Translation */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Book size={16} className="text-indigo-500" />
                {t.translation}
              </label>
              <select
                value={preferences.bibleTranslation}
                onChange={(e) => onUpdatePreference('bibleTranslation', e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
              >
                {TRANSLATIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1.5 ml-1">
                {t.translationHelp}
              </p>
            </div>

            {/* Appearance */}
            <div>
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
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Account Section */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              {t.account}
            </h3>
            
            {/* Display Name Editor */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Display Name</label>
                <div className="flex gap-2">
                    {isEditingName ? (
                        <>
                            <input 
                                type="text" 
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 outline-none"
                            />
                            <button onClick={handleSaveName} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                <Check size={16} />
                            </button>
                            <button onClick={() => setIsEditingName(false)} className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg">
                                <X size={16} />
                            </button>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-lg">
                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{preferences.displayName || 'Not Set'}</span>
                            <button onClick={() => { setTempName(preferences.displayName || ''); setIsEditingName(true); }} className="text-slate-400 hover:text-indigo-500">
                                <Edit2 size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 mb-4">
               <div className="w-10 h-10 bg-indigo-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-indigo-600 dark:text-slate-300">
                  <User size={20} />
               </div>
               <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {userEmail || 'Guest User'}
                  </p>
                  <p className="text-xs text-slate-500">{t.loggedIn}</p>
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

          {/* Diagnostics Section */}
          <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                 <Activity size={12} />
                 System Diagnostics
              </h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                      If you are experiencing connection errors, run a test below.
                  </div>
                  
                  {diagStatus !== 'idle' && (
                      <div className={`mb-3 p-2 rounded text-xs break-all font-mono ${diagStatus === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'}`}>
                          {diagStatus === 'loading' && "Running..."}
                          {diagStatus === 'error' && <div className="flex gap-2"><AlertTriangle size={14} className="flex-shrink-0" /> {diagMessage}</div>}
                          {diagStatus === 'success' && <div className="flex gap-2"><CheckCircle size={14} className="flex-shrink-0" /> {diagMessage}</div>}
                      </div>
                  )}

                  <button 
                     onClick={runDiagnostics}
                     disabled={diagStatus === 'loading'}
                     className="w-full py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded transition-colors"
                  >
                      {diagStatus === 'loading' ? 'Testing...' : 'Test Connection'}
                  </button>
              </div>
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
             
             {/* DEBUG VERSION LABEL */}
             <div className="mt-4 text-center text-[10px] text-slate-400 font-mono">
                 App Version: Debug-1.0
             </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;