import { FnContext } from 'boardgame.io/dist/types/src/types';
import { PhaseConfig, Ctx, LongFormMove } from 'boardgame.io';
import { GameState, PlayerRole, TurnStage, GameAction, PendingReaction } from 'shared-types/game.types';
import { Card } from 'shared-types/card.types';
import { drawCard, drawStartingHand, initializePlayer } from './playerManager';

// Type for move parameter context
type MoveParams<T> = {
  G: T;
  playerID?: string;
  ctx?: Ctx;
  events?: any;
  random?: any;
};

// Debugging function
function debugLog(message: string) {
  console.log(message);
}
import { createInfrastructureCards } from '../cards/infrastructureCardLoader';

/**
 * Helper function to check if the turn should end due to end conditions
 * - Player has no action points left
 * - Player has no cards left in hand
 * - Player explicitly ends their turn
 */
function checkEndConditions(G: GameState, ctx: Ctx, events: any): GameState {
  // Get current player
  const isAttacker = G.currentTurn === 'attacker';
  const player = isAttacker ? G.attacker : G.defender;
  
  if (!player) return G;
  
  // Check if player has no action points or no cards
  if (player.actionPoints <= 0 || player.hand.length === 0) {
    console.log(`End conditions met: AP=${player.actionPoints}, hand size=${player.hand.length}`);
    // End the turn automatically
    events.endTurn();
  }
  
  return G;
}

/**
 * Setup phase handlers
 */
