import React, { useCallback, useMemo } from 'react';
import type { BoardProps } from 'boardgame.io/react';
import isEqual from 'lodash/isEqual';

// Import local types only - we'll use @ts-expect-error for shared type mismatches
import type { GameState } from '../../types/game.types';

/**
 * In this component, we handle two issues:
 * 1. GameState types differ between frontend and shared code - shared requires maxHandSize and cardsDrawnPerTurn
 * 2. Chat messages need real-time updates when the component is memoized
 * 
 * Solution: Use selective re-rendering based on specific properties like chat messages
 * while keeping the rest of the component memoized for performance
 */
import '../../styles/gameboard-v2.css'; // Import the main styles
import '../../styles/card-throw.css'; // Import targeting styles

// Import custom hook for deep memoization
import { useMemoizedValue } from '../../hooks/useMemoizedValue';

// Import all the extracted components
import PlayerHand from './board-components/PlayerHand';
import PlayerBoard from './board-components/PlayerBoard';
import GameStatus from './board-components/GameStatus';
import InfrastructureArea from './board-components/InfrastructureArea';
import PlayerInfo from './board-components/PlayerInfo';
import GameControls from './board-components/GameControls';
import PowerBar from './board-components/PowerBar';
import RoundTracker from './board-components/RoundTracker';
import WinnerLobby from './board-components/WinnerLobby';
import ChainEffectUI from './board-components/ChainEffectUI';

// Import custom hooks
import { useCardActions } from '../../hooks/useCardActions';
import { useTurnActions } from '../../hooks/useTurnActions';
import { useGameState } from '../../hooks/useGameState';

// Extend the BoardProps interface to include the client property that's available at runtime
// Define client interface to fix TypeScript errors with client.moves calls
// Custom interface that properly types the client's available moves
// Use Record type to avoid type mismatch between specific properties and index signature
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
  // The client property is injected by boardgame.io but not included in their types
  client?: GameClient;
}

