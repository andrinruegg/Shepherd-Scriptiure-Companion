
import React, { useState, useRef, useEffect } from 'react';
/* Added Loader2 to imports */
import { X, Download, Palette, Type, AlignLeft, AlignCenter, AlignRight, Check, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import ShepherdLogo from './ShepherdLogo';
import { useTranslation } from 'react-i18next';

const THEMES = [
  { id: 'midnight', type: 'color', value: 'bg-gradient-to-br from-slate-900 to-indigo-950', text: 'text-white', overlay: 'bg-black/0' },
  { id: 'sunset', type: 'color', value: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500', text: 'text-white', overlay: 'bg-black/0' },
  { id: 'forest', type: 'color', value: 'bg-gradient-to-br from-emerald-800 to-teal-900', text: 'text-emerald-50', overlay: 'bg-black/0' },
  { id: 'paper', type: 'color', value: 'bg-[#fdf6e3]', text: 'text-slate-800', overlay: 'bg-black/0' },
  { id: 'clean', type: 'color', value: 'bg-white', text: 'text-slate-900', overlay: 'bg-black/0' },
  { id: 'img-mountains', type: 'image', value: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1080&q=80', text: 'text-white', overlay: 'bg-black/30' }
];

const VisualComposerModal: React.FC<{ isOpen: boolean, onClose: () => void, initialText: string, initialReference?: string, language: string }> = ({ isOpen, onClose, initialText, initialReference }) => {
  const { t } = useTranslation();
  const [text, setText] = useState(initialText);
  const [reference, setReference] = useState(initialReference || '');
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (isOpen) { setText(initialText); setReference(initialReference || ''); } }, [isOpen, initialText, initialReference]);
  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: null });
      const link = document.createElement('a');
      link.download = `shepherd-verse-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) { alert(t('composer.securityWarning')); } finally { setIsDownloading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 w-full max-w-4xl rounded-[2.5rem] shadow-2xl border border-slate-800 animate-scale-in flex flex-col md:flex-row max-h-[90vh] overflow-hidden">
        <div className="flex-1 bg-slate-950 p-6 flex items-center justify-center relative overflow-hidden">
           <div ref={cardRef} className={`relative w-full max-w-[400px] aspect-square shadow-2xl flex flex-col justify-center p-10 transition-all duration-500 overflow-hidden rounded-2xl ${selectedTheme.type === 'color' ? selectedTheme.value : 'bg-slate-900'} ${selectedTheme.text}`} style={selectedTheme.type === 'image' ? {backgroundImage: `url(${selectedTheme.value})`, backgroundSize: 'cover', backgroundPosition: 'center'} : {}}>
              {selectedTheme.type === 'image' && <div className={`absolute inset-0 ${selectedTheme.overlay}`} />}
              <div className="relative z-10 text-center"><p className="text-xl md:text-2xl leading-relaxed font-serif-text mb-6 drop-shadow-lg italic">"{text}"</p>{reference && <p className="text-sm font-black uppercase tracking-widest opacity-90">— {reference}</p>}</div>
              <div className="relative z-10 mt-12 flex items-center justify-center gap-2 opacity-50"><ShepherdLogo size={16}/><span className="text-[9px] font-black tracking-[0.3em] uppercase">Shepherd</span></div>
           </div>
        </div>
        <div className="w-full md:w-80 bg-slate-900 border-l border-slate-800 flex flex-col p-6 space-y-6 overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center"><h3 className="text-white font-bold font-serif-text text-lg">{t('composer.title')}</h3><button onClick={onClose} className="text-slate-500 p-1 hover:text-white"><X size={20}/></button></div>
            <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Palette size={14} />{t('composer.background')}</label>
                <div className="grid grid-cols-3 gap-2">{THEMES.map(th => (<button key={th.id} onClick={() => setSelectedTheme(th)} className={`h-12 rounded-xl border-2 transition-all overflow-hidden relative ${selectedTheme.id === th.id ? 'border-indigo-500 scale-105' : 'border-slate-800 opacity-60'}`}>{th.type === 'color' ? <div className={`w-full h-full ${th.value}`} /> : <img src={th.value} className="w-full h-full object-cover"/>}{selectedTheme.id === th.id && <Check size={14} className="absolute inset-0 m-auto text-white" />}</button>))}</div>
            </div>
            <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">{t('composer.message')}</label><textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="w-full bg-slate-800 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-white resize-none"/></div>
            <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">{t('composer.reference')}</label><input type="text" value={reference} onChange={(e) => setReference(e.target.value)} className="w-full bg-slate-800 border-none rounded-2xl p-4 text-sm outline-none text-white"/></div>
            {/* Fixed: Loader2 is now imported */}
            <button onClick={handleDownload} disabled={isDownloading} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">{isDownloading ? <Loader2 size={20} className="animate-spin" /> : <><Download size={20}/>{t('composer.download')}</>}</button>
        </div>
      </div>
    </div>
  );
};

export default VisualComposerModal;
