import React, { useCallback, useMemo, useEffect } from 'react';
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

// Import toast notifications
import { useToastStore } from '../../store/toast.store';

// Import overlay components
import ChainEffectUI from './board-components/ChainEffectUI';
import WildcardChoiceUI from './board-components/WildcardChoiceUI';
import HandDisruptionUI from './board-components/HandDisruptionUI';
import CardSelectionUI from './board-components/CardSelectionUI';
import WinnerLobby from './board-components/WinnerLobby';

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

// Import audio SFX triggers
import { useAudioManager } from '../../hooks/useAudioManager';
import { useThemeStore } from '../../store/theme.store';

// Import auto-reaction timer
import { useAutoReactionTimer } from '../../hooks/useAutoReactionTimer';

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
  
  // Use optimized memoization strategies
  const memoizedG = useMemoizedValue(G);
  const memoizedCtx = useMemoizedKeys(ctx, ['phase', 'currentPlayer', 'gameover', 'activePlayers']);
  
  // Memoize critical game state properties
  useMemoizedKeys(G, [
    'gamePhase', 'message', 'attackerScore', 'defenderScore',
    'infrastructure', 'attacker', 'defender', 'chat', 'rematchRequested',
    'pendingChainChoice', 'pendingWildcardChoice', 'pendingHandChoice', 'pendingCardChoice',
    'temporaryEffects', 'persistentEffects'
  ]);

  // Use custom hooks for game state and actions
  const {
    currentPlayerObj,
    opponent,
    opponentDisconnected,
    currentPhase,
    isAttacker
  } = useGameState(memoizedG, memoizedCtx, playerID);
  
  
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
    animatingThrow,
    processing: cardProcessing,
    validTargets,
    playCard,
    cycleCard,
    selectCardToThrow,
    handleInfrastructureTarget,
    cancelTargeting
  } = useCardActions(optimizedProps);
  
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
  
  // Track processing state
  const isProcessingMove = cardProcessing || turnProcessing;

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
    if (isActive && !isProcessingMove) {
      // Play positive-click three times with 250ms delay each
      triggerPositiveClick();
      setTimeout(() => triggerPositiveClick(), 250);
      setTimeout(() => triggerPositiveClick(), 500);
    }
  }, [isActive, isProcessingMove, triggerPositiveClick]);
  
  // Handle player surrender
  const surrender = useCallback(() => {
    console.log('CLIENT: Surrender button clicked!');
    console.log('CLIENT: Player ID:', playerID);
    console.log('CLIENT: Is attacker:', isAttacker);
    console.log('CLIENT: Is active:', isActive);
    console.log('CLIENT: Current phase:', ctx.phase);
    console.log('CLIENT: Current activePlayers:', ctx.activePlayers);
    
    // Show confirmation dialog - surrender should be allowed even when not active
    const confirmed = window.confirm(`Are you sure you want to surrender? This will end the game and count as a loss.\n\nNote: It's currently ${isActive ? 'your' : "your opponent's"} turn, but you can surrender at any time.`);
    if (!confirmed) {
      console.log('CLIENT: Surrender cancelled by user');
      return;
    }
    
    console.log('CLIENT: Surrender confirmed by user!');
    
    console.log('CLIENT: Executing surrender move');
    console.log('CLIENT: Available moves:', Object.keys(moves || {}));
    console.log('CLIENT: Surrender move available:', !!moves?.surrender);
    console.log('CLIENT: Current phase:', ctx.phase);
    console.log('CLIENT: Current game phase:', G.gamePhase);
    console.log('CLIENT: Player ID:', playerID);
    console.log('CLIENT: Is active:', isActive);
    console.log('CLIENT: Active players:', ctx.activePlayers);
    
    // First try using the moves.surrender function - use non-memoized moves
    if (moves && typeof moves.surrender === 'function') {
      try {
        console.log('CLIENT: Using moves.surrender()');
        moves.surrender();
        return; // If this succeeds, we're done
      } catch (error) {
        console.error('CLIENT: Error calling moves.surrender:', error);
        // Continue to try the fallbacks
      }
    } else {
      console.log('CLIENT: surrender move not available in moves, trying alternatives');
    }
    
    // Try using the client's makeMove function as a fallback
    if (props.client && props.client.moves && typeof props.client.moves.surrender === 'function') {
      try {
        console.log('CLIENT: Using client.moves.surrender()');
        props.client.moves.surrender();
        return;
      } catch (error) {
        console.error('CLIENT: Error calling client.moves.surrender:', error);
      }
    }
    
    // As a last resort, try manual move
    try {
      if (props.client) {
        console.log('CLIENT: Using client.makeMove("surrender", [])');
        props.client.makeMove('surrender', []);
      }
    } catch (error) {
      console.error('CLIENT: All surrender attempts failed:', error);
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
        console.error('Error calling moves.sendChatMessage:', error);
      }
    }
    
    if (props.client && props.client.moves && typeof props.client.moves.sendChatMessage === 'function') {
      try {
        props.client.moves.sendChatMessage(content);
        return;
      } catch (error) {
        console.error('Error calling client.moves.sendChatMessage:', error);
      }
    }
    
    try {
      if (props.client) {
        props.client.makeMove('sendChatMessage', [content]);
      }
    } catch (error) {
      console.error('All chat message attempts failed:', error);
    }
  }, [moves, props.client]);

  // Rematch request helper
  const requestRematch = useCallback(() => {
    if (moves && typeof moves.requestRematch === 'function') {
      try {
        moves.requestRematch();
      } catch (error) {
        console.error('Error requesting rematch:', error);
      }
    } else if (props.client && props.client.moves && typeof props.client.moves.requestRematch === 'function') {
      props.client.moves.requestRematch();
    }
  }, [moves, props.client]);
  
  // Choice handlers
  const handleChooseChainTarget = useCallback((targetId: string) => {
    if (moves.chooseChainTarget) {
      moves.chooseChainTarget(targetId);
    }
  }, [moves]);
  
  const handleChooseWildcardType = useCallback((type: string) => {
    if (moves.chooseWildcardType) {
      moves.chooseWildcardType({ type });
    }
  }, [moves]);
  
  const handleChooseHandDiscard = useCallback((cardIds: string[]) => {
    console.log('🎯 HAND DISCARD: Attempting to discard cards:', cardIds);
    console.log('🎯 HAND DISCARD: Available moves:', Object.keys(moves || {}));
    console.log('🎯 HAND DISCARD: chooseHandDiscard available:', !!moves.chooseHandDiscard);
    
    if (moves.chooseHandDiscard) {
      console.log('🎯 HAND DISCARD: Calling moves.chooseHandDiscard with:', { cardIds });
      moves.chooseHandDiscard({ cardIds });
    } else {
      console.error('🎯 HAND DISCARD: chooseHandDiscard move not available!');
    }
  }, [moves]);
  
  const handleChooseCardFromDeck = useCallback((cardId: string) => {
    if (moves.chooseCardFromDeck) {
      moves.chooseCardFromDeck(cardId);
    }
  }, [moves]);

  // Developer cheat handler
  const handleCheatAddCard = useCallback((card: any) => {
    console.log('🔧 CHEAT: Adding card to hand:', card.name);
    
    if (moves && typeof moves.devCheatAddCard === 'function') {
      try {
        moves.devCheatAddCard(card);
        return;
      } catch (error) {
        console.error('🔧 CHEAT: Error calling moves.devCheatAddCard:', error);
      }
    }
    
    if (props.client && props.client.moves && typeof props.client.moves.devCheatAddCard === 'function') {
      try {
        props.client.moves.devCheatAddCard(card);
        return;
      } catch (error) {
        console.error('🔧 CHEAT: Error calling client.moves.devCheatAddCard:', error);
      }
    }
    
    try {
      if (props.client) {
        props.client.makeMove('devCheatAddCard', [card]);
      }
    } catch (error) {
      console.error('🔧 CHEAT: All devCheatAddCard attempts failed:', error);
    }
  }, [moves, props.client]);

  // Optimized common props with performance utilities
  const optimizedInfrastructureData = useMemo(() => ({
    cards: memoizedG?.infrastructure || [],
    length: memoizedG?.infrastructure?.length || 0,
    states: memoizedG?.infrastructure?.map(infra => ({ id: infra.id, state: infra.state })) || []
  }), [memoizedG?.infrastructure]);

  // Common props to pass to child components
  const commonProps = useMemo(() => ({
    G: memoizedG,
    ctx: memoizedCtx,
    playerID,
    isActive,
    moves,
    isAttacker
  }), [memoizedG, memoizedCtx, playerID, isActive, moves, isAttacker]);

  // Theme support - still needed for main component styling
  const { theme } = useThemeStore();

  // Loading state
  if (!G || !ctx) {
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

  // Game over state
  if (ctx.gameover || ctx.phase === 'gameOver' || G.gamePhase === 'gameOver') {
    const winnerLobbyMoves = {
      sendChatMessage,
      requestRematch,
      surrender
    };
    
    return (
      <>
        <WinnerLobby
          // @ts-expect-error - Missing gameConfig properties in local type
          G={G}
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
        cycleCard={cycleCard}
        surrender={surrender}
        isInReactionMode={Boolean(isInReactionMode)}
        isTimerActive={isTimerActive}
        timeRemaining={timeRemaining}
      />

      {/* Enhanced status bar with turn indicator */}
      <div className={`
        px-4 py-3 border-b transition-all duration-500
        ${isActive 
          ? isAttacker
            ? 'bg-gradient-to-r from-red-600/20 via-red-500/10 to-red-600/20 border-red-500/50' 
            : 'bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-blue-600/20 border-blue-500/50'
          : isAttacker
            ? 'bg-red-900/50 border-red-800/30'
            : 'bg-blue-900/50 border-blue-800/30'
        }
      `}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Connection status */}
          <span className={`
            text-xs font-mono flex items-center gap-2 
            ${opponentDisconnected 
              ? 'text-red-400' 
              : isAttacker 
                ? 'text-red-300' 
                : 'text-blue-300'
            }
          `}>
            <div className={`
              w-2 h-2 rounded-full animate-pulse
              ${opponentDisconnected 
                ? 'bg-red-500' 
                : isAttacker 
                  ? 'bg-red-400' 
                  : 'bg-blue-400'
              }
            `}></div>
            {opponentDisconnected ? 'OPPONENT_DISCONNECTED' : 'CONNECTION_ACTIVE'}
          </span>
          
          {/* Turn status in header */}
          {isActive && (
            <div className="flex items-center gap-2">
              <div className={`
                badge gap-2 animate-pulse
                ${isAttacker 
                  ? 'badge-error bg-red-600 text-red-100 border-red-400' 
                  : 'badge-info bg-blue-600 text-blue-100 border-blue-400'
                }
              `}>
                <span className={`
                  w-2 h-2 rounded-full animate-ping
                  ${isAttacker ? 'bg-red-100' : 'bg-blue-100'}
                `}></span>
                YOUR TURN - TAKE ACTION
              </div>
            </div>
          )}
          
          {!isActive && (
            <div className="flex items-center gap-2">
              <div className={`
                badge gap-2
                ${isAttacker 
                  ? 'badge-ghost bg-red-800/50 text-red-300 border-red-700' 
                  : 'badge-ghost bg-blue-800/50 text-blue-300 border-blue-700'
                }
              `}>
                <span className="loading loading-dots loading-xs"></span>
                WAITING FOR OPPONENT
              </div>
            </div>
          )}
        </div>
      </div>



      {/* Main game area */}
      <main className="flex-1 flex flex-col gap-4 p-4 w-full">
        {/* Opponent area */}
        <div className={`${!isActive ? 'ring-2 ring-current/50 shadow-lg shadow-current/20' : ''}`}>
          <OpponentHandArea
            opponent={opponent}
            opponentDisconnected={opponentDisconnected}
            isAttacker={isAttacker}
            G={memoizedG}
            ctx={memoizedCtx}
            playerID={playerID}
            isActive={isActive}
            moves={moves}
          />
        </div>

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
            <div className="bg-base-200 border border-primary/30 rounded-xl p-6 relative flex-1 lg:min-h-80 min-h-60 flex flex-col items-center justify-center backdrop-blur-sm">
              {/* Network grid label */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-base-200 text-primary px-4 py-1 border border-primary/30 rounded-full text-xs font-bold font-mono uppercase tracking-wider">
                NETWORK_GRID
              </div>
              
              {/* Corner bracket */}
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
              
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
          playCard={playCard}
          cycleCard={cycleCard}
          selectCardToThrow={selectCardToThrow}
          cancelTargeting={cancelTargeting}
        />
      </main>

      {/* Overlay UIs for game choices */}
      {memoizedG.pendingWildcardChoice && playerID === memoizedG.pendingWildcardChoice.playerId && (
        <WildcardChoiceUI
          pendingChoice={memoizedG.pendingWildcardChoice}
          playerId={playerID || ''}
          onChooseType={handleChooseWildcardType}
        />
      )}
      
      {memoizedG.pendingChainChoice && playerID === memoizedG.pendingChainChoice.playerId && (
        <ChainEffectUI
          pendingChainChoice={memoizedG.pendingChainChoice}
          infrastructureCards={optimizedInfrastructureData.cards}
          onChooseTarget={handleChooseChainTarget}
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
        
        console.log('🎯 HAND CHOICE DEBUG:', {
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

      {/* Developer Cheat Panel - Only in development */}
      {process.env.NODE_ENV === 'development' && (
        <DevCheatPanel
          G={memoizedG}
          playerID={playerID || ''}
          isAttacker={isAttacker}
          onAddCard={handleCheatAddCard}
        />
      )}
    </div>
  );
};

// Memoized version with optimized comparison
const MemoBalatroGameBoard = React.memo(BalatroGameBoard, (prevProps, nextProps) => {
  // Safety check
  if (!prevProps.G || !nextProps.G || !prevProps.ctx || !nextProps.ctx) {
    console.log('CLIENT: Re-rendering due to missing props');
    return false;
  }
  
  // Quick primitive checks
  if (prevProps.isActive !== nextProps.isActive ||
      prevProps.playerID !== nextProps.playerID) {
    console.log('CLIENT: Re-rendering due to player/active state change');
    return false;
  }
  
  // Context changes
  if (prevProps.ctx.phase !== nextProps.ctx.phase ||
      prevProps.ctx.currentPlayer !== nextProps.ctx.currentPlayer ||
      prevProps.ctx.gameover !== nextProps.ctx.gameover) {
    console.log('CLIENT: Re-rendering due to context change');
    return false;
  }
  
  // CRITICAL: Check activePlayers for reaction mode detection
  if (!isEqual(prevProps.ctx.activePlayers, nextProps.ctx.activePlayers)) {
    console.log('CLIENT: Re-rendering due to activePlayers change (reaction mode)');
    return false;
  }
  
  // Game state primitive checks
  if (prevProps.G.gamePhase !== nextProps.G.gamePhase ||
      prevProps.G.message !== nextProps.G.message ||
      prevProps.G.attackerScore !== nextProps.G.attackerScore ||
      prevProps.G.defenderScore !== nextProps.G.defenderScore) {
    console.log('CLIENT: Re-rendering due to game state change');
    return false;
  }
  
  // Chat messages - only check length and last message for performance
  const prevMessages = prevProps.G?.chat?.messages || [];
  const nextMessages = nextProps.G?.chat?.messages || [];
  if (prevMessages.length !== nextMessages.length ||
      (prevMessages.length > 0 && nextMessages.length > 0 &&
       !isEqual(prevMessages[prevMessages.length - 1], nextMessages[nextMessages.length - 1]))) {
    console.log('CLIENT: Re-rendering due to chat message changes');
    return false;
  }
  
  // Player objects - check IDs and hand lengths only
  if (prevProps.G?.attacker?.id !== nextProps.G?.attacker?.id ||
      prevProps.G?.defender?.id !== nextProps.G?.defender?.id ||
      prevProps.G?.attacker?.hand?.length !== nextProps.G?.attacker?.hand?.length ||
      prevProps.G?.defender?.hand?.length !== nextProps.G?.defender?.hand?.length) {
    console.log('CLIENT: Re-rendering due to player changes');
    return false;
  }
  
  // Infrastructure - check length and states only
  const prevInfra = prevProps.G?.infrastructure || [];
  const nextInfra = nextProps.G?.infrastructure || [];
  if (prevInfra.length !== nextInfra.length) {
    console.log('CLIENT: Re-rendering due to infrastructure count change');
    return false;
  }
  
  // Check infrastructure states
  for (let i = 0; i < prevInfra.length; i++) {
    if (prevInfra[i]?.state !== nextInfra[i]?.state ||
        prevInfra[i]?.id !== nextInfra[i]?.id) {
      console.log('CLIENT: Re-rendering due to infrastructure state change');
      return false;
    }
  }
  
  // Pending choices - check player IDs only
  if (prevProps.G?.pendingChainChoice?.playerId !== nextProps.G?.pendingChainChoice?.playerId ||
      prevProps.G?.pendingWildcardChoice?.playerId !== nextProps.G?.pendingWildcardChoice?.playerId ||
      prevProps.G?.pendingHandChoice?.targetPlayerId !== nextProps.G?.pendingHandChoice?.targetPlayerId ||
      prevProps.G?.pendingCardChoice?.playerId !== nextProps.G?.pendingCardChoice?.playerId) {
    console.log('CLIENT: Re-rendering due to pending choice changes');
    return false;
  }
  
  // Rematch requests
  if (prevProps.G?.rematchRequested !== nextProps.G?.rematchRequested) {
    console.log('CLIENT: Re-rendering due to rematch request changes');
    return false;
  }
  
  // Persistent effects - check arrays for changes
  const prevPersistentEffects = prevProps.G?.persistentEffects || [];
  const nextPersistentEffects = nextProps.G?.persistentEffects || [];
  if (prevPersistentEffects.length !== nextPersistentEffects.length ||
      !isEqual(prevPersistentEffects, nextPersistentEffects)) {
    console.log('CLIENT: Re-rendering due to persistent effects changes');
    return false;
  }
  
  // Temporary effects - check arrays for changes
  const prevTemporaryEffects = prevProps.G?.temporaryEffects || [];
  const nextTemporaryEffects = nextProps.G?.temporaryEffects || [];
  if (prevTemporaryEffects.length !== nextTemporaryEffects.length ||
      !isEqual(prevTemporaryEffects, nextTemporaryEffects)) {
    console.log('CLIENT: Re-rendering due to temporary effects changes');
    return false;
  }
  
  // If we reach here, no meaningful changes detected
  return true;
});

export default MemoBalatroGameBoard; 