// The main GameBoard component
const GameBoardComponent = (props: GameBoardProps) => {
  // Destructure props but keep the original props object accessible
  const {
    G,
    ctx,
    moves,
    playerID,
    isActive
  } = props;
  
  // Use memoizedValue to prevent unnecessary re-renders caused by reference changes
  const memoizedG = useMemoizedValue(G);
  const memoizedCtx = useMemoizedValue(ctx);
  
  // No longer need memoizedMoves as we're using original moves for actions
  // Removed unused refs

  // Define containerClass to fix the reference error
  const containerClass = "game-container";
  
  // Use custom hooks for game state and actions with memoized values
  const {
    currentPlayerObj,
    opponent,
    opponentDisconnected,
    currentPhase,
    isAttacker
  } = useGameState(memoizedG, memoizedCtx, playerID);
  
  // Card actions hook with memoized props
  const memoizedProps = useMemoizedValue(props);
  const { 
    selectedCard, 
    targetMode, 
    targetedInfraId,
    animatingThrow,
    processing: cardProcessing,
    playCard, 
    cycleCard, 
    selectCardToThrow, 
    handleInfrastructureTarget, 
    cancelTargeting
  } = useCardActions(memoizedProps);
  
  // Turn actions hook - also memoized
  const { 
    processing: turnProcessing, 
    handleEndTurn, 
    handleSkipReaction 
  } = useTurnActions(memoizedProps);
  
  // Track processing state for UI feedback
  const isProcessingMove = cardProcessing || turnProcessing;
  
  // Handle player surrender - memoize callback to maintain referential equality
  const surrender = useCallback(() => {
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to surrender? This will end the game and count as a loss.');
    if (!confirmed) return;
    
    console.log('CLIENT: Executing surrender move');
    
    // First try using the moves.surrender function - use non-memoized moves
    if (moves && typeof moves.surrender === 'function') {
      try {
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
        props.client.moves.surrender();
        return;
      } catch (error) {
        console.error('CLIENT: Error calling client.moves.surrender:', error);
      }
    }
    
    // As a last resort, try manual move
    try {
      if (props.client) {
        props.client.makeMove('surrender', []);
      }
    } catch (error) {
      console.error('CLIENT: All surrender attempts failed:', error);
      alert('Unable to surrender. Please try again or refresh the page.');
    }
  }, [moves, props.client]);

  // Helper to make the chat message move correctly even if we have to fall back to other methods
  const sendChatMessage = useCallback((content: string) => {
    if (!content.trim()) return; // Don't send empty messages
    
    console.log('CLIENT: Trying to send chat message:', content);
    // Debug what moves are available
    console.log('CLIENT: Available moves:', Object.keys(moves || {}));
    
    // First try using the moves.sendChatMessage function directly
    if (moves && typeof moves.sendChatMessage === 'function') {
      try {
        console.log('CLIENT: Executing sendChatMessage move');
        moves.sendChatMessage(content);
        return; // If this succeeds, we're done
      } catch (error) {
        console.error('CLIENT: Error calling moves.sendChatMessage:', error);
        // Continue to try the fallbacks
      }
    } else {
      console.log('CLIENT: sendChatMessage not available in moves, trying alternatives');
    }
    
    // Try using the client's sendChatMessage function as a fallback
    if (props.client && props.client.moves && typeof props.client.moves.sendChatMessage === 'function') {
      try {
        console.log('CLIENT: Attempting to use client.moves.sendChatMessage as fallback');
        props.client.moves.sendChatMessage(content);
        return;
      } catch (error) {
        console.error('CLIENT: Error calling client.moves.sendChatMessage:', error);
      }
    }
    
    // As a last resort, try using the makeMove method directly
    try {
      if (props.client) {
        props.client.makeMove('sendChatMessage', [content]);
      }
    } catch (error) {
      console.error('CLIENT: All chat message attempts failed:', error);
    }
  }, [moves, props.client]);

  // Helper to make the rematch request move
  const requestRematch = useCallback(() => {
    console.log('CLIENT: Trying to request rematch');
    // Debug what moves are available
    console.log('CLIENT: Available moves for rematch:', Object.keys(moves));
      
    // Use non-memoized moves to ensure we have the latest functions
    if (moves && typeof moves.requestRematch === 'function') {
      try {
        console.log('CLIENT: Executing requestRematch move');
        moves.requestRematch();
      } catch (error) {
        console.error('CLIENT: Error requesting rematch:', error);
      }
    } else {
      console.error('CLIENT: requestRematch move is not defined or not a function');
      // Try using the client's makeMove function as a fallback
      if (props.client && props.client.moves && typeof props.client.moves.requestRematch === 'function') {
        console.log('CLIENT: Attempting to use client.moves.requestRematch as fallback');
        props.client.moves.requestRematch();
      }
    }
  }, [moves, props.client]);
  
  // Create the handler for chain target choice
  const handleChooseChainTarget = useCallback((targetId: string) => {
    console.log('🔥 Chain target handler called with:', targetId);
    console.log('🔥 Available moves:', Object.keys(moves || {}));
    console.log('🔥 chooseChainTarget function exists:', typeof moves.chooseChainTarget);
    
    if (moves.chooseChainTarget) {
      console.log('🔥 Calling moves.chooseChainTarget with:', targetId);
      moves.chooseChainTarget(targetId);
      console.log('🔥 Chain target selected:', targetId);
    } else {
      console.error('🔥 moves.chooseChainTarget is not available!');
    }
  }, [moves]);
  
  // Common props to pass to child components - memoized to prevent unnecessary re-renders
  const commonProps = useMemo(() => {
    return {
      G: memoizedG, // Use original G, child components will handle defaults as needed
      ctx: memoizedCtx, 
      playerID,
      isActive,
      moves, // Add moves to commonProps
      isAttacker // Add isAttacker to commonProps
    };
  }, [memoizedG, memoizedCtx, playerID, isActive, moves, isAttacker]);

  if (!G || !ctx) {
    return <div className="loading">Loading game data...</div>;
  }

  // If the game is over, show the winner lobby
  if (ctx.gameover || ctx.phase === 'gameOver' || G.gamePhase === 'gameOver') {
    console.log('CLIENT: Rendering winner lobby. Phase:', ctx.phase, 'gamePhase:', G.gamePhase);
    console.log('CLIENT: Chat messages:', G.chat?.messages?.length || 0, 'messages');
    
    // Create the moves object for the winner lobby with memoized functions
    const winnerLobbyMoves = {
      sendChatMessage,
      requestRematch,
      surrender
    };
    
    // Use a type assertion with proper comment to document the type mismatch
    // This is necessary because the shared types expect maxHandSize and cardsDrawnPerTurn
    // but they're not required at runtime since the component handles missing values
    return (
      <WinnerLobby
        // @ts-expect-error - Missing gameConfig.maxHandSize and gameConfig.cardsDrawnPerTurn in local type
        G={G}
        playerID={playerID || undefined}
        moves={winnerLobbyMoves}
        isAttacker={isAttacker}
      />
    );
  }
  
  // Otherwise show the regular game UI
  return (
    <div className={containerClass}>
      {isProcessingMove && <div className="move-indicator">Processing move...</div>}
      
      {/* Connection status indicator */}
      <div className="connection-status">
        <span className={`status-indicator ${opponentDisconnected ? 'disconnected' : 'connected'}`}>
          {opponentDisconnected ? ' Opponent Disconnected' : ' Connected'}
        </span>
      </div>
      
      {/* Round tracker showing game progress */}
      <RoundTracker gameState={memoizedG} />
      
      {/* Power balance bar showing control status */}
      <PowerBar
        attackerScore={memoizedG.attackerScore || 0}
        defenderScore={memoizedG.defenderScore || 0}
        totalInfrastructure={memoizedG.infrastructure?.length || 5}
      />
      
      {/* Top status bar with game info and controls */}
      <div className="game-status-bar">
        <GameStatus 
          {...commonProps}
          message={memoizedG.message}
          currentPhase={currentPhase} // Pass current phase explicitly to fix lint warning
        />
        
        <GameControls
          {...commonProps}
          targetMode={targetMode}
          selectedCard={selectedCard}
          onEndTurn={handleEndTurn}
          onCycleCard={cycleCard}
          onCancelThrow={cancelTargeting}
          onSkipReaction={handleSkipReaction}
          onSurrender={surrender}
        />
      </div>
      
      {/* Main game layout in 16:9 aspect ratio */}
      <div className="game-layout">
        {/* Opponent area */}
        <div className="opponent-area">
          <PlayerInfo
            {...commonProps}
            player={opponent}
            isOpponent={true}
          />
          
          <PlayerBoard
            {...commonProps}
            player={opponent}
            isCurrentPlayer={false}
          />
        </div>
        
        {/* Infrastructure area - middle of the board */}
        <InfrastructureArea
          {...commonProps}
          infrastructureCards={memoizedG.infrastructure}
          targetMode={targetMode}
          targetedInfraId={targetedInfraId} 
          animatingThrow={animatingThrow}
          onTargetInfrastructure={handleInfrastructureTarget}
        />
        
        {/* Player area */}
        <div className="player-area">
          <PlayerInfo
            {...commonProps}
            player={currentPlayerObj}
            isOpponent={false}
          />
          
          <PlayerBoard
            {...commonProps}
            player={currentPlayerObj}
            isCurrentPlayer={true}
          />
        </div>
      </div>
      
      {/* Player hand - hidden by default, revealed on hover */}
      <div className="player-hand-container">
        <div className="hand-peek">Your Hand (Hover to reveal)</div>
        <PlayerHand
          {...commonProps}
          player={currentPlayerObj}
          onPlayCard={playCard}
          onCycleCard={cycleCard}
          onSelectCardToThrow={selectCardToThrow}
          targetMode={targetMode}
        />
      </div>
      
      {/* Chain Effect UI */}
      {memoizedG.pendingChainChoice && playerID === memoizedG.pendingChainChoice.playerId && (
        <ChainEffectUI
          pendingChainChoice={memoizedG.pendingChainChoice}
          infrastructureCards={memoizedG.infrastructure || []}
          onChooseTarget={handleChooseChainTarget}
        />
      )}
    </div>
  );
};

