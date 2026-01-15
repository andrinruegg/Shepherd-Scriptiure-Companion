
import React from 'react';

interface ShepherdLogoProps {
  className?: string;
  size?: number;
}

const ShepherdLogo: React.FC<ShepherdLogoProps> = ({ className = "", size = 24 }) => {
  return (
    <img 
      src="https://jnsyoqbkpcziblavorvm.supabase.co/storage/v1/object/public/assets/Screenshot_2026-01-14_9.18.14_AM-removebg-preview.png"
      alt="Shepherd Logo"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

export default ShepherdLogo;
