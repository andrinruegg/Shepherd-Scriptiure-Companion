
import React from 'react';
import ShepherdLogo from './ShepherdLogo';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#0c0a09] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1c1917] via-[#0c0a09] to-black opacity-90"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-900/10 rounded-full blur-[120px] animate-pulse"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Logo */}
        <div className="mb-10 relative">
           <div className="absolute inset-0 bg-amber-500/10 blur-2xl rounded-full animate-cross-pulse"></div>
           <div className="relative w-28 h-28 bg-gradient-to-br from-[#292524] to-black rounded-[2rem] flex items-center justify-center border border-amber-900/30 shadow-2xl animate-float">
              <ShepherdLogo size={56} className="drop-shadow-[0_0_15px_rgba(217,119,6,0.5)]" />
           </div>
        </div>

        {/* Title with Reveal Animation */}
        <h1 className="text-5xl md:text-6xl font-bold font-serif-text text-transparent bg-clip-text bg-gradient-to-r from-[#fef3c7] via-[#fcd34d] to-[#d97706] tracking-tight animate-letter-reveal drop-shadow-sm">
          Shepherd
        </h1>

        {/* Subtitle with Tracking Expansion */}
        <div className="mt-4 flex items-center gap-3 overflow-hidden">
           <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-amber-900/50"></div>
           <p className="text-[10px] md:text-xs font-black uppercase text-amber-800/60 tracking-widest animate-tracking-expand">
             Scripture Companion
           </p>
           <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-amber-900/50"></div>
        </div>
      </div>
      
      {/* Loading Indicator */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
         <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-amber-600/60 rounded-full animate-shimmer"></div>
         </div>
      </div>
    </div>
  );
};

export default SplashScreen;
