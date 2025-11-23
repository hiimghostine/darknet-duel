import React, { useEffect, useState } from 'react';
import { useThemeStore } from '../store/theme.store';

interface LogoutScreenProps {
  text?: string;
}

const LogoutScreen: React.FC<LogoutScreenProps> = ({ text = 'DISCONNECTING SESSION' }) => {
  const { theme } = useThemeStore();
  const [fadeOut, setFadeOut] = useState(false);
  const [glitchEffect, setGlitchEffect] = useState(false);
  
  // Use primary color for light theme, error for dark theme
  const accentColor = theme === 'cyberpunk' ? 'primary' : 'error';
  
  useEffect(() => {
    // Add random glitch effects at intervals
    const glitchInterval = setInterval(() => {
      setGlitchEffect(true);
      setTimeout(() => setGlitchEffect(false), 150);
    }, 800);
    
    // Start fade out animation after 2 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);
    
    return () => {
      clearInterval(glitchInterval);
      clearTimeout(fadeTimer);
    };
  }, []);
  
  return (
    <div className={`fixed inset-0 flex flex-col items-center justify-center z-[9999] bg-base-100 
                   transition-opacity duration-1000 ${fadeOut ? 'opacity-80' : 'opacity-100'}`}>
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg"></div>
      
      {/* Scanlines with increased intensity during logout */}
      <div className="absolute inset-0 scanline-intense"></div>
      
      {/* Glitch overlay */}
      {glitchEffect && (
        <div className="absolute inset-0 bg-primary/5 z-10"></div>
      )}
      
      {/* Decorative lines that will break apart */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-${accentColor}/70 ${glitchEffect ? 'translate-x-3' : ''} transition-transform`}></div>
      <div className={`absolute bottom-0 right-0 w-full h-1 bg-${accentColor}/70 ${glitchEffect ? '-translate-x-3' : ''} transition-transform`}></div>
      <div className={`absolute left-0 top-0 w-1 h-full bg-${accentColor}/70 ${glitchEffect ? 'translate-y-3' : ''} transition-transform`}></div>
      <div className={`absolute right-0 top-0 w-1 h-full bg-${accentColor}/70 ${glitchEffect ? '-translate-y-3' : ''} transition-transform`}></div>
      
      {/* Warning icon with shutdown animation */}
      <div className="relative mb-8">
        <div className={`absolute inset-0 rounded-full ${fadeOut ? `bg-${accentColor}/20` : `bg-${accentColor}/40`} filter blur-xl animate-pulse`}></div>
        <div className={`text-6xl font-bold font-mono ${glitchEffect ? `text-${accentColor}/50` : `text-${accentColor}`} text-flicker pulse-glow`}>
          {fadeOut ? '×' : '!'}
        </div>
      </div>
      
      {/* Shutdown visualization */}
      <div className="relative w-32 h-32 mb-6">
        <div className={`absolute inset-0 flex items-center justify-center ${glitchEffect ? 'scale-95' : 'scale-100'} transition-transform`}>
          <div className={`w-24 h-24 border-4 border-${accentColor}/40 hexagon rotate-animation-reverse`}></div>
        </div>
        <div className={`absolute inset-0 flex items-center justify-center ${fadeOut ? 'opacity-40' : 'opacity-100'} transition-opacity`}>
          <div className={`w-16 h-16 border-4 border-${accentColor}/60 hexagon rotate-animation`}></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-8 h-8 ${fadeOut ? `bg-${accentColor}/30` : `bg-${accentColor}/70`} hexagon pulse-error ${glitchEffect ? 'translate-x-1' : ''} transition-transform`}></div>
        </div>
      </div>
      
      {/* Loading text with data corruption effect */}
      <div className="text-center">
        <h2 className={`text-xl font-mono ${glitchEffect ? `text-${accentColor}/50` : `text-${accentColor}`} mb-2 data-corrupt`}>{text}</h2>
        <div className="flex justify-center gap-1">
          <span className={`loading-dot bg-${accentColor} ${fadeOut ? 'opacity-30' : 'opacity-100'}`}></span>
          <span className={`loading-dot bg-${accentColor} animation-delay-200 ${fadeOut ? 'opacity-50' : 'opacity-100'}`}></span>
          <span className={`loading-dot bg-${accentColor} animation-delay-400 ${fadeOut ? 'opacity-70' : 'opacity-100'}`}></span>
        </div>
      </div>
      
      {/* System shutdown messages */}
      <div className="absolute bottom-6 w-full max-w-md mx-auto">
        <div className={`border border-${accentColor}/20 bg-base-200/50 p-2 backdrop-blur-sm ${glitchEffect ? 'translate-x-1' : ''} transition-transform`}>
          <div className="font-mono text-xs text-base-content/70 flex flex-wrap justify-center gap-x-4">
            <span className="text-flicker">CONNECTION: <span className={`text-${accentColor}`}>TERMINATING</span></span>
            <span className="data-corrupt">STATUS: <span className={`text-${accentColor}`}>SHUTTING_DOWN</span></span>
            <span>SECURITY: <span className={`text-${accentColor}`}>CLEARING</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutScreen;
