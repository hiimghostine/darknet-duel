import React, { useCallback, useMemo, useEffect } from 'react';
import type { BoardProps } from 'boardgame.io/react';
import isEqual from 'lodash/isEqual';

// Import local types
import type { GameState } from '../../types/game.types';
import { isReactiveCardObject } from '../../types/card.types';

// Import custom hooks for memoization
import { useMemoizedValue, useMemoizedKeys } from '../../hooks/useMemoizedValue';

// Import custom hooks
import { useCardActions } from '../../hooks/useCardActions';
import { useTurnActions } from '../../hooks/useTurnActions';
import { useGameState } from '../../hooks/useGameState';
import { useGameBoardData } from '../../hooks/useGameBoardData';

// Import overlay components
import ChainEffectUI from './board-components/ChainEffectUI';
import WildcardChoiceUI from './board-components/WildcardChoiceUI';
import HandDisruptionUI from './board-components/HandDisruptionUI';
import CardSelectionUI from './board-components/CardSelectionUI';
import WinnerLobby from './board-components/WinnerLobby';

// Import missing components
import PostGameChat from './board-components/PostGameChat';
import PlayerBoard from './board-components/PlayerBoard';
import PlayerInfo from './board-components/PlayerInfo';
import PowerBar from './board-components/PowerBar';
import InfrastructureArea from './board-components/InfrastructureArea';



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
  
  // Extract game board data with performance utilities
  const { infrastructureData } = useGameBoardData(memoizedG, currentPhase);
  
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
    console.log('CLIENT: Surrender button clicked!');
    
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to surrender? This will end the game and count as a loss.');
    if (!confirmed) {
      console.log('CLIENT: Surrender cancelled by user');
      return;
    }
    
    console.log('CLIENT: Executing surrender move');
    console.log('CLIENT: Available moves:', Object.keys(moves || {}));
    console.log('CLIENT: Current phase:', ctx.phase);
    console.log('CLIENT: Current game phase:', G.gamePhase);
    console.log('CLIENT: Player ID:', playerID);
    console.log('CLIENT: Is active:', isActive);
    
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
    if (moves.chooseHandDiscard) {
      moves.chooseHandDiscard({ cardIds });
    }
  }, [moves]);
  
  const handleChooseCardFromDeck = useCallback((cardId: string) => {
    if (moves.chooseCardFromDeck) {
      moves.chooseCardFromDeck({ cardId });
    }
  }, [moves]);

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
      <div 
        key={i} 
        className={`
          lg:w-20 lg:h-28 w-16 h-24 bg-base-300 border border-error rounded-lg 
          flex items-center justify-center shadow-lg
          transition-all duration-300 hover:transform hover:-translate-y-2 hover:z-10
          hover:shadow-xl hover:shadow-error/30
          ${i > 0 ? 'lg:-ml-5 -ml-4' : ''}
        `}
        style={{ zIndex: handSize - i }}
      >
        <span className="text-error lg:text-2xl text-xl font-bold font-mono text-shadow-sm">?</span>
      </div>
    ));
    
    return (
      <div className="flex items-end justify-center">
        {cards}
      </div>
    );
  };

  // Render player hand (face-up cards)
  const renderPlayerHand = () => {
    const hand = currentPlayerObj?.hand || [];
    
    return (
      <div className="flex flex-wrap gap-2 justify-center max-w-4xl lg:gap-2 gap-1">
        {hand.map((card: any, index: number) => {
          const isSelected = selectedCard === card.id;
          const cardType = card.type || card.cardType;
          const currentStage = ctx.activePlayers && playerID ? ctx.activePlayers[playerID] : null;
          const isInReactionMode = currentStage === 'reaction';
          const isInActionMode = currentStage === 'action';
          
          // Proper reaction mode filtering - only reactive cards can be played
          let isPlayable = false;
          if (!targetMode && isActive && ctx.phase === 'playing') {
            if (isInReactionMode) {
              // In reaction mode, only reactive cards can be played
              isPlayable = isReactiveCardObject(card) && card.playable;
            } else if (isInActionMode) {
              // In action mode, all playable cards can be played
              isPlayable = card.playable;
            }
          }
          
          // Card type border colors
          const borderColorClass = cardType === 'attacker' ? 'border-l-error' :
                                 cardType === 'defender' ? 'border-l-primary' :
                                 cardType === 'wildcard' ? 'border-l-warning' :
                                 cardType === 'reaction' ? 'border-l-accent' :
                                 cardType === 'counter-attack' ? 'border-l-accent' :
                                 'border-l-accent';
          
          // Special styling for reactive cards in reaction mode
          const isReactiveCard = isReactiveCardObject(card);
          const reactionModeClass = isInReactionMode && isReactiveCard ? 
            'ring-2 ring-accent animate-pulse bg-accent/10' : '';
          
          return (
            <div
              key={card.id}
              className={`
                lg:w-24 lg:h-32 w-20 h-28 bg-base-300 border border-primary rounded-lg lg:p-2 p-1
                flex flex-col justify-between transition-all duration-300 cursor-pointer
                font-mono lg:text-xs text-[10px] text-base-content relative
                ${borderColorClass} border-l-4
                ${reactionModeClass}
                ${isSelected ? 'border-warning shadow-lg shadow-warning/50 -translate-y-2 scale-105 z-10' : ''}
                ${isPlayable ? 'border-success shadow-md shadow-success/30 hover:-translate-y-4 hover:scale-110 hover:z-20 hover:shadow-lg hover:shadow-primary/40' : ''}
                ${!isPlayable && !targetMode ? 'opacity-60 cursor-not-allowed' : ''}
              `}
              onClick={(event) => {
                if (!isPlayable) {
                  console.log('🚫 Card not playable:', {
                    cardName: card.name,
                    isInReactionMode,
                    isReactive: isReactiveCardObject(card),
                    playable: card.playable
                  });
                  return;
                }
                
                // In reaction mode, only reactive cards should be played directly
                if (isInReactionMode) {
                  console.log('✅ Playing reactive card in reaction mode:', card.name);
                  playCard(card, event);
                  return;
                }
                
                // In action mode, handle different card types
                // Only attack and exploit cards need targeting, all others play directly
                if (cardType === 'attack' || cardType === 'exploit') {
                  console.log('🎯 Selecting card for targeting:', card.name);
                  selectCardToThrow(card);
                } else {
                  console.log('🃏 Playing card directly:', card.name);
                  playCard(card, event);
                }
              }}
            >
              {/* Card header with cost */}
              <div className="flex justify-between items-center mb-1">
                <div className="lg:w-5 lg:h-5 w-4 h-4 bg-base-100 border border-primary rounded-full flex items-center justify-center lg:text-[10px] text-[8px] font-bold text-primary">
                  {card.cost}
                </div>
                {/* Attack vector indicator */}
                {(card as any).attackVector && (
                  <div className="lg:w-4 lg:h-4 w-3 h-3 bg-warning text-warning-content rounded-full flex items-center justify-center lg:text-[8px] text-[6px] font-bold">
                    {(card as any).attackVector.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Card name */}
              <div className="text-primary font-bold lg:text-[10px] text-[8px] text-center mb-1 leading-tight">
                {card.name}
              </div>
              
              {/* Card type */}
              <div className="text-base-content/60 lg:text-[8px] text-[6px] uppercase text-center mb-1">
                {cardType}
              </div>
              
              {/* Card description */}
              <div className="text-base-content/80 lg:text-[8px] text-[6px] flex-1 overflow-hidden leading-tight">
                {card.description}
              </div>
              
              {/* Card power */}
              {card.power && (
                <div className="text-primary font-bold lg:text-[10px] text-[8px] text-center mt-1">
                  PWR: {card.power}
                </div>
              )}
              

              
              {/* Card category */}
              {card.metadata?.category && (
                <div className="text-base-content/60 lg:text-[8px] text-[6px] text-center mt-1 uppercase">
                  {card.metadata.category}
                </div>
              )}
              
              {/* Reactive card marker (always visible for reactive cards) */}
              {isReactiveCard && (
                <div className="absolute top-1 left-1 bg-accent/80 text-accent-content rounded px-1 text-[6px] font-bold">
                  R
                </div>
              )}
              
              {/* Reactive indicator in reaction mode */}
              {isInReactionMode && isReactiveCard && (
                <div className="absolute -top-1 -right-1 bg-accent text-accent-content rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold animate-pulse">
                  ⚡
                </div>
              )}
              
              {/* Per-card cycle button - only show in action mode, not during targeting or reaction */}
              {!targetMode && !isInReactionMode && isInActionMode && (
                <button 
                  className="absolute -top-1 -left-1 bg-secondary text-secondary-content rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold hover:scale-110 transition-transform z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('🔄 Cycling card:', card.name);
                    cycleCard(card.id);
                  }}
                  title="Cycle this card"
                >
                  ↻
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render infrastructure grid
  const renderInfrastructure = () => {
    const infrastructure = optimizedInfrastructureData.cards;
    
    return (
      <div className="flex flex-wrap gap-3 justify-center items-center max-w-full">
        {infrastructure.map((infra) => {
          const isTargetable = targetMode && validTargets.includes(infra.id);
          const isSelected = targetMode && targetedInfraId === infra.id;
          
          // State-based styling
          const stateClass = infra.state === 'compromised' ? 'border-error shadow-error/30' :
                           infra.state === 'fortified' ? 'border-success shadow-success/30' :
                           'border-primary';
          
          return (
            <div
              key={infra.id}
              className={`
                lg:w-32 lg:h-36 w-28 h-32 bg-base-300 border rounded-lg lg:p-2 p-1
                flex flex-col justify-between transition-all duration-300
                font-mono lg:text-xs text-[10px] text-base-content relative
                ${stateClass}
                ${isTargetable ? 'border-warning shadow-lg shadow-warning/50 scale-105 cursor-pointer animate-pulse' : ''}
                ${isSelected ? 'border-accent shadow-xl shadow-accent/70 scale-110 z-10' : ''}
                ${targetMode && !isTargetable ? 'opacity-50 cursor-not-allowed' : ''}
                ${!targetMode ? 'hover:-translate-y-1 hover:scale-105 hover:shadow-lg hover:shadow-primary/30' : ''}
              `}
              onClick={() => {
                if (targetMode && isTargetable) {
                  handleInfrastructureTarget(infra.id);
                }
              }}
            >
              {/* Infrastructure name */}
              <div className="text-primary font-bold lg:text-[10px] text-[8px] text-center mb-1">
                {infra.name}
              </div>
              
              {/* Infrastructure type */}
              <div className="text-base-content/60 lg:text-[8px] text-[6px] uppercase text-center mb-1">
                {infra.type}
              </div>
              
              {/* Infrastructure description */}
              <div className="text-base-content/80 lg:text-[8px] text-[6px] flex-1 overflow-hidden leading-tight">
                {infra.description}
              </div>
              
              {/* Infrastructure state */}
              <div className="text-center lg:text-[10px] text-[8px] font-bold mt-1">
                <span className={infra.state === 'compromised' ? 'text-error' : 
                               infra.state === 'fortified' ? 'text-success' : 'text-primary'}>
                  {infra.state.toUpperCase()}
                </span>
              </div>
              
              {/* Vulnerability indicators */}
              {(infra as any).vulnerableVectors && (infra as any).vulnerableVectors.length > 0 && (
                <div className="mt-1">
                  <div className="lg:text-[8px] text-[6px] text-warning font-bold mb-1">VULNERABLE TO:</div>
                  <div className="flex flex-wrap gap-1">
                    {(infra as any).vulnerableVectors.map((vector: any, idx: number) => {
                      const vectorType = typeof vector === 'string' ? vector : 
                                       (vector?.vector || vector?.type || 'unknown');
                      return (
                        <span 
                          key={idx}
                          className="bg-warning/20 text-warning border border-warning/40 rounded px-1 lg:text-[6px] text-[5px] font-bold uppercase"
                        >
                          {vectorType}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Target indicator */}
              {targetMode && isTargetable && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-warning text-warning-content lg:px-2 px-1 py-1 rounded lg:text-[8px] text-[6px] font-bold animate-bounce">
                  🎯 TARGET
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`
      min-h-screen w-full bg-base-100 text-base-content flex flex-col relative overflow-hidden font-mono
      ${targetMode ? 'ring-4 ring-warning/60 ring-inset shadow-[inset_0_0_50px_rgba(255,204,0,0.2)] animate-pulse' : ''}
    `}>
      {/* Cyberpunk background grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--p)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--p)) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-32 h-1 bg-gradient-to-r from-primary to-transparent pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-24 h-1 bg-gradient-to-l from-primary to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-48 h-1 bg-gradient-to-r from-primary to-transparent pointer-events-none"></div>
      <div className="absolute top-0 right-24 w-1 h-32 bg-gradient-to-b from-primary to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-32 w-1 h-48 bg-gradient-to-t from-primary to-transparent pointer-events-none"></div>

      {/* Target mode notification - top-right corner */}
      {targetMode && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="alert alert-warning shadow-lg border-warning/60 backdrop-blur-sm max-w-sm">
            <div className="flex items-center gap-3">
              <span className="text-warning text-lg">🎯</span>
              <div>
                <div className="font-bold font-mono">TARGET_MODE</div>
                <div className="text-sm">
                  Select target for <span className="text-accent font-bold">{selectedCard?.name}</span>
                </div>
                <div className="text-xs opacity-70">Click infrastructure or ESC to cancel</div>
              </div>
              <button 
                className="btn btn-ghost btn-xs ml-2" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  cancelTargeting();
                }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reaction mode notification - top-center */}
      {!targetMode && ctx.activePlayers && playerID && ctx.activePlayers[playerID] === 'reaction' && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in-down">
          <div className="alert alert-info shadow-lg border-accent/60 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="text-accent text-lg">⚡</span>
              <div>
                <div className="font-bold font-mono">REACTION_MODE</div>
                <div className="text-sm">Play a defensive card to counter</div>
                <div className="text-xs opacity-70">Only reactive cards can be played</div>
              </div>
            </div>
            {/* Auto-dismiss timer visualization */}
            <div className="absolute bottom-0 left-0 h-1 bg-accent/30 animate-[shrink_8s_linear_forwards]" style={{width: '100%'}}></div>
          </div>
        </div>
      )}

      {/* Processing overlay */}
      {isProcessingMove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-200 border border-primary/20 rounded-lg p-6 relative">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
            
            <div className="flex items-center gap-4">
              <div className="loading loading-spinner loading-md text-primary"></div>
              <span className="font-mono text-primary font-bold">PROCESSING_MOVE...</span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-base-200/80 border-b border-primary/20 backdrop-blur-sm z-10">
        <h1 className="text-xl font-bold font-mono text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 uppercase tracking-wide">
          DARKNET_DUEL
        </h1>
        <div className="flex gap-2">
          <button 
            className="btn btn-sm bg-base-300/80 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary hover:shadow-md hover:shadow-primary/30 font-mono font-bold uppercase"
            onClick={handleEndTurn}
            disabled={!isActive || isProcessingMove}
          >
            END_TURN
          </button>
          
          {/* Cycle Card Button - only show in action mode when player has cards */}
          {isActive && !isProcessingMove && currentPlayerObj?.hand?.length > 0 && 
           ctx.activePlayers && playerID && ctx.activePlayers[playerID] === 'action' && (
            <button 
              className="btn btn-sm bg-base-300/80 border-secondary/30 text-secondary hover:bg-secondary/10 hover:border-secondary hover:shadow-md hover:shadow-secondary/30 font-mono font-bold uppercase"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                cycleCard(currentPlayerObj.hand[0].id);
              }}
              title="Cycle out your current hand for a new card"
            >
              CYCLE_CARD
            </button>
          )}
          
          <button 
            className="btn btn-sm bg-base-300/80 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary hover:shadow-md hover:shadow-primary/30 font-mono font-bold uppercase"
            onClick={surrender}
            disabled={isProcessingMove}
          >
            SURRENDER
          </button>
        </div>
      </header>

      {/* Connection status indicator */}
      <div className="px-4 py-2 bg-base-300/50 border-b border-primary/10">
        <div className="flex items-center justify-center max-w-7xl mx-auto">
          <span className={`text-xs font-mono flex items-center gap-2 ${opponentDisconnected ? 'text-error' : 'text-success'}`}>
            <div className={`w-2 h-2 rounded-full ${opponentDisconnected ? 'bg-error' : 'bg-success'} animate-pulse`}></div>
            {opponentDisconnected ? 'OPPONENT_DISCONNECTED' : 'CONNECTION_ACTIVE'}
          </span>
        </div>
      </div>



      {/* Main game area */}
      <main className="flex-1 flex flex-col gap-4 p-4 w-full">
        {/* Opponent area */}
        <div className={`
          flex justify-center items-end gap-4 p-4 
          bg-error/5 border border-error/20 rounded-lg relative h-40
          ${!isActive ? 'ring-2 ring-error/50 shadow-lg shadow-error/20' : ''}
        `}>
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-error"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-error"></div>
          
          <div className="absolute top-2 left-4 text-error font-bold text-sm font-mono uppercase tracking-wide">
            <div className="flex items-center gap-2">
              <span>{isAttacker ? '🛡️' : '🎯'}</span>
              <span>{opponent?.username || 'OPPONENT'} - {isAttacker ? 'DEFENDER' : 'ATTACKER'}</span>
            </div>
            {opponentDisconnected && <div className="text-xs text-error/80">(⚠️ DISCONNECTED)</div>}
            {/* Opponent AP */}
            <div className="flex items-center gap-1 text-xs mt-1">
              <span className="text-accent">⚡</span>
              <span className="text-accent">
                {(opponent as any)?.actionPoints || 0}/{memoizedG?.gameConfig?.maxActionPoints || 10}
              </span>
            </div>
          </div>
          {renderOpponentHand()}
        </div>

        {/* Game content wrapper */}
        <div className="flex gap-4 flex-1 min-h-0 lg:flex-row flex-col">
          {/* Left info panel */}
          <div className="flex flex-col gap-4 lg:w-64 w-full flex-shrink-0 lg:order-1 order-2">
            <div className="bg-base-200 border border-primary/20 rounded-lg p-4 relative backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
              
              <h3 className="text-primary font-bold text-sm mb-3 font-mono uppercase tracking-wide">GAME_INFO</h3>
              <div className="space-y-2 text-sm">
                <div>Round: {memoizedG.currentRound || 1}</div>
                <div>Phase: {currentPhase}</div>
                <div>Turn: {isActive ? 'YOUR_TURN' : 'WAITING'}</div>
              </div>
            </div>
            
            <div className="bg-base-200 border border-primary/20 rounded-lg p-4 relative backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
              
              <h3 className="text-primary font-bold text-sm mb-3 font-mono uppercase tracking-wide">PLAYER_INFO</h3>
              <div className="space-y-3">
                <PlayerInfo
                  {...commonProps}
                  player={currentPlayerObj}
                  isOpponent={false}
                />
              </div>
            </div>
            
            {/* Player Board - Played Cards */}
            {currentPlayerObj?.playedCards && currentPlayerObj.playedCards.length > 0 && (
              <div className="bg-base-200 border border-primary/20 rounded-lg p-4 relative backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
                
                <h3 className="text-primary font-bold text-sm mb-3 font-mono uppercase tracking-wide">PLAYED_CARDS</h3>
                <div className="max-h-40 overflow-y-auto">
                  <PlayerBoard
                    {...commonProps}
                    player={currentPlayerObj}
                    isCurrentPlayer={true}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Center column - Infrastructure */}
          <div className="flex-1 flex flex-col lg:order-2 order-1">
            <div className="bg-base-200 border border-primary/30 rounded-xl p-6 relative flex-1 lg:min-h-80 min-h-60 flex flex-col items-center justify-center backdrop-blur-sm">
              {/* Network grid label */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-base-200 text-primary px-4 py-1 border border-primary/30 rounded-full text-xs font-bold font-mono uppercase tracking-wider">
                NETWORK_GRID
              </div>
              
              {/* Corner bracket */}
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
              
              {renderInfrastructure()}
            </div>
          </div>

          {/* Right info panel */}
          <div className="flex flex-col gap-4 lg:w-64 w-full flex-shrink-0 lg:order-3 order-3">
            <div className="bg-base-200 border border-primary/20 rounded-lg p-4 relative backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
              
              <h3 className="text-primary font-bold text-sm mb-3 font-mono uppercase tracking-wide">BATTLE_STATUS</h3>
              
              <PowerBar
                attackerScore={memoizedG?.attackerScore || 0}
                defenderScore={memoizedG?.defenderScore || 0}
                totalInfrastructure={optimizedInfrastructureData.length}
              />
              
              <div className="flex justify-between items-center mt-3">
                <div className={`text-center ${isAttacker ? 'border-success bg-success/10 p-2 rounded' : ''}`}>
                  <div className="text-xl font-bold text-primary font-mono">{memoizedG?.attackerScore || 0}</div>
                  <div className="text-xs">ATTACKER</div>
                  {isAttacker && <div className="text-xs text-success font-mono mt-1">YOU</div>}
                </div>
                <div className="text-base-content/50 font-mono">VS</div>
                <div className={`text-center ${!isAttacker ? 'border-success bg-success/10 p-2 rounded' : ''}`}>
                  <div className="text-xl font-bold text-primary font-mono">{memoizedG?.defenderScore || 0}</div>
                  <div className="text-xs">DEFENDER</div>
                  {!isAttacker && <div className="text-xs text-success font-mono mt-1">YOU</div>}
                </div>
              </div>
            </div>
            
            <div className="bg-base-200 border border-primary/20 rounded-lg p-4 relative backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
              
              <h3 className="text-primary font-bold text-sm mb-3 font-mono uppercase tracking-wide">INFRASTRUCTURE</h3>
              <div className="space-y-2 text-sm">
                <div>Total: {optimizedInfrastructureData.length}</div>
                <div>Compromised: {optimizedInfrastructureData.cards.filter(i => i.state === 'compromised').length}</div>
                <div>Secured: {optimizedInfrastructureData.cards.filter(i => i.state === 'fortified').length}</div>
              </div>
            </div>
            
            {/* Chat Panel */}
            {memoizedG?.chat && (
              <div className="bg-base-200 border border-primary/20 rounded-lg p-4 relative backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
                
                <h3 className="text-primary font-bold text-sm mb-3 font-mono uppercase tracking-wide">TACTICAL_CHAT</h3>
                <div className="h-32 overflow-hidden">
                  <PostGameChat
                    chat={memoizedG.chat}
                    playerID={playerID || undefined}
                    sendMessage={sendChatMessage}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Player area */}
        <div className={`
          flex justify-center items-start gap-4 p-4 
          bg-primary/5 border border-primary/20 rounded-lg relative h-44
          ${isActive ? 'ring-2 ring-primary/50 shadow-lg shadow-primary/20' : ''}
        `}>
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
          
          <div className="absolute top-2 left-4 text-primary font-bold text-sm font-mono uppercase tracking-wide">
            <div className="flex items-center gap-2">
              <span>{isAttacker ? '🎯' : '🛡️'}</span>
              <span>{currentPlayerObj?.username || playerID} - {isAttacker ? 'ATTACKER' : 'DEFENDER'}</span>
            </div>
          </div>
          
          {/* Hand peek indicator */}
          <div className="absolute top-2 right-4 text-primary/60 text-xs font-mono uppercase tracking-wide opacity-70 hover:opacity-100 transition-opacity">
            TACTICAL_HAND • {currentPlayerObj?.hand?.length || 0} CARDS
          </div>
          
          {renderPlayerHand()}
          
          {/* Action buttons */}
          <div className="absolute bottom-2 right-4 flex gap-2">
            {targetMode && (
              <button 
                className="btn btn-sm bg-base-300/80 border-warning/30 text-warning hover:bg-warning/10 font-mono font-bold uppercase"
                onClick={cancelTargeting}
              >
                CANCEL
              </button>
            )}
            {/* Skip reaction button - check for player stage, not phase */}
            {!targetMode && isActive && ctx.activePlayers && playerID && ctx.activePlayers[playerID] === 'reaction' && (
              <button 
                className="btn btn-sm bg-base-300/80 border-accent/30 text-accent hover:bg-accent/10 font-mono font-bold uppercase"
                onClick={handleSkipReaction}
              >
                SKIP_REACTION
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
          infrastructureCards={optimizedInfrastructureData.cards}
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
  
  // If we reach here, no meaningful changes detected
  return true;
});

export default MemoBalatroGameBoard; 