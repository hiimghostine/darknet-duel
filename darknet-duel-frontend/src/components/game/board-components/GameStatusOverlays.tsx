import React from 'react';
import { Target, X, Zap, Clock, Loader2 } from 'lucide-react';

// Import types
import type { GameComponentProps } from './types';

// Import hooks
import { useAudioManager } from '../../../hooks/useAudioManager';
import { useThemeStore } from '../../../store/theme.store';

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
  
  // Get theme for conditional styling
  const { theme } = useThemeStore();

  return (
    <>
      {/* Target mode notification - top-right corner */}
      {targetMode && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
          <div className={`
            bg-gradient-to-br backdrop-blur-md border-2 rounded-xl p-4 shadow-2xl max-w-sm
            ${theme === 'cyberpunk'
              ? 'from-warning/40 to-orange-500/30 border-warning/70'
              : 'from-warning/20 to-orange-500/10 border-warning/50'
            }
          `}>
            <div className="flex items-start gap-3">
              <div className={`
                p-2 rounded-lg border
                ${theme === 'cyberpunk'
                  ? 'bg-warning/30 border-warning/50'
                  : 'bg-warning/20 border-warning/30'
                }
              `}>
                <Target className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <div className="font-bold font-mono text-warning text-sm mb-1">TARGET MODE ACTIVE</div>
                <div className="text-xs text-base-content/80 mb-2">
                  Select target for <span className="text-warning font-bold">{selectedCard?.name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-base-content/60">
                  <kbd className="kbd kbd-xs">ESC</kbd>
                  <span>to cancel</span>
                </div>
              </div>
              <button 
                className="btn btn-ghost btn-xs hover:bg-warning/10" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  triggerClick();
                  cancelTargeting();
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reaction mode notification - top-center */}
      {isInReactionMode && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in-down">
          <div className={`
            bg-gradient-to-br backdrop-blur-md border-2 rounded-xl p-4 shadow-2xl relative overflow-hidden
            ${theme === 'cyberpunk'
              ? 'from-accent/40 to-cyan-500/30 border-accent/70'
              : 'from-accent/20 to-cyan-500/10 border-accent/50'
            }
          `}>
            <div className="flex items-start gap-3">
              <div className={`
                p-2 rounded-lg border animate-pulse
                ${theme === 'cyberpunk'
                  ? 'bg-accent/30 border-accent/50'
                  : 'bg-accent/20 border-accent/30'
                }
              `}>
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="font-bold font-mono text-accent text-sm mb-1">REACTION WINDOW</div>
                <div className="text-xs text-base-content/80 mb-1">
                  Play a defensive card to counter
                </div>
                <div className="text-xs text-base-content/60">
                  Only reactive cards can be played
                </div>
                {isTimerActive && (
                  <div className="flex items-center gap-2 mt-2 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5 text-warning" />
                    <span className="text-warning">
                      {isPaused ? 'PAUSED' : `Auto-skip in ${timeRemaining}s`}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Auto-skip timer visualization */}
            {isTimerActive && !isPaused && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-base-200/30">
                <div
                  className="h-full transition-all duration-1000 ease-linear"
                  style={{
                    width: `${(timeRemaining / 20) * 100}%`,
                    backgroundColor: timeRemaining <= 5 ? '#ef4444' : timeRemaining <= 10 ? '#f59e0b' : '#10b981'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Processing overlay */}
      {isProcessingMove && (
        <div className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 ${
          theme === 'cyberpunk' ? 'bg-black/40' : 'bg-black/60'
        }`}>
          <div className={`
            bg-gradient-to-br border-2 rounded-xl p-8 shadow-2xl
            ${theme === 'cyberpunk'
              ? 'from-base-200/98 to-base-300/98 border-primary/60'
              : 'from-base-200/95 to-base-300/95 border-primary/30'
            }
          `}>
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <span className="font-mono text-primary font-bold text-lg tracking-wider">
                PROCESSING
                <span className="animate-pulse">...</span>
              </span>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary/50"
                    style={{
                      animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(GameStatusOverlays);