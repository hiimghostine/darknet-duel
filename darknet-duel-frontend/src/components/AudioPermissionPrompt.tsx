import React, { useState, useEffect } from 'react';
import { useAudioStore } from '../store/audio.store';
import { audioHandler } from '../utils/audioHandler';

// Debug flag from environment variable
const DEBUG_AUDIO = import.meta.env.VITE_DEBUG_AUDIO === 'true';

interface AudioPermissionPromptProps {
  isVisible: boolean;
  onEnable: () => void;
}

const AudioPermissionPrompt: React.FC<AudioPermissionPromptProps> = ({ 
  isVisible, 
  onEnable 
}) => {
  const [hasInteracted, setHasInteracted] = useState(false);
  const { bgmEnabled } = useAudioStore();

  useEffect(() => {
    // Only track interactions if the prompt is visible
    if (!isVisible) return;

    const checkInteraction = (event: Event) => {
      // Don't hide prompt if clicking inside the modal
      if (event.target && (event.target as Element).closest('.audio-permission-modal')) {
        return;
      }
      
      if (DEBUG_AUDIO) console.log('🎵 User interacted with page, but audio context not unlocked');
      // Don't automatically hide - let user explicitly enable audio
    };

    document.addEventListener('click', checkInteraction);
    document.addEventListener('keydown', checkInteraction);
    document.addEventListener('touchstart', checkInteraction);

    return () => {
      document.removeEventListener('click', checkInteraction);
      document.removeEventListener('keydown', checkInteraction);
      document.removeEventListener('touchstart', checkInteraction);
    };
  }, [isVisible]);

  const handleEnableAudio = () => {
    if (DEBUG_AUDIO) console.log('🎵 Attempting to unlock audio context...');
    
    // Try multiple methods to unlock audio context
    const unlockAudio = async () => {
      try {
        // Method 1: Play silent audio
        const silentAudio = new Audio();
        silentAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
        await silentAudio.play();
        if (DEBUG_AUDIO) console.log('🎵 Audio context unlocked successfully with silent audio');
        return true;
      } catch (error) {
        if (DEBUG_AUDIO) console.log('🎵 Silent audio failed, trying alternative method...');
        
        try {
          // Method 2: Create and play a simple tone
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.001);
          
          if (DEBUG_AUDIO) console.log('🎵 Audio context unlocked successfully with oscillator');
          return true;
        } catch (error2) {
          console.error('🎵 All audio unlock methods failed:', error2);
          return false;
        }
      }
    };

    unlockAudio().then((success) => {
      if (success) {
        if (DEBUG_AUDIO) console.log('🎵 Audio context unlocked, enabling audio...');
        onEnable();
      } else {
        if (DEBUG_AUDIO) console.log('🎵 Audio unlock failed, but proceeding anyway...');
        onEnable();
      }
    });
  };

  // Only show if BGM is enabled and prompt is visible
  if (!isVisible || !bgmEnabled) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[999998] audio-permission-modal"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      <div className="bg-base-100 border border-primary/30 rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="text-center space-y-4">
          <div className="text-4xl mb-4">🔊</div>
          <h3 className="text-xl font-bold text-primary">Enable Audio</h3>
          <p className="text-base-content/80">
            Click the button below to enable background music and sound effects. 
            This is required due to browser autoplay restrictions.
          </p>
          <button
            onClick={handleEnableAudio}
            className="btn btn-primary btn-lg w-full"
          >
            Enable Audio
          </button>
          <p className="text-xs text-base-content/60">
            You can disable audio later in the settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default AudioPermissionPrompt; 