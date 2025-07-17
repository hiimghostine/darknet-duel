import { FnContext } from 'boardgame.io/dist/types/src/types';
import { PhaseConfig, Ctx, LongFormMove } from 'boardgame.io';
import { GameState, PlayerRole, TurnStage, GameAction, PendingReaction } from 'shared-types/game.types';
import { Card } from 'shared-types/card.types';
import { drawCard, drawStartingHand, initializePlayer, initializePlayerWithData } from './playerManager';
import { TemporaryEffectsManager } from '../actions/temporaryEffectsManager';
import { createInfrastructureCards } from '../cards/infrastructureCardLoader';

// Import extracted modules
import { handleChatMessage, handleChatMessageImmutable, addSystemMessage } from './phases/chatMoveHandler';
import { handleSurrender, handleSurrenderInGameOver } from './phases/surrenderMoveHandler';
import { 
  debugLog, 
  canGameStart, 
  checkWinConditions, 
  createTurnMessage, 
  cleanStateForTurnTransition,
  MoveParams 
} from './phases/phaseUtils';
import { actionStageMoves } from './phases/actionStageMoves';
import { reactionStageMoves } from './phases/reactionStageMoves';

/**
 * REFACTORED: Game Phases Configuration
 * 
 * This file has been properly refactored from 1091 lines to ~300 lines by using extracted modules.
 * ALL CRITICAL LOGIC is preserved in the extracted modules.
 */

/**
 * Setup phase handlers
 */
export const setupPhase = {
  start: true,
  
  moves: {
    // Register player's JWT token to map boardgame.io ID to real UUID
    registerPlayerToken: ({ G, playerID }: MoveParams<GameState>, token: string) => {
      console.log(`Player ${playerID} is registering their JWT token`);
      
      try {
        if (!G.playerUuidMap) {
          G.playerUuidMap = {};
        }
        
        if (playerID) {
          G.playerUuidMap[playerID] = `pending_${token.substring(0, 8)}`;
          console.log(`✅ Token registered for player ${playerID}, will be resolved via lobby metadata`);
        }
      } catch (error) {
        console.error(`Error registering player token:`, error);
      }
    },
    
    // Use extracted chat handler
    sendChatMessage: handleChatMessageImmutable,
    
    // Developer cheat move
    devCheatAddCard: ({ G, ctx, playerID }: { G: GameState, ctx: Ctx, playerID: string }, card: any) => {
      const { devCheatAddCardMove } = require('../moves/devCheatAddCard');
      return devCheatAddCardMove(G, ctx, playerID, card);
    },
    
    // Forward game moves to player actions
    playCard: ({ G, ctx, playerID }: { G: GameState, ctx: Ctx, playerID: string }, cardId: string) => {
      const { playCardMove } = require('../actions/playerActions');
      return playCardMove({ G, ctx, playerID }, cardId);
    },
    
    throwCard: ({ G, ctx, playerID }: { G: GameState, ctx: Ctx, playerID: string }, cardId: string, targetInfrastructureId: string) => {
      const { throwCardMove } = require('../actions/playerActions');
      return throwCardMove({ G, ctx, playerID }, cardId, targetInfrastructureId);
    },
    
    cycleCard: ({ G, ctx, playerID }: { G: GameState, ctx: Ctx, playerID: string }, cardId: string) => {
      const { cycleCardMove } = require('../actions/playerActions');
      return cycleCardMove({ G, ctx, playerID }, cardId);
    },
    
    endTurn: ({ G, ctx, playerID }: { G: GameState, ctx: Ctx, playerID: string }) => {
      const { endTurnMove } = require('../actions/playerActions');
      return endTurnMove({ G, ctx, playerID });
    }
  },
  
  onBegin: ({ G, ctx }: FnContext<GameState>): GameState => {
    // Skip if players are already initialized
    if (G.attacker && G.defender) {
      console.log('Game already initialized, skipping setup');
      return G;
    }
    
    const attackerId = ctx.playOrder[0];
    const defenderId = ctx.playOrder[1];
    
    if (!attackerId || !defenderId || ctx.playOrder.length < 2) {
      console.log('⏳ Waiting for both players to join lobby before initializing game');
      return G;
    }
    
    console.log(`✅ Both players present, initializing game with attacker ${attackerId}, defender ${defenderId}`);
    
    // Extract real player data
    let attackerData = { id: attackerId, name: `Player ${attackerId}` };
    let defenderData = { id: defenderId, name: `Player ${defenderId}` };
    
    if (G.playerUuidMap) {
      if (G.playerUuidMap[attackerId]) {
        attackerData.id = G.playerUuidMap[attackerId];
      }
      if (G.playerUuidMap[defenderId]) {
        defenderData.id = G.playerUuidMap[defenderId];
      }
    }
    
    // Initialize players with starting hands
    let attacker = initializePlayerWithData(attackerId, 'attacker', G.gameConfig, attackerData);
    let defender = initializePlayerWithData(defenderId, 'defender', G.gameConfig, defenderData);
    
    attacker = drawStartingHand(attacker, G.gameConfig.startingHandSize);
    defender = drawStartingHand(defender, G.gameConfig.startingHandSize);
    
    // Set up infrastructure
    const infrastructureCards = createInfrastructureCards();
    console.log(`Created ${infrastructureCards.length} infrastructure cards`);
    
    // Return clean, serializable game state
    return {
      ...G,
      attacker: JSON.parse(JSON.stringify(attacker)),
      defender: JSON.parse(JSON.stringify(defender)),
      infrastructureDeck: [],
      infrastructure: JSON.parse(JSON.stringify(infrastructureCards)),
    };
  },
  
  next: 'playing',
  
  endIf: ({ G, ctx }: { G: GameState, ctx: Ctx }) => {
    const bothPlayersInitialized = Boolean(G.attacker && G.defender);
    const bothPlayersConnected = ctx.playOrder.length === 2;
    const gameCanStart = bothPlayersInitialized && bothPlayersConnected;
    
    if (gameCanStart) {
      console.log('✅ Setup phase complete, transitioning to playing phase');
    }
    
    return gameCanStart;
  }
};

