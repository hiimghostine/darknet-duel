import React from 'react';
import { useAudioManager } from '../hooks/useAudioManager';
import AudioPermissionPrompt from './AudioPermissionPrompt';

interface AudioProviderProps {
  children: React.ReactNode;
}

const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  console.log('🎵 AudioProvider initialized');
  
  // Initialize audio manager - this will handle BGM transitions and SFX
  const { showPermissionPrompt, setShowPermissionPrompt } = useAudioManager();
  
  const handleAudioEnabled = () => {
    console.log('🎵 AudioProvider: Audio enabled by user');
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