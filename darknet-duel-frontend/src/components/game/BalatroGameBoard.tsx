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
import DevCheatPanel from './board-components/DevCheatPanel';
import TemporaryEffectsDisplay from './board-components/TemporaryEffectsDisplay';

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
    if (moves.chooseHandDiscard) {
      moves.chooseHandDiscard({ cardIds });
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
                group relative lg:w-28 lg:h-40 w-24 h-32 border-2 rounded-xl lg:p-3 p-2
                flex flex-col justify-center items-center transition-all duration-500 cursor-pointer
                font-mono lg:text-sm text-xs overflow-visible
                ${getPlayerCardClasses(cardType, isAttacker)}
                ${borderColorClass} border-l-4
                ${reactionModeClass}
                ${isSelected ? 'border-warning shadow-lg shadow-warning/50 -translate-y-2 scale-105 z-30' : ''}
                ${isPlayable ? 'border-success shadow-md shadow-success/30 hover:scale-125 hover:z-20 hover:shadow-2xl transform-gpu' : ''}
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
                
                // Check if this card needs targeting (let useCardActions decide)
                // This includes: attack, exploit, reaction, counter-attack, shield, fortify, response
                const needsTargeting = cardType === 'attack' || cardType === 'exploit' || 
                                     cardType === 'reaction' || cardType === 'counter-attack' || 
                                     cardType === 'counter' || cardType === 'shield' || 
                                     cardType === 'fortify' || cardType === 'response';
                
                if (needsTargeting) {
                  console.log('🎯 Selecting card for targeting:', card.name, 'type:', cardType);
                  selectCardToThrow(card);
                } else {
                  console.log('🃏 Playing card directly:', card.name, 'type:', cardType);
                  playCard(card, event);
                }
              }}
            >
              {/* Compact Card View */}
              <div className="group-hover:opacity-0 transition-opacity duration-300 flex flex-col justify-between h-full text-center p-1">
                {/* Top section - Cost and Type Icon */}
                <div className="flex items-center justify-between w-full">
                  <div className="lg:w-6 lg:h-6 w-5 h-5 bg-amber-600 text-amber-100 rounded-full flex items-center justify-center lg:text-xs text-[9px] font-bold">
                    {card.cost}
                  </div>
                  <div className="lg:text-xl text-lg">
                    {cardType === 'attack' ? '⚔️' : 
                     cardType === 'exploit' ? '🔓' : 
                     cardType === 'counter-attack' || cardType === 'counter' ? '🛡️' : 
                     cardType === 'reaction' ? '⚡' : 
                     cardType === 'shield' ? '🔒' : 
                     cardType === 'fortify' ? '🏰' : 
                     cardType === 'wildcard' ? '🃏' : '🔧'}
                  </div>
                </div>
                
                {/* Middle section - Card name */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="font-bold lg:text-[11px] text-[9px] leading-tight px-1">
                    {card.name.length > 10 ? card.name.substring(0, 10) + '...' : card.name}
                  </div>
                </div>
                
                {/* Bottom section - Type and Category */}
                <div className="space-y-1">
                  <div className="lg:text-[9px] text-[8px] font-semibold uppercase text-gray-300">
                    {cardType}
                  </div>
                  {card.metadata?.category && (
                    <div className={`
                      inline-block lg:text-[7px] text-[6px] rounded-full px-1.5 py-0.5 font-bold uppercase tracking-wide
                      ${card.metadata.category === 'network' ? 'bg-blue-500 text-blue-100' :
                        card.metadata.category === 'web' ? 'bg-green-500 text-green-100' :
                        card.metadata.category === 'social' ? 'bg-purple-500 text-purple-100' :
                        card.metadata.category === 'physical' ? 'bg-orange-500 text-orange-100' :
                        card.metadata.category === 'malware' ? 'bg-red-500 text-red-100' :
                        'bg-gray-500 text-gray-100'}
                    `}>
                      {card.metadata.category}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Card View (on hover) - Card-like proportions */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-sm rounded-xl border-2 border-current z-20 transform scale-125 origin-bottom shadow-2xl w-64 h-96 p-3 flex flex-col pointer-events-none">
                {/* Card Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 bg-amber-600 text-amber-100 rounded-full flex items-center justify-center text-xs font-bold">
                      {card.cost}
                    </div>
                    {card.power && (
                      <div className="w-6 h-6 bg-blue-600 text-blue-100 rounded-full flex items-center justify-center text-xs font-bold">
                        {card.power}
                      </div>
                    )}
                  </div>
                  <div className="text-xl">
                    {cardType === 'attack' ? '⚔️' : 
                     cardType === 'exploit' ? '🔓' : 
                     cardType === 'counter-attack' || cardType === 'counter' ? '🛡️' : 
                     cardType === 'reaction' ? '⚡' : 
                     cardType === 'shield' ? '🔒' : 
                     cardType === 'fortify' ? '🏰' : 
                     cardType === 'wildcard' ? '🃏' : '🔧'}
                  </div>
                </div>

                {/* Card Name and Type */}
                <div className="text-center mb-2 border-b border-current/30 pb-2">
                  <div className="font-bold text-sm text-white leading-tight mb-1">
                    {card.name}
                  </div>
                  <div className="text-xs opacity-70 uppercase text-gray-300 font-semibold">
                    {cardType}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1 justify-center">
                    {(card as any).attackVector && (
                      <span className="inline-block bg-orange-600 text-orange-100 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase">
                        {(card as any).attackVector}
                      </span>
                    )}
                    {card.metadata?.category && (
                      <span className={`
                        inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase
                        ${card.metadata.category === 'network' ? 'bg-blue-600 text-blue-100' :
                          card.metadata.category === 'web' ? 'bg-green-600 text-green-100' :
                          card.metadata.category === 'social' ? 'bg-purple-600 text-purple-100' :
                          card.metadata.category === 'physical' ? 'bg-orange-600 text-orange-100' :
                          card.metadata.category === 'malware' ? 'bg-red-600 text-red-100' :
                          'bg-gray-600 text-gray-200'}
                      `}>
                        {card.metadata.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Description */}
                <div className="flex-1 mb-2">
                  <div className="text-xs text-gray-200 leading-tight mb-2">
                    {card.description}
                  </div>
                  
                  {/* Effects */}
                  {(card as any).effects && (card as any).effects.length > 0 && (
                    <div className="mb-2">
                      <div className="text-[10px] font-bold text-cyan-300 mb-1 uppercase">Effects:</div>
                      {(card as any).effects.map((effect: any, idx: number) => (
                        <div key={idx} className="text-[10px] text-cyan-200 bg-cyan-900/30 rounded px-1.5 py-0.5 mb-1">
                          <span className="font-semibold">{effect.type}:</span> {effect.description}
                          {effect.value && <span className="ml-1 text-cyan-100 font-bold">({effect.value})</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Flavor Text */}
                  {card.metadata?.flavor && (
                    <div className="border-t border-current/20 pt-1.5">
                      <div className="text-[10px] italic text-amber-200 leading-tight">
                        "{card.metadata.flavor}"
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer - Special Properties */}
                <div className="space-y-1">
                  {(card as any).isReactive && (
                    <div className="text-center text-[10px] font-bold bg-cyan-600 text-cyan-100 py-0.5 px-1.5 rounded">
                      REACTIVE
                    </div>
                  )}
                  
                  {(card as any).preventReaction && (
                    <div className="text-center text-[10px] font-bold bg-red-600 text-red-100 py-0.5 px-1.5 rounded">
                      NO REACTIONS
                    </div>
                  )}
                </div>
              </div>

              {/* Special indicators */}
              {isReactiveCard && (
                <div className="absolute top-1 left-1 bg-cyan-600/90 text-cyan-100 rounded px-1 text-[6px] font-bold z-60">
                  REACTIVE
                </div>
              )}
              
              {isInReactionMode && isReactiveCard && (
                <div className="absolute -top-1 -right-1 bg-cyan-500 text-cyan-100 rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold animate-pulse z-60">
                  ⚡
                </div>
              )}
              
              {/* Per-card cycle button */}
              {!targetMode && !isInReactionMode && isInActionMode && (
                <button 
                  className="absolute -top-1 -left-1 bg-orange-600 text-orange-100 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold hover:scale-110 transition-transform z-60"
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

  // Helper function to get infrastructure state classes
  const getInfraStateClasses = (state: string) => {
    switch (state) {
      case 'secure':
        return 'bg-green-900/70 border-green-500 text-green-100 shadow-green-500/30';
      case 'vulnerable':
        return 'bg-amber-900/70 border-amber-500 text-amber-100 shadow-amber-500/40 animate-pulse';
      case 'compromised':
        return 'bg-red-900/80 border-red-500 text-red-100 shadow-red-500/50 animate-pulse';
      case 'fortified':
        return 'bg-blue-900/70 border-blue-500 text-blue-100 shadow-blue-500/40';
      case 'shielded':
        return 'bg-purple-900/70 border-purple-500 text-purple-100 shadow-purple-500/40';
      default:
        return isAttacker 
          ? 'bg-red-900/60 border-red-600 text-red-200' 
          : 'bg-blue-900/60 border-blue-600 text-blue-200';
    }
  };

  // Helper function to get player card classes
  const getPlayerCardClasses = (cardType: string, isAttacker: boolean) => {
    const baseClasses = isAttacker 
      ? 'bg-red-900/30 border-red-600 text-red-100' 
      : 'bg-blue-900/30 border-blue-600 text-blue-100';
    
    switch (cardType) {
      case 'attack':
        return `${baseClasses} shadow-red-500/40`;
      case 'exploit':
        return `${baseClasses} shadow-orange-500/40`;
      case 'counter-attack':
      case 'counter':
        return `${baseClasses} shadow-purple-500/40`;
      case 'reaction':
        return `${baseClasses} shadow-cyan-500/40`;
      case 'shield':
      case 'fortify':
        return `${baseClasses} shadow-blue-500/40`;
      case 'wildcard':
        return 'bg-purple-900/30 border-purple-600 text-purple-100 shadow-purple-500/40';
      default:
        return baseClasses;
    }
  };

  // Render infrastructure grid
  const renderInfrastructure = () => {
    const infrastructure = optimizedInfrastructureData.cards;
    
    // Get temporary effects from game state
    const temporaryEffects = G.temporaryEffects || [];
    
    // Get persistent effects from game state
    const persistentEffects = G.persistentEffects || [];
    
    // Debug persistent effects
    if (persistentEffects.length > 0) {
      console.log('🎯 PERSISTENT EFFECTS DEBUG:', persistentEffects);
      console.log('🎯 Current player ID:', playerID);
    }
    
    return (
      <div className="flex flex-wrap gap-3 justify-center items-center max-w-full">
        {infrastructure.map((infra) => {
          const isTargetable = targetMode && validTargets.includes(infra.id);
          const isSelected = targetMode && targetedInfraId === infra.id;
          
          // Filter effects that apply to this specific infrastructure card
          const infraEffects = temporaryEffects.filter((effect: any) => effect.targetId === infra.id);
          
          // Filter persistent effects that apply to this infrastructure
          // Show monitoring indicators to BOTH players, but rewards only go to the effect owner
          const infraPersistentEffects = persistentEffects.filter((effect: any) =>
            effect.targetId === infra.id
          );
          
          // Check if this infrastructure has any monitoring effects
          const hasMonitoringEffects = infraPersistentEffects.length > 0;
          const hasActiveEffects = infraEffects.length > 0;
          const totalEffectsCount = infraEffects.length + infraPersistentEffects.length;
          
          return (
            <div
              key={infra.id}
              className={`
                group relative lg:w-44 lg:h-56 w-40 h-48 border-2 rounded-xl lg:p-4 p-3
                flex flex-col justify-center items-center transition-all duration-500 cursor-pointer
                font-mono lg:text-base text-sm overflow-visible
                ${getInfraStateClasses(infra.state)}
                ${isTargetable ? 'border-warning shadow-lg shadow-warning/50 scale-105 animate-pulse z-40' : ''}
                ${isSelected ? 'border-accent shadow-xl shadow-accent/70 scale-110 z-50' : ''}
                ${targetMode && !isTargetable ? 'opacity-50 cursor-not-allowed' : ''}
                ${!targetMode ? 'hover:scale-150 hover:z-60 hover:shadow-2xl transform-gpu' : ''}
                ${hasMonitoringEffects ? 'ring-2 ring-orange-500/60 ring-offset-2 ring-offset-base-100' : ''}
              `}
              onClick={() => {
                if (targetMode && isTargetable) {
                  handleInfrastructureTarget(infra.id);
                }
              }}
            >
              {/* Monitoring & Effects Indicators - Top overlay */}
              {(hasMonitoringEffects || hasActiveEffects) && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-70 group/effects flex gap-1">
                  {/* Monitoring Indicator */}
                  {hasMonitoringEffects && (
                    <div className="lg:text-[9px] text-[8px] bg-orange-600 text-orange-100 rounded-full px-2 py-1 font-bold uppercase animate-pulse shadow-lg border border-orange-400 cursor-help">
                      🎯 MONITORED
                    </div>
                  )}
                  
                  {/* Active Effects Indicator */}
                  {hasActiveEffects && (
                    <div className="lg:text-[9px] text-[8px] bg-purple-600 text-purple-100 rounded-full px-2 py-1 font-bold uppercase animate-pulse shadow-lg border border-purple-400 cursor-help">
                      ⚡ AFFECTED
                    </div>
                  )}
                  
                  {/* Effects Magnification on Hover */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover/effects:opacity-100 transition-all duration-300 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-sm rounded-xl border-2 border-slate-400 z-80 transform scale-110 origin-top shadow-2xl w-72 p-3 pointer-events-none">
                    <div className="text-center mb-2">
                      <div className="font-bold text-sm text-slate-100 mb-1">Effects & Monitoring</div>
                      <div className="text-xs text-slate-200">on {infra.name}</div>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Persistent Effects Section */}
                      {infraPersistentEffects.length > 0 && (
                        <div>
                          <div className="text-xs font-bold text-orange-300 mb-2 uppercase flex items-center gap-1">
                            <span>🎯</span> Monitoring Effects
                          </div>
                          {infraPersistentEffects.map((effect, idx) => (
                            <div key={`persistent-${idx}`} className="bg-orange-800/50 rounded-lg p-2 border border-orange-600/30 mb-2">
                              <div className="flex items-center justify-between mb-1">
                                <div className="text-xs font-bold text-orange-100 capitalize">
                                  Multi-Stage Malware
                                </div>
                                <div className="text-xs text-orange-300">
                                  {effect.triggered ? 'TRIGGERED' : 'ACTIVE'}
                                </div>
                              </div>
                              <div className="text-[10px] text-orange-200 mb-1">
                                Condition: {effect.condition.fromState || 'any'} → {effect.condition.toState}
                              </div>
                              <div className="text-[10px] text-orange-200 mb-1">
                                Reward: +{effect.reward.amount} AP when compromised
                              </div>
                              <div className="text-[10px] text-orange-200 mb-1">
                                Owner: Player {effect.playerId} {effect.playerId === playerID ? '(You)' : '(Opponent)'}
                              </div>
                              <div className="text-[10px] text-orange-300 italic">
                                Watching for infrastructure compromise...
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Temporary Effects Section */}
                      {infraEffects.length > 0 && (
                        <div>
                          <div className="text-xs font-bold text-purple-300 mb-2 uppercase flex items-center gap-1">
                            <span>⚡</span> Active Effects
                          </div>
                          {infraEffects.map((effect, idx) => (
                            <div key={`temporary-${idx}`} className="bg-purple-800/50 rounded-lg p-2 border border-purple-600/30 mb-2">
                              <div className="flex items-center justify-between mb-1">
                                <div className="text-xs font-bold text-purple-100 capitalize">
                                  {effect.type.replace('_', ' ')}
                                </div>
                                <div className="text-xs text-purple-300">
                                  {effect.duration} turn{effect.duration !== 1 ? 's' : ''}
                                </div>
                              </div>
                              <div className="text-[10px] text-purple-200">
                                Source: {effect.sourceCardId}
                              </div>
                              {effect.type === 'prevent_reactions' && (
                                <div className="text-[10px] text-purple-300 mt-1 italic">
                                  Blocks reaction cards from targeting this infrastructure
                                </div>
                              )}
                              {effect.type === 'prevent_restore' && (
                                <div className="text-[10px] text-purple-300 mt-1 italic">
                                  Prevents restoration effects on this infrastructure
                                </div>
                              )}
                              {effect.type === 'cost_reduction' && (
                                <div className="text-[10px] text-purple-300 mt-1 italic">
                                  Reduces action point costs when targeting this
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Compact Infrastructure Card View */}
              <div className="group-hover:opacity-0 transition-opacity duration-300 flex flex-col justify-between h-full text-center p-1">
                {/* Top section - ID and Type Icon */}
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="lg:text-xs text-[10px] bg-gray-600 text-gray-200 rounded px-1.5 py-1 font-semibold">
                    {infra.id}
                  </div>
                  <div className="lg:text-3xl text-2xl">
                    {infra.type === 'network' ? '🌐' : 
                     infra.type === 'data' ? '💾' : 
                     infra.type === 'web' ? '🖥️' : 
                     infra.type === 'user' ? '👤' : 
                     infra.type === 'critical' ? '🔧' : '⚙️'}
                  </div>
                </div>
                
                {/* Middle section - Infrastructure name */}
                <div className="flex-1 flex items-center justify-center mb-2">
                  <div className="font-bold lg:text-sm text-xs leading-tight px-1 text-center">
                    {infra.name.length > 16 ? infra.name.substring(0, 16) + '...' : infra.name}
                  </div>
                </div>
                
                {/* Bottom section - Type and Vulnerabilities */}
                <div className="space-y-2">
                  <div className="lg:text-xs text-[10px] font-semibold uppercase text-gray-300 text-center">
                    {infra.type} Infra
                  </div>
                  
                  {/* Vulnerability categories - show all vectors */}
                  {(infra as any).vulnerableVectors && (infra as any).vulnerableVectors.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {(infra as any).vulnerableVectors.slice(0, 3).map((vector: string, idx: number) => (
                        <div key={idx} className={`
                          inline-block lg:text-[9px] text-[8px] rounded-full px-2 py-1 font-bold uppercase tracking-wide
                          ${vector === 'network' ? 'bg-blue-500 text-blue-100' :
                            vector === 'web' ? 'bg-green-500 text-green-100' :
                            vector === 'social' ? 'bg-purple-500 text-purple-100' :
                            vector === 'physical' ? 'bg-orange-500 text-orange-100' :
                            vector === 'malware' ? 'bg-red-500 text-red-100' :
                            'bg-gray-500 text-gray-100'}
                        `}>
                          {vector}
                        </div>
                      ))}
                      {(infra as any).vulnerableVectors.length > 3 && (
                        <div className="inline-block lg:text-[9px] text-[8px] bg-gray-400 text-gray-100 rounded-full px-2 py-1 font-bold">
                          +{(infra as any).vulnerableVectors.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* State indicator */}
                  <div className={`
                    lg:text-[10px] text-[9px] font-bold px-2 py-1 rounded uppercase text-center
                    ${infra.state === 'compromised' ? 'bg-red-600 text-red-100' : 
                      infra.state === 'fortified' ? 'bg-blue-600 text-blue-100' : 
                      infra.state === 'vulnerable' ? 'bg-amber-600 text-amber-100' :
                      infra.state === 'shielded' ? 'bg-purple-600 text-purple-100' :
                      'bg-green-600 text-green-100'}
                  `}>
                    {infra.state}
                  </div>
                </div>
              </div>

              {/* Expanded Infrastructure Card View (on hover) - Card-like proportions */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-sm rounded-xl border-2 border-current z-60 transform scale-125 origin-center shadow-2xl w-48 h-72 p-2.5 flex flex-col pointer-events-none">
                {/* Infrastructure Card Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${infra.state === 'compromised' ? 'bg-red-600 text-red-100' : 
                        infra.state === 'fortified' ? 'bg-blue-600 text-blue-100' : 
                        infra.state === 'vulnerable' ? 'bg-amber-600 text-amber-100' :
                        infra.state === 'shielded' ? 'bg-purple-600 text-purple-100' :
                        'bg-green-600 text-green-100'}
                    `}>
                      {infra.state === 'compromised' ? '💥' : 
                       infra.state === 'fortified' ? '🛡️' : 
                       infra.state === 'vulnerable' ? '⚠️' :
                       infra.state === 'shielded' ? '🔒' :
                       '✅'}
                    </div>
                    <div className="text-xs bg-gray-600 text-gray-200 rounded px-1.5 py-0.5 font-semibold uppercase">
                      {infra.id}
                    </div>
                  </div>
                  <div className="text-xl">
                    {infra.type === 'network' ? '🌐' : 
                     infra.type === 'data' ? '💾' : 
                     infra.type === 'web' ? '🖥️' : 
                     infra.type === 'user' ? '👤' : 
                     infra.type === 'critical' ? '🔧' : '⚙️'}
                  </div>
                </div>

                {/* Infrastructure Name and Type */}
                <div className="text-center mb-2 border-b border-current/30 pb-2">
                  <div className="font-bold text-sm text-white leading-tight mb-1">
                    {infra.name}
                  </div>
                  <div className="text-xs opacity-70 uppercase text-gray-300 font-semibold">
                    {infra.type} Infrastructure
                  </div>
                  <div className={`
                    mt-1 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded uppercase
                    ${infra.state === 'compromised' ? 'bg-red-600 text-red-100' : 
                      infra.state === 'fortified' ? 'bg-blue-600 text-blue-100' : 
                      infra.state === 'vulnerable' ? 'bg-amber-600 text-amber-100' :
                      infra.state === 'shielded' ? 'bg-purple-600 text-purple-100' :
                      'bg-green-600 text-green-100'}
                  `}>
                    {infra.state}
                  </div>
                </div>

                {/* Infrastructure Description */}
                <div className="flex-1 mb-2">
                  <div className="text-xs text-gray-200 leading-tight mb-2">
                    {infra.description}
                  </div>
                  
                  {/* Vulnerabilities Section */}
                  {((infra as any).vulnerableVectors && (infra as any).vulnerableVectors.length > 0) || ((infra as any).vulnerabilities && (infra as any).vulnerabilities.length > 0) && (
                    <div className="mb-2">
                      <div className="text-[10px] font-bold text-red-300 mb-1 uppercase">Vulnerable To:</div>
                      <div className="flex flex-wrap gap-1">
                        {/* Show vulnerableVectors if available */}
                        {(infra as any).vulnerableVectors && (infra as any).vulnerableVectors.map((vector: string, idx: number) => (
                          <span key={`vector-${idx}`} className="text-[10px] text-red-200 bg-red-900/30 rounded px-1.5 py-0.5">
                            {vector.toUpperCase()}
                          </span>
                        ))}
                        {/* Show vulnerabilities if available and different from vulnerableVectors */}
                        {(infra as any).vulnerabilities && (infra as any).vulnerabilities.map((vuln: string, idx: number) => (
                          <span key={`vuln-${idx}`} className="text-[10px] text-red-200 bg-red-900/30 rounded px-1.5 py-0.5">
                            {vuln.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Flavor Text */}
                  {(infra as any).flavor && (
                    <div className="border-t border-current/20 pt-1.5">
                      <div className="text-[10px] italic text-amber-200 leading-tight">
                        "{(infra as any).flavor}"
                      </div>
                    </div>
                  )}
                </div>

                {/* Infrastructure Footer - Additional Info */}
                <div className="space-y-1">
                  {/* Security Level Indicator */}
                  <div className="text-center">
                    <div className={`
                      text-[10px] font-bold py-0.5 px-1.5 rounded
                      ${infra.state === 'compromised' ? 'bg-red-600 text-red-100' : 
                        infra.state === 'fortified' ? 'bg-blue-600 text-blue-100' : 
                        infra.state === 'vulnerable' ? 'bg-amber-600 text-amber-100' :
                        infra.state === 'shielded' ? 'bg-purple-600 text-purple-100' :
                        'bg-green-600 text-green-100'}
                    `}>
                      Security: {infra.state === 'compromised' ? 'BREACHED' : 
                                infra.state === 'fortified' ? 'FORTIFIED' : 
                                infra.state === 'vulnerable' ? 'AT RISK' :
                                infra.state === 'shielded' ? 'SHIELDED' :
                                'SECURE'}
                    </div>
                  </div>

                  {/* Infrastructure Type Category */}
                  <div className="text-center text-[10px] bg-gray-600 text-gray-100 py-0.5 px-1.5 rounded">
                    Category: {infra.type.charAt(0).toUpperCase() + infra.type.slice(1)}
                  </div>
                  
                  {/* Effects Display for detailed view */}
                  {(infraEffects.length > 0 || infraPersistentEffects.length > 0) && (
                    <div className="mt-2 pt-2 border-t border-current/20">
                      {/* Persistent Effects */}
                      {infraPersistentEffects.length > 0 && (
                        <div className="mb-2">
                          <div className="text-[10px] font-bold text-orange-300 mb-1 uppercase flex items-center gap-1">
                            <span>🎯</span> Monitoring:
                          </div>
                          <div className="space-y-1">
                            {infraPersistentEffects.map((effect, idx) => (
                              <div key={`persist-${idx}`} className="text-[9px] text-orange-200 bg-orange-900/30 rounded px-1.5 py-0.5">
                                <span className="font-semibold">Multi-Stage Malware:</span> +{effect.reward.amount} AP on compromise
                                <div className="text-[8px] text-orange-300 mt-0.5">
                                  Owner: Player {effect.playerId} {effect.playerId === playerID ? '(You)' : '(Opponent)'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Temporary Effects */}
                      {infraEffects.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold text-purple-300 mb-1 uppercase flex items-center gap-1">
                            <span>⚡</span> Active Effects:
                          </div>
                          <TemporaryEffectsDisplay
                            effects={infraEffects}
                            targetInfrastructure={infra}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`
      min-h-screen w-full flex flex-col relative overflow-hidden font-mono transition-all duration-1000
      ${isAttacker 
        ? 'bg-red-950 text-red-50' 
        : 'bg-blue-950 text-blue-50'
      }
      ${targetMode ? 'ring-4 ring-warning/60 ring-inset shadow-[inset_0_0_50px_rgba(255,204,0,0.2)] animate-pulse' : ''}
      ${isActive 
        ? isAttacker 
          ? 'ring-2 ring-red-400/50 ring-inset shadow-[inset_0_0_100px_rgba(239,68,68,0.15)]' 
          : 'ring-2 ring-blue-400/50 ring-inset shadow-[inset_0_0_100px_rgba(59,130,246,0.15)]'
        : ''
      }
    `}>
      {/* Team-colored cyberpunk background grid */}
      <div 
        className={`absolute inset-0 pointer-events-none opacity-5 ${
          isAttacker ? 'bg-red-grid' : 'bg-blue-grid'
        }`}
        style={{
          backgroundImage: `
            linear-gradient(to right, ${isAttacker ? '#ef4444' : '#3b82f6'} 1px, transparent 1px),
            linear-gradient(to bottom, ${isAttacker ? '#ef4444' : '#3b82f6'} 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Team-colored decorative corner elements */}
      <div className={`absolute top-0 left-0 w-32 h-1 pointer-events-none ${
        isAttacker 
          ? 'bg-gradient-to-r from-red-500 to-transparent' 
          : 'bg-gradient-to-r from-blue-500 to-transparent'
      }`}></div>
      <div className={`absolute top-0 right-0 w-24 h-1 pointer-events-none ${
        isAttacker 
          ? 'bg-gradient-to-l from-red-500 to-transparent' 
          : 'bg-gradient-to-l from-blue-500 to-transparent'
      }`}></div>
      <div className={`absolute bottom-0 left-0 w-48 h-1 pointer-events-none ${
        isAttacker 
          ? 'bg-gradient-to-r from-red-500 to-transparent' 
          : 'bg-gradient-to-r from-blue-500 to-transparent'
      }`}></div>
      <div className={`absolute top-0 right-24 w-1 h-32 pointer-events-none ${
        isAttacker 
          ? 'bg-gradient-to-b from-red-500 to-transparent' 
          : 'bg-gradient-to-b from-blue-500 to-transparent'
      }`}></div>
      <div className={`absolute bottom-0 left-32 w-1 h-48 pointer-events-none ${
        isAttacker 
          ? 'bg-gradient-to-t from-red-500 to-transparent' 
          : 'bg-gradient-to-t from-blue-500 to-transparent'
      }`}></div>

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
            onClick={ctx.activePlayers && playerID && ctx.activePlayers[playerID] === 'reaction' ? handleSkipReaction : handleEndTurn}
            disabled={!isActive || isProcessingMove}
          >
            {ctx.activePlayers && playerID && ctx.activePlayers[playerID] === 'reaction' ? 'PASS' : 'END_TURN'}
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
            onClick={surrender}
            disabled={isProcessingMove}
          >
            SURRENDER
          </button>
        </div>
      </header>

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
        <div className={`
          flex justify-center items-end gap-4 p-4 rounded-lg relative h-40
          ${isAttacker ? 'defender-area' : 'attacker-area'}
          ${!isActive ? 'ring-2 ring-current/50 shadow-lg shadow-current/20' : ''}
        `}>
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-current"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-current"></div>
          
          <div className="absolute top-2 left-4 font-bold text-sm font-mono uppercase tracking-wide team-label">
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
            <div className={`
              rounded-lg p-4 relative backdrop-blur-sm border
              ${isAttacker 
                ? 'bg-red-900/60 border-red-700/40' 
                : 'bg-blue-900/60 border-blue-700/40'
              }
            `}>
              <div className={`
                absolute top-0 left-0 w-3 h-3 border-t border-l
                ${isAttacker ? 'border-red-500' : 'border-blue-500'}
              `}></div>
              <div className={`
                absolute bottom-0 right-0 w-3 h-3 border-b border-r
                ${isAttacker ? 'border-red-500' : 'border-blue-500'}
              `}></div>
              
              <h3 className={`
                font-bold text-sm mb-3 font-mono uppercase tracking-wide
                ${isAttacker ? 'text-red-300' : 'text-blue-300'}
              `}>GAME_INFO</h3>
              <div className="space-y-2 text-sm">
                <div>Round: {memoizedG.currentRound || 1}</div>
                <div>Phase: {currentPhase}</div>
                <div className="flex items-center gap-2">
                  <span>AP:</span>
                  <span className="text-accent font-bold">
                    {currentPlayerObj?.actionPoints || 0}/{memoizedG?.gameConfig?.maxActionPoints || 10}
                  </span>
                </div>
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
          flex justify-center items-start gap-4 p-4 rounded-lg relative h-44
          ${isAttacker ? 'attacker-area' : 'defender-area'}
          ${isActive ? 'ring-2 ring-current/50 shadow-lg shadow-current/20' : ''}
        `}>
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-current"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-current"></div>
          
          <div className="absolute top-2 left-4 font-bold text-sm font-mono uppercase tracking-wide team-label">
            <div className="flex items-center gap-2">
              <span>{isAttacker ? '🎯' : '🛡️'}</span>
              <span>{currentPlayerObj?.username || playerID} - {isAttacker ? 'ATTACKER' : 'DEFENDER'}</span>
            </div>
          </div>
          
          {/* Hand peek indicator */}
          <div className="absolute top-2 right-4 text-xs font-mono uppercase tracking-wide opacity-70 hover:opacity-100 transition-opacity team-label">
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
      
      {memoizedG.pendingHandChoice && playerID !== memoizedG.pendingHandChoice.targetPlayerId && (
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