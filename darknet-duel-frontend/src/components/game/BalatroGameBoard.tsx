import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { BoardProps } from 'boardgame.io/react';
import isEqual from 'lodash/isEqual';

// Import local types
import type { GameState } from '../../types/game.types';

// Import custom hooks for memoization
import { useMemoizedValue, useMemoizedKeys } from '../../hooks/useMemoizedValue';

// Import custom hooks
import { useCardActions } from '../../hooks/useCardActions';
import { useTurnActions } from '../../hooks/useTurnActions';
import { useGameState } from '../../hooks/useGameState';
import { useGameStateBuffer } from '../../hooks/useGameStateBuffer';
import { useCardAttackAnimation } from '../../hooks/useCardAttackAnimation';
import { useRecentCardTracker } from '../../hooks/useRecentCardTracker';
import { useHeartbeat } from '../../hooks/useHeartbeat';
import { useDisconnectionHandler } from '../../hooks/useDisconnectionHandler';

// Import toast notifications
import { useToastStore } from '../../store/toast.store';

// Import overlay components
import ChainEffectUI from './board-components/ChainEffectUI';
import WildcardChoiceUI from './board-components/WildcardChoiceUI';
import HandDisruptionUI from './board-components/HandDisruptionUI';
import CardSelectionUI from './board-components/CardSelectionUI';
import WinnerLobby from './board-components/WinnerLobby';
import DisconnectionAlert from './DisconnectionAlert';
import InactivityWarning from './InactivityWarning';

// Import remaining components
import DevCheatPanel from './board-components/DevCheatPanel';
import GlobalEffectsIndicator from './board-components/GlobalEffectsIndicator';
import LobbyChat from '../lobby/LobbyChat';
import GameControlsBar from './board-components/GameControlsBar';
import OpponentHandArea from './board-components/OpponentHandArea';
import GameStatusOverlays from './board-components/GameStatusOverlays';
import PlayerHandArea from './board-components/PlayerHandArea';
import InfrastructureGrid from './board-components/InfrastructureGrid';
import GameInfoPanels from './board-components/GameInfoPanels';
import GameBackgroundElements from './board-components/GameBackgroundElements';
import CardAttackAnimation from './animations/CardAttackAnimation';
import RecentCardDisplay from './board-components/RecentCardDisplay';
import SharedEffectsDisplay from './board-components/SharedEffectsDisplay';

// Import audio SFX triggers
import { useAudioManager } from '../../hooks/useAudioManager';
import { useTheme } from '../../store/theme.store';

// Import auto-reaction timer
import { useAutoReactionTimer } from '../../hooks/useAutoReactionTimer';
import { useAutoTurnTimer } from '../../hooks/useAutoTurnTimer';

// Debug logging helper - controlled by VITE_GAMEBOARD_DEBUG env variable
const GAMEBOARD_DEBUG = import.meta.env.VITE_GAMEBOARD_DEBUG === 'true';
const debugLog = (...args: any[]) => {
  if (GAMEBOARD_DEBUG) {
    console.log(...args);
  }
};
const debugError = (...args: any[]) => {
  if (GAMEBOARD_DEBUG) {
    console.error(...args);
  }
};

// Extended interface for client properties
type ClientMoves = Record<string, ((...args: unknown[]) => unknown) | undefined> & {
  surrender?: () => void;
  sendChatMessage?: (content: string) => void;
  requestRematch?: () => void;
  devCheatAddCard?: (card: any) => void;
}

interface GameClient {
  moves: ClientMoves;
  makeMove: (type: string, args: unknown[]) => void;
}

interface GameBoardProps extends BoardProps<GameState> {
  client?: GameClient;
}

