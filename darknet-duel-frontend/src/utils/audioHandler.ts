import { useAudioStore } from '../store/audio.store';

// Audio file imports
import clickWav from '../assets/sfx/click.wav';
import errorWav from '../assets/sfx/error.wav';
import notificationWav from '../assets/sfx/notification.wav';
import positiveClickWav from '../assets/sfx/positive-click.wav';
import negativeClickWav from '../assets/sfx/negative-click.wav';
import purchaseSuccessfulWav from '../assets/sfx/purchase-successful.wav';
import sendMsgWav from '../assets/sfx/send-msg.wav';
import recvMsgWav from '../assets/sfx/recv-msg.wav';

import endCreditsM4a from '../assets/bgm/end-credits-loop.m4a';
import unpluggedFromMatrixM4a from '../assets/bgm/unplugged-from-the-matrix-loop.m4a';
import systemHasFailedM4a from '../assets/bgm/the-system-has-failed-loop.m4a';
import theDropM4a from '../assets/bgm/the-drop-loop.m4a';

// SFX mapping
const SFX_FILES = {
  click: clickWav,
  error: errorWav,
  notification: notificationWav,
  'positive-click': positiveClickWav,
  'negative-click': negativeClickWav,
  'purchase-successful': purchaseSuccessfulWav,
  'send-msg': sendMsgWav,
  'recv-msg': recvMsgWav,
} as const;

// BGM mapping
const BGM_FILES = {
  'end-credits': endCreditsM4a,
  'unplugged-from-the-matrix': unpluggedFromMatrixM4a,
  'the-system-has-failed': systemHasFailedM4a,
  'the-drop': theDropM4a,
} as const;

console.log('🎵 BGM_FILES loaded:', Object.keys(BGM_FILES));
console.log('🎵 BGM file paths:', BGM_FILES);

export type SFXType = keyof typeof SFX_FILES;
export type BGMType = keyof typeof BGM_FILES;

class AudioHandler {
  private bgmAudio: HTMLAudioElement | null = null;
  private currentBGM: BGMType | null = null;
  private isLoading = false;
  private fadeTimeout: NodeJS.Timeout | null = null;

  constructor() {
    console.log('🎵 AudioHandler initialized');
    // Preload all audio files
    this.preloadAudio();
  }

  private preloadAudio() {
    console.log('🎵 Preloading audio files...');
    console.log('🎵 SFX files:', Object.keys(SFX_FILES));
    console.log('🎵 BGM files:', Object.keys(BGM_FILES));
    
    // Preload SFX
    Object.values(SFX_FILES).forEach(src => {
      const audio = new Audio(src);
      audio.preload = 'auto';
    });

    // Preload BGM
    Object.values(BGM_FILES).forEach(src => {
      const audio = new Audio(src);
      audio.preload = 'auto';
    });
  }

  // Play SFX
  playSFX(type: SFXType) {
    const { sfxEnabled, sfxVolume } = useAudioStore.getState();
    
    console.log('🔊 playSFX called with type:', type);
    console.log('🔊 SFX enabled:', sfxEnabled, 'volume:', sfxVolume);
    
    if (!sfxEnabled) {
      console.log('🔊 SFX disabled, not playing');
      return;
    }

    const audio = new Audio(SFX_FILES[type]);
    audio.volume = sfxVolume / 100;
    console.log('🔊 Playing SFX:', type, 'at volume:', sfxVolume / 100);
    audio.play().catch((error) => {
      console.error('🔊 Error playing SFX:', error);
    });
  }

