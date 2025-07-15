import React, { useCallback, useMemo, useEffect } from 'react';
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
import { useGameBoardData } from '../../hooks/useGameBoardData';
import { useGameBoardCallbacks } from '../../hooks/useGameBoardCallbacks';

// Import working board components that already handle all the logic
import GameBoardLayout from './board-components/GameBoardLayout';
import GameBoardHand from './board-components/GameBoardHand';
import GameControls from './board-components/GameControls';
import PendingChoicesOverlay from './board-components/PendingChoicesOverlay';
import WinnerLobby from './board-components/WinnerLobby';

// Import overlay components
import ChainEffectUI from './board-components/ChainEffectUI';
import WildcardChoiceUI from './board-components/WildcardChoiceUI';
import HandDisruptionUI from './board-components/HandDisruptionUI';
import CardSelectionUI from './board-components/CardSelectionUI';

// Import Balatro layout CSS for styling
import '../../styles/balatro-layout.css';

// Extended interface for client properties
type ClientMoves = Record<string, ((...args: unknown[]) => unknown) | undefined> & {
  surrender?: () => void;
  sendChatMessage?: (content: string) => void;
  requestRematch?: () => void;
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
  
  // Use optimized memoization strategies
  const memoizedG = useMemoizedValue(G);
  const memoizedCtx = useMemoizedKeys(ctx, ['phase', 'currentPlayer', 'gameover', 'activePlayers']);
  
  // Memoize critical game state properties
  useMemoizedKeys(G, [
    'gamePhase', 'message', 'attackerScore', 'defenderScore',
    'infrastructure', 'attacker', 'defender', 'chat', 'rematchRequested',
    'pendingChainChoice', 'pendingWildcardChoice', 'pendingHandChoice', 'pendingCardChoice'
  ]);

  // Use custom hooks for game state and actions
  const {
    currentPlayerObj,
    opponent,
    opponentDisconnected,
    currentPhase,
    isAttacker
  } = useGameState(memoizedG, memoizedCtx, playerID);
  
  // Create optimized props object for hooks
  const optimizedProps = useMemo(() => ({
    ...props,
    G: memoizedG,
    ctx: memoizedCtx
  }), [props, memoizedG, memoizedCtx]);
  
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
  
  // Use extracted hooks for working components
  const { infrastructureData, gameMetrics } = useGameBoardData(memoizedG, currentPhase);
  const callbacks = useGameBoardCallbacks(props, moves);
  
  // Create common props for working components
  const commonProps = useMemo(() => ({
    G: memoizedG,
    ctx: memoizedCtx,
    playerID,
    isActive,
    moves,
    isAttacker
  }), [memoizedG, memoizedCtx, playerID, isActive, moves, isAttacker]);
  
  // Track processing state
  const isProcessingMove = cardProcessing || turnProcessing;

  // Detect reaction mode - CRITICAL for proper UI behavior
  const isInReactionMode = memoizedCtx.activePlayers && playerID && memoizedCtx.activePlayers[playerID] === 'reaction';
  
  // Debug reaction mode detection
  console.log('🔍 BalatroGameBoard state:', {
    playerID,
    activePlayers: memoizedCtx.activePlayers,
    isInReactionMode,
    isActive,
    currentPlayer: memoizedCtx.currentPlayer,
    phase: memoizedCtx.phase
  });

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

  // Early returns
  if (!G || !ctx) {
    return <div className="loading">Loading game data...</div>;
  }

  // If the game is over, show the winner lobby
  if (ctx.gameover || ctx.phase === 'gameOver' || G.gamePhase === 'gameOver') {
    console.log('CLIENT: Rendering winner lobby. Phase:', ctx.phase, 'gamePhase:', G.gamePhase);
    
    const winnerLobbyMoves = {
      sendChatMessage: callbacks.sendChatMessage,
      requestRematch: callbacks.requestRematch,
      surrender: callbacks.surrender
    };
    
          return (
        <WinnerLobby
          // @ts-expect-error - Type compatibility issue between frontend and shared types
          G={G}
          playerID={playerID || undefined}
          moves={winnerLobbyMoves}
          isAttacker={isAttacker}
        />
      );
  }

  return (
    <div className="balatro-game-container relative overflow-hidden text-base-content">
      {/* Background grid and decorative elements - matching dashboard */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/3 h-1 bg-gradient-to-r from-primary to-transparent"></div>
        <div className="absolute top-0 right-0 w-1/4 h-1 bg-gradient-to-l from-primary to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1 bg-gradient-to-r from-primary to-transparent"></div>
        <div className="absolute top-0 right-1/4 w-1 h-32 bg-gradient-to-b from-primary to-transparent"></div>
        <div className="absolute bottom-0 left-1/3 w-1 h-48 bg-gradient-to-t from-primary to-transparent"></div>
      </div>

      {/* Target mode overlay */}
      {targetMode && (
        <div className="fixed inset-0 bg-warning/10 flex items-center justify-center z-40 pointer-events-none">
          <div className="bg-base-200 border border-warning rounded-lg p-4 text-center max-w-md mx-4">
            <div className="text-warning text-lg font-bold mb-2">🎯 TARGET MODE</div>
            <div className="text-sm">
              Select a target for <span className="text-accent font-bold">{selectedCard?.name}</span>
            </div>
            <div className="text-xs text-base-content/70 mt-2">
              Click on a highlighted infrastructure card or press ESC to cancel
            </div>
          </div>
        </div>
      )}

      {/* Reaction mode overlay */}
      {isInReactionMode && !targetMode && (
        <div className="fixed inset-0 bg-accent/10 flex items-center justify-center z-40 pointer-events-none">
          <div className="bg-base-200 border border-accent rounded-lg p-4 text-center max-w-md mx-4">
            <div className="text-accent text-lg font-bold mb-2">⚡ REACTION MODE</div>
            <div className="text-sm">
              Play a defensive card to counter the attack or skip reaction
            </div>
            <div className="text-xs text-base-content/70 mt-2">
              Only reactive cards (shield, counter, reaction) can be played
            </div>
          </div>
        </div>
      )}

      {/* Processing overlay */}
      {isProcessingMove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="balatro-processing-content">
            <div className="balatro-spinner"></div>
            <div>Processing move...</div>
          </div>
        </div>
      )}

      {/* Balatro-styled header */}
      <header className="balatro-header">
        <h1 className="text-xl font-bold">DARKNET DUEL</h1>
        <div className="flex items-center gap-4">
          {/* Connection status indicator */}
          <div className="connection-status">
            <span className={`status-indicator ${opponentDisconnected ? 'disconnected' : 'connected'}`}>
              {opponentDisconnected ? '⚠ Disconnected' : '✓ Connected'}
            </span>
          </div>
          
          <button 
            className="balatro-btn"
            onClick={callbacks.surrender}
            disabled={isProcessingMove}
          >
            SURRENDER
          </button>
        </div>
      </header>

      {/* Main game area with Balatro layout but working components */}
      <main className="balatro-main">
        {/* Use the working GameBoardLayout component with Balatro styling */}
        <div className="balatro-layout-wrapper">
          <GameBoardLayout
            commonProps={commonProps}
            currentPlayerObj={currentPlayerObj}
            opponent={opponent}
            infrastructureCards={infrastructureData.cards}
            targetMode={targetMode}
            targetedInfraId={targetedInfraId}
            animatingThrow={animatingThrow}
            handleInfrastructureTarget={handleInfrastructureTarget}
          />
        </div>

        {/* Use the working GameBoardHand component */}
        <div className="balatro-hand-wrapper">
          <GameBoardHand
            commonProps={commonProps}
            currentPlayerObj={currentPlayerObj}
            playCard={playCard}
            cycleCard={cycleCard}
            selectCardToThrow={selectCardToThrow}
            targetMode={targetMode}
          />
        </div>

        {/* Use the working GameControls component */}
                 <div className="balatro-controls-wrapper">
           <GameControls
             targetMode={targetMode}
             selectedCard={selectedCard}
             onEndTurn={handleEndTurn}
             onCycleCard={cycleCard}
             onCancelThrow={cancelTargeting}
             onSkipReaction={handleSkipReaction}
             onSurrender={callbacks.surrender}
             isActive={isActive}
             currentPlayerObj={currentPlayerObj}
             ctx={memoizedCtx}
             playerID={playerID}
             G={memoizedG}
             moves={moves}
             isAttacker={isAttacker}
           />
         </div>
      </main>

      {/* Use the working PendingChoicesOverlay component */}
      <PendingChoicesOverlay
        memoizedG={memoizedG}
        playerID={playerID}
        infrastructureCards={infrastructureData.cards}
        handleChooseWildcardType={callbacks.handleChooseWildcardType}
        handleChooseChainTarget={callbacks.handleChooseChainTarget}
        handleChooseHandDiscard={callbacks.handleChooseHandDiscard}
        handleChooseCardFromDeck={callbacks.handleChooseCardFromDeck}
      />

      {/* Keep individual overlay components for specific choices */}
      {memoizedG.pendingWildcardChoice && playerID === memoizedG.pendingWildcardChoice.playerId && (
        <WildcardChoiceUI
          pendingChoice={memoizedG.pendingWildcardChoice}
          playerId={playerID || ''}
          onChooseType={callbacks.handleChooseWildcardType}
        />
      )}
      
      {memoizedG.pendingChainChoice && playerID === memoizedG.pendingChainChoice.playerId && (
        <ChainEffectUI
          pendingChainChoice={memoizedG.pendingChainChoice}
          infrastructureCards={memoizedG?.infrastructure || []}
          onChooseTarget={callbacks.handleChooseChainTarget}
        />
      )}
      
      {memoizedG.pendingHandChoice && playerID === memoizedG.pendingHandChoice.targetPlayerId && (
        <HandDisruptionUI
          pendingChoice={memoizedG.pendingHandChoice}
          playerId={playerID || ''}
          onChooseCards={callbacks.handleChooseHandDiscard}
        />
      )}
      
      {memoizedG.pendingCardChoice && playerID === memoizedG.pendingCardChoice.playerId && (
        <CardSelectionUI
          pendingChoice={memoizedG.pendingCardChoice}
          onChooseCard={callbacks.handleChooseCardFromDeck}
        />
      )}
    </div>
  );
};