const BalatroGameBoard = (props: GameBoardProps) => {
  const {
    G,
    ctx,
    moves,
    playerID,
    isActive
  } = props;
  
  // Get matchID from URL params
  const { matchID } = useParams<{ matchID: string }>();
  
  // Toast notifications
  const { addToast } = useToastStore();
  
  // Local state to track when choices have been made (for immediate UI feedback)
  const [chainChoiceMade, setChainChoiceMade] = useState(false);
  const [wildcardChoiceMade, setWildcardChoiceMade] = useState(false);
  
  // Use state buffer to prevent re-render flash during actions
  const { 
    gameState: bufferedG, 
    context: bufferedCtx, 
    isTransitioning,
    isProcessingAction 
  } = useGameStateBuffer(G, ctx, playerID);
  
  // Use optimized memoization strategies with buffered state
  const memoizedG = useMemoizedValue(bufferedG);
  const memoizedCtx = useMemoizedKeys(bufferedCtx, ['phase', 'currentPlayer', 'gameover', 'activePlayers']);
  
  // Memoize critical game state properties using buffered state
  useMemoizedKeys(bufferedG, [
    'gamePhase', 'message', 'attackerScore', 'defenderScore',
    'infrastructure', 'attacker', 'defender', 'chat', 'rematchRequested',
    'pendingChainChoice', 'pendingWildcardChoice', 'pendingHandChoice', 'pendingCardChoice',
    'temporaryEffects', 'persistentEffects'
  ]);

  // Use custom hooks for game state and actions
  const {
    currentPlayerObj,
    opponent,
    currentPhase,
    isAttacker
  } = useGameState(memoizedG, memoizedCtx, playerID);
  
  // Connection monitoring hooks
  const heartbeatStatus = useHeartbeat(matchID || '', playerID || '');
  const disconnectionHandler = useDisconnectionHandler(
    heartbeatStatus.connectionStatus,
    heartbeatStatus.opponentStatus,
    isActive || false,
    Date.now(), // lastActivityTime - using current time as placeholder
    heartbeatStatus.hasInitialized,
    {} // config - using defaults
  );
  
  // Inject audio SFX triggers
  const { triggerClick, triggerPositiveClick, triggerNegativeClick } = useAudioManager();
  
  // Create optimized props object for hooks
  const optimizedProps = useMemo(() => ({
    ...props,
    G: memoizedG,
    ctx: memoizedCtx,
    triggerClick,
    triggerPositiveClick,
    triggerNegativeClick
  }), [props, memoizedG, memoizedCtx, triggerClick, triggerPositiveClick, triggerNegativeClick]);
  
  const {
    selectedCard,
    targetMode,
    targetedInfraId,
    // animatingThrow, // Unused variable
    processing: cardProcessing,
    validTargets,
    playCard,
    cycleCard,
    selectCardToThrow,
    handleInfrastructureTarget: originalHandleInfrastructureTarget,
    cancelTargeting
  } = useCardActions(optimizedProps);

  // Attack animation hook
  const {
    animationState,
    startAttackAnimation,
    onAnimationComplete,
    onStateChangeReady
  } = useCardAttackAnimation();

  // Recent card tracker hook
  const { recentCardPlay, dismissRecentCard } = useRecentCardTracker(memoizedG, playerID);

  // Enhanced infrastructure target handler with animation support
  const handleInfrastructureTarget = useCallback((infraId: string, event?: React.MouseEvent) => {
    originalHandleInfrastructureTarget(infraId, event, startAttackAnimation);
  }, [originalHandleInfrastructureTarget, startAttackAnimation]);
  
  // Turn actions hook
  const {
    processing: turnProcessing,
    handleEndTurn,
    handleSkipReaction
  } = useTurnActions(optimizedProps);

  // Check if player is in reaction mode
  const isInReactionMode = !targetMode && ctx.activePlayers && playerID && ctx.activePlayers[playerID] === 'reaction';
  
  // Auto-reaction timer hook
  const {
    isTimerActive,
    timeRemaining,
    isPaused
  } = useAutoReactionTimer({
    isInReactionMode: Boolean(isInReactionMode),
    isActive,
    targetMode,
    onAutoSkip: handleSkipReaction
  });

  // Auto-turn timer hook (120 seconds)
  const {
    isTimerActive: isTurnTimerActive,
    timeRemaining: turnTimeRemaining,
    isPaused: isTurnTimerPaused
  } = useAutoTurnTimer({
    isActive,
    isInReactionMode: Boolean(isInReactionMode),
    targetMode,
    onAutoEndTurn: handleEndTurn
  });

  // Track processing state - exclude animation state to prevent overlay during animations
  const isProcessingMove = cardProcessing || turnProcessing || isProcessingAction;

  // Handle ESC key to cancel targeting
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && targetMode) {
        cancelTargeting();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [targetMode, cancelTargeting]);

  // Monitor game messages for errors and show toast notifications
  useEffect(() => {
    if (G && G.message) {
      // Check for D301 blocking messages or other error messages
      if (G.message.includes('blocked by Advanced Threat Defense') ||
          G.message.includes('Not enough action points') ||
          G.message.includes('Invalid target') ||
          G.message.includes('Validation failed')) {
        
        // Show error toast notification
        addToast({
          type: 'error',
          title: 'Move Blocked',
          message: G.message,
          duration: 4000
        });
      }
    }
  }, [G?.message, addToast]);

  // Play turn start sound effect when it becomes the player's turn
  useEffect(() => {
    if (isActive && !isProcessingMove && !animationState.isActive) {
      // Play positive-click three times with 250ms delay each
      triggerPositiveClick();
      setTimeout(() => triggerPositiveClick(), 250);
      setTimeout(() => triggerPositiveClick(), 500);
    }
  }, [isActive, isProcessingMove, animationState.isActive, triggerPositiveClick]);

  // NOTE: Timeout logic removed per user request - no automatic timeout for card selection

  // Reset local choice flags when server state clears the pending choices
  useEffect(() => {
    if (!memoizedG.pendingChainChoice && chainChoiceMade) {
      setChainChoiceMade(false);
    }
  }, [memoizedG.pendingChainChoice, chainChoiceMade]);
  
  useEffect(() => {
    if (!memoizedG.pendingWildcardChoice && wildcardChoiceMade) {
      setWildcardChoiceMade(false);
    }
  }, [memoizedG.pendingWildcardChoice, wildcardChoiceMade]);

  // ROBUST: Monitor pendingCardChoice state transitions for debugging
  useEffect(() => {
    if (memoizedG.pendingCardChoice) {
      debugLog(`🎯 CARD CHOICE STATE: pendingCardChoice active for player ${memoizedG.pendingCardChoice.playerId}`);
      debugLog(`🎯 CARD CHOICE STATE: Available cards: ${memoizedG.pendingCardChoice.availableCards?.length || 0}`);
      debugLog(`🎯 CARD CHOICE STATE: Choice type: ${memoizedG.pendingCardChoice.choiceType}`);
      debugLog(`🎯 CARD CHOICE STATE: Source card: ${memoizedG.pendingCardChoice.sourceCardId}`);
    } else {
      debugLog(`🎯 CARD CHOICE STATE: No pendingCardChoice active`);
    }
  }, [memoizedG.pendingCardChoice]);

  // Game over state detection and debugging
  const isGameOver = memoizedCtx.gameover || memoizedCtx.phase === 'gameOver' || memoizedG.gamePhase === 'gameOver';
  
  useEffect(() => {
    if (isGameOver) {
      debugLog('🎮 Game Over Detected:', {
        ctxGameover: memoizedCtx.gameover,
        ctxPhase: memoizedCtx.phase,
        gamePhase: memoizedG.gamePhase,
        winner: memoizedG.winner,
        message: memoizedG.message
      });
    }
  }, [isGameOver, memoizedCtx.gameover, memoizedCtx.phase, memoizedG.gamePhase, memoizedG.winner, memoizedG.message]);
  
  // Handle player surrender
  const surrender = useCallback(() => {
    debugLog('CLIENT: Surrender button clicked!');
    debugLog('CLIENT: Player ID:', playerID);
    debugLog('CLIENT: Is attacker:', isAttacker);
    debugLog('CLIENT: Is active:', isActive);
    debugLog('CLIENT: Current phase:', ctx.phase);
    debugLog('CLIENT: Current activePlayers:', ctx.activePlayers);
    
    // Show confirmation dialog - surrender should be allowed even when not active
    const confirmed = window.confirm(`Are you sure you want to surrender? This will end the game and count as a loss.\n\nNote: It's currently ${isActive ? 'your' : "your opponent's"} turn, but you can surrender at any time.`);
    if (!confirmed) {
      debugLog('CLIENT: Surrender cancelled by user');
      return;
    }
    
    debugLog('CLIENT: Surrender confirmed by user!');
    
    debugLog('CLIENT: Executing surrender move');
    debugLog('CLIENT: Available moves:', Object.keys(moves || {}));
    debugLog('CLIENT: Surrender move available:', !!moves?.surrender);
    debugLog('CLIENT: Current phase:', ctx.phase);
    debugLog('CLIENT: Current game phase:', G.gamePhase);
    debugLog('CLIENT: Player ID:', playerID);
    debugLog('CLIENT: Is active:', isActive);
    debugLog('CLIENT: Active players:', ctx.activePlayers);
    
    // First try using the moves.surrender function - use non-memoized moves
    if (moves && typeof moves.surrender === 'function') {
      try {
        debugLog('CLIENT: Using moves.surrender()');
        moves.surrender();
        return; // If this succeeds, we're done
      } catch (error) {
        debugError('CLIENT: Error calling moves.surrender:', error);
        // Continue to try the fallbacks
      }
    } else {
      debugLog('CLIENT: surrender move not available in moves, trying alternatives');
    }
    
    // Try using the client's makeMove function as a fallback
    if (props.client && props.client.moves && typeof props.client.moves.surrender === 'function') {
      try {
        debugLog('CLIENT: Using client.moves.surrender()');
        props.client.moves.surrender();
        return;
      } catch (error) {
        debugError('CLIENT: Error calling client.moves.surrender:', error);
      }
    }
    
    // As a last resort, try manual move
    try {
      if (props.client) {
        debugLog('CLIENT: Using client.makeMove("surrender", [])');
        props.client.makeMove('surrender', []);
      }
    } catch (error) {
      debugError('CLIENT: All surrender attempts failed:', error);
      alert('Unable to surrender. Please try again or refresh the page.');
    }
  }, [moves, props.client]);

  // Chat message helper
  const sendChatMessage = useCallback((content: string) => {
    if (!content.trim()) return;
    
    if (moves && typeof moves.sendChatMessage === 'function') {
      try {
        moves.sendChatMessage(content);
        return;
      } catch (error) {
        debugError('Error calling moves.sendChatMessage:', error);
      }
    }
    
    if (props.client && props.client.moves && typeof props.client.moves.sendChatMessage === 'function') {
      try {
        props.client.moves.sendChatMessage(content);
        return;
      } catch (error) {
        debugError('Error calling client.moves.sendChatMessage:', error);
      }
    }
    
    try {
      if (props.client) {
        props.client.makeMove('sendChatMessage', [content]);
      }
    } catch (error) {
      debugError('All chat message attempts failed:', error);
    }
  }, [moves, props.client]);

  // Rematch request helper
  const requestRematch = useCallback(() => {
    if (moves && typeof moves.requestRematch === 'function') {
      try {
        moves.requestRematch();
      } catch (error) {
        debugError('Error requesting rematch:', error);
      }
    } else if (props.client && props.client.moves && typeof props.client.moves.requestRematch === 'function') {
      props.client.moves.requestRematch();
    }
  }, [moves, props.client]);
  
  // Choice handlers
  const handleChooseChainTarget = useCallback((targetId: string) => {
    if (moves.chooseChainTarget) {
      // Immediately hide the modal for better UX
      setChainChoiceMade(true);
      moves.chooseChainTarget(targetId);
    }
  }, [moves]);
  
  const handleCancelChainEffect = useCallback(() => {
    debugLog('🔗 CHAIN CANCEL: User cancelled chain effect');
    // Cancel by choosing an empty/invalid target that will be handled gracefully
    if (moves.chooseChainTarget) {
      // Immediately hide the modal for better UX
      setChainChoiceMade(true);
      // Pass empty string to signal cancellation
      moves.chooseChainTarget('');
    }
  }, [moves]);
  
  const handleChooseWildcardType = useCallback((type: string) => {
    if (moves.chooseWildcardType) {
      // Immediately hide the modal for better UX
      setWildcardChoiceMade(true);
      moves.chooseWildcardType({ type });
    }
  }, [moves]);
  
  const handleChooseHandDiscard = useCallback((cardIds: string[]) => {
    debugLog('🎯 HAND DISCARD: Attempting to discard cards:', cardIds);
    debugLog('🎯 HAND DISCARD: Available moves:', Object.keys(moves || {}));
    debugLog('🎯 HAND DISCARD: chooseHandDiscard available:', !!moves.chooseHandDiscard);
    
    if (moves.chooseHandDiscard) {
      debugLog('🎯 HAND DISCARD: Calling moves.chooseHandDiscard with:', { cardIds });
      moves.chooseHandDiscard({ cardIds });
    } else {
      debugError('🎯 HAND DISCARD: chooseHandDiscard move not available!');
    }
  }, [moves]);
  
  const handleChooseCardFromDeck = useCallback((cardId: string) => {
    debugLog(`🎯 FRONTEND DEBUG: handleChooseCardFromDeck called with cardId: ${cardId}`);
    debugLog(`🎯 FRONTEND DEBUG: typeof cardId: ${typeof cardId}`);
    debugLog(`🎯 FRONTEND DEBUG: moves.chooseCardFromDeck available: ${!!moves.chooseCardFromDeck}`);
    debugLog(`🎯 FRONTEND DEBUG: Current pendingCardChoice: ${!!memoizedG.pendingCardChoice}`);
    
    // DEFENSIVE: Validate inputs
    if (!cardId || typeof cardId !== 'string') {
      debugError(`🎯 FRONTEND ERROR: Invalid cardId: ${cardId}`);
      addToast({
        type: 'error',
        title: 'Invalid Selection',
        message: 'Please select a valid card',
        duration: 3000
      });
      return;
    }
    
    // DEFENSIVE: Validate game state
    if (!memoizedG.pendingCardChoice) {
      debugError(`🎯 FRONTEND ERROR: No pending card choice available`);
      addToast({
        type: 'error',
        title: 'Selection Unavailable',
        message: 'No card selection is currently available',
        duration: 3000
      });
      return;
    }
    
    // DEFENSIVE: Validate player permission
    if (memoizedG.pendingCardChoice.playerId !== playerID) {
      debugError(`🎯 FRONTEND ERROR: Wrong player for card choice`);
      addToast({
        type: 'error',
        title: 'Access Denied',
        message: 'You cannot make this selection',
        duration: 3000
      });
      return;
    }
    
    if (moves.chooseCardFromDeck) {
      debugLog(`🎯 FRONTEND DEBUG: Calling moves.chooseCardFromDeck with: ${cardId}`);
      try {
        moves.chooseCardFromDeck(cardId);
        debugLog(`🎯 FRONTEND DEBUG: Move call completed successfully`);
        
        // Success feedback
        addToast({
          type: 'success',
          title: 'Card Selected',
          message: 'Your card selection is being processed...',
          duration: 2000
        });
      } catch (error) {
        debugError(`🎯 FRONTEND ERROR: Failed to call chooseCardFromDeck:`, error);
        addToast({
          type: 'error',
          title: 'Selection Failed',
          message: 'Failed to process card selection. Please try again.',
          duration: 4000
        });
      }
    } else {
      debugError(`🎯 FRONTEND ERROR: chooseCardFromDeck move not available!`);
      addToast({
        type: 'error',
        title: 'Move Unavailable',
        message: 'Card selection is not available right now. Please try again.',
        duration: 4000
      });
    }
  }, [moves, memoizedG.pendingCardChoice, playerID, addToast]);

  // Developer cheat handler
  const handleCheatAddCard = useCallback((card: any) => {
    debugLog('🔧 CHEAT: Adding card to hand:', card.name);
    
    if (moves && typeof moves.devCheatAddCard === 'function') {
      try {
        moves.devCheatAddCard(card);
        return;
      } catch (error) {
        debugError('🔧 CHEAT: Error calling moves.devCheatAddCard:', error);
      }
    }
    
    if (props.client && props.client.moves && typeof props.client.moves.devCheatAddCard === 'function') {
      try {
        props.client.moves.devCheatAddCard(card);
        return;
      } catch (error) {
        debugError('🔧 CHEAT: Error calling client.moves.devCheatAddCard:', error);
      }
    }
    
    try {
      if (props.client) {
        props.client.makeMove('devCheatAddCard', [card]);
      }
    } catch (error) {
      debugError('🔧 CHEAT: All devCheatAddCard attempts failed:', error);
    }
  }, [moves, props.client]);

  // Optimized common props with performance utilities
  const optimizedInfrastructureData = useMemo(() => ({
    cards: memoizedG?.infrastructure || [],
    length: memoizedG?.infrastructure?.length || 0,
    states: memoizedG?.infrastructure?.map(infra => ({ id: infra.id, state: infra.state })) || []
  }), [memoizedG?.infrastructure]);

  // Common props to pass to child components - commented out as unused
  // const commonProps = useMemo(() => ({
  //   G: memoizedG,
  //   ctx: memoizedCtx,
  //   playerID,
  //   isActive,
  //   moves,
  //   isAttacker
  // }), [memoizedG, memoizedCtx, playerID, isActive, moves, isAttacker]);

  // Theme support - still needed for main component styling
  const theme = useTheme();

  // Loading state
  if (!memoizedG || !memoizedCtx) {
    return (
      <div className="min-h-screen bg-base-100 text-base-content flex items-center justify-center font-mono">
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-200 border border-primary/20 rounded-lg p-8 text-center">
            <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
            <div className="text-primary font-bold">LOADING_GAME...</div>
          </div>
        </div>
      </div>
    );
  }

  
  if (isGameOver) {
    const winnerLobbyMoves = {
      sendChatMessage: () => {},
      requestRematch: () => {},
      surrender: () => {}
    };
    
    return (
      <>
        <WinnerLobby
          // @ts-expect-error - Missing gameConfig properties in local type
          G={memoizedG}
          playerID={playerID || undefined}
          moves={winnerLobbyMoves}
          isAttacker={isAttacker}
          matchID={matchID}
        />
        <div className="mt-8">
          {/* Connect to the lobby chat for this game/lobby */}
          <LobbyChat lobbyId={matchID} showChannelSwitcher={false} />
        </div>
      </>
    );
  }




  return (
    <div
      className={`min-h-screen w-full flex flex-col relative overflow-hidden font-mono transition-all duration-1000 bg-base-100 text-base-content ${theme}`}
      data-theme={theme}
    >
      {/* Game Background Elements */}
      <GameBackgroundElements isAttacker={isAttacker} />

      {/* Game Status Overlays */}
      <GameStatusOverlays
        targetMode={targetMode}
        selectedCard={selectedCard}
        cancelTargeting={cancelTargeting}
        isInReactionMode={Boolean(isInReactionMode)}
        isTimerActive={isTimerActive}
        timeRemaining={timeRemaining}
        isPaused={isPaused}
        isProcessingMove={isProcessingMove}
        G={memoizedG}
        ctx={memoizedCtx}
        playerID={playerID}
        isActive={isActive}
        moves={moves}
        isAttacker={isAttacker}
      />

      {/* Header - Game Controls Bar */}
      <GameControlsBar
        G={memoizedG}
        ctx={memoizedCtx}
        moves={moves}
        playerID={playerID}
        isActive={isActive}
        isAttacker={isAttacker}
        currentPlayerObj={currentPlayerObj}
        isProcessingMove={isProcessingMove}
        handleEndTurn={handleEndTurn}
        handleSkipReaction={handleSkipReaction}
        isTurnTimerActive={isTurnTimerActive}
        turnTimeRemaining={turnTimeRemaining}
        isTurnTimerPaused={isTurnTimerPaused}
        cycleCard={cycleCard}
        surrender={surrender}
        isInReactionMode={Boolean(isInReactionMode)}
        isTimerActive={isTimerActive}
        timeRemaining={timeRemaining}
      />

      {/* Main game area */}
      <main className="flex-1 flex flex-col gap-4 p-4 w-full">
        {/* Opponent area */}
        <OpponentHandArea
          opponent={opponent}
          isAttacker={isAttacker}
          G={memoizedG}
          ctx={memoizedCtx}
          playerID={playerID}
          isActive={isActive}
          moves={moves}
          opponentStatus={heartbeatStatus.opponentStatus}
        />

        {/* Game content wrapper */}
        <div className="flex gap-4 flex-1 min-h-0 lg:flex-row flex-col">
          <GameInfoPanels
            G={memoizedG}
            ctx={memoizedCtx}
            playerID={playerID}
            isActive={isActive}
            moves={moves}
            isAttacker={isAttacker}
            currentPlayerObj={currentPlayerObj}
            opponent={opponent}
            currentPhase={currentPhase}
            optimizedInfrastructureData={optimizedInfrastructureData}
            sendChatMessage={sendChatMessage}
          />

                 {/* Center column - Infrastructure */}
                 <div className="flex-1 flex flex-col lg:order-2 order-1">
                   <div className={`
                     border-2 rounded-xl p-6 relative flex-1 lg:min-h-80 min-h-60 flex flex-col items-center justify-center backdrop-blur-sm shadow-lg
                     ${theme === 'cyberpunk'
                       ? isAttacker
                         ? 'bg-red-50/80 border-red-600/60'
                         : 'bg-blue-50/80 border-blue-600/60'
                       : isAttacker
                         ? 'bg-red-950/30 border-red-500/30'
                         : 'bg-blue-950/30 border-blue-500/30'
                     }
                   `}>
                     {/* Network grid label */}
                     <div className={`
                       absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 border-2 rounded-full text-xs font-bold font-mono uppercase tracking-wider
                       ${theme === 'cyberpunk'
                         ? isAttacker
                           ? 'bg-red-50 text-red-700 border-red-600/60 shadow-sm'
                           : 'bg-blue-50 text-blue-700 border-blue-600/60 shadow-sm'
                         : isAttacker
                           ? 'bg-red-950/90 text-red-300 border-red-500/30'
                           : 'bg-blue-950/90 text-blue-300 border-blue-500/30'
                       }
                     `}>
                       NETWORK_GRID
                     </div>
                     
                     {/* Corner bracket */}
                     <div className={`absolute top-0 right-0 w-3 h-3 border-t border-r ${
                       theme === 'cyberpunk'
                         ? isAttacker ? 'border-red-600/60' : 'border-blue-600/60'
                         : isAttacker ? 'border-red-500' : 'border-blue-500'
                     }`}></div>
              
              <InfrastructureGrid
                G={memoizedG}
                playerID={playerID}
                targetMode={targetMode}
                validTargets={validTargets}
                targetedInfraId={targetedInfraId}
                isAttacker={isAttacker}
                onInfrastructureTarget={handleInfrastructureTarget}
              />
            </div>
          </div>
        </div>

        {/* Player area */}
        <PlayerHandArea
          G={memoizedG}
          ctx={memoizedCtx}
          playerID={playerID}
          isActive={isActive}
          moves={moves}
          isAttacker={isAttacker}
          currentPlayerObj={currentPlayerObj}
          selectedCard={selectedCard}
          targetMode={targetMode}
          isTransitioning={isTransitioning}
          playCard={playCard}
          cycleCard={cycleCard}
          selectCardToThrow={selectCardToThrow}
          cancelTargeting={cancelTargeting}
          connectionStatus={heartbeatStatus.connectionStatus}
        />
      </main>

      {/* Overlay UIs for game choices */}
      {memoizedG.pendingWildcardChoice && playerID === memoizedG.pendingWildcardChoice.playerId && !wildcardChoiceMade && (
        <WildcardChoiceUI
          pendingChoice={memoizedG.pendingWildcardChoice}
          playerId={playerID || ''}
          onChooseType={handleChooseWildcardType}
        />
      )}
      
      {memoizedG.pendingChainChoice && playerID === memoizedG.pendingChainChoice.playerId && !chainChoiceMade && (
        <ChainEffectUI
          pendingChainChoice={memoizedG.pendingChainChoice}
          infrastructureCards={optimizedInfrastructureData.cards}
          onChooseTarget={handleChooseChainTarget}
          onCancel={handleCancelChainEffect}
        />
      )}
      
      {(() => {
        // Debug pendingHandChoice state - updated logic to match PendingChoicesOverlay
        const isHoneypotTax = memoizedG.pendingHandChoice?.pendingCardPlay !== undefined;
        const shouldShow = memoizedG.pendingHandChoice && (
          isHoneypotTax
            ? (playerID === memoizedG.pendingHandChoice.targetPlayerId) // Honeypot tax: attacker chooses their own cards
            : (playerID !== memoizedG.pendingHandChoice.targetPlayerId) // Threat Intelligence: opponent chooses target's cards
        );
        
        debugLog('🎯 HAND CHOICE DEBUG:', {
          hasPendingHandChoice: !!memoizedG.pendingHandChoice,
          playerID,
          targetPlayerId: memoizedG.pendingHandChoice?.targetPlayerId,
          isHoneypotTax,
          shouldShow,
          pendingChoice: memoizedG.pendingHandChoice
        });
        
        return shouldShow && memoizedG.pendingHandChoice && (
          <HandDisruptionUI
            pendingChoice={memoizedG.pendingHandChoice}
            playerId={playerID || ''}
            onChooseCards={handleChooseHandDiscard}
          />
        );
      })()}
      
      {memoizedG.pendingCardChoice && playerID === memoizedG.pendingCardChoice.playerId && (
        <CardSelectionUI
          pendingChoice={memoizedG.pendingCardChoice}
          onChooseCard={handleChooseCardFromDeck}
        />
      )}

      {/* Global Effects Indicator */}
      <GlobalEffectsIndicator gameState={memoizedG} />

      {/* Card Attack Animation */}
      <CardAttackAnimation
        isActive={animationState.isActive}
        attackingCardId={animationState.attackingCardId}
        targetInfraId={animationState.targetInfraId}
        attackingCardElement={animationState.attackingCardElement}
        targetInfraElement={animationState.targetInfraElement}
        onAnimationComplete={onAnimationComplete}
        onStateChangeReady={onStateChangeReady}
      />

      {/* Recent Card Display */}
      {recentCardPlay && (
        <RecentCardDisplay
          recentCard={recentCardPlay.card}
          playerName={recentCardPlay.playerName}
          isOpponent={recentCardPlay.playerId !== playerID}
          onDismiss={dismissRecentCard}
        />
      )}

      {/* Shared Effects Display */}
      <SharedEffectsDisplay
        gameState={memoizedG}
        playerID={playerID}
      />

      {/* Developer Cheat Panel - Only in development */}
      {process.env.NODE_ENV === 'development' && (
        <DevCheatPanel
          G={memoizedG}
          playerID={playerID || ''}
          isAttacker={isAttacker}
          onAddCard={handleCheatAddCard}
        />
      )}

      {/* Disconnection Alert */}
      <DisconnectionAlert
        disconnectionState={disconnectionHandler.disconnectionState}
        onForfeit={() => {
          debugLog('Player forfeited due to disconnection');
          disconnectionHandler.stopCountdown();
          // TODO: Implement actual forfeit logic
        }}
      />

      {/* Inactivity Warning */}
      <InactivityWarning
        timeUntilForfeit={disconnectionHandler.timeUntilInactivityForfeit}
        isActive={isActive || false}
        isVisible={disconnectionHandler.timeUntilInactivityForfeit > 0 && disconnectionHandler.timeUntilInactivityForfeit <= 180000} // Show warning in last 3 minutes
      />
    </div>
  );
};