export const setupPhase = {
  start: true,
  
  moves: {
    // Register player's JWT token to map boardgame.io ID to real UUID
    registerPlayerToken: async ({ G, playerID }: MoveParams<GameState>, token: string) => {
      console.log(`Player ${playerID} is registering their JWT token`);
      
      try {
        // Import validateToken to verify the token and get user data
        const { validateToken } = require('../../server/auth');
        
        // Validate the token against the backend server
        const validation = await validateToken(token);
        
        if (validation.valid && validation.user && validation.user.id) {
          // Initialize playerUuidMap if it doesn't exist
          if (!G.playerUuidMap) {
            G.playerUuidMap = {};
          }
          
          // Map this player's boardgame.io ID to their real UUID
          G.playerUuidMap[playerID] = validation.user.id;
          
          console.log(`✅ Successfully mapped player ${playerID} to UUID ${validation.user.id}`);
        } else {
          console.error(`❌ Failed to validate token for player ${playerID}`);
        }
      } catch (error) {
        console.error(`Error registering player token:`, error);
      }
    },
    
    // Allow sending chat messages during setup phase
    sendChatMessage: ({ G, playerID }: MoveParams<GameState>, content: string) => {
      console.log('SERVER: Received chat message in setup phase:', content, 'from player:', playerID);
      
      // Option 1: Mutation style (preferred for simpler code)
      if (!G.chat) {
        G.chat = {
          messages: [],
          lastReadTimestamp: {}
        };
      }
      
      // Determine player role
      let senderRole: PlayerRole = 'attacker';
      if (playerID === G.attacker?.id) {
        senderRole = 'attacker';
      } else if (playerID === G.defender?.id) {
        senderRole = 'defender';
      }
      
      // Add message to chat
      const newMessage = {
        id: Date.now().toString(),
        sender: playerID || 'unknown',
        senderRole,
        content,
        timestamp: Date.now(),
        isSystem: false
      };
      
      // Just push the new message to the existing array (mutation)
      G.chat.messages.push(newMessage);
      
      // Do not return anything when using mutation style
      // This fixes the Immer error
    },
    
    // Add all necessary moves to the setup phase
    playCard: ({ G, ctx, playerID }: { G: GameState, ctx: Ctx, playerID: string }, cardId: string) => {
      // Import and forward to the main playCardMove function
      const { playCardMove } = require('../actions/playerActions');
      return playCardMove({ G, ctx, playerID }, cardId);
    },
    
    throwCard: ({ G, ctx, playerID }: { G: GameState, ctx: Ctx, playerID: string }, cardId: string, targetInfrastructureId: string) => {
      // Import and forward to the main throwCardMove function
      const { throwCardMove } = require('../actions/playerActions');
      return throwCardMove({ G, ctx, playerID }, cardId, targetInfrastructureId);
    },
    
    cycleCard: ({ G, ctx, playerID }: { G: GameState, ctx: Ctx, playerID: string }, cardId: string) => {
      // Import and forward to the main cycleCardMove function
      const { cycleCardMove } = require('../actions/playerActions');
      return cycleCardMove({ G, ctx, playerID }, cardId);
    },
    
    endTurn: ({ G, ctx, playerID }: { G: GameState, ctx: Ctx, playerID: string }) => {
      // Import and forward to the main endTurnMove function
      const { endTurnMove } = require('../actions/playerActions');
      return endTurnMove({ G, ctx, playerID });
    }
  },
  
  onBegin: ({ G, ctx }: FnContext<GameState>) => {
    // Skip if players are already initialized
    if (G.attacker && G.defender) return G;
    
    // Get player IDs from the game context
    const attackerId = ctx.playOrder[0];
    const defenderId = ctx.playOrder[1];
    
    // Check if we have both players
    if (!attackerId || !defenderId) {
      console.error('Missing player IDs in ctx.playOrder');
      return G;
    }
    
    console.log(`Initializing game with attacker ${attackerId}, defender ${defenderId}`);
    
    // Initialize players with their roles
    let attacker = initializePlayer(attackerId, 'attacker', G.gameConfig);
    let defender = initializePlayer(defenderId, 'defender', G.gameConfig);
    
    // Draw starting hands for both players
    attacker = drawStartingHand(attacker, G.gameConfig.startingHandSize);
    defender = drawStartingHand(defender, G.gameConfig.startingHandSize);
    
    // Set up infrastructure cards
    const infrastructureCards = createInfrastructureCards();
    
    console.log(`Created ${infrastructureCards.length} infrastructure cards`);
    
    // Add all infrastructure cards to the game board immediately
    // In the original code, infrastructure cards were part of the initial game state
    return {
      ...G,
      attacker,
      defender,
      infrastructureDeck: [], // Keep as a backup if needed
      infrastructure: infrastructureCards, // Add all infrastructure cards to the board immediately
    };
  },
  
  next: 'playing',
  
  // Add an endIf function to automatically transition from setup to playing phase
  endIf: ({ G, ctx }: { G: GameState, ctx: Ctx }) => {
    // If we have both players initialized, end the setup phase
    return Boolean(G.attacker && G.defender);
  }
};

/**
 * Playing phase handlers with detailed turn stages
 */