/**
 * Playing phase handlers
 */
export const playingPhase: PhaseConfig<GameState, Record<string, unknown>> = {
  onBegin: ({ G }: { G: GameState }) => {
    return {
      ...G,
      gamePhase: 'playing' as const
    };
  },
  
  moves: {
    sendChatMessage: handleChatMessageImmutable,
    surrender: handleSurrender,
    devCheatAddCard: ({ G, ctx, playerID, events }, card) => {
      // Import and forward to the main devCheatAddCardMove function
      const { devCheatAddCardMove } = require('../../moves/devCheatAddCard');
      return devCheatAddCardMove(G, ctx, playerID, card);
    },
  },
  
  turn: {
    onBegin: ({ G, ctx, events }: FnContext<GameState>) => {
      let updatedG = TemporaryEffectsManager.processTurnStart(G);
      const isAttacker = G.currentTurn === 'attacker';
      
      events.setActivePlayers({ currentPlayer: 'action' });
      
      if (isAttacker && G.attacker) {
        console.log(`Attacker turn start: AP ${G.attacker.actionPoints}/${G.gameConfig.maxActionPoints}`);
      } else if (!isAttacker && G.defender) {
        console.log(`Defender turn start: AP ${G.defender.actionPoints}/${G.gameConfig.maxActionPoints}`);
      }
      
      return {
        ...updatedG,
        pendingReactions: [],
        reactionComplete: false
      };
    },
    
    onEnd: ({ G, ctx, events }: FnContext<GameState>): GameState => {
      const nextTurn = G.currentTurn === 'attacker' ? 'defender' : 'attacker' as const;
      let updatedG = { ...G };
      
      if (G.currentTurn === 'defender') {
        updatedG.currentRound = G.currentRound + 1;
        
        if (updatedG.currentRound > 15) {
          if (updatedG.attackerScore > updatedG.defenderScore) {
            updatedG.winner = 'attacker' as PlayerRole;
          } else if (updatedG.defenderScore > updatedG.attackerScore) {
            updatedG.winner = 'defender' as PlayerRole;
          } else {
            updatedG.winner = undefined; 
            updatedG.message = `Game ended after ${updatedG.currentRound - 1} rounds. It's a draw!`;
          }
          updatedG.gameEnded = true;
          updatedG.gamePhase = 'gameOver' as const;
          events.setPhase('gameOver');
        }
      }
      
      const turnMsg = `${nextTurn.charAt(0).toUpperCase() + nextTurn.slice(1)}'s turn`;
      const roundMsg = `Round ${updatedG.currentRound}${updatedG.currentRound >= 13 ? ' (Final rounds!)' : ''}`;
      
      return {
        ...updatedG,
        currentTurn: nextTurn,
        turnNumber: nextTurn === 'attacker' ? G.turnNumber + 1 : G.turnNumber,
        currentStage: null as TurnStage,
        message: `${roundMsg} - ${turnMsg}`
      };
    },
    
    stages: {
      action: {
        moves: {
          ...actionStageMoves,
          // Add hand disruption move for Memory Corruption Attack
          chooseHandDiscard: ({ G, ctx, playerID }, { cardIds }) => {
            const { chooseHandDiscardMove } = require('../../moves/chooseHandDiscard');
            return chooseHandDiscardMove(G, ctx, playerID, cardIds);
          }
        },
        next: 'reaction'
      },
      
      reaction: {
        moves: {
          ...reactionStageMoves,
          // Add hand disruption move for Memory Corruption Attack
          chooseHandDiscard: ({ G, ctx, playerID }, { cardIds }) => {
            const { chooseHandDiscardMove } = require('../../moves/chooseHandDiscard');
            return chooseHandDiscardMove(G, ctx, playerID, cardIds);
          }
        },
        next: 'end'
      },

      end: {
        moves: {
          surrender: handleSurrender,
          
          finalizeTurn: function finalizeTurn({ G, ctx, events }: FnContext<GameState>) {
            const isAttacker = G.currentTurn === 'attacker';
            const currentPlayer = isAttacker ? G.attacker : G.defender;
            
            if (!currentPlayer) {
              return { ...G, message: 'Player not found' };
            }
            
            let updatedPlayer = JSON.parse(JSON.stringify(currentPlayer));
            
            const maxHandSize = G.gameConfig.maxHandSize;
            const cardsToDrawPerTurn = G.gameConfig.cardsDrawnPerTurn;
            const currentHandSize = updatedPlayer.hand?.length || 0;
            const cardsToDrawCount = Math.min(cardsToDrawPerTurn, maxHandSize - currentHandSize);
            
            if (cardsToDrawCount > 0) {
              for (let i = 0; i < cardsToDrawCount; i++) {
                updatedPlayer = drawCard(updatedPlayer);
              }
            }
            
            updatedPlayer.freeCardCyclesUsed = 0;
            
            const updatedG = {
              ...G,
              [isAttacker ? 'attacker' : 'defender']: updatedPlayer,
              message: 'Turn finalized, ready for next player',
              pendingReactions: [],
              reactionComplete: false,
              currentStage: null,
              currentActionPlayer: undefined
            };
            
            events.endTurn();
            return updatedG;
          }
        }
      }
    }
  }
};