// Memoized version with optimized comparison
const MemoBalatroGameBoard = React.memo(BalatroGameBoard, (prevProps, nextProps) => {
  // Safety check
  if (!prevProps.G || !nextProps.G || !prevProps.ctx || !nextProps.ctx) {
    debugLog('CLIENT: Re-rendering due to missing props');
    return false;
  }
  
  // Quick primitive checks
  if (prevProps.isActive !== nextProps.isActive ||
      prevProps.playerID !== nextProps.playerID) {
    debugLog('CLIENT: Re-rendering due to player/active state change');
    return false;
  }
  
  // Context changes
  if (prevProps.ctx.phase !== nextProps.ctx.phase ||
      prevProps.ctx.currentPlayer !== nextProps.ctx.currentPlayer ||
      prevProps.ctx.gameover !== nextProps.ctx.gameover) {
    debugLog('CLIENT: Re-rendering due to context change');
    return false;
  }
  
  // CRITICAL: Check activePlayers for reaction mode detection
  if (!isEqual(prevProps.ctx.activePlayers, nextProps.ctx.activePlayers)) {
    debugLog('CLIENT: Re-rendering due to activePlayers change (reaction mode)');
    return false;
  }
  
  // Game state primitive checks
  if (prevProps.G.gamePhase !== nextProps.G.gamePhase ||
      prevProps.G.message !== nextProps.G.message ||
      prevProps.G.attackerScore !== nextProps.G.attackerScore ||
      prevProps.G.defenderScore !== nextProps.G.defenderScore) {
    debugLog('CLIENT: Re-rendering due to game state change');
    return false;
  }
  
  // Chat messages - only check length and last message for performance
  const prevMessages = prevProps.G?.chat?.messages || [];
  const nextMessages = nextProps.G?.chat?.messages || [];
  if (prevMessages.length !== nextMessages.length ||
      (prevMessages.length > 0 && nextMessages.length > 0 &&
       !isEqual(prevMessages[prevMessages.length - 1], nextMessages[nextMessages.length - 1]))) {
    debugLog('CLIENT: Re-rendering due to chat message changes');
    return false;
  }
  
  // Player objects - check IDs and hand lengths only
  if (prevProps.G?.attacker?.id !== nextProps.G?.attacker?.id ||
      prevProps.G?.defender?.id !== nextProps.G?.defender?.id ||
      prevProps.G?.attacker?.hand?.length !== nextProps.G?.attacker?.hand?.length ||
      prevProps.G?.defender?.hand?.length !== nextProps.G?.defender?.hand?.length) {
    debugLog('CLIENT: Re-rendering due to player changes');
    return false;
  }
  
  // Infrastructure - check length and states only
  const prevInfra = prevProps.G?.infrastructure || [];
  const nextInfra = nextProps.G?.infrastructure || [];
  if (prevInfra.length !== nextInfra.length) {
    debugLog('CLIENT: Re-rendering due to infrastructure count change');
    return false;
  }
  
  // Check infrastructure states
  for (let i = 0; i < prevInfra.length; i++) {
    if (prevInfra[i]?.state !== nextInfra[i]?.state ||
        prevInfra[i]?.id !== nextInfra[i]?.id) {
      debugLog('CLIENT: Re-rendering due to infrastructure state change');
      return false;
    }
  }
  
  // Pending choices - check player IDs only
  if (prevProps.G?.pendingChainChoice?.playerId !== nextProps.G?.pendingChainChoice?.playerId ||
      prevProps.G?.pendingWildcardChoice?.playerId !== nextProps.G?.pendingWildcardChoice?.playerId ||
      prevProps.G?.pendingHandChoice?.targetPlayerId !== nextProps.G?.pendingHandChoice?.targetPlayerId ||
      prevProps.G?.pendingCardChoice?.playerId !== nextProps.G?.pendingCardChoice?.playerId) {
    debugLog('CLIENT: Re-rendering due to pending choice changes');
    return false;
  }
  
  // Rematch requests
  if (prevProps.G?.rematchRequested !== nextProps.G?.rematchRequested) {
    debugLog('CLIENT: Re-rendering due to rematch request changes');
    return false;
  }
  
  // Persistent effects - check arrays for changes
  const prevPersistentEffects = prevProps.G?.persistentEffects || [];
  const nextPersistentEffects = nextProps.G?.persistentEffects || [];
  if (prevPersistentEffects.length !== nextPersistentEffects.length ||
      !isEqual(prevPersistentEffects, nextPersistentEffects)) {
    debugLog('CLIENT: Re-rendering due to persistent effects changes');
    return false;
  }
  
  // Temporary effects - check arrays for changes
  const prevTemporaryEffects = prevProps.G?.temporaryEffects || [];
  const nextTemporaryEffects = nextProps.G?.temporaryEffects || [];
  if (prevTemporaryEffects.length !== nextTemporaryEffects.length ||
      !isEqual(prevTemporaryEffects, nextTemporaryEffects)) {
    debugLog('CLIENT: Re-rendering due to temporary effects changes');
    return false;
  }
  
  // If we reach here, no meaningful changes detected
  return true;
});

export default MemoBalatroGameBoard; 