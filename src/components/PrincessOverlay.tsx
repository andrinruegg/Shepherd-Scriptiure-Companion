
import React, { useMemo } from 'react';
import { Heart } from 'lucide-react';

const PrincessOverlay: React.FC<{ showHearts?: boolean, showSparkles?: boolean }> = ({ showHearts = true, showSparkles = true }) => {
  const hearts = useMemo(() => Array.from({ length: 25 }).map((_, i) => ({ id: i, left: Math.random() * 100, delay: Math.random() * 10, duration: 12 + Math.random() * 18, size: 15 + Math.random() * 25 })), []);
  return (
    <div className="fixed inset-0 pointer-events-none z-[80] overflow-hidden">
      {showSparkles && <div className="absolute inset-0 animate-sparkly-aurora opacity-40 pointer-events-none" />}
      {showHearts && hearts.map(h => <div key={h.id} className="absolute -bottom-20 animate-float-heart text-pink-300/40" style={{ left: `${h.left}%`, animationDelay: `${h.delay}s`, animationDuration: `${h.duration}s` }}><Heart size={h.size} fill="currentColor" /></div>)}
    </div>
  );
};

export default PrincessOverlay;
