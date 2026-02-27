import React, { useState } from 'react';
import { Database, ArrowRight, AlertCircle, Info } from 'lucide-react';
import { saveSupabaseConfig } from '../services/supabase';
import { useTranslation } from 'react-i18next';

const SetupScreen: React.FC = () => {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) {
      setError(t('setup.errorMissing'));
      return;
    }

    if (!url.startsWith('http')) {
      setError(t('setup.errorUrl'));
      return;
    }

    saveSupabaseConfig(url.trim(), key.trim());
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors overflow-hidden">
      <div className="w-full h-full flex flex-col items-center justify-center overflow-y-auto no-scrollbar py-12 relative z-10">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 mx-auto shrink-0">
          <div className="bg-slate-900 p-8 text-center">
            <div className="mx-auto bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
              <Database className="text-emerald-400" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{t('setup.title')}</h1>
            <p className="text-slate-400 text-sm">{t('setup.desc')}</p>
          </div>

          <div className="p-8">

            <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 rounded-xl p-4 flex items-start gap-3">
              <Info className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
              <div className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                <span className="font-semibold block mb-1">{t('setup.devNote')}</span>
                {t('setup.devNoteDesc')}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  {t('setup.url')}
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={t('setup.urlPlaceholder')}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  {t('setup.key')}
                </label>
                <input
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder={t('setup.keyPlaceholder')}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-xl transition-all duration-200 shadow-lg mt-4 active:scale-95"
              >
                <span>{t('setup.connect')}</span>
                <ArrowRight size={18} strokeWidth={2.5} />
              </button>
            </form>

            <div className="mt-8 text-xs text-slate-400 text-center leading-relaxed font-medium">
              {t('setup.help')} <br />
              <span className="font-bold text-slate-500 dark:text-slate-400 mt-1 block tracking-tight">{t('setup.path')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;