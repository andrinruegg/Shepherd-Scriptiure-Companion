
import React, { useEffect } from 'react';

// This component has been deprecated and disabled.
// It is kept as a placeholder to prevent import errors if cached versions of App.tsx call it.

const PrincessOverlay: React.FC<any> = () => {
  useEffect(() => {
      // Safety cleanup: Ensure the class is removed if it somehow got added
      document.body.classList.remove('princess-mode');
  }, []);

  return null;
};

export default PrincessOverlay;
