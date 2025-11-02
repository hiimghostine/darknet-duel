import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, XOctagon } from 'lucide-react';
import { useAudioManager } from '../hooks/useAudioManager';
import { useThemeStore } from '../store/theme.store';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const { triggerPositiveClick, triggerNegativeClick } = useAudioManager();
  const { theme } = useThemeStore();
  const [glitchEffect, setGlitchEffect] = useState(false);
  
  // Use primary color for light theme, error for dark theme
  const accentColor = theme === 'cyberpunk' ? 'primary' : 'error';

  useEffect(() => {
    if (!isOpen) return;

    // Add random glitch effects at intervals
    const glitchInterval = setInterval(() => {
      setGlitchEffect(true);
      setTimeout(() => setGlitchEffect(false), 100);
    }, 1500);

    return () => {
      clearInterval(glitchInterval);
    };
  }, [isOpen]);

  const handleConfirm = () => {
    triggerPositiveClick();
    onConfirm();
  };

  const handleCancel = () => {
    triggerNegativeClick();
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleCancel}
      />
      
      {/* Modal container - centered */}
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
              <div className={`text-2xl ${glitchEffect ? `text-${accentColor}/50` : `text-${accentColor}`} transition-colors`}>
                ⚠️
              </div>
              <h2 className={`text-lg font-mono font-bold ${glitchEffect ? `text-${accentColor}/70` : `text-${accentColor}`} text-flicker`}>
                TERMINATE_SESSION
              </h2>
            </div>
            <button
              onClick={handleCancel}
              className={`text-base-content/60 hover:text-${accentColor} transition-colors`}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Warning icon with pulsing effect */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className={`absolute inset-0 rounded-full bg-${accentColor}/20 filter blur-xl animate-pulse`}></div>
                <div className={`relative w-16 h-16 border-2 border-${accentColor}/40 hexagon rotate-animation flex items-center justify-center`}>
                  <XOctagon className={`w-10 h-10 text-${accentColor} ${glitchEffect ? 'translate-x-0.5' : ''} transition-transform`} />
                </div>
              </div>
            </div>
            
            {/* Message */}
            <div className="space-y-2 text-center">
              <p className={`font-mono text-base-content ${glitchEffect ? 'data-corrupt' : ''}`}>
                Are you sure you want to terminate your session?
              </p>
              <p className="font-mono text-sm text-base-content/60">
                All active connections will be severed.
              </p>
            </div>
            
            {/* System status indicators */}
            <div className={`border border-${accentColor}/20 bg-base-300/50 p-3 backdrop-blur-sm`}>
              <div className="font-mono text-xs text-base-content/70 space-y-1">
                <div className="flex justify-between">
                  <span className={glitchEffect ? 'text-flicker' : ''}>SESSION_STATUS:</span>
                  <span className={`text-${accentColor}`}>ACTIVE</span>
                </div>
                <div className="flex justify-between">
                  <span>SECURITY_LEVEL:</span>
                  <span className="text-success">AUTHENTICATED</span>
                </div>
                <div className="flex justify-between">
                  <span className={glitchEffect ? 'data-corrupt' : ''}>ACTION:</span>
                  <span className={`text-${accentColor}`}>LOGOUT_PENDING</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className={`flex gap-3 p-4 border-t border-${accentColor}/30 bg-base-300/30`}>
            <button
              onClick={handleCancel}
              className={`flex-1 btn bg-base-300/80 border-${accentColor}/30 hover:border-${accentColor} text-${accentColor} btn-cyberpunk`}
            >
              <span className="font-mono">CANCEL</span>
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 btn bg-${accentColor}/20 border-${accentColor}/50 hover:bg-${accentColor}/30 text-${accentColor} btn-cyberpunk pulse-glow`}
            >
              <span className="font-mono">TERMINATE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default LogoutConfirmModal;
