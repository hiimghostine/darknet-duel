import React from 'react';

// Import types
import type { GameComponentProps } from './types';

// Import hooks
import { useAudioManager } from '../../../hooks/useAudioManager';

// Define props interface extending GameComponentProps
export interface GameStatusOverlaysProps extends GameComponentProps {
  // Target mode state
  targetMode: boolean;
  selectedCard: any;
  cancelTargeting: () => void;
  
  // Reaction mode state
  isInReactionMode: boolean;
  isTimerActive: boolean;
  timeRemaining: number;
  isPaused?: boolean;
  
  // Processing state
  isProcessingMove: boolean;
}

const GameStatusOverlays: React.FC<GameStatusOverlaysProps> = ({
  targetMode,
  selectedCard,
  cancelTargeting,
  isInReactionMode,
  isTimerActive,
  timeRemaining,
  isPaused = false,
  isProcessingMove
}) => {
  // Audio manager for sound effects
  const { triggerClick } = useAudioManager();

  return (
    <>
      {/* Target mode notification - top-right corner */}
      {targetMode && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="alert alert-warning shadow-lg border-warning/60 backdrop-blur-sm max-w-sm">
            <div className="flex items-center gap-3">
              <span className="text-warning text-lg">🎯</span>
              <div>
                <div className="font-bold font-mono">TARGET_MODE</div>
                <div className="text-sm">
                  Select target for <span className="text-accent font-bold">{selectedCard?.name}</span>
                </div>
                <div className="text-xs opacity-70">Click infrastructure or ESC to cancel</div>
              </div>
              <button 
                className="btn btn-ghost btn-xs ml-2" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  triggerClick(); // Play click sound on button press
                  cancelTargeting();
                }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reaction mode notification - top-center */}
      {isInReactionMode && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in-down">
          <div className="alert alert-info shadow-lg border-accent/60 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="text-accent text-lg">⚡</span>
              <div>
                <div className="font-bold font-mono">REACTION_MODE</div>
                <div className="text-sm">Play a defensive card to counter</div>
                <div className="text-xs opacity-70">Only reactive cards can be played</div>
                {isTimerActive && (
                  <div className="text-xs text-warning font-bold mt-1">
                    {isPaused ? '⏸️ PAUSED' : `⏰ Auto-skip in ${timeRemaining}s`}
                  </div>
                )}
              </div>
            </div>
            {/* Auto-skip timer visualization */}
            {isTimerActive && !isPaused && (
              <div
                className="absolute bottom-0 left-0 h-1 bg-warning transition-all duration-1000 ease-linear"
                style={{
                  width: `${(timeRemaining / 20) * 100}%`,
                  backgroundColor: timeRemaining <= 5 ? '#ef4444' : timeRemaining <= 10 ? '#f59e0b' : '#10b981'
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Processing overlay */}
      {isProcessingMove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-200 border border-primary/20 rounded-lg p-6 relative">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
            
            <div className="flex items-center gap-4">
              <div className="loading loading-spinner loading-md text-primary"></div>
              <span className="font-mono text-primary font-bold">PROCESSING_MOVE...</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(GameStatusOverlays);