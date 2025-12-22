import React, { useState } from 'react';
import { ArrowLeft, Menu, Scroll, Clock, BookOpen, Quote, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { STORIES_DATA } from '../data/storiesData.ts';
import { translations } from '../utils/translations.ts';
import { BibleStory } from '../types.ts';
import { getDetailedBiography } from '../services/geminiService.ts';

interface StoriesTabProps {
  language: string;
  onMenuClick: () => void;
}

const StoriesTab: React.FC<StoriesTabProps> = ({ language, onMenuClick }) => {
  const [selectedStory, setSelectedStory] = useState<BibleStory | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const stories = STORIES_DATA[language || 'English'] || STORIES_DATA['English'] || [];
  const t = translations[language || 'English']?.stories || translations['English'].stories;

  const handleFetchDetailedHistory = async () => {
    if (!selectedStory || isFetching) return;
    setIsFetching(true);
    try {
        const details = await getDetailedBiography(selectedStory.name, language || 'English');
        setSelectedStory(prev => prev ? { ...prev, ...details, biography: details.fullHistory || prev.biography } : null);
    } catch (e) { } finally { setIsFetching(false); }
  };

  if (selectedStory) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 animate-fade-in relative">
        <div className="absolute top-0 left-0 p-4 z-30"><button onClick={() => setSelectedStory(null)} className="p-2 bg-black/30 backdrop-blur-md text-white rounded-full"><ArrowLeft size={24} /></button></div>
        <div className="relative h-[40vh] w-full shrink-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-900 via-transparent to-black/60 z-10"></div>
            <img src={selectedStory.image} className="w-full h-full object-cover" alt={selectedStory.name} />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20"><span className="px-2 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full">{selectedStory.role}</span><h1 className="text-3xl md:text-4xl font-bold text-white font-serif-text mt-2">{selectedStory.name}</h1></div>
        </div>
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 -mt-4 rounded-t-3xl relative z-20 p-6">
            <div className="max-w-2xl mx-auto space-y-8">
                {selectedStory.meaningOfName && (<div className="grid grid-cols-2 gap-4"><div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border"><span className="text-[10px] font-bold text-slate-400 uppercase">Meaning</span><p className="text-sm font-bold text-indigo-600">{selectedStory.meaningOfName}</p></div><div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border"><span className="text-[10px] font-bold text-slate-400 uppercase">Traits</span><div className="flex flex-wrap gap-1 mt-1">{selectedStory.traits?.map((trait, i) => (<span key={i} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{trait}</span>))}</div></div></div>)}
                <div className="prose dark:prose-invert max-w-none">{selectedStory.biography.map((para, i) => (<p key={i} className="text-base md:text-lg leading-relaxed font-serif-text mb-4 first-letter:text-3xl first-letter:font-bold first-letter:text-indigo-600 first-letter:mr-1">{para}</p>))}</div>
                {!selectedStory.meaningOfName && !isFetching && (<button onClick={handleFetchDetailedHistory} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3"><Sparkles size={20} /><span>Shepherd AI Research</span></button>)}
                {isFetching && (<div className="py-10 flex flex-col items-center gap-4 animate-pulse"><Loader2 className="w-10 h-10 text-indigo-50 animate-spin" /><p className="text-sm font-bold text-slate-400 uppercase">Researching Scriptures...</p></div>)}
                {selectedStory.keyVerses && selectedStory.keyVerses.length > 0 && (<div className="space-y-4 pt-4 border-t"><h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><BookOpen size={14} className="text-amber-500"/> Key Scripture</h3><div className="grid gap-4">{selectedStory.keyVerses.map((v, idx) => (<div key={idx} className="bg-amber-50/50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30 relative"><Quote className="absolute -top-2 -left-2 text-amber-200/40" size={64} /><p className="text-slate-800 dark:text-slate-200 font-serif-text italic relative z-10">"{v.text}"</p><p className="text-[10px] font-bold text-amber-600 uppercase mt-4 tracking-widest">— {v.ref}</p></div>))}</div></div>)}
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-950 border-b p-4 shadow-sm sticky top-0 z-10 flex items-center gap-3"><button onClick={onMenuClick} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"><Menu size={24} /></button><div className="bg-amber-100 p-2 rounded-lg text-amber-600"><Scroll size={20} /></div><h1 className="text-xl font-bold font-serif-text">{t?.title || 'Stories'}</h1></header>
      <main className="flex-1 overflow-y-auto p-4 md:p-6"><div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{stories.map((story, i) => (<button key={story.id} onClick={() => setSelectedStory(story)} className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden text-left flex flex-col h-80 border animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}><div className="h-52 w-full relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" /><img src={story.image} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" alt={story.name} /><div className="absolute bottom-4 left-4 z-20"><span className="px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-bold rounded uppercase mb-1">{story.role}</span><h3 className="text-2xl font-bold text-white font-serif-text">{story.name}</h3></div></div><div className="flex-1 p-5 flex flex-col justify-between"><p className="text-xs text-slate-500 line-clamp-2 leading-relaxed italic">{story.biography[0]}</p><div className="flex items-center text-indigo-600 text-[10px] font-bold uppercase tracking-widest">{t?.readMore || 'Read More'} <ArrowRight size={14} className="ml-1" /></div></div></button>))}</div></main>
    </div>
  );
};

export default StoriesTab;