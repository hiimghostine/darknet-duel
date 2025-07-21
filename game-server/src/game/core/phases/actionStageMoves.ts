import { FnContext } from 'boardgame.io/dist/types/src/types';
import { GameState, GameAction, PlayerRole } from 'shared-types/game.types';
import { drawCard } from '../playerManager';
import { handleSurrender } from './surrenderMoveHandler';

// Import the common types
export type MoveParams<T> = {
  G: T;
  playerID?: string;
  ctx?: any;
  events?: any;
  random?: any;
};

// Helper function to check if the turn should end due to end conditions
function checkEndConditions(G: GameState, ctx: any, events: any): GameState {
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
 * Action Stage Moves - Complete implementation
 * All moves available during the action stage of a turn
 */
export const actionStageMoves = {
  // Chat message functionality
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

  // Surrender functionality - use centralized handler
  surrender: handleSurrender,
  
  // Play card functionality
  playCard: function playCard({ G, ctx, playerID, events }, cardId) {
    // Import and forward to the main playCardMove function
    const { playCardMove } = require('../../actions/playerActions');
    const newG = playCardMove({ G, ctx, playerID }, cardId);
    
    // Check if this card can be reacted to (if it's a reaction-eligible card)
    // FIXED: Use boardgame.io player IDs for validation
    const isAttacker = playerID === '0';
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
      // FIXED: Use boardgame.io player IDs for opponent lookup
      const opponentID = playerID === '0' ? '1' : '0';
      if (opponentID) {
        events.setActivePlayers({ value: { [opponentID]: 'reaction' } });
      }
      
      return updatedG;
    }
    
    // Check end conditions
    return checkEndConditions(newG, ctx, events);
  },
  
  // Cycle card functionality
  cycleCard: function cycleCard({ G, ctx, playerID, events }, cardId) {
    // Import and forward to the main cycleCardMove function
    const { cycleCardMove } = require('../../actions/playerActions');
    const newG = cycleCardMove({ G, ctx, playerID }, cardId);
    
    // Check end conditions
    return checkEndConditions(newG, ctx, events);
  },
  
  // Throw card functionality
  throwCard: function throwCard({ G, ctx, playerID, events }, cardId, targetInfrastructureId) {
    // Import and forward to the main throwCardMove function
    const { throwCardMove } = require('../../actions/playerActions');
    const newG = throwCardMove({ G, ctx, playerID }, cardId, targetInfrastructureId);
    
    // Check if there's a pending chain choice - if so, don't switch to reaction yet
    if (newG.pendingChainChoice) {
      console.log('DEBUG: Found pendingChainChoice, staying in action stage for chain selection');
      return {
        ...newG,
        currentActionPlayer: playerID
      };
    }
    
    // Check if there's a pending card choice (A306 AI-Powered Attack) - if so, don't switch to reaction yet
    if (newG.pendingCardChoice) {
      console.log('DEBUG: Found pendingCardChoice, staying in action stage for card selection');
      return {
        ...newG,
        currentActionPlayer: playerID
      };
    }
    
    // Check if there's a pending hand choice (D302 Threat Intelligence) - if so, don't switch to reaction yet
    if (newG.pendingHandChoice) {
      console.log('DEBUG: Found pendingHandChoice, staying in action stage for hand discard selection');
      return {
        ...newG,
        currentActionPlayer: playerID
      };
    }
    
    // Always allow reaction to a throw card action
    // Store the action player's ID so we can return to them later
    const updatedG = {
      ...newG,
      currentActionPlayer: playerID
    };
    
    // Switch active player to opponent for reaction stage
    // FIXED: Use boardgame.io player IDs for opponent lookup
    const opponentID = playerID === '0' ? '1' : '0';
    if (opponentID) {
      events.setActivePlayers({ value: { [opponentID]: 'reaction' } });
    }
    
    return updatedG;
  },
  
  // End turn functionality
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
        const drawCardFn = require('../playerManager').drawCard;
        updatedPlayer = drawCardFn(updatedPlayer);
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
  },
  
  // Chain target selection functionality
  chooseChainTarget: ({ G, ctx, playerID, events }, targetId) => {
    const { chooseChainTargetMove } = require('../../moves/chooseChainTarget');
    const updatedG = chooseChainTargetMove(G, ctx, playerID, targetId);
    
    // After chain effect is resolved, transition to reaction phase
    if (!updatedG.pendingChainChoice) {
      // Chain effect completed, now allow reaction to the original card
      // FIXED: Use boardgame.io player IDs for opponent lookup
      const opponentID = playerID === '0' ? '1' : '0';
      if (opponentID) {
        events.setActivePlayers({ value: { [opponentID]: 'reaction' } });
      }
    }
    
    return updatedG;
  },
  
  // Card selection from deck functionality (A306 AI-Powered Attack)
  chooseCardFromDeck: ({ G, ctx, playerID, events }, selectedCardId) => {
    const { chooseCardFromDeckMove } = require('../../moves/chooseCardFromDeck');
    const updatedG = chooseCardFromDeckMove(G, ctx, playerID, selectedCardId);
    
    // After card selection is resolved, transition to reaction phase
    if (!updatedG.pendingCardChoice) {
      console.log('DEBUG: Card selection completed, transitioning to reaction phase');
      // Card selection completed, now allow reaction to the original card
      // FIXED: Use boardgame.io player IDs for opponent lookup
      const opponentID = playerID === '0' ? '1' : '0';
      if (opponentID) {
        events.setActivePlayers({ value: { [opponentID]: 'reaction' } });
      }
    }
    
    return updatedG;
  },
  
  // Hand discard selection functionality (D302 Threat Intelligence Network)
  chooseHandDiscard: ({ G, ctx, playerID, events }, args) => {
    // Extract cardIds from the parameter object
    const cardIds = Array.isArray(args) ? args : args?.cardIds || [];
    console.log('DEBUG: chooseHandDiscard received args:', args);
    console.log('DEBUG: extracted cardIds:', cardIds);
    
    const { chooseHandDiscardMove } = require('../../moves/chooseHandDiscard');
    const updatedG = chooseHandDiscardMove(G, ctx, playerID, cardIds);
    
    // After hand choice is resolved, transition to reaction phase
    if (!updatedG.pendingHandChoice) {
      console.log('DEBUG: Hand discard selection completed, transitioning to reaction phase');
      // Hand discard completed, now allow reaction to the original card
      // FIXED: Use boardgame.io player IDs for opponent lookup  
      const opponentID = playerID === '0' ? '1' : '0';
      if (opponentID) {
        events.setActivePlayers({ value: { [opponentID]: 'reaction' } });
      }
    }
    
    return updatedG;
  },
  
  // Developer cheat move
  devCheatAddCard: ({ G, ctx, playerID, events }: MoveParams<GameState>, card: any) => {
    const { devCheatAddCardMove } = require('../../moves/devCheatAddCard');
    return devCheatAddCardMove(G, ctx, playerID, card);
  }
};