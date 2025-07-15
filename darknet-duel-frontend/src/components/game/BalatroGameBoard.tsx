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

// Import overlay components
import ChainEffectUI from './board-components/ChainEffectUI';
import WildcardChoiceUI from './board-components/WildcardChoiceUI';
import HandDisruptionUI from './board-components/HandDisruptionUI';
import CardSelectionUI from './board-components/CardSelectionUI';
import WinnerLobby from './board-components/WinnerLobby';

// Import new layout CSS
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
  
  // Handle player surrender
  const surrender = useCallback(() => {
    const confirmed = window.confirm('Are you sure you want to surrender?');
    if (!confirmed) return;
    
    if (moves && typeof moves.surrender === 'function') {
      try {
        moves.surrender();
        return;
      } catch (error) {
        console.error('Error calling moves.surrender:', error);
      }
    }
    
    if (props.client && props.client.moves && typeof props.client.moves.surrender === 'function') {
      try {
        props.client.moves.surrender();
        return;
      } catch (error) {
        console.error('Error calling client.moves.surrender:', error);
      }
    }
    
    try {
      if (props.client) {
        props.client.makeMove('surrender', []);
      }
    } catch (error) {
      console.error('All surrender attempts failed:', error);
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
    if (moves.chooseHandDiscard) {
      moves.chooseHandDiscard({ cardIds });
    }
  }, [moves]);
  
  const handleChooseCardFromDeck = useCallback((cardId: string) => {
    if (moves.chooseCardFromDeck) {
      moves.chooseCardFromDeck({ cardId });
    }
  }, [moves]);

  // Loading state
  if (!G || !ctx) {
    return (
      <div className="balatro-game-container">
        <div className="balatro-processing">
          <div className="balatro-processing-content">
            <div className="balatro-spinner"></div>
            <div>Loading game...</div>
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
      <WinnerLobby
        // @ts-expect-error - Missing gameConfig properties in local type
        G={G}
        playerID={playerID || undefined}
        moves={winnerLobbyMoves}
        isAttacker={isAttacker}
      />
    );
  }

  // Render opponent hand (card backs)
  const renderOpponentHand = () => {
    const handSize = opponent?.hand?.length || 0;
    const cards = Array.from({ length: handSize }, (_, i) => (
      <div key={i} className="balatro-card-back" />
    ));
    
    return (
      <div className="balatro-opponent-hand">
        {cards}
      </div>
    );
  };

  // Render player hand (face-up cards) - DEBUGGING VERSION
  const renderPlayerHand = () => {
    const hand = currentPlayerObj?.hand || [];
    
    console.log('🐛 BalatroGameBoard renderPlayerHand DEBUG:', {
      handLength: hand.length,
      selectedCard,
      targetMode,
      isActive,
      currentPhase: ctx.phase,
      activePlayers: ctx.activePlayers,
      playerID,
      hasCardActions: {
        playCard: !!playCard,
        selectCardToThrow: !!selectCardToThrow,
        cycleCard: !!cycleCard
      }
    });
    
    return (
      <div className="balatro-player-hand">
        {hand.map((card: any, index: number) => {
          const isSelected = selectedCard === card.id;
          const cardType = card.type || card.cardType; // Use 'type' from BoardGame.io, fallback to 'cardType'
          const currentStage = ctx.activePlayers && playerID ? ctx.activePlayers[playerID] : null;
          const isInActionOrReactionStage = currentStage === 'action' || currentStage === 'reaction';
          const isPlayable = !targetMode && isActive && ctx.phase === 'playing' && isInActionOrReactionStage && card.playable;
          
          console.log('🐛 Card render debug:', {
            cardName: card.name,
            cardType: cardType,
            cardId: card.id,
            isSelected,
            isPlayable,
            targetMode,
            isActive,
            phase: ctx.phase,
            currentStage: currentStage,
            isInActionOrReactionStage: isInActionOrReactionStage,
            activePlayers: ctx.activePlayers,
            cardPlayableProperty: card.playable
          });
          
                      return (
              <div
                key={card.id}
                className={`balatro-player-card ${cardType} ${isSelected ? 'selected' : ''} ${isPlayable ? 'playable' : ''}`}
                onClick={(event) => {
                  console.log('🔔 BalatroGameBoard card clicked:', {
                    cardName: card.name,
                    cardType: cardType,
                    cardId: card.id,
                    isPlayable,
                    targetMode,
                    isActive,
                    phase: ctx.phase
                  });
                  
                  if (!isPlayable) {
                    console.log('🚫 Card click blocked - not playable');
                    return;
                  }
                  
                  // DEBUG: Try all possible actions
                  console.log('🎯 Attempting card action...');
                  
                  if (cardType === 'attack' || cardType === 'exploit') {
                    console.log('🎯 Selecting attack/exploit card for throwing:', card.name);
                    selectCardToThrow(card.id);
                  } else if (cardType === 'attacker' || cardType === 'defender') {
                    console.log('🎯 Selecting attacker/defender card for throwing:', card.name);
                    selectCardToThrow(card.id);
                  } else {
                    console.log('🃏 Playing card directly:', card.name);
                    playCard(card.id, event);
                  }
                }}
            >
              <div className="balatro-card-header">
                <div className="balatro-card-cost">{card.cost}</div>
              </div>
              
              <div className="balatro-card-name">{card.name}</div>
              <div className="balatro-card-type">{cardType}</div>
              <div className="balatro-card-description">{card.description}</div>
              
              {card.power && (
                <div className="balatro-card-power">Power: {card.power}</div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render infrastructure grid
  const renderInfrastructure = () => {
    const infrastructure = memoizedG?.infrastructure || [];
    
    return (
      <div className="balatro-infrastructure-grid">
        {infrastructure.map((infra) => {
          // Check if this infrastructure is a valid target
          const isTargetable = targetMode && validTargets.includes(infra.id);
          const isSelected = targetMode && targetedInfraId === infra.id;
          
          return (
            <div
              key={infra.id}
              className={`balatro-infrastructure-card ${infra.state} ${isTargetable ? 'targetable' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => {
                if (targetMode && isTargetable) {
                  handleInfrastructureTarget(infra.id);
                }
              }}
              style={{
                cursor: targetMode ? (isTargetable ? 'pointer' : 'not-allowed') : 'default',
                opacity: targetMode && !isTargetable ? 0.5 : 1
              }}
            >
              <div className="balatro-card-name">{infra.name}</div>
              <div className="balatro-card-type">{infra.type}</div>
              <div className="balatro-card-description">{infra.description}</div>
              <div className="balatro-card-power">State: {infra.state}</div>
              {targetMode && isTargetable && (
                <div className="balatro-target-indicator">
                  🎯 VALID TARGET
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

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

      {/* Processing overlay */}
      {isProcessingMove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm">
            <div className="bg-base-200 border border-primary/20 p-6 relative">
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
              
              <div className="flex items-center gap-4">
                <div className="loading loading-spinner loading-md text-primary"></div>
                <span className="font-mono text-primary">PROCESSING_MOVE...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="balatro-header">
        <h1 className="text-xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 text-flicker">
          DARKNET_DUEL
        </h1>
        <div className="balatro-header-controls">
          <button 
            className="balatro-btn btn-cyberpunk"
            onClick={handleEndTurn}
            disabled={!isActive || isProcessingMove}
          >
            END_TURN
          </button>
          <button 
            className="balatro-btn btn-cyberpunk"
            onClick={surrender}
            disabled={isProcessingMove}
          >
            SURRENDER
          </button>
        </div>
      </header>

      {/* Main game area */}
      <main className="balatro-main">
        {/* Opponent area */}
        <div className={`balatro-opponent-area ${!isActive ? 'active-turn' : ''}`}>
          <div className="balatro-opponent-info">
            {opponent?.username || 'Opponent'} - {isAttacker ? 'Defender' : 'Attacker'}
            {opponentDisconnected && ' (Disconnected)'}
          </div>
          {renderOpponentHand()}
        </div>

        {/* Game content wrapper */}
        <div className="balatro-game-content">
          {/* Left info panel */}
          <div className="balatro-left-panel">
            <div className="balatro-info-panel">
              <h3>Game Info</h3>
              <div>Round: {memoizedG.currentRound || 1}</div>
              <div>Phase: {currentPhase}</div>
              <div>Turn: {isActive ? 'Your Turn' : 'Waiting'}</div>
            </div>
            
            <div className="balatro-info-panel">
              <h3>Player Info</h3>
              <div>You: {currentPlayerObj?.username || playerID}</div>
              <div>Role: {isAttacker ? 'Attacker' : 'Defender'}</div>
              <div>Hand: {currentPlayerObj?.hand?.length || 0} cards</div>
            </div>
          </div>

          {/* Center column */}
          <div className="balatro-center-column">
            {/* Central infrastructure */}
            <div className="balatro-infrastructure">
              {renderInfrastructure()}
            </div>
          </div>

          {/* Right info panel */}
          <div className="balatro-right-panel">
            <div className="balatro-info-panel">
              <h3>Battle Status</h3>
              <div className="balatro-score-display">
                <div>
                  <div className="balatro-score-value">{memoizedG?.attackerScore || 0}</div>
                  <div>Attacker</div>
                </div>
                <div className="balatro-vs-divider">VS</div>
                <div>
                  <div className="balatro-score-value">{memoizedG?.defenderScore || 0}</div>
                  <div>Defender</div>
                </div>
              </div>
            </div>
            
            <div className="balatro-info-panel">
              <h3>Infrastructure</h3>
              <div>Total: {memoizedG?.infrastructure?.length || 0}</div>
              <div>Compromised: {memoizedG?.infrastructure?.filter(i => i.state === 'compromised').length || 0}</div>
              <div>Secured: {memoizedG?.infrastructure?.filter(i => i.state === 'fortified').length || 0}</div>
            </div>
          </div>
        </div>

        {/* Player area */}
        <div className={`balatro-player-area ${isActive ? 'active-turn' : ''}`}>
          <div className="balatro-player-info">
            {currentPlayerObj?.username || playerID} - {isAttacker ? 'Attacker' : 'Defender'}
          </div>
          {renderPlayerHand()}
          
          {/* Action buttons */}
          <div className="balatro-actions">
            {targetMode && (
              <button className="balatro-btn" onClick={cancelTargeting}>
                Cancel
              </button>
            )}
            {ctx.phase === 'reaction' && isActive && (
              <button className="balatro-btn" onClick={handleSkipReaction}>
                Skip Reaction
              </button>
            )}
          </div>
        </div>
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
          infrastructureCards={memoizedG?.infrastructure || []}
          onChooseTarget={handleChooseChainTarget}
        />
      )}
      
      {memoizedG.pendingHandChoice && playerID === memoizedG.pendingHandChoice.targetPlayerId && (
        <HandDisruptionUI
          pendingChoice={memoizedG.pendingHandChoice}
          playerId={playerID || ''}
          onChooseCards={handleChooseHandDiscard}
        />
      )}
      
      {memoizedG.pendingCardChoice && playerID === memoizedG.pendingCardChoice.playerId && (
        <CardSelectionUI
          pendingChoice={memoizedG.pendingCardChoice}
          onChooseCard={handleChooseCardFromDeck}
        />
      )}
    </div>
  );
};

// Memoized version with optimized comparison
const MemoBalatroGameBoard = React.memo(BalatroGameBoard, (prevProps, nextProps) => {
  // Safety check
  if (!prevProps.G || !nextProps.G || !prevProps.ctx || !nextProps.ctx) {
    return false;
  }
  
  // Quick primitive checks
  if (prevProps.isActive !== nextProps.isActive ||
      prevProps.playerID !== nextProps.playerID) {
    return false;
  }
  
  // Context changes
  if (prevProps.ctx.phase !== nextProps.ctx.phase ||
      prevProps.ctx.currentPlayer !== nextProps.ctx.currentPlayer ||
      prevProps.ctx.gameover !== nextProps.ctx.gameover) {
    return false;
  }
  
  // Check activePlayers for reaction mode
  if (!isEqual(prevProps.ctx.activePlayers, nextProps.ctx.activePlayers)) {
    return false;
  }
  
  // Game state changes
  if (prevProps.G.gamePhase !== nextProps.G.gamePhase ||
      prevProps.G.message !== nextProps.G.message ||
      prevProps.G.attackerScore !== nextProps.G.attackerScore ||
      prevProps.G.defenderScore !== nextProps.G.defenderScore) {
    return false;
  }
  
  // Player objects - check hand lengths
  if (prevProps.G?.attacker?.hand?.length !== nextProps.G?.attacker?.hand?.length ||
      prevProps.G?.defender?.hand?.length !== nextProps.G?.defender?.hand?.length) {
    return false;
  }
  
  // Infrastructure changes
  const prevInfra = prevProps.G?.infrastructure || [];
  const nextInfra = nextProps.G?.infrastructure || [];
  if (prevInfra.length !== nextInfra.length) {
    return false;
  }
  
  for (let i = 0; i < prevInfra.length; i++) {
    if (prevInfra[i]?.state !== nextInfra[i]?.state) {
      return false;
    }
  }
  
  // Pending choices
  if (prevProps.G?.pendingChainChoice?.playerId !== nextProps.G?.pendingChainChoice?.playerId ||
      prevProps.G?.pendingWildcardChoice?.playerId !== nextProps.G?.pendingWildcardChoice?.playerId ||
      prevProps.G?.pendingHandChoice?.targetPlayerId !== nextProps.G?.pendingHandChoice?.targetPlayerId ||
      prevProps.G?.pendingCardChoice?.playerId !== nextProps.G?.pendingCardChoice?.playerId) {
    return false;
  }
  
  return true;
});

export default MemoBalatroGameBoard; 