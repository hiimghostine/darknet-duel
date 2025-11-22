import React, { useEffect, useRef } from 'react';
import { useAudioStore } from '../store/audio.store';
import { audioHandler } from '../utils/audioHandler';
import { useThemeStore } from '../store/theme.store';
import { useAudioManager } from '../hooks/useAudioManager';
import { Volume2, VolumeX, X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();
  const { triggerClick } = useAudioManager();

  const {
    bgmVolume,
    sfxVolume,
    bgmEnabled,
    sfxEnabled,
    setBGMVolume,
    setSFXVolume,
    setBGMEnabled,
    setSFXEnabled,
  } = useAudioStore();

  const handleBgmVolumeChange = (volume: number) => {
    setBGMVolume(volume);
    audioHandler.updateBGMVolume();
  };

  const handleSfxVolumeChange = (volume: number) => {
    setSFXVolume(volume);
    // SFX volume is applied when playing, no need to update existing
  };

  const handleBgmToggle = () => {
    const newEnabled = !bgmEnabled;
    setBGMEnabled(newEnabled);
    audioHandler.updateBGMVolume();
  };

  const handleSfxToggle = () => {
    const newEnabled = !sfxEnabled;
    setSFXEnabled(newEnabled);
    // SFX enabled state is checked when playing
  };

  const testSFX = () => {
    audioHandler.playSFX('click');
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
      style={{
        zIndex: 999999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      <div
        ref={modalRef}
        className={`rounded-lg p-6 w-full max-w-md mx-4 border shadow-2xl ${theme === 'cyberpunk'
          ? 'bg-base-100 border-primary/30 text-base-content'
          : 'bg-base-200 border-base-300 text-base-content'
          }`}
        style={{
          zIndex: 1000000,
          position: 'relative'
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${theme === 'cyberpunk' ? 'text-primary' : 'text-base-content'
            }`}>
            AUDIO SETTINGS
          </h2>
          <button
            onClick={() => {
              triggerClick();
              onClose();
            }}
            className={`btn btn-ghost btn-sm ${theme === 'cyberpunk' ? 'text-primary hover:text-primary/70' : 'text-base-content hover:text-base-content/70'
              }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* BGM Settings */}
          <div className={`card p-5 w-full ${theme === 'cyberpunk' ? 'bg-base-200' : 'bg-base-100'
            }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-base-content">Background Music</h3>
              <label className="swap swap-rotate">
                <input
                  type="checkbox"
                  checked={bgmEnabled}
                  onChange={handleBgmToggle}
                  className="swap-input"
                />
                <div className="swap-on p-2 rounded-lg bg-primary/20 text-primary"><Volume2 className="w-5 h-5" /></div>
                <div className="swap-off p-2 rounded-lg bg-base-300 text-base-content/50"><VolumeX className="w-5 h-5" /></div>
              </label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-base-content">Volume</span>
                <span className="text-sm text-base-content/70 font-mono">{bgmVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={bgmVolume}
                onChange={(e) => handleBgmVolumeChange(parseInt(e.target.value))}
                className="range range-primary w-full"
                disabled={!bgmEnabled}
              />
            </div>
          </div>

          {/* SFX Settings */}
          <div className={`card p-5 w-full ${theme === 'cyberpunk' ? 'bg-base-200' : 'bg-base-100'
            }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-base-content">Sound Effects</h3>
              <label className="swap swap-rotate">
                <input
                  type="checkbox"
                  checked={sfxEnabled}
                  onChange={handleSfxToggle}
                  className="swap-input"
                />
                <div className="swap-on p-2 rounded-lg bg-secondary/20 text-secondary"><Volume2 className="w-5 h-5" /></div>
                <div className="swap-off p-2 rounded-lg bg-base-300 text-base-content/50"><VolumeX className="w-5 h-5" /></div>
              </label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-base-content">Volume</span>
                <span className="text-sm text-base-content/70 font-mono">{sfxVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={sfxVolume}
                onChange={(e) => handleSfxVolumeChange(parseInt(e.target.value))}
                className="range range-secondary w-full"
                disabled={!sfxEnabled}
              />
              <button
                onClick={() => {
                  triggerClick();
                  testSFX();
                }}
                disabled={!sfxEnabled}
                className={`btn btn-secondary btn-sm w-full ${theme === 'cyberpunk' ? 'btn-cyberpunk' : ''
                  }`}
              >
                Test Sound
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal; 