import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Debug flag from environment variable
const DEBUG_AUDIO = import.meta.env.VITE_DEBUG_AUDIO === 'true';

interface AudioSettings {
  bgmVolume: number;
  sfxVolume: number;
  bgmEnabled: boolean;
  sfxEnabled: boolean;
}

interface AudioStore extends AudioSettings {
  setBGMVolume: (volume: number) => void;
  setSFXVolume: (volume: number) => void;
  setBGMEnabled: (enabled: boolean) => void;
  setSFXEnabled: (enabled: boolean) => void;
  resetSettings: () => void;
}

const defaultSettings: AudioSettings = {
  bgmVolume: 50,
  sfxVolume: 70,
  bgmEnabled: true,
  sfxEnabled: true,
};

export const useAudioStore = create<AudioStore>()(
  persist(
    (set, get) => ({
      ...defaultSettings,
      setBGMVolume: (volume: number) => {
        if (DEBUG_AUDIO) console.log('🎵 Setting BGM volume to:', volume);
        set({ bgmVolume: Math.max(0, Math.min(100, volume)) });
      },
      setSFXVolume: (volume: number) => {
        if (DEBUG_AUDIO) console.log('🔊 Setting SFX volume to:', volume);
        set({ sfxVolume: Math.max(0, Math.min(100, volume)) });
      },
      setBGMEnabled: (enabled: boolean) => {
        if (DEBUG_AUDIO) console.log('🎵 Setting BGM enabled to:', enabled);
        set({ bgmEnabled: enabled });
      },
      setSFXEnabled: (enabled: boolean) => {
        if (DEBUG_AUDIO) console.log('🔊 Setting SFX enabled to:', enabled);
        set({ sfxEnabled: enabled });
      },
      resetSettings: () => {
        if (DEBUG_AUDIO) console.log('🎵 Resetting audio settings to defaults');
        set(defaultSettings);
      },
    }),
    {
      name: 'audio-settings',
      onRehydrateStorage: () => (state) => {
        if (DEBUG_AUDIO) console.log('🎵 Audio store rehydrated:', state);
      },
    }
  )
); 