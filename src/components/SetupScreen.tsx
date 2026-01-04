
import React, { useState } from 'react';
import { Database, ArrowRight, Info } from 'lucide-react';
import { saveSupabaseConfig } from '../services/supabase';
import { useTranslation } from 'react-i18next';

const SetupScreen: React.FC = () => {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-white/5 animate-scale-in">
        <div className="p-12 text-center">
          <div className="w-24 h-24 bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-white/5"><Database className="text-emerald-400" size={48} /></div>
          <h1 className="text-3xl font-bold text-white mb-4 font-serif-text">{t('setup.title')}</h1>
          <p className="text-slate-400 text-sm leading-relaxed">{t('setup.desc')}</p>
        </div>
        <form onSubmit={(e)=>{e.preventDefault(); if(url&&key) saveSupabaseConfig(url.trim(), key.trim());}} className="px-12 pb-12 space-y-6">
            <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 ml-1">URL</label><input value={url} onChange={e=>setUrl(e.target.value)} className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="https://xyz.supabase.co"/></div>
            <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 ml-1">ANON KEY</label><input type="password" value={key} onChange={e=>setKey(e.target.value)} className="w-full bg-slate-800 border-none rounded-2xl p-4 text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="eyJ..."/></div>
            <button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 text-lg">Connect <ArrowRight size={20}/></button>
            <p className="text-[9px] text-slate-500 text-center uppercase tracking-widest font-black mt-6 leading-loose">{t('setup.help')} <br/> src/services/supabase.ts</p>
        </form>
      </div>
    </div>
  );
};

export default SetupScreen;
