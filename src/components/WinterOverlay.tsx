
import React, { useMemo } from 'react';
import { Snowflake } from 'lucide-react';

const WinterOverlay: React.FC<{ showSnow?: boolean, showLights?: boolean, showIcicles?: boolean }> = ({ showSnow = true }) => {
  const flakes = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({ id: i, left: Math.random() * 100, delay: Math.random() * 10, duration: 10 + Math.random() * 15, size: 8 + Math.random() * 14 })), []);
  return (
    <div className="fixed inset-0 pointer-events-none z-[80] overflow-hidden">
      <div className="absolute inset-0 frost-vignette opacity-30 pointer-events-none" />
      {showSnow && flakes.map(f => <div key={f.id} className="absolute top-[-20px] animate-snow text-white/40 dark:text-white/20" style={{ left: `${f.left}%`, animationDelay: `${f.delay}s`, animationDuration: `${f.duration}s` }}><Snowflake size={f.size} /></div>)}
    </div>
  );
};

export default WinterOverlay;