/**
 * Game over phase handlers
 */
export const gameOverPhase = {
  turn: {
    activePlayers: { all: 'gameOver' },
    moveLimit: 0,
    order: {
      first: () => 0,
      next: () => 0,
      playOrder: () => ['0', '1']
    },
    
    stages: {
      gameOver: {
        moves: {
          sendChatMessage: handleChatMessage,
          
          requestRematch: ({ G, playerID }: MoveParams<GameState>) => {
            console.log('SERVER: Rematch requested by player:', playerID);
            
            const rematchRequested = G.rematchRequested || [];
            
            if (playerID && !rematchRequested.includes(playerID)) {
              const newMessage = {
                id: Date.now().toString(),
                sender: 'system',
                senderRole: 'attacker' as PlayerRole,
                content: `${playerID === G.attacker?.id ? 'Attacker' : 'Defender'} has requested a rematch!`,
                timestamp: Date.now(),
                isSystem: true
              };
              
              const chatMessages = G.chat?.messages || [];
              
              return {
                ...G,
                rematchRequested: [...rematchRequested, playerID],
                chat: {
                  messages: [...chatMessages, newMessage],
                  lastReadTimestamp: G.chat?.lastReadTimestamp || {}
                }
              };
            }
            
            return G;
          },

          surrender: handleSurrenderInGameOver
        }
      }
    }
  },

  onBegin: ({ G, ctx }: FnContext<GameState>) => {
    console.log('Game over, winner:', G.winner);
    
    const gameDuration = Date.now() - (G.actions[0]?.timestamp || Date.now());
    const cardsPlayed = G.actions.filter(action => 
      action.actionType === 'playCard' || action.actionType === 'throwCard'
    ).length;
    const infrastructureChanged = G.actions.filter(action => 
      action.payload.infrastructureId !== undefined
    ).length;
    
    // Determine win reason
    let winReason = 'Unknown';
    if (G.winner === 'abandoned') {
      winReason = 'Opponent abandoned the game';
    } else if (G.turnNumber > G.gameConfig.maxTurns) {
      winReason = 'Maximum turns reached - defender wins by default';
    } else {
      let attackerControlled = 0;
      let defenderControlled = 0;
      
      G.infrastructure?.forEach(infra => {
        if (infra.state === 'compromised') {
          attackerControlled++;
        } else if (infra.state === 'fortified' || infra.state === 'fortified_weaken') {
          defenderControlled++;
        }
      });
      
      const infrastructureThreshold = Math.ceil((G.infrastructure?.length || 0) / 2) + 1;
      
      if (attackerControlled >= infrastructureThreshold) {
        winReason = `Attacker controlled ${attackerControlled} infrastructure cards`;
      } else if (defenderControlled >= infrastructureThreshold) {
        winReason = `Defender fortified ${defenderControlled} infrastructure cards`;
      }
    }
    
    const initialChat = {
      messages: [
        {
          id: Date.now().toString(),
          sender: 'system',
          senderRole: 'attacker' as PlayerRole,
          content: G.winner ? 
            `Game over! ${G.winner === 'attacker' ? 'Attacker' : 'Defender'} has won the game.` : 
            'Game ended in a draw.',
          timestamp: Date.now(),
          isSystem: true
        }
      ],
      lastReadTimestamp: {}
    };
    
    return {
      ...G,
      gamePhase: 'gameOver' as const,
      gameEnded: true,
      message: G.winner ? `${G.winner} has won the game!` : 'Game ended in a draw',
      chat: initialChat,
      gameStats: {
        gameDuration,
        cardsPlayed,
        infrastructureChanged,
        winReason
      },
      rematchRequested: []
    };
  }
};
