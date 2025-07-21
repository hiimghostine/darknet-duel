import React, { useCallback } from 'react';

// Import types
import type { GameState } from '../../../types/game.types';
import type { BoardProps } from 'boardgame.io/react';

// Import hooks
import { useThemeStore } from '../../../store/theme.store';
import { useAutoReactionTimer } from '../../../hooks/useAutoReactionTimer';
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
  cycleCard: (cardId: string) => void;
  surrender: () => void;
  
  // Timer state from useAutoReactionTimer
  isInReactionMode: boolean;
  isTimerActive: boolean;
  timeRemaining: number;
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
  timeRemaining
}) => {
  // Theme support
  const { theme, toggleTheme } = useThemeStore();
  
  // Audio manager for sound effects
  const { triggerClick } = useAudioManager();

  return (
    <header className={`
      flex justify-between items-center p-4 border-b backdrop-blur-sm z-10
      ${isAttacker 
        ? 'bg-red-900/80 border-red-700/30' 
        : 'bg-blue-900/80 border-blue-700/30'
      }
    `}>
      <h1 className={`
        text-xl font-bold font-mono uppercase tracking-wide
        ${isAttacker 
          ? 'text-red-300 bg-clip-text text-transparent bg-gradient-to-r from-red-300 to-red-500' 
          : 'text-blue-300 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-blue-500'
        }
      `}>
        DARKNET_DUEL
      </h1>
      <div className="flex gap-2">
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
        
        {/* Cycle Card Button - only show in action mode when player has cards */}
        {isActive && !isProcessingMove && currentPlayerObj?.hand?.length > 0 && 
         ctx.activePlayers && playerID && ctx.activePlayers[playerID] === 'action' && (
          <button 
            className={`
              btn btn-sm font-mono font-bold uppercase transition-all duration-200
              ${isAttacker 
                ? 'bg-orange-800/80 border-orange-600/50 text-orange-100 hover:bg-orange-700/90 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/30' 
                : 'bg-cyan-800/80 border-cyan-600/50 text-cyan-100 hover:bg-cyan-700/90 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/30'
              }
            `}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              triggerClick(); // Play click sound on button press
              cycleCard(currentPlayerObj.hand[0].id);
            }}
            title="Cycle out your current hand for a new card"
          >
            CYCLE_CARD
          </button>
        )}
        
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
        {/* Theme Switcher Button - right of Surrender */}
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