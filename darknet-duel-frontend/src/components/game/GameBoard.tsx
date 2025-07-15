import React, { useRef, useEffect, useCallback } from 'react';
import type { BoardProps } from 'boardgame.io/react';
import isEqual from 'lodash/isEqual';
// Import both shared and local types
import type { GameState as SharedGameState } from 'shared-types/game.types';
import type { GameState } from '../../types/game.types';
import { useMemoizedValue } from '../../hooks/useMemoizedValue';
import '../../styles/gameboard-v2.css'; // Import the main styles
import '../../styles/card-throw.css'; // Import targeting styles
import '../../styles/chain-effect.css'; // Import chain effect styles
import '../../styles/hand-disruption.css'; // Import hand disruption styles

// Import all the extracted components
import PlayerHand from './board-components/PlayerHand';
import PlayerBoard from './board-components/PlayerBoard';
import GameStatus from './board-components/GameStatus';
import InfrastructureArea from './board-components/InfrastructureArea';
import PlayerInfo from './board-components/PlayerInfo';
import GameControls from './board-components/GameControls';
import WinnerLobby from './board-components/WinnerLobby';

// Import individual components
import RoundTracker from './board-components/RoundTracker';
import PowerBar from './board-components/PowerBar';

// Phase 2 and 3 UI components
import WildcardChoiceUI from './board-components/WildcardChoiceUI';
import ChainEffectUI from './board-components/ChainEffectUI';
import ChainTargetUI from './board-components/ChainTargetUI';
import HandDisruptionUI from './board-components/HandDisruptionUI';
import CardSelectionUI from './board-components/CardSelectionUI';

// Import custom hooks
import { useCardActions } from '../../hooks/useCardActions';
import { useTurnActions } from '../../hooks/useTurnActions';
import { useGameState } from '../../hooks/useGameState';

// Extend the BoardProps interface to include the client property that's available at runtime
interface GameBoardProps extends BoardProps<GameState> {
  // The client property is injected by boardgame.io but not included in their types
  client?: any;
}

