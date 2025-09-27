import React from 'react';
import { ArrowLeft, Shield, Sword, GraduationCap, Brain } from 'lucide-react';

// Import types
import type { GameState } from '../../../types/game.types';
import type { BoardProps } from 'boardgame.io/react';

// Import hooks
import { useThemeStore } from '../../../store/theme.store';
import { useAudioManager } from '../../../hooks/useAudioManager';

// Define props interface with exact properties needed
export interface GameControlsBarProps {
  // Core game state
  G: GameState;
  ctx: BoardProps<GameState>['ctx'];
  moves: BoardProps<GameState>['moves'];
  playerID: string | null;
  isActive: boolean;
  
  // Player state
  isAttacker: boolean;
  currentPlayerObj: any;
  
  // Processing state
  isProcessingMove: boolean;
  
  // Action handlers
  handleEndTurn: () => void;
  handleSkipReaction: () => void;
  cycleCard: (cardId: string) => void;  // Keep for compatibility but won't use
  surrender: () => void;
  
  // Timer state from useAutoReactionTimer
  isInReactionMode: boolean;
  isTimerActive: boolean;
  timeRemaining: number;
  
  // Tutorial integration
  tutorialInfo?: {
    scriptName: string;
    role: 'attacker' | 'defender';
    stepIndex: number;
    totalSteps: number;
    onExit: () => void;
  };
}

const GameControlsBar: React.FC<GameControlsBarProps> = ({
  G,
  ctx,
  moves,
  playerID,
  isActive,
  isAttacker,
  currentPlayerObj,
  isProcessingMove,
  handleEndTurn,
  handleSkipReaction,
  cycleCard,
  surrender,
  isInReactionMode,
  isTimerActive,
  timeRemaining,
  tutorialInfo
}) => {
  // Theme support
  const { theme, toggleTheme } = useThemeStore();
  
  // Audio manager for sound effects
  const { triggerClick } = useAudioManager();

  const getScriptIcon = (scriptId: string) => {
    switch (scriptId) {
      case 'defender_basics':
        return <Shield className="w-5 h-5" />;
      case 'attacker_basics':
        return <Sword className="w-5 h-5" />;
      case 'card_encyclopedia':
        return <GraduationCap className="w-5 h-5" />;
      case 'advanced_mechanics':
        return <Brain className="w-5 h-5" />;
      default:
        return <GraduationCap className="w-5 h-5" />;
    }
  };

  return (
    <header className={`
      flex justify-between items-center p-4 border-b backdrop-blur-sm z-10
      ${isAttacker 
        ? 'bg-red-900/80 border-red-700/30' 
        : 'bg-blue-900/80 border-blue-700/30'
      }
    `}>
      {/* Left side - Game title or tutorial info */}
      <div className="flex items-center gap-4">
        {tutorialInfo ? (
          <>
            <button
              onClick={() => {
                triggerClick();
                tutorialInfo.onExit();
              }}
              className="btn btn-ghost btn-sm gap-2 text-base-content/70 hover:text-base-content"
            >
              <ArrowLeft className="w-4 h-4" />
              Exit Tutorial
            </button>
            
            <div className="divider divider-horizontal"></div>
            
            <div className="flex items-center gap-3">
              {getScriptIcon(tutorialInfo.scriptName.toLowerCase().replace(/\s+/g, '_'))}
              <div>
                <h1 className="text-lg font-bold text-base-content">
                  {tutorialInfo.scriptName}
                </h1>
                <p className="text-sm text-base-content/70">
                  Playing as: {tutorialInfo.role === 'attacker' ? 'Red Team (Attacker)' : 'Blue Team (Defender)'}
                </p>
              </div>
            </div>
          </>
        ) : (
          <h1 className={`
            text-xl font-bold font-mono uppercase tracking-wide
            ${isAttacker 
              ? 'text-red-300 bg-clip-text text-transparent bg-gradient-to-r from-red-300 to-red-500' 
              : 'text-blue-300 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-blue-500'
            }
          `}>
            DARKNET_DUEL
          </h1>
        )}
      </div>

      {/* Right side - Controls and tutorial progress */}
      <div className="flex items-center gap-2">
        {tutorialInfo && (
          <>
            <div className="badge badge-info">
              Step {tutorialInfo.stepIndex + 1} of {tutorialInfo.totalSteps}
            </div>
            <div className="badge badge-success">
              {Math.round(((tutorialInfo.stepIndex + 1) / tutorialInfo.totalSteps) * 100)}%
            </div>
            <div className="divider divider-horizontal"></div>
          </>
        )}
        
        <button 
          className={`
            btn btn-sm font-mono font-bold uppercase transition-all duration-200
            ${isAttacker 
              ? 'bg-red-800/80 border-red-600/50 text-red-100 hover:bg-red-700/90 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/30' 
              : 'bg-blue-800/80 border-blue-600/50 text-blue-100 hover:bg-blue-700/90 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/30'
            }
          `}
          onClick={() => {
            triggerClick(); // Play click sound on button press
            isInReactionMode ? handleSkipReaction() : handleEndTurn();
          }}
          disabled={!isActive || isProcessingMove}
        >
          {isInReactionMode ? (
            isTimerActive ? `PASS (${timeRemaining}s)` : 'PASS'
          ) : 'END_TURN'}
        </button>
        
        <button
          className={`
            btn btn-sm font-mono font-bold uppercase transition-all duration-200
            ${isAttacker
              ? 'bg-red-900/80 border-red-700/50 text-red-200 hover:bg-red-800/90 hover:border-red-600 hover:shadow-lg hover:shadow-red-600/30'
              : 'bg-blue-900/80 border-blue-700/50 text-blue-200 hover:bg-blue-800/90 hover:border-blue-600 hover:shadow-lg hover:shadow-blue-600/30'
            }
          `}
          onClick={() => {
            triggerClick(); // Play click sound on button press
            surrender();
          }}
          disabled={!isActive || isProcessingMove}
          title={!isActive ? "Surrender is only available during your turn" : "Surrender the game"}
        >
          SURRENDER
        </button>
        
        <button
          onClick={() => {
            triggerClick(); // Play click sound on button press
            toggleTheme();
          }}
          className={`btn btn-sm font-mono font-bold uppercase transition-all duration-200 bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk`}
          aria-label="Toggle Theme"
          style={{ marginLeft: '0.5rem' }}
        >
          {theme === 'cyberpunk' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
};

export default GameControlsBar;