import React from 'react';
import { ArrowLeft, Shield, Sword, GraduationCap, Brain, Moon, Sun, LogOut, FastForward, Clock } from 'lucide-react';

// Import types
import type { GameState } from '../../../types/game.types';
import type { BoardProps } from 'boardgame.io/react';

// Import hooks
import { useTheme, useToggleTheme } from '../../../store/theme.store';
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
  
  // Turn timer state from useAutoTurnTimer
  isTurnTimerActive?: boolean;
  turnTimeRemaining?: number;
  isTurnTimerPaused?: boolean;
  
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
  isTurnTimerActive,
  turnTimeRemaining,
  isTurnTimerPaused,
  tutorialInfo
}) => {
  // Theme support
  const theme = useTheme();
  const toggleTheme = useToggleTheme();
  
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
      flex justify-between items-center px-6 py-3 border-b backdrop-blur-md z-10 relative
      ${theme === 'cyberpunk'
        ? isAttacker
          ? 'bg-gradient-to-r from-red-100/95 via-red-50/85 to-red-100/95 border-red-600/50'
          : 'bg-gradient-to-r from-blue-100/95 via-blue-50/85 to-blue-100/95 border-blue-600/50'
        : isAttacker 
          ? 'bg-gradient-to-r from-red-950/90 via-red-900/80 to-red-950/90 border-red-500/30' 
          : 'bg-gradient-to-r from-blue-950/90 via-blue-900/80 to-blue-950/90 border-blue-500/30'
      }
    `}>
      {/* Cyberpunk corner accents */}
      <div className={`absolute top-0 left-0 w-16 h-0.5 ${
        theme === 'cyberpunk'
          ? isAttacker ? 'bg-red-600/70' : 'bg-blue-600/70'
          : isAttacker ? 'bg-red-500/50' : 'bg-blue-500/50'
      }`} />
      <div className={`absolute top-0 right-0 w-16 h-0.5 ${
        theme === 'cyberpunk'
          ? isAttacker ? 'bg-red-600/70' : 'bg-blue-600/70'
          : isAttacker ? 'bg-red-500/50' : 'bg-blue-500/50'
      }`} />
      
      {/* Left side - Game title or tutorial info */}
      <div className="flex items-center gap-4">
        {tutorialInfo ? (
          <>
            <button
              onClick={() => {
                triggerClick();
                tutorialInfo.onExit();
              }}
              className="btn btn-ghost btn-sm gap-2 text-base-content/70 hover:text-base-content transition-all hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Exit Tutorial</span>
            </button>
            
            <div className="w-px h-8 bg-base-content/20" />
            
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isAttacker ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                {getScriptIcon(tutorialInfo.scriptName.toLowerCase().replace(/\s+/g, '_'))}
              </div>
              <div>
                <h1 className="text-base font-bold text-base-content font-mono">
                  {tutorialInfo.scriptName}
                </h1>
                <p className="text-xs text-base-content/60 flex items-center gap-1.5">
                  {tutorialInfo.role === 'attacker' ? <Sword className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                  {tutorialInfo.role === 'attacker' ? 'Red Team' : 'Blue Team'}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className={`
              w-10 h-10 rounded-lg flex items-center justify-center
              ${isAttacker 
                ? 'bg-gradient-to-br from-red-500/30 to-red-600/20 border border-red-500/30' 
                : 'bg-gradient-to-br from-blue-500/30 to-blue-600/20 border border-blue-500/30'
              }
            `}>
              {isAttacker ? <Sword className="w-5 h-5 text-red-300" /> : <Shield className="w-5 h-5 text-blue-300" />}
            </div>
            <h1 className={`
              text-xl font-bold font-mono uppercase tracking-widest
              bg-clip-text text-transparent bg-gradient-to-r
              ${isAttacker 
                ? 'from-red-300 via-red-400 to-red-500' 
                : 'from-blue-300 via-blue-400 to-blue-500'
              }
            `}>
              DARKNET<span className="text-base-content/40 mx-1">//</span>DUEL
            </h1>
          </div>
        )}
      </div>

      {/* Right side - Controls and tutorial progress */}
      <div className="flex items-center gap-2">
        {tutorialInfo && (
          <>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-base-200/50 border border-base-content/10">
              <GraduationCap className="w-4 h-4 text-info" />
              <span className="text-xs font-mono font-bold">
                {tutorialInfo.stepIndex + 1}/{tutorialInfo.totalSteps}
              </span>
              <span className="text-xs text-base-content/50">
                ({Math.round(((tutorialInfo.stepIndex + 1) / tutorialInfo.totalSteps) * 100)}%)
              </span>
            </div>
            <div className="w-px h-8 bg-base-content/20" />
          </>
        )}
        
        {/* Turn Timer Display - Only show when active turn (not in reaction mode) */}
        {isTurnTimerActive && !isInReactionMode && turnTimeRemaining !== undefined && (
          <>
            <div className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold
              ${theme === 'cyberpunk'
                ? turnTimeRemaining <= 30
                  ? 'bg-error/30 border-error/60 text-error-content'
                  : 'bg-warning/30 border-warning/60 text-warning-content'
                : turnTimeRemaining <= 30
                  ? 'bg-error/20 border-error/50 text-error'
                  : 'bg-warning/20 border-warning/50 text-warning'
              }
            `}>
              <Clock className="w-4 h-4" />
              <span>
                {isTurnTimerPaused ? 'PAUSED' : `${Math.floor(turnTimeRemaining / 60)}:${(turnTimeRemaining % 60).toString().padStart(2, '0')}`}
              </span>
            </div>
            <div className="w-px h-8 bg-base-content/20" />
          </>
        )}
        
        <button 
          className={`
            btn btn-sm gap-2 font-mono font-bold uppercase transition-all duration-200
            ${theme === 'cyberpunk'
              ? isInReactionMode 
                ? 'bg-accent/30 border-accent/70 text-accent-content hover:bg-accent/40 hover:border-accent shadow-md' 
                : isAttacker 
                  ? 'bg-red-200/60 border-red-600/60 text-red-900 hover:bg-red-300/70 hover:border-red-700 shadow-md' 
                  : 'bg-blue-200/60 border-blue-600/60 text-blue-900 hover:bg-blue-300/70 hover:border-blue-700 shadow-md'
              : isInReactionMode 
                ? 'bg-accent/20 border-accent/50 text-accent hover:bg-accent/30 hover:border-accent' 
                : isAttacker 
                  ? 'bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30 hover:border-red-500' 
                  : 'bg-blue-500/20 border-blue-500/50 text-blue-300 hover:bg-blue-500/30 hover:border-blue-500'
            }
            ${(!isActive || isProcessingMove) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
          `}
          onClick={() => {
            triggerClick();
            isInReactionMode ? handleSkipReaction() : handleEndTurn();
          }}
          disabled={!isActive || isProcessingMove}
        >
          <FastForward className="w-4 h-4" />
          <span className="hidden sm:inline">
            {isInReactionMode ? (isTimerActive ? `PASS (${timeRemaining}s)` : 'PASS') : 'END TURN'}
          </span>
          <span className="sm:hidden">
            {isInReactionMode ? (isTimerActive ? `${timeRemaining}s` : 'PASS') : 'END'}
          </span>
        </button>
        
        <button
          className={`
            btn btn-sm gap-2 font-mono font-bold uppercase transition-all duration-200
            ${theme === 'cyberpunk'
              ? 'bg-error/30 border-error/70 text-error-content hover:bg-error/40 hover:border-error shadow-md'
              : 'bg-error/20 border-error/50 text-error hover:bg-error/30 hover:border-error'
            }
            ${(!isActive || isProcessingMove) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
          `}
          onClick={() => {
            triggerClick();
            surrender();
          }}
          disabled={!isActive || isProcessingMove}
          title={!isActive ? "Surrender is only available during your turn" : "Surrender the game"}
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">FORFEIT</span>
        </button>
        
        <div className="w-px h-8 bg-base-content/20" />
        
        <button
          onClick={() => {
            triggerClick();
            toggleTheme();
          }}
          className="btn btn-sm btn-ghost gap-2 text-primary hover:text-primary hover:bg-primary/10 transition-all hover:scale-105"
          aria-label="Toggle Theme"
        >
          {theme === 'cyberpunk' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};

export default GameControlsBar;