// Optimized memo comparison function
const MemoBalatroGameBoard = React.memo(BalatroGameBoard, (prevProps, nextProps) => {
  // Safety check
  if (!prevProps.G || !nextProps.G || !prevProps.ctx || !nextProps.ctx) {
    console.log('CLIENT: Re-rendering due to missing props');
    return false;
  }
  
  // Quick primitive checks first
  if (prevProps.isActive !== nextProps.isActive ||
      prevProps.playerID !== nextProps.playerID) {
    console.log('CLIENT: Re-rendering due to player/active state change');
    return false;
  }
  
  // Context changes including CRITICAL activePlayers for reaction mode
  if (prevProps.ctx.phase !== nextProps.ctx.phase ||
      prevProps.ctx.currentPlayer !== nextProps.ctx.currentPlayer ||
      prevProps.ctx.gameover !== nextProps.ctx.gameover ||
      !isEqual(prevProps.ctx.activePlayers, nextProps.ctx.activePlayers)) {
    console.log('CLIENT: Re-rendering due to context change');
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
    return false;
  }
  
  // Infrastructure state changes
  const prevInfra = prevProps.G?.infrastructure || [];
  const nextInfra = nextProps.G?.infrastructure || [];
  if (prevInfra.length !== nextInfra.length ||
      !isEqual(prevInfra.map(i => ({id: i.id, state: i.state})), 
               nextInfra.map(i => ({id: i.id, state: i.state})))) {
    return false;
  }
  
  // Player state changes
  if (!isEqual(prevProps.G?.attacker, nextProps.G?.attacker) ||
      !isEqual(prevProps.G?.defender, nextProps.G?.defender)) {
    return false;
  }
  
  // Pending choices (for overlays)
  if (!isEqual(prevProps.G?.pendingWildcardChoice, nextProps.G?.pendingWildcardChoice) ||
      !isEqual(prevProps.G?.pendingChainChoice, nextProps.G?.pendingChainChoice) ||
      !isEqual(prevProps.G?.pendingHandChoice, nextProps.G?.pendingHandChoice) ||
      !isEqual(prevProps.G?.pendingCardChoice, nextProps.G?.pendingCardChoice)) {
    return false;
  }
  
  // Rematch state
  if (!isEqual(prevProps.G?.rematchRequested, nextProps.G?.rematchRequested)) {
    return false;
  }
  
  // No significant changes detected
  return true;
});

export default MemoBalatroGameBoard; 