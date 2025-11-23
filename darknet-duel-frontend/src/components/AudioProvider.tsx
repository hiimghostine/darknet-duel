import React from 'react';
import { useAudioManager } from '../hooks/useAudioManager';
import AudioPermissionPrompt from './AudioPermissionPrompt';

// Debug flag from environment variable
const DEBUG_AUDIO = import.meta.env.VITE_DEBUG_AUDIO === 'true';

interface AudioProviderProps {
  children: React.ReactNode;
}

const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  if (DEBUG_AUDIO) console.log('🎵 AudioProvider initialized');
  
  // Initialize audio manager - this will handle BGM transitions and SFX
  const { showPermissionPrompt, setShowPermissionPrompt } = useAudioManager();
  
  const handleAudioEnabled = () => {
    if (DEBUG_AUDIO) console.log('🎵 AudioProvider: Audio enabled by user');
    window.dispatchEvent(new CustomEvent('audio-permission-granted'));
    setShowPermissionPrompt(false);
  };
  
  return (
    <>
      {children}
      <AudioPermissionPrompt 
        isVisible={showPermissionPrompt} 
        onEnable={handleAudioEnabled} 
      />
    </>
  );
};

export default AudioProvider; 