// Create a memoized version of the GameBoard with custom comparison function
// This prevents re-renders when props haven't meaningfully changed
const MemoGameBoard = React.memo(GameBoardComponent, (prevProps, nextProps) => {
  // Safety check - if any required props are missing, re-render to be safe
  if (!prevProps.G || !nextProps.G || !prevProps.ctx || !nextProps.ctx) {
    console.log('CLIENT: Re-rendering due to missing props');
    return false;
  }
  
  // First check for critical changes that should always trigger re-render
  // If any of these have changed, return false to force a re-render
  
  // More specific chat changes check - only compare the actual messages
  // This prevents unnecessary re-renders for other chat-related properties
  if (!isEqual(prevProps.G?.chat?.messages, nextProps.G?.chat?.messages)) {
    console.log('CLIENT: Re-rendering due to chat message changes');
    return false;
  }
  
  // Check for rematch requests - safely using optional chaining
  if (!isEqual(prevProps.G?.rematchRequested, nextProps.G?.rematchRequested)) {
    console.log('CLIENT: Re-rendering due to rematch request changes');
    return false;
  }
  
  // Check for changes in game phase
  if (prevProps.ctx?.phase !== nextProps.ctx?.phase) {
    console.log('CLIENT: Re-rendering due to phase change');
    return false;
  }
  
  // Check for changes in current player
  if (prevProps.ctx?.currentPlayer !== nextProps.ctx?.currentPlayer) {
    console.log('CLIENT: Re-rendering due to current player change');
    return false;
  }
  
  // Check for changes in pending choices
  if (!isEqual(prevProps.G?.pendingChainChoice, nextProps.G?.pendingChainChoice)) {
    console.log('CLIENT: Re-rendering due to pendingChainChoice change');
    return false;
  }
  
  // For other game state changes, do deep comparisons only for visual components
  return (
    isEqual(prevProps.G?.infrastructure, nextProps.G?.infrastructure) &&
    isEqual(prevProps.G?.attacker, nextProps.G?.attacker) &&
    isEqual(prevProps.G?.defender, nextProps.G?.defender) &&
    prevProps.G?.message === nextProps.G?.message &&
    prevProps.G?.attackerScore === nextProps.G?.attackerScore &&
    prevProps.G?.defenderScore === nextProps.G?.defenderScore &&
    prevProps.isActive === nextProps.isActive
  );
});

// Export our memoized component as default
export default MemoGameBoard;