  // Play BGM
  playBGM(type: BGMType) {
    const { bgmEnabled, bgmVolume } = useAudioStore.getState();
    
    console.log('🎵 playBGM called with type:', type);
    console.log('🎵 BGM enabled:', bgmEnabled, 'volume:', bgmVolume);
    
    if (!bgmEnabled) {
      console.log('🎵 BGM disabled, stopping current BGM');
      this.stopBGM();
      return;
    }

    // If same BGM is already playing, don't restart
    if (this.currentBGM === type && this.bgmAudio && !this.bgmAudio.paused) {
      console.log('🎵 Same BGM already playing:', type);
      return;
    }

    // Stop current BGM
    console.log('🎵 Stopping current BGM and starting new one:', type);
    this.stopBGM();

    // Create new BGM audio
    console.log('🎵 Creating audio element for BGM:', type);
    console.log('🎵 BGM file path:', BGM_FILES[type]);
    
    this.bgmAudio = new Audio(BGM_FILES[type]);
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = bgmVolume / 100;
    this.currentBGM = type;

    console.log('🎵 Playing BGM:', type, 'at volume:', bgmVolume / 100);
    this.bgmAudio.play().catch((error) => {
      console.error('🎵 Error playing BGM:', error);
      console.error('🎵 Error name:', error.name);
      console.error('🎵 Error message:', error.message);
      
      // Check if it's an autoplay restriction error
      if (error.name === 'NotAllowedError' || 
          error.message.includes('autoplay') || 
          error.message.includes('user gesture') ||
          error.message.includes('interaction')) {
        console.log('🎵 Autoplay blocked, triggering permission prompt');
        // Dispatch custom event to trigger permission prompt
        window.dispatchEvent(new CustomEvent('audio-permission-needed'));
      }
    });
    
    // Add event listeners for debugging
    this.bgmAudio.addEventListener('canplaythrough', () => {
      console.log('🎵 BGM can play through:', type);
    });
    
    this.bgmAudio.addEventListener('error', (e) => {
      console.error('🎵 BGM error event:', e);
    });
  }

  // Stop BGM
  stopBGM() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
      this.bgmAudio = null;
    }
    this.currentBGM = null;
  }

  // Update BGM volume
  updateBGMVolume() {
    const { bgmVolume, bgmEnabled } = useAudioStore.getState();
    
    if (this.bgmAudio) {
      if (!bgmEnabled) {
        this.stopBGM();
      } else {
        this.bgmAudio.volume = bgmVolume / 100;
      }
    }
  }

  // Retry playing current BGM (useful after permission is granted)
  retryCurrentBGM() {
    if (this.currentBGM && this.bgmAudio) {
      console.log('🎵 Retrying current BGM:', this.currentBGM);
      this.bgmAudio.play().catch((error) => {
        console.error('🎵 Retry failed:', error);
      });
    }
  }

  // Update SFX volume (for future SFX)
  updateSFXVolume() {
    // SFX volume is applied when playing, so no need to update existing audio
  }

  // Fade BGM during loading
  fadeBGMForLoading() {
    if (!this.bgmAudio || this.isLoading) return;

    this.isLoading = true;
    const { bgmVolume } = useAudioStore.getState();
    const targetVolume = (bgmVolume * 0.3) / 100; // 30% of user's volume

    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
    }

    // Fade out
    const fadeOut = () => {
      if (this.bgmAudio) {
        this.bgmAudio.volume = Math.max(this.bgmAudio.volume - 0.1, targetVolume);
        if (this.bgmAudio.volume > targetVolume) {
          this.fadeTimeout = setTimeout(fadeOut, 50);
        }
      }
    };

    fadeOut();
  }

  // Restore BGM volume after loading
  restoreBGMVolume() {
    if (!this.bgmAudio || !this.isLoading) return;

    this.isLoading = false;
    const { bgmVolume } = useAudioStore.getState();
    const targetVolume = bgmVolume / 100;

    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
    }

    // Fade in
    const fadeIn = () => {
      if (this.bgmAudio) {
        this.bgmAudio.volume = Math.min(this.bgmAudio.volume + 0.1, targetVolume);
        if (this.bgmAudio.volume < targetVolume) {
          this.fadeTimeout = setTimeout(fadeIn, 50);
        }
      }
    };

    fadeIn();
  }

  // Get current BGM
  getCurrentBGM(): BGMType | null {
    return this.currentBGM;
  }

  // Check if BGM is playing
  isBGMPlaying(): boolean {
    return this.bgmAudio !== null && !this.bgmAudio.paused;
  }
}

// Create singleton instance
export const audioHandler = new AudioHandler();
console.log('🎵 AudioHandler singleton created');

// Export convenience functions
export const playSFX = (type: SFXType) => audioHandler.playSFX(type);
export const playBGM = (type: BGMType) => audioHandler.playBGM(type);
export const stopBGM = () => audioHandler.stopBGM();
export const fadeBGMForLoading = () => audioHandler.fadeBGMForLoading();
export const restoreBGMVolume = () => audioHandler.restoreBGMVolume();
export const getCurrentBGM = () => audioHandler.getCurrentBGM();
export const isBGMPlaying = () => audioHandler.isBGMPlaying();
export const retryCurrentBGM = () => audioHandler.retryCurrentBGM(); 