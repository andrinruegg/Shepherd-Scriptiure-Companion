
import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Palette, Type, AlignLeft, AlignCenter, AlignRight, Check, ChevronDown } from 'lucide-react';
import html2canvas from 'html2canvas';
import ShepherdLogo from './ShepherdLogo';
import { translations } from '../utils/translations';

interface VisualComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  initialReference?: string;
  language: string; 
}

const THEMES = [
  { id: 'midnight', type: 'color', value: 'bg-gradient-to-br from-slate-900 to-indigo-950', text: 'text-white', overlay: 'bg-black/0' },
  { id: 'sunset', type: 'color', value: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500', text: 'text-white', overlay: 'bg-black/0' },
  { id: 'forest', type: 'color', value: 'bg-gradient-to-br from-emerald-800 to-teal-900', text: 'text-emerald-50', overlay: 'bg-black/0' },
  { id: 'paper', type: 'color', value: 'bg-[#fdf6e3]', text: 'text-slate-800', overlay: 'bg-black/0' },
  { id: 'clean', type: 'color', value: 'bg-white', text: 'text-slate-900', overlay: 'bg-black/0' },
  { id: 'img-mountains', type: 'image', value: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1080&q=80', text: 'text-white', overlay: 'bg-black/30' },
  { id: 'img-mist', type: 'image', value: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1080&q=80', text: 'text-white', overlay: 'bg-black/20' },
  { id: 'img-valley', type: 'image', value: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1080&q=80', text: 'text-white', overlay: 'bg-black/20' },
  { id: 'img-canyon', type: 'image', value: 'https://images.unsplash.com/photo-1615551043360-33de8b5f410c?auto=format&fit=crop&w=1080&q=80', text: 'text-white', overlay: 'bg-black/30' },
  { id: 'img-desert', type: 'image', value: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1080&q=80', text: 'text-white', overlay: 'bg-black/20' },
  { id: 'img-field', type: 'image', value: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1080&q=80', text: 'text-white', overlay: 'bg-black/30' },
  { id: 'img-ocean', type: 'image', value: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80', text: 'text-slate-900', overlay: 'bg-white/30' },
  { id: 'img-waterfall', type: 'image', value: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1080&q=80', text: 'text-white', overlay: 'bg-black/30' },
  { id: 'img-rain', type: 'image', value: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1080&q=80', text: 'text-white', overlay: 'bg-black/40' },
  { id: 'img-coast', type: 'image', value: 'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?auto=format&fit=crop&w=1080&q=80', text: 'text-white', overlay: 'bg-black/30' },
  { id: 'img-stars', type: 'image', value: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=1080&q=80', text: 'text-white', overlay: 'bg-black/20' },
  { id: 'img-aurora', type: 'image', value: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1080&q=80', text: 'text-white', overlay: 'bg-black/10' },
  { id: 'img-clouds', type: 'image', value: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=1080&q=80', text: 'text-slate-900', overlay: 'bg-white/20' },
  { id: 'img-sunset', type: 'image', value: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1080&q=80', text: 'text-white', overlay: 'bg-black/20' },
  { id: 'img-nebula', type: 'image', value: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1080&q=80', text: 'text-white', overlay: 'bg-black/20' },
  { id: 'img-bloom', type: 'image', value: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1080&q=80', text: 'text-white', overlay: 'bg-black/40' },
  { id: 'img-lavender', type: 'image', value: 'https://images.unsplash.com/photo-1499063078284-f78f7d89616a?auto=format&fit=crop&w=1080&q=80', text: 'text-white', overlay: 'bg-black/20' },
  { id: 'img-winter', type: 'image', value: 'https://images.unsplash.com/photo-1483664852095-d6cc6870702d?auto=format&fit=crop&w=1080&q=80', text: 'text-slate-900', overlay: 'bg-white/20' },
  { id: 'img-autumn', type: 'image', value: 'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?auto=format&fit=crop&w=1080&q=80', text: 'text-white', overlay: 'bg-black/30' },
  { id: 'img-leaves', type: 'image', value: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=1080&q=80', text: 'text-white', overlay: 'bg-black/40' },
  { id: 'img-palm', type: 'image', value: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1080&q=80', text: 'text-white', overlay: 'bg-black/20' },
  { id: 'img-cross', type: 'image', value: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1080&q=80', text: 'text-white', overlay: 'bg-black/40' },
];

const TEXT_COLORS = [
    { id: 'white', value: '#FFFFFF', name: 'White' },
    { id: 'black', value: '#0f172a', name: 'Black' },
    { id: 'gold', value: '#fbbf24', name: 'Gold' },
    { id: 'rose', value: '#fb7185', name: 'Rose' },
    { id: 'indigo', value: '#818cf8', name: 'Indigo' },
    { id: 'emerald', value: '#34d399', name: 'Emerald' },
    { id: 'slate', value: '#94a3b8', name: 'Slate' },
];

const VisualComposerModal: React.FC<VisualComposerModalProps> = ({ isOpen, onClose, initialText, initialReference, language }) => {
  // Fix: Safe access to translations
  const t = translations[language]?.composer || translations['English']?.composer || { presets: [], themes: {} };
  const presets = t.presets || [];

  const [text, setText] = useState(initialText);
  const [reference, setReference] = useState(initialReference || '');
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [font, setFont] = useState<'serif' | 'sans'>('serif');
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('center');
  const [textColor, setTextColor] = useState('#FFFFFF'); 
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<'theme' | 'text'>('theme');

  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
      if (isOpen) {
          setText(initialText);
          setReference(initialReference || '');
          // Reset text color based on initial theme
          if (selectedTheme.id === 'clean') setTextColor('#0f172a');
          else if (selectedTheme.id === 'paper') setTextColor('#1e293b');
          else setTextColor('#FFFFFF');
      }
  }, [isOpen, initialText, initialReference]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, 
        useCORS: true, 
        backgroundColor: null,
      });
      
      const link = document.createElement('a');
      link.download = `shepherd-verse-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error("Download failed", e);
      alert(t.securityWarning || "Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePresetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const idx = parseInt(e.target.value);
      if (idx >= 0 && idx < presets.length) {
          setText(presets[idx].text);
          setReference(presets[idx].ref);
      }
  };

  const getThemeName = (themeId: string) => {
      const key = themeId.replace('img-', '');
      return t.themes?.[key] || key;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-800 animate-scale-in flex flex-col md:flex-row max-h-[90vh] overflow-y-auto md:overflow-hidden md:h-[85vh]">
        
        {/* PREVIEW AREA */}
        <div className="flex-1 bg-slate-950/50 p-6 flex items-center justify-center relative md:overflow-hidden group shrink-0 min-h-[350px]">
           <button 
                onClick={onClose}
                className="md:hidden absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-20 backdrop-blur-sm"
           >
               <X size={20} />
           </button>

           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
           
           <div 
              ref={cardRef}
              className={`
                relative w-full max-w-[400px] aspect-square shadow-2xl flex flex-col justify-center p-8 md:p-12 transition-all duration-500 overflow-hidden
                ${selectedTheme.type === 'color' ? selectedTheme.value : 'bg-slate-900'} 
                ${selectedTheme.text}
              `}
              style={selectedTheme.type === 'image' ? {
                  backgroundImage: `url(${selectedTheme.value})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
              } : {}}
           >
              {selectedTheme.type === 'image' && (
                  <div className={`absolute inset-0 ${selectedTheme.overlay} transition-colors duration-500`}></div>
              )}

              <div className={`relative z-10 flex-1 flex flex-col justify-center ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}`}>
                  <p 
                    className={`
                      text-lg md:text-2xl leading-relaxed font-medium mb-6 whitespace-pre-wrap drop-shadow-sm
                      ${font === 'serif' ? 'font-serif-text' : 'font-sans'}
                    `}
                    style={{ color: textColor }} 
                  >
                    {text}
                  </p>
                  {reference && (
                    <p 
                        className={`
                            text-sm font-bold uppercase tracking-wider opacity-90 drop-shadow-sm
                            ${font === 'serif' ? 'font-sans' : 'font-serif-text'}
                        `}
                        style={{ color: textColor }} 
                    >
                        {reference}
                    </p>
                  )}
              </div>

              <div className="relative z-10 mt-8 flex items-center justify-center gap-2 opacity-70" style={{ color: textColor }}>
                  <ShepherdLogo size={16} className="currentColor" />
                  <span className="text-[10px] font-bold tracking-widest uppercase shadow-black">Shepherd</span>
              </div>
           </div>
        </div>

        {/* CONTROLS AREA */}
        <div className="w-full md:w-80 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col shrink-0 h-auto md:h-full">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-white font-bold font-serif-text">{t.title || 'Composer'}</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"><X size={20}/></button>
            </div>

            <div className="flex-1 p-4 space-y-6 md:overflow-y-auto custom-scrollbar">
                <div className="flex p-1 bg-slate-800 rounded-lg mb-4">
                    <button 
                        onClick={() => setActiveTab('theme')} 
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === 'theme' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        {t.theme || 'Theme'}
                    </button>
                    <button 
                        onClick={() => setActiveTab('text')} 
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === 'text' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        {t.content || 'Text'}
                    </button>
                </div>

                {activeTab === 'theme' && (
                    <div className="space-y-6 animate-slide-up">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block flex items-center gap-2">
                                <Palette size={14} /> {t.background || 'Background'}
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {THEMES.map(th => (
                                    <button
                                        key={th.id}
                                        onClick={() => {
                                            setSelectedTheme(th);
                                            if (th.type === 'color' && th.id === 'clean') setTextColor('#0f172a');
                                            else if (th.type === 'color' && th.id === 'paper') setTextColor('#1e293b');
                                            else setTextColor('#FFFFFF');
                                        }}
                                        className={`h-12 rounded-lg border-2 transition-all overflow-hidden relative shadow-sm hover:opacity-100 ${selectedTheme.id === th.id ? 'border-indigo-500 scale-105 ring-2 ring-indigo-500/50' : 'border-slate-700 opacity-70 hover:scale-105'}`}
                                        title={getThemeName(th.id)}
                                    >
                                        {th.type === 'color' ? (
                                            <div className={`w-full h-full ${th.value}`}></div>
                                        ) : (
                                            <img src={th.value} className="w-full h-full object-cover" alt={getThemeName(th.id)} />
                                        )}
                                        
                                        {selectedTheme.id === th.id && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                                                <Check size={16} className="text-white drop-shadow-md" />
                                            </div>
                                        )}
                                        <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-[8px] text-white text-center py-0.5 truncate">{getThemeName(th.id)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block flex items-center gap-2">
                                <Type size={14} /> {t.typography || 'Font'}
                            </label>
                            
                            <div className="flex gap-2 mb-4">
                                <button 
                                    onClick={() => setFont('serif')}
                                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-serif-text transition-all ${font === 'serif' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'}`}
                                >
                                    Serif
                                </button>
                                <button 
                                    onClick={() => setFont('sans')}
                                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-sans transition-all ${font === 'sans' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'}`}
                                >
                                    Sans
                                </button>
                            </div>
                            
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                                {t.textColor || 'Text Color'}
                            </label>
                            <div className="flex gap-2 mb-4 flex-wrap">
                                {TEXT_COLORS.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => setTextColor(c.value)}
                                        className={`w-8 h-8 rounded-full border-2 transition-all ${textColor === c.value ? 'border-indigo-500 scale-110' : 'border-transparent hover:scale-105'}`}
                                        style={{ backgroundColor: c.value }}
                                        title={c.name}
                                    >
                                        {textColor === c.value && (
                                            <Check size={14} className={c.id === 'white' ? 'text-black mx-auto' : 'text-white mx-auto'} />
                                        )}
                                    </button>
                                ))}
                                <input 
                                    type="color" 
                                    value={textColor} 
                                    onChange={(e) => setTextColor(e.target.value)}
                                    className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer p-0" 
                                    title="Custom Color"
                                />
                            </div>

                            <div className="flex bg-slate-800 rounded-lg p-1">
                                <button onClick={() => setAlign('left')} className={`flex-1 p-1.5 rounded flex justify-center ${align === 'left' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}><AlignLeft size={16}/></button>
                                <button onClick={() => setAlign('center')} className={`flex-1 p-1.5 rounded flex justify-center ${align === 'center' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}><AlignCenter size={16}/></button>
                                <button onClick={() => setAlign('right')} className={`flex-1 p-1.5 rounded flex justify-center ${align === 'right' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}><AlignRight size={16}/></button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'text' && (
                    <div className="space-y-4 animate-slide-up">
                        {presets.length > 0 && (
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">{t.quickSelect || 'Quick Select'}</label>
                                <div className="relative">
                                    <select 
                                        onChange={handlePresetSelect}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                                        defaultValue=""
                                    >
                                        <option value="" disabled>{t.selectPlaceholder || 'Select a verse...'}</option>
                                        {presets.map((v: any, i: number) => (
                                            <option key={i} value={i}>{v.ref} - {v.text.substring(0, 30)}...</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                        )}

                        <div className="w-full h-px bg-slate-800 my-2"></div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">{t.message || 'Text'}</label>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={6}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">{t.reference || 'Reference'}</label>
                            <input
                                type="text"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                )}

            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900 sticky bottom-0 z-10 md:static">
                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
                >
                    {isDownloading ? (
                        <>{t.processing || 'Processing...'}</>
                    ) : (
                        <>
                            <Download size={20} /> {t.download || 'Download Image'}
                        </>
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default VisualComposerModal;