// The original non-memoized GameBoard component implementation
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
  // This is critical for the GameBoard as it receives new references each time
  const memoizedG = useMemoizedValue(G);
  const memoizedCtx = useMemoizedValue(ctx);
  
  // Refs for animation tracking
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastGameStateRef = useRef<any>(null);

  // Define containerClass to fix the reference error
  const containerClass = "game-container";
  
  // Use custom hooks for game state and actions with memoized values
  // This ensures the hooks don't recalculate unless there are actual changes
  const { 
    currentPlayerObj, 
    opponent, 
    opponentDisconnected, 
    currentPhase, 
    isAttacker 
  } = useGameState(memoizedG, memoizedCtx, playerID);
  
  // Card actions hook with memoized props to prevent unnecessary hook re-execution
  const memoizedProps = useMemoizedValue(props);
  const { 
    selectedCard, 
    targetMode, 
    targetedInfraId,
    animatingThrow,
    playCard, 
    cycleCard, 
    selectCardToThrow, 
    handleInfrastructureTarget, 
    cancelTargeting
  } = useCardActions(memoizedProps);
  
  // Turn actions hook
  const { 
    handleEndTurn, 
    handleSkipReaction 
  } = useTurnActions(props);
  
  // We're tracking card and turn processing individually as needed
  
  // Handle player surrender - memoize the function to maintain referential equality
  const surrender = useCallback(() => {
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to surrender? This will end the game and count as a loss.');
    if (!confirmed) return;
    
    try {
      if (moves.surrender && typeof moves.surrender === 'function') {
        moves.surrender();
        return;
      } else if (props.client && props.client.moves && props.client.moves.surrender) {
        props.client.moves.surrender();
        return;
      }
    } catch (error) {
      console.error('CLIENT: Error calling surrender:', error);
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

  if (!G || !ctx) {
    return <div className="loading">Loading game data...</div>;
  }

  // Simple state monitoring for debugging
  useEffect(() => {
    if (G && Object.keys(G).length > 0) {
      lastGameStateRef.current = G;
    }
  }, [G]);

  // Cleanup animation timeouts when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup function
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
    };
  }, []);

  // Check for infrastructure card states and connection status
  useEffect(() => {
    // Custom debug logging hook for infrastructure changes and opponent connection
    if (G && G.infrastructure) {
      // Log any important infrastructure changes here for debugging
      console.debug('Infrastructure updated:', G.infrastructure.length, 'cards');
    }
    
    // Check opponent connection status for debug logging
    // Note: ctx.playerInfo is available at runtime but not in the TypeScript type definitions
    if (ctx && (ctx as any).playerInfo) {
      const opponentID = isAttacker ? G.defender?.id : G.attacker?.id;
      const playerInfo = (ctx as any).playerInfo;
      
      if (opponentID && playerInfo[opponentID]) {
        const opponentInfo = playerInfo[opponentID];
        const opponentConnectionState = opponentInfo.isConnected ? 'connected' : 'disconnected';
        console.debug('Opponent connection status:', opponentConnectionState);
      }
    }
  }, [G, ctx, isAttacker, opponentDisconnected]);

  // Note: All render methods have been refactored into separate components

  // If no player data yet, show loading
  if (!currentPlayerObj) {
    return <div className="loading">Waiting for game to initialize...</div>;
  }

  // Create a common props object to pass to all components
  const commonProps = {
    G, 
    ctx, 
    moves, 
    playerID, 
    isActive,
    isAttacker,
    currentPlayerObj,
    opponent
  };

  // If game is over, show only the winner lobby page
  if (currentPhase === 'gameOver' || G.winner) {
    // Make sure we have these move functions available and properly defined
    const surrender = () => {
      console.log('CLIENT: Available moves:', moves);
      
      if (typeof moves.surrender === 'function') {
        try {
          console.log('CLIENT: Executing surrender move');
          moves.surrender();
        } catch (error) {
          console.error('CLIENT: Error surrendering:', error);
        }
      }
      
      // Create empty functions for required moves props that aren't implemented yet
      const sendChatMessage = useCallback((content: string) => {
        console.log('Chat message would be sent:', content);
      }, []);
      
      const requestRematch = useCallback(() => {
        console.log('Rematch would be requested');
      }, []);
      
      return (
        <WinnerLobby
          G={memoizedG as unknown as SharedGameState}
          playerID={playerID || undefined}
          isAttacker={isAttacker}
          moves={{
            sendChatMessage,
            requestRematch,
            surrender
          }}
        />
      );
    };
    
    return surrender();
  }
  
  // Create the handler for wildcard type choice - Phase 2
  const handleChooseWildcardType = useCallback((type: string) => {
    if (moves.chooseWildcardType) {
      moves.chooseWildcardType({ type });
    }
  }, [moves]);
  
  // Create the handler for chain target choice - Phase 3
  const handleChooseChainTarget = useCallback((targetId: string) => {
    if (moves.chooseChainTarget) {
      moves.chooseChainTarget({ targetId });
      console.log('Chain target selected:', targetId);
    }
  }, [moves]);
  
  // Create the handler for hand discard choice - Phase 3
  const handleChooseHandDiscard = useCallback((cardIds: string[]) => {
    if (moves.chooseHandDiscard) {
      moves.chooseHandDiscard({ cardIds });
      console.log('Hand cards selected for discard:', cardIds);
    }
  }, [moves]);
  
  // Create the handler for card selection from deck - AI-Powered Attack
  const handleChooseCardFromDeck = useCallback((cardId: string) => {
    if (moves.chooseCardFromDeck) {
      moves.chooseCardFromDeck({ cardId });
      console.log('Card selected from deck:', cardId);
    }
  }, [moves]);

  // Otherwise show the regular game UI
  return (
    <div className={containerClass}>
      
      {/* Round tracker showing game progress */}
      <RoundTracker gameState={G} />
      
      {/* Power balance bar showing control status */}
      <PowerBar
        attackerScore={G.attackerScore || 0}
        defenderScore={G.defenderScore || 0}
        totalInfrastructure={G.infrastructure?.length || 5}
      />
      
      {/* Top status bar with game info and controls */}
      <div className="game-status-bar">
        <GameStatus 
          {...commonProps}
          message={G.message}
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
          infrastructureCards={G.infrastructure}
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

      {/* Wildcard Type Choice UI - Phase 2 */}
      {G.pendingWildcardChoice && playerID === G.pendingWildcardChoice.playerId && (
        <WildcardChoiceUI 
          pendingChoice={G.pendingWildcardChoice}
          playerId={playerID || ''}
          onChooseType={handleChooseWildcardType}
        />
      )}
      
      {/* Chain Effect UI - Phase 3 */}
      {G.pendingChainChoice && playerID === G.pendingChainChoice.playerId && (
        <ChainEffectUI 
          pendingChainChoice={G.pendingChainChoice}
          infrastructureCards={G.infrastructure || []}
          onChooseTarget={handleChooseChainTarget}
        />
      )}
      
      
      {/* Hand Disruption UI - Phase 3 */}
      {/* Only show the HandDisruptionUI if the player is the target player who needs to discard cards */}
      {G.pendingHandChoice && playerID === G.pendingHandChoice.targetPlayerId && (
        <HandDisruptionUI
          pendingChoice={G.pendingHandChoice}
          playerId={playerID || ''}
          onChooseCards={handleChooseHandDiscard}
        />
      )}
      
      {/* Card Selection UI - AI-Powered Attack */}
      {G.pendingCardChoice && playerID === G.pendingCardChoice.playerId && (
        <CardSelectionUI
          pendingChoice={G.pendingCardChoice}
          onChooseCard={handleChooseCardFromDeck}
        />
      )}
    </div>
  );
};

// Create a memoized version of the GameBoard with custom comparison function
// This prevents re-renders when props haven't meaningfully changed
const GameBoard = React.memo(GameBoardComponent, (prevProps, nextProps) => {
  // Don't re-render for these specific shallow changes that don't affect display
  // Deep compare the essential parts of the game state
  return (
    // Compare essential game state properties that trigger visual updates
    isEqual(prevProps.G?.infrastructure, nextProps.G?.infrastructure) &&
    isEqual(prevProps.G?.attacker, nextProps.G?.attacker) &&
    isEqual(prevProps.G?.defender, nextProps.G?.defender) &&
    prevProps.G?.message === nextProps.G?.message &&
    prevProps.G?.attackerScore === nextProps.G?.attackerScore &&
    prevProps.G?.defenderScore === nextProps.G?.defenderScore &&
    prevProps.ctx?.phase === nextProps.ctx?.phase &&
    prevProps.ctx?.currentPlayer === nextProps.ctx?.currentPlayer &&
    prevProps.isActive === nextProps.isActive
  );
});

export default GameBoard;
