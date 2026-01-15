import React from 'react';

interface ShepherdLogoProps {
  className?: string;
  size?: number;
}

const ShepherdLogo: React.FC<ShepherdLogoProps> = ({ className = "text-[#7c4a32]", size = 24 }) => {
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
      {/* Head - Tan skin tone color */}
      <circle cx="10" cy="7" r="3" stroke="#d2b48c" />
      
      {/* Robed Body - Robe Brown */}
      <path 
        d="M14 13.5v7.5h-8v-7.5c0-1.5 1-3.5 4-3.5s4 2 4 3.5z" 
        stroke="currentColor" 
        fill="currentColor" 
        fillOpacity="0.2"
      />
      
      {/* Staff - Staff Dark Brown */}
      <path d="M18 21V8a3 3 0 0 0-3-3" stroke="#54362d" />
      
      {/* Small Cross on chest - Headpiece Cream color */}
      <path d="M10 14v4M8 16h4" stroke="#f5f1e8" strokeWidth="1" />
    </svg>
  );
};

export default ShepherdLogo;