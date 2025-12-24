
import React, { useMemo } from 'react';
import { Heart } from 'lucide-react';

interface PrincessOverlayProps {
    showHearts?: boolean;
    showSparkles?: boolean; 
}

const PrincessOverlay: React.FC<PrincessOverlayProps> = ({ 
    showHearts = true,
    showSparkles = true, // Aurora
}) => {
  // Generate hearts with distinct Soft Pink/Rose colors
  const hearts = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      const rand = Math.random();
      let colorClass = 'text-pink-300'; 
      if (rand > 0.5) colorClass = 'text-rose-300'; 

      return {
        id: i,
        left: Math.random() * 100, 
        delay: Math.random() * 8, 
        duration: 10 + Math.random() * 15,
        size: 15 + Math.random() * 25,
        colorClass,
        opacity: 0.3 + Math.random() * 0.4 
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      
      {/* 1. Sparkly Aurora Background */}
      {showSparkles && (
          <div className="absolute inset-0 animate-sparkly-aurora pointer-events-none opacity-50"></div>
      )}

      {/* 2. Floating Hearts */}
      {showHearts && hearts.map((heart) => (
        <div
          key={heart.id}
          className={`absolute -bottom-20 animate-float-heart ${heart.colorClass}`}
          style={{
            left: `${heart.left}%`,
            animationDelay: `${heart.delay}s`,
            animationDuration: `${heart.duration}s`,
            '--tw-heart-opacity': heart.opacity,
            zIndex: 60
          } as React.CSSProperties}
        >
          <Heart size={heart.size} fill="currentColor" />
        </div>
      ))}
    </div>
  );
};

export default PrincessOverlay;
