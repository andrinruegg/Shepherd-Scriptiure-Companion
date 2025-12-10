
import React, { useMemo } from 'react';
import { Snowflake } from 'lucide-react';

interface WinterOverlayProps {
    showSnow?: boolean;
    showLights?: boolean;
    showIcicles?: boolean;
}

const WinterOverlay: React.FC<WinterOverlayProps> = ({ 
    showSnow = true, 
    showLights = true, 
    showIcicles = true 
}) => {
  // Generate random snowflakes
  const flakes = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // Random position across screen
      delay: Math.random() * 5,  // Random delay
      duration: 8 + Math.random() * 12, // Slower fall speed (8-20s)
      size: 8 + Math.random() * 10, // Slightly smaller range
      opacity: 0.2 + Math.random() * 0.4,
    }));
  }, []);

  // Generate Christmas lights on a Curve
  // We place 16 lights along the width
  const lights = useMemo(() => {
    const count = 16;
    const colors = [
      'text-red-500 shadow-red-500/50', 
      'text-emerald-500 shadow-emerald-500/50', 
      'text-amber-400 shadow-amber-400/50', 
      'text-blue-500 shadow-blue-500/50'
    ];
    
    return Array.from({ length: count }).map((_, i) => {
      // Calculate Normalized Position (0 to 1)
      const t = i / (count - 1);
      
      // Parabolic Curve Logic: y = 4 * dipHeight * x * (1-x)
      // This creates a nice "U" hang shape.
      // Let's assume max dip is 40px (at center)
      const dipHeight = 40; 
      const yOffset = 4 * dipHeight * t * (1 - t); 
      
      return {
        id: i,
        leftPercent: t * 100,
        topOffset: yOffset,
        colorClass: colors[i % colors.length],
        delay: Math.random() * 2,
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      
      {/* 1. Frost Vignette (Subtle fog at edges) - Always visible if Mode is active for atmosphere */}
      <div className="absolute inset-0 frost-vignette z-40"></div>

      {/* 2. Corner Icicles (Decorative, transparent) */}
      {showIcicles && (
          <>
            <div className="absolute top-0 left-0 w-32 h-32 opacity-40 text-slate-200 dark:text-slate-600">
                <svg viewBox="0 0 100 100" fill="currentColor">
                    <path d="M0,0 L20,0 L25,40 L30,0 L50,0 L55,60 L60,0 L80,0 L85,30 L100,0 L0,0 Z" />
                </svg>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 opacity-40 text-slate-200 dark:text-slate-600 transform scale-x-[-1]">
                <svg viewBox="0 0 100 100" fill="currentColor">
                    <path d="M0,0 L20,0 L25,45 L30,0 L50,0 L55,70 L60,0 L80,0 L85,35 L100,0 L0,0 Z" />
                </svg>
            </div>
          </>
      )}

      {/* 3. Curved Wire (SVG) */}
      {showLights && (
          <div className="absolute top-0 left-0 right-0 h-20 z-10">
            <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                <path d="M0,-2 Q50,80 100,-2" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-800/30 dark:text-slate-500/30" vectorEffect="non-scaling-stroke"/>
            </svg>
          </div>
      )}

      {/* 4. Christmas Lights */}
      {showLights && (
        <div className="absolute top-0 left-0 right-0 h-20 z-20">
            {lights.map((light) => (
                <div 
                    key={light.id} 
                    className="absolute flex flex-col items-center -translate-x-1/2 origin-top"
                    style={{ 
                        left: `${light.leftPercent}%`, 
                        top: `${light.topOffset}px` 
                    }} 
                >
                    {/* Socket */}
                    <div className="w-1.5 h-2 bg-slate-700 dark:bg-slate-600 rounded-sm"></div>
                    {/* Bulb */}
                    <div 
                        className={`w-2.5 h-3.5 rounded-full animate-light-glow bg-current ${light.colorClass} transition-all duration-1000`}
                        style={{ animationDelay: `${light.delay}s` }}
                    ></div>
                </div>
            ))}
        </div>
      )}

      {/* 5. Falling Snowflakes */}
      {showSnow && flakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute top-[-20px] animate-snow text-slate-300 dark:text-slate-400"
          style={{
            left: `${flake.left}%`,
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
            opacity: flake.opacity,
            zIndex: 5
          }}
        >
          <Snowflake size={flake.size} />
        </div>
      ))}
      
    </div>
  );
};

export default WinterOverlay;
