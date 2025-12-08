import React, { useState } from 'react';
import { Database, ArrowRight, AlertCircle, Info } from 'lucide-react';
import { saveSupabaseConfig } from '../services/supabase';

const SetupScreen: React.FC = () => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) {
      setError('Please provide both the Project URL and the Anon Key.');
      return;
    }
    
    if (!url.startsWith('http')) {
       setError('The URL must start with https://');
       return;
    }

    saveSupabaseConfig(url.trim(), key.trim());
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
        <div className="bg-slate-900 p-8 text-center">
          <div className="mx-auto bg-slate-800 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
            <Database className="text-emerald-400" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Connect Database</h1>
          <p className="text-slate-400 text-sm">Connect to your Supabase backend to enable history and authentication.</p>
        </div>

        <div className="p-8">
          
          {/* Developer Note */}
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 rounded-lg p-3 flex items-start gap-3">
             <Info className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
             <div className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
               <span className="font-semibold block mb-1">Developer Note:</span>
               This screen is only visible to you during development. In the final published app, these keys will be hidden automatically, and users will never see this screen.
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Project URL
              </label>
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyz.supabase.co"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Anon Public Key
              </label>
              <input 
                type="password" 
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
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
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-md mt-4"
            >
              <span>Connect</span>
              <ArrowRight size={18} />
            </button>
          </form>
          
          <div className="mt-6 text-xs text-slate-400 text-center leading-relaxed">
            You can find these in your Supabase Dashboard under <br/>
            <span className="font-semibold text-slate-500 dark:text-slate-400">Project Settings &gt; API</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;