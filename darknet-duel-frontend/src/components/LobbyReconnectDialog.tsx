import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Wifi, WifiOff, X } from 'lucide-react';
import { useAudioManager } from '../hooks/useAudioManager';
import { useThemeStore } from '../store/theme.store';

interface LobbyReconnectDialogProps {
  open: boolean;
  matchID: string;
  onReconnect: () => void;
  onDismiss: () => void;
}

export const LobbyReconnectDialog: React.FC<LobbyReconnectDialogProps> = ({
  open,
  matchID,
  onReconnect,
  onDismiss
}) => {
  const { triggerPositiveClick, triggerNegativeClick } = useAudioManager();
  const { theme } = useThemeStore();
  const [glitchEffect, setGlitchEffect] = useState(false);
  
  const accentColor = theme === 'cyberpunk' ? 'primary' : 'success';

  useEffect(() => {
    if (!open) return;

    const glitchInterval = setInterval(() => {
      setGlitchEffect(true);
      setTimeout(() => setGlitchEffect(false), 100);
    }, 2000);

    return () => {
      clearInterval(glitchInterval);
    };
  }, [open]);

  const handleReconnect = () => {
    triggerPositiveClick();
    onReconnect();
  };

  const handleDismiss = () => {
    triggerNegativeClick();
    onDismiss();
  };

  if (!open) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleDismiss}
      />
      
      {/* Modal container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Glitch overlay effect */}
        {glitchEffect && (
          <div className={`absolute inset-0 bg-${accentColor}/10 z-20 pointer-events-none`}></div>
        )}
        
        {/* Main modal content */}
        <div className={`bg-base-200 border-2 border-${accentColor}/50 shadow-2xl shadow-${accentColor}/20 relative overflow-hidden`}>
          {/* Scanlines */}
          <div className="absolute inset-0 scanline pointer-events-none"></div>
          
          {/* Corner accents */}
          <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-${accentColor}`}></div>
          <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-${accentColor}`}></div>
          <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-${accentColor}`}></div>
          <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-${accentColor}`}></div>
          
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b border-${accentColor}/30 bg-${accentColor}/5`}>
            <div className="flex items-center gap-3">
              <Wifi className={`w-6 h-6 ${glitchEffect ? `text-${accentColor}/50` : `text-${accentColor}`} transition-colors`} />
              <h2 className={`text-lg font-mono font-bold ${glitchEffect ? `text-${accentColor}/70` : `text-${accentColor}`} text-flicker`}>
                ACTIVE_LOBBY_FOUND
              </h2>
            </div>
            <button
              onClick={handleDismiss}
              className={`text-base-content/60 hover:text-${accentColor} transition-colors`}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Icon with pulsing effect */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className={`absolute inset-0 rounded-full bg-${accentColor}/20 filter blur-xl animate-pulse`}></div>
                <div className={`relative w-16 h-16 border-2 border-${accentColor}/40 hexagon rotate-animation flex items-center justify-center`}>
                  <Wifi className={`w-10 h-10 text-${accentColor} ${glitchEffect ? 'translate-x-0.5' : ''} transition-transform`} />
                </div>
              </div>
            </div>
            
            {/* Message */}
            <div className="space-y-2 text-center">
              <p className={`font-mono text-base-content ${glitchEffect ? 'data-corrupt' : ''}`}>
                You have an active lobby session from a previous visit.
              </p>
              <p className="font-mono text-sm text-base-content/60">
                Would you like to reconnect?
              </p>
            </div>
            
            {/* Lobby info */}
            <div className={`border border-${accentColor}/20 bg-base-300/50 p-3 backdrop-blur-sm`}>
              <div className="font-mono text-xs text-base-content/70 space-y-1">
                <div className="flex justify-between">
                  <span className={glitchEffect ? 'text-flicker' : ''}>LOBBY_ID:</span>
                  <span className={`text-${accentColor} font-semibold`}>{matchID}</span>
                </div>
                <div className="flex justify-between">
                  <span>STATUS:</span>
                  <span className="text-success">ACTIVE</span>
                </div>
                <div className="flex justify-between">
                  <span className={glitchEffect ? 'data-corrupt' : ''}>ACTION:</span>
                  <span className={`text-${accentColor}`}>RECONNECT_AVAILABLE</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className={`flex gap-3 p-4 border-t border-${accentColor}/30 bg-base-300/30`}>
            <button
              onClick={handleDismiss}
              className={`flex-1 btn bg-base-300/80 border-${accentColor}/30 hover:border-${accentColor}/50 text-base-content btn-cyberpunk`}
            >
              <WifiOff className="w-4 h-4 mr-2" />
              <span className="font-mono">DISMISS</span>
            </button>
            <button
              onClick={handleReconnect}
              className={`flex-1 btn bg-${accentColor}/20 border-${accentColor}/50 hover:bg-${accentColor}/30 text-${accentColor} btn-cyberpunk pulse-glow`}
            >
              <Wifi className="w-4 h-4 mr-2" />
              <span className="font-mono">RECONNECT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
