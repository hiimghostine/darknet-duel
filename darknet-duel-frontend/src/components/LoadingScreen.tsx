import React from 'react';

interface LoadingScreenProps {
  text?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ text = 'SYSTEM INITIALIZING' }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-base-100">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg"></div>
      
      {/* Scanlines */}
      <div className="absolute inset-0 scanline"></div>
      
      {/* Decorative lines */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
      <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-primary to-transparent"></div>
      <div className="absolute right-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-primary to-transparent"></div>
      
      {/* Logo glow effect */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-primary/30 filter blur-xl animate-pulse"></div>
        <div className="text-6xl font-bold font-mono text-primary text-flicker pulse-glow">D</div>
      </div>
      
      {/* Loading hexagon animation */}
      <div className="relative w-32 h-32 mb-6">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 border-4 border-primary/30 hexagon rotate-animation"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary/50 hexagon rotate-animation-reverse"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-primary/70 hexagon pulse-glow"></div>
        </div>
      </div>
      
      {/* Loading text */}
      <div className="text-center">
        <h2 className="text-xl font-mono text-primary typing-animation mb-2">{text}</h2>
        <div className="flex justify-center gap-1">
          <span className="loading-dot bg-primary"></span>
          <span className="loading-dot bg-primary animation-delay-200"></span>
          <span className="loading-dot bg-primary animation-delay-400"></span>
        </div>
      </div>
      
      {/* Status text */}
      <div className="absolute bottom-6 w-full max-w-md mx-auto">
        <div className="border border-primary/20 bg-base-200/50 p-2 backdrop-blur-sm">
          <div className="font-mono text-xs text-base-content/70 flex flex-wrap justify-center gap-x-4">
            <span className="text-flicker">NETWORK: <span className="text-primary">CONNECTING</span></span>
            <span className="data-corrupt">STATUS: <span className="text-primary">VALIDATING</span></span>
            <span>SECURITY: <span className="text-primary">ACTIVE</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