export const playingPhase: PhaseConfig<GameState, Record<string, unknown>> = {

  // Update gamePhase when entering this phase
  onBegin: ({ G }: { G: GameState }) => {
    return {
      ...G,
      gamePhase: 'playing' as const
    };
  },
  
  // Add essential moves at the phase level to ensure they're always available
  moves: {
    sendChatMessage: ({ G, playerID }: MoveParams<GameState>, content: string) => {
      console.log('SERVER: Received chat message in playing phase:', content, 'from player:', playerID);
      
      if (!G.chat) {
        G.chat = {
          messages: [],
          lastReadTimestamp: {}
        };
      }
      
      // Determine player role
      let senderRole: PlayerRole = 'attacker';
      if (playerID === G.attacker?.id) {
        senderRole = 'attacker';
      } else if (playerID === G.defender?.id) {
        senderRole = 'defender';
      }
      
      // Add message to chat
      const newMessage = {
        id: Date.now().toString(),
        sender: playerID || 'unknown',
        senderRole,
        content,
        timestamp: Date.now(),
        isSystem: false
      };
      
      // Return updated game state with the new message
      return {
        ...G,
        chat: {
          ...G.chat,
          messages: [...G.chat.messages, newMessage]
        }
      };
    },
    
    surrender: ({ G, ctx, playerID, events }) => {
      const winner = playerID === G.attacker?.id ? 'defender' : 'attacker';
      return {
        ...G,
        gamePhase: 'gameOver' as const,
        gameEnded: true,
        winner,
        message: `${playerID} has surrendered! ${winner} wins the game!`
      };
    },
  },
  
  // Most moves are defined at the stage level for clarity
  
  // Reorganized turn structure with proper boardgame.io stage transitions
  turn: {
    // We don't set default activePlayers here, instead we set it explicitly in onBegin
    // This gives us more control over the stage transitions
    onBegin: ({ G, ctx, events }: FnContext<GameState>) => {
      let updatedG = { ...G };
      
      // Track which player is currently active (for turn-based logic)
      const currentPlayer = ctx.currentPlayer;
      const isAttacker = G.currentTurn === 'attacker';
      
      // Set active player to action stage by default
      events.setActivePlayers({ currentPlayer: 'action' });
      
      // No need to add action points here anymore since it's done in endTurn
      // Just log the current AP for debugging purposes
      if (isAttacker && G.attacker) {
        console.log(`Attacker turn start: AP ${G.attacker.actionPoints}/${G.gameConfig.maxActionPoints}`);
      } else if (!isAttacker && G.defender) {
        console.log(`Defender turn start: AP ${G.defender.actionPoints}/${G.gameConfig.maxActionPoints}`);
      }
      
      // Start in the Action stage with a clean state
      return {
        ...updatedG,
        pendingReactions: [],
        reactionComplete: false
      };
    },
    
    onEnd: ({ G, ctx, events }: FnContext<GameState>): GameState => {
      // Switch current turn
      const nextTurn = G.currentTurn === 'attacker' ? 'defender' : 'attacker' as const;
      let updatedG = { ...G };
      
      // If defender's turn is ending, it means a complete round has finished
      if (G.currentTurn === 'defender') {
        // Increment round counter
        updatedG.currentRound = G.currentRound + 1;
        
        // Check if we've reached the round limit (15 rounds)
        if (updatedG.currentRound > 15) {
          // Set game ending conditions based on score
          if (updatedG.attackerScore > updatedG.defenderScore) {
            updatedG.winner = 'attacker' as PlayerRole;
          } else if (updatedG.defenderScore > updatedG.attackerScore) {
            updatedG.winner = 'defender' as PlayerRole;
          } else {
            // For a draw, we don't set a specific winner
            // but we should note it in the message
            updatedG.winner = undefined; 
            updatedG.message = `Game ended after ${updatedG.currentRound - 1} rounds. It's a draw!`;
          }
          updatedG.gameEnded = true;
          updatedG.gamePhase = 'gameOver' as const;
          console.log(`Game ended after ${updatedG.currentRound - 1} rounds. Winner: ${updatedG.winner}`);
          
          // CRITICAL: Transition to the gameOver phase in boardgame.io
          // This is needed so the chat functionality works properly
          events.setPhase('gameOver');
        }
      }
      
      // Create message that includes round information
      const turnMsg = `${nextTurn.charAt(0).toUpperCase() + nextTurn.slice(1)}'s turn`;
      const roundMsg = `Round ${updatedG.currentRound}${updatedG.currentRound >= 13 ? ' (Final rounds!)' : ''}`;
      const message = `${roundMsg} - ${turnMsg}`;
      
      return {
        ...updatedG,
        currentTurn: nextTurn,
        turnNumber: nextTurn === 'attacker' ? G.turnNumber + 1 : G.turnNumber,
        currentStage: null as TurnStage,
        message
      };
    },
    
    // Define the stages for each turn
    stages: {
      // Action Stage: Player can spend AP to play cards and activate effects
      action: {
        moves: {
          // Add chat message functionality to action stage
          sendChatMessage: ({ G, playerID }: MoveParams<GameState>, content: string) => {
            console.log('SERVER: Received chat message in action stage:', content, 'from player:', playerID);
            
            // Option 1: Mutation style (preferred for simpler code)
            if (!G.chat) {
              G.chat = {
                messages: [],
                lastReadTimestamp: {}
              };
            }
            
            // Determine player role
            const senderRole = playerID === G.attacker?.id ? 'attacker' as PlayerRole : 'defender' as PlayerRole;
            
            // Add message to chat
            const newMessage = {
              id: Date.now().toString(),
              sender: playerID || 'unknown',
              senderRole,
              content,
              timestamp: Date.now(),
              isSystem: false
            };
            
            // Just push the new message to the existing array (mutation)
            G.chat.messages.push(newMessage);
            
            // Do not return anything when using mutation style
            // This fixes the Immer error
          },

          surrender: ({ G, ctx, playerID, events }) => {
            console.log('Player surrendered:', playerID);
            
            // Determine which player surrendered and set the other as winner
            const winner = playerID === G.attacker?.id ? 'defender' as PlayerRole : 'attacker' as PlayerRole;
            const surrenderer = playerID === G.attacker?.id ? 'attacker' as PlayerRole : 'defender' as PlayerRole;
            
            // Create updated game state
            const updatedG = {
              ...G,
              gamePhase: 'gameOver' as const,
              gameEnded: true,
              winner,
              message: `${surrenderer} has surrendered! ${winner} wins the game!`
            };
            
            // CRITICAL: Transition to the gameOver phase in boardgame.io
            // This is needed so the chat functionality works properly
            events.setPhase('gameOver');
            
            return updatedG;
          },
          
          playCard: function playCard({ G, ctx, playerID, events }, cardId) {
            // Import and forward to the main playCardMove function
            const { playCardMove } = require('../actions/playerActions');
            const newG = playCardMove({ G, ctx, playerID }, cardId);
            
            // Check if this card can be reacted to (if it's a reaction-eligible card)
            const isAttacker = playerID === G.attacker?.id;
            const currentPlayer = isAttacker ? G.attacker : G.defender;
            const card = currentPlayer?.hand.find(c => c.id === cardId);
            
            // Check if the card type is eligible for reaction
            const reactionEligible = card && ['attack', 'virus', 'exploit', 'hack'].includes(card.type);
            
            if (reactionEligible) {
              // Store the action player's ID so we can return to them later
              const updatedG = {
                ...newG,
                currentActionPlayer: playerID
              };
              
              // Switch active player to opponent for reaction stage
              const opponentID = playerID === G.attacker?.id ? G.defender?.id : G.attacker?.id;
              if (opponentID) {
                events.setActivePlayers({ value: { [opponentID]: 'reaction' } });
              }
              
              return updatedG;
            }
            
            // Check end conditions
            return checkEndConditions(newG, ctx, events);
          },
          
          cycleCard: function cycleCard({ G, ctx, playerID, events }, cardId) {
            // Import and forward to the main cycleCardMove function
            const { cycleCardMove } = require('../actions/playerActions');
            const newG = cycleCardMove({ G, ctx, playerID }, cardId);
            
            // Check end conditions
            return checkEndConditions(newG, ctx, events);
          },
          
          throwCard: function throwCard({ G, ctx, playerID, events }, cardId, targetInfrastructureId) {
            // Import and forward to the main throwCardMove function
            const { throwCardMove } = require('../actions/playerActions');
            const newG = throwCardMove({ G, ctx, playerID }, cardId, targetInfrastructureId);
            
            // Always allow reaction to a throw card action
            // Store the action player's ID so we can return to them later
            const updatedG = {
              ...newG,
              currentActionPlayer: playerID
            };
            
            // Switch active player to opponent for reaction stage
            const opponentID = playerID === G.attacker?.id ? G.defender?.id : G.attacker?.id;
            if (opponentID) {
              events.setActivePlayers({ value: { [opponentID]: 'reaction' } });
            }
            
            return updatedG;
          },
          
          endTurn: ({ G, ctx, events }) => {
            // Get current active player
            const isAttacker = G.currentTurn === 'attacker';
            const currentPlayer = isAttacker ? G.attacker : G.defender;
            
            if (!currentPlayer) {
              return { ...G, message: 'Player not found' };
            }
            
            // Deep copy the player to avoid reference issues
            let updatedPlayer = JSON.parse(JSON.stringify(currentPlayer));
            
            // Always draw exactly 2 cards at end of turn, but respect maximum hand size
            const maxHandSize = G.gameConfig.maxHandSize; // Max hand size from config
            const cardsToDrawPerTurn = G.gameConfig.cardsDrawnPerTurn; // Cards to draw from config
            
            // Calculate how many cards we can draw without exceeding max hand size
            const currentHandSize = updatedPlayer.hand?.length || 0;
            const cardsToDrawCount = Math.min(cardsToDrawPerTurn, maxHandSize - currentHandSize);
            
            console.log(`End of turn: Drawing ${cardsToDrawCount} cards for ${isAttacker ? 'attacker' : 'defender'} (hand: ${currentHandSize}/${maxHandSize})`);
            
            // Draw cards up to the calculated amount
            if (cardsToDrawCount > 0) {
              for (let i = 0; i < cardsToDrawCount; i++) {
                const drawCardFn = require('../core/playerManager').drawCard;
                updatedPlayer = drawCardFn(updatedPlayer);
              }
            }
            
            // Reset free card cycles counter for next turn
            updatedPlayer.freeCardCyclesUsed = 0;
            
            // Add next turn's action points now rather than waiting for next turn
            // This gives immediate feedback to the player about their next turn's AP
            const apPerTurn = isAttacker ? 
              G.gameConfig.attackerActionPointsPerTurn : 
              G.gameConfig.defenderActionPointsPerTurn;
              
            updatedPlayer.actionPoints = Math.min(
              updatedPlayer.actionPoints + apPerTurn,
              G.gameConfig.maxActionPoints
            );
            
            console.log(`End turn: Added ${apPerTurn} AP for ${isAttacker ? 'attacker' : 'defender'}, now ${updatedPlayer.actionPoints}/${G.gameConfig.maxActionPoints}`);
            
            // Update game state
            const updatedG = {
              ...G,
              [isAttacker ? 'attacker' : 'defender']: updatedPlayer,
              message: 'Turn finalized, ready for next player',
              pendingReactions: [],
              reactionComplete: false,
              currentStage: null,
              currentActionPlayer: undefined // Clear the current action player
            };
            
            // End the turn and move to the next player
            events.endTurn();
            
            return updatedG;
          }
        },
        next: 'reaction'
      },
      
      // Reaction Stage: Opponent can play reaction cards in response
      reaction: {
        moves: {
          // Add chat message functionality to reaction stage
          sendChatMessage: ({ G, playerID }: MoveParams<GameState>, content: string) => {
            console.log('SERVER: Received chat message in reaction stage:', content, 'from player:', playerID);
            
            // Option 1: Mutation style (preferred for simpler code)
            if (!G.chat) {
              G.chat = {
                messages: [],
                lastReadTimestamp: {}
              };
            }
            
            // Determine player role
            const senderRole = playerID === G.attacker?.id ? 'attacker' as PlayerRole : 'defender' as PlayerRole;
            
            // Add message to chat
            const newMessage = {
              id: Date.now().toString(),
              sender: playerID || 'unknown',
              senderRole,
              content,
              timestamp: Date.now(),
              isSystem: false
            };
            
            // Just push the new message to the existing array (mutation)
            G.chat.messages.push(newMessage);
            
            // Do not return anything when using mutation style
            // This fixes the Immer error
          },

          surrender: ({ G, ctx, playerID, events }) => {
            console.log('Player surrendered:', playerID);
            
            // Determine which player surrendered and set the other as winner
            const winner = playerID === G.attacker?.id ? 'defender' as PlayerRole : 'attacker' as PlayerRole;
            const surrenderer = playerID === G.attacker?.id ? 'attacker' as PlayerRole : 'defender' as PlayerRole;
            
            // Create updated game state
            const updatedG = {
              ...G,
              gamePhase: 'gameOver' as const,
              gameEnded: true,
              winner,
              message: `${surrenderer} has surrendered! ${winner} wins the game!`
            };
            
            // CRITICAL: Transition to the gameOver phase in boardgame.io
            // This is needed so the chat functionality works properly
            events.setPhase('gameOver');
            
            return updatedG;
          },
          
          // Allow both standard playCard and throwCard moves during reaction stage
          // The isCardPlayable function will ensure only reactive cards can be played
          playCard: function playCard({ G, ctx, playerID, events }, cardId) {
            // Import and forward to the main playCardMove function
            const { playCardMove } = require('../actions/playerActions');
            const newG = playCardMove({ G, ctx, playerID }, cardId);
            
            // Return to the action player's action stage after playing a reaction
            if (G.currentActionPlayer) {
              events.setActivePlayers({ value: { [G.currentActionPlayer]: 'action' } });
            } else {
              events.setActivePlayers({ currentPlayer: 'action' });
            }
            
            return newG;
          },
          
          throwCard: function throwCard({ G, ctx, playerID, events }, cardId, targetInfrastructureId) {
            // Import and forward to the main throwCardMove function
            const { throwCardMove } = require('../actions/playerActions');
            const newG = throwCardMove({ G, ctx, playerID }, cardId, targetInfrastructureId);
            
            // Clear pending reactions for this player
            const updatedPendingReactions = G.pendingReactions ? 
              G.pendingReactions.filter(reaction => reaction.target !== playerID) : [];
              
            // Return to the action player's action stage after playing a reaction
            if (G.currentActionPlayer) {
              events.setActivePlayers({ value: { [G.currentActionPlayer]: 'action' } });
            } else {
              events.setActivePlayers({ currentPlayer: 'action' });
            }
            
            // Update the game state to include cleared pending reactions
            return {
              ...newG,
              pendingReactions: updatedPendingReactions,
              reactionComplete: updatedPendingReactions.length === 0
            };
          },
          
          // Keep the legacy playReaction for backward compatibility
          playReaction: function playReaction({ G, ctx, playerID, events }, cardId) {
            // Get current player (the one reacting)
            if (!G.attacker || !G.defender) {
              return { ...G, message: 'Game not properly initialized' };
            }
            
            // Get the card from the player's hand
            const isAttacker = G.attacker.id === playerID;
            const currentPlayer = isAttacker ? G.attacker : G.defender;
            
            // Find the card in player's hand
            const cardIndex = currentPlayer.hand.findIndex(card => card.id === cardId);
            if (cardIndex === -1) {
              return { ...G, message: 'Card not found in hand' };
            }
            
            // Check if the card is a valid reaction card
            const cardToPlay = currentPlayer.hand[cardIndex];
            if (cardToPlay.type !== 'reaction' && cardToPlay.type !== 'counter') {
              return { ...G, message: 'Not a valid reaction card' };
            }
            
            // Check if player has enough action points
            if (currentPlayer.actionPoints < cardToPlay.cost) {
              return { ...G, message: 'Not enough action points' };
            }
            
            // Remove the card from hand
            const newHand = [...currentPlayer.hand];
            newHand.splice(cardIndex, 1);
            
            // Create a deep copy of the card to ensure all properties are preserved during serialization
            const cardCopy = JSON.parse(JSON.stringify(cardToPlay));
            
            // Add the card to the field
            const actionPoints = currentPlayer.actionPoints - cardToPlay.cost;
            
            // Update player state
            const updatedPlayer = {
              ...currentPlayer,
              hand: newHand,
              field: [...currentPlayer.field, cardCopy],
              actionPoints
            };
            
            // Update game state with reaction
            const updatedG = {
              ...G,
              message: `${currentPlayer.name} reacted with ${cardToPlay.name}`,
              [isAttacker ? 'attacker' : 'defender']: updatedPlayer,
            };
            
            // Return to the action player's action stage
            if (G.currentActionPlayer) {
              events.setActivePlayers({ value: { [G.currentActionPlayer]: 'action' } });
            } else {
              // Fallback to current player if somehow currentActionPlayer is not set
              events.setActivePlayers({ currentPlayer: 'action' });
            }
            
            return updatedG;
          },
          
          skipReaction: function skipReaction({ G, ctx, playerID, events }) {
            // Skip the reaction and clear pending reactions for this player
            
            // Clear pending reactions for this player
            const updatedPendingReactions = G.pendingReactions ? 
              G.pendingReactions.filter(reaction => reaction.target !== playerID) : [];
            
            // Return control to the action player if no more pending reactions
            if (updatedPendingReactions.length === 0) {
              if (G.currentActionPlayer) {
                events.setActivePlayers({ value: { [G.currentActionPlayer]: 'action' } });
              } else {
                // Fallback to current player if somehow currentActionPlayer is not set
                events.setActivePlayers({ currentPlayer: 'action' });
              }
            }
            
            // Record the action of skipping a reaction
            const isAttacker = playerID === G.attacker?.id;
            const newAction: GameAction = {
              playerRole: isAttacker ? 'attacker' : 'defender',
              actionType: 'skipReaction',
              timestamp: Date.now(),
              payload: {}
            };
            
            return {
              ...G,
              pendingReactions: updatedPendingReactions,
              reactionComplete: updatedPendingReactions.length === 0,
              actions: [...G.actions, newAction],
              message: 'Reaction skipped'
            };
          }
        },
        next: 'end'
      },

      // End Stage: Resolve effects and perform clean-up
      end: {
        moves: {
          surrender: ({ G, ctx, playerID, events }) => {
            console.log('Player surrendered:', playerID);
            
            // Determine which player surrendered and set the other as winner
            const winner = playerID === G.attacker?.id ? 'defender' as PlayerRole : 'attacker' as PlayerRole;
            const surrenderer = playerID === G.attacker?.id ? 'attacker' as PlayerRole : 'defender' as PlayerRole;
            
            // Create updated game state
            const updatedG = {
              ...G,
              gamePhase: 'gameOver' as const,
              gameEnded: true,
              winner,
              message: `${surrenderer} has surrendered! ${winner} wins the game!`
            };
            
            // CRITICAL: Transition to the gameOver phase in boardgame.io
            // This is needed so the chat functionality works properly
            events.setPhase('gameOver');
            
            return updatedG;
          },
          
          finalizeTurn: function finalizeTurn({ G, ctx, events }: FnContext<GameState>) {
            // Get current active player
            const isAttacker = G.currentTurn === 'attacker';
            const currentPlayer = isAttacker ? G.attacker : G.defender;
            
            if (!currentPlayer) {
              return { ...G, message: 'Player not found' };
            }
            
            // Deep copy the player to avoid reference issues
            let updatedPlayer = JSON.parse(JSON.stringify(currentPlayer));
            
            // Always draw exactly 2 cards at end of turn, but respect maximum hand size
            const maxHandSize = G.gameConfig.maxHandSize; // Max hand size from config
            const cardsToDrawPerTurn = G.gameConfig.cardsDrawnPerTurn; // Cards to draw from config
            
            // Calculate how many cards we can draw without exceeding max hand size
            const currentHandSize = updatedPlayer.hand?.length || 0;
            const cardsToDrawCount = Math.min(cardsToDrawPerTurn, maxHandSize - currentHandSize);
            
            console.log(`End of turn: Drawing ${cardsToDrawCount} cards for ${isAttacker ? 'attacker' : 'defender'} (hand: ${currentHandSize}/${maxHandSize})`);
            
            // Draw cards up to the calculated amount
            if (cardsToDrawCount > 0) {
              for (let i = 0; i < cardsToDrawCount; i++) {
                updatedPlayer = drawCard(updatedPlayer);
              }
            }
            
            // Reset free card cycles counter for next turn
            updatedPlayer.freeCardCyclesUsed = 0;
            
            // Update game state
            const updatedG = {
              ...G,
              [isAttacker ? 'attacker' : 'defender']: updatedPlayer,
              message: 'Turn finalized, ready for next player',
              pendingReactions: [],
              reactionComplete: false,
              currentStage: null,
              currentActionPlayer: undefined // Clear the current action player
            };
            
            // End the turn and move to the next player
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
  // Override the default turn mechanics
  turn: {
    // Make all players active in game over phase
    activePlayers: { all: 'gameOver' },
    // This is critical - we need to enable moves from the parent game
    moveLimit: 0,
    order: {
      // Use the default turn order from the game
      first: (context: FnContext<GameState>) => 0,
      next: (context: FnContext<GameState>) => 0,
      playOrder: (context: FnContext<GameState>) => ['0', '1']
    },
    
    // Define the available moves during the gameOver phase stage
    stages: {
      gameOver: {
        moves: {
          // Chat functionality
          sendChatMessage: ({ G, playerID }: MoveParams<GameState>, content: string) => {
            console.log('SERVER: Received chat message in gameOver stage:', content, 'from player:', playerID);
            
            // Option 1: Mutation style (preferred for simpler code)
            if (!G.chat) {
              G.chat = {
                messages: [],
                lastReadTimestamp: {}
              };
            }
            
            // Determine player role
            const senderRole = playerID === G.attacker?.id ? 'attacker' as PlayerRole : 'defender' as PlayerRole;
            
            // Add message to chat
            const newMessage = {
              id: Date.now().toString(),
              sender: playerID || 'unknown',
              senderRole,
              content,
              timestamp: Date.now(),
              isSystem: false
            };
            
            // Just push the new message to the existing array (mutation)
            G.chat.messages.push(newMessage);
            
            // Do not return anything when using mutation style
            // This fixes the Immer error
          },
          
          // Rematch functionality
          requestRematch: ({ G, playerID }: MoveParams<GameState>) => {
            console.log('SERVER: Rematch requested by player:', playerID);
            
            // Initialize rematchRequested array if it doesn't exist
            const rematchRequested = G.rematchRequested || [];
            
            // Add player to rematch requested list if not already there
            if (playerID && !rematchRequested.includes(playerID)) {
              // Add system message about rematch request
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

          // Surrender functionality (even though the game is over)
          surrender: ({ G, playerID }: MoveParams<GameState>) => {
            console.log('SERVER: Player surrendered in gameOverPhase:', playerID);
            
            // In case someone tries to surrender in the gameOver phase, just log it
            // The game is already over so no need to change winner
            
            // Add system message about surrender
            const newMessage = {
              id: Date.now().toString(),
              sender: 'system',
              senderRole: 'attacker' as PlayerRole,
              content: `${playerID === G.attacker?.id ? 'Attacker' : 'Defender'} has surrendered!`,
              timestamp: Date.now(),
              isSystem: true
            };
            
            const chatMessages = G.chat?.messages || [];
            
            return {
              ...G,
              chat: {
                messages: [...chatMessages, newMessage],
                lastReadTimestamp: G.chat?.lastReadTimestamp || {}
              }
            };
          }
        }
      }
    }
  },

  onBegin: ({ G, ctx }: FnContext<GameState>) => {
    console.log('Game over, winner:', G.winner);
    
    // Calculate game statistics
    const gameDuration = Date.now() - (G.actions[0]?.timestamp || Date.now());
    
    // Count cards played
    const cardsPlayed = G.actions.filter(action => 
      action.actionType === 'playCard' || 
      action.actionType === 'throwCard'
    ).length;
    
    // Count infrastructure state changes
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
      // Count controlled infrastructure
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
    
    // Initialize chat functionality
    const initialChat = {
      messages: [
        {
          id: Date.now().toString(),
          sender: 'system',
          senderRole: 'attacker' as PlayerRole, // Using attacker as system messages
          content: G.winner ? 
            `Game over! ${G.winner === 'attacker' ? 'Attacker' : 'Defender'} has won the game.` : 
            'Game ended in a draw.',
          timestamp: Date.now(),
          isSystem: true
        }
      ],
      lastReadTimestamp: {}
    };
    
    // Return updated game state
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
