
import React from 'react';

interface ShepherdLogoProps {
  className?: string;
  size?: number;
}

const ShepherdLogo: React.FC<ShepherdLogoProps> = ({ className = "text-indigo-600", size = 24 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Head */}
      <circle cx="10" cy="7" r="3" />
      
      {/* Robed Body - Shifted slightly left to make room for staff */}
      <path d="M14 13.5v7.5h-8v-7.5c0-1.5 1-3.5 4-3.5s4 2 4 3.5z" />
      
      {/* Staff - Distinctly on the right, curved crook facing the shepherd */}
      <path d="M18 21V8a3 3 0 0 0-3-3" />
    </svg>
  );
};

export default ShepherdLogo;
