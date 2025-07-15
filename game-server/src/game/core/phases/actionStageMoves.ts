import type { GameState } from 'shared-types/game.types';
import type { Ctx } from 'boardgame.io';
import { handleChatMessage } from './chatMoveHandler';
import { handleSurrender } from './surrenderMoveHandler';
import { checkEndConditions, getOpponentId, switchToStage, isReactionEligible, MoveParams } from './phaseUtils';

/**
 * Action stage moves for the playing phase
 * Contains all moves available during the action stage
 */

export const actionStageMoves = {
  // Chat functionality
  sendChatMessage: ({ G, playerID }: MoveParams<GameState>, content: string) => {
    handleChatMessage({ G, playerID }, content);
  },

  // Surrender functionality
  surrender: handleSurrender,
  
  // Play card move
  playCard: function playCard({ G, ctx, playerID, events }: MoveParams<GameState>, cardId: string) {
    // Import and forward to the main playCardMove function
    const { playCardMove } = require('../../actions/playerActions');
    const newG = playCardMove({ G, ctx, playerID }, cardId);
    
    // Check if this card can be reacted to (if it's a reaction-eligible card)
    const isAttacker = playerID === G.attacker?.id;
    const currentPlayer = isAttacker ? G.attacker : G.defender;
    const card = currentPlayer?.hand.find((c: any) => c.id === cardId);
    
    // Check if the card type is eligible for reaction
    const reactionEligible = card && isReactionEligible(card.type);
    
    if (reactionEligible) {
      // Store the action player's ID so we can return to them later
      const updatedG = {
        ...newG,
        currentActionPlayer: playerID
      };
      
      // Switch active player to opponent for reaction stage
      const opponentID = getOpponentId(G, playerID || '');
      if (opponentID && events) {
        switchToStage(events, opponentID, 'reaction');
      }
      
      return updatedG;
    }
    
    // Check end conditions
    return ctx ? checkEndConditions(newG, ctx, events) : newG;
  },
  
  // Cycle card move
  cycleCard: function cycleCard({ G, ctx, playerID, events }: MoveParams<GameState>, cardId: string) {
    // Import and forward to the main cycleCardMove function
    const { cycleCardMove } = require('../../actions/playerActions');
    const newG = cycleCardMove({ G, ctx, playerID }, cardId);
    
    // Check end conditions
    return ctx ? checkEndConditions(newG, ctx, events) : newG;
  },
  
  // Throw card move
  throwCard: function throwCard({ G, ctx, playerID, events }: MoveParams<GameState>, cardId: string, targetInfrastructureId: string) {
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
    
    // Always allow reaction to a throw card action
    // Store the action player's ID so we can return to them later
    const updatedG = {
      ...newG,
      currentActionPlayer: playerID
    };
    
    // Switch active player to opponent for reaction stage
    const opponentID = getOpponentId(G, playerID || '');
    if (opponentID && events) {
      switchToStage(events, opponentID, 'reaction');
    }
    
    return updatedG;
  },
  
  // End turn move
  endTurn: ({ G, ctx, events }: MoveParams<GameState>) => {
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
    if (events) {
      events.endTurn();
    }
    
    return updatedG;
  },
  
  // Chain target selection move
  chooseChainTarget: ({ G, ctx, playerID, events }: MoveParams<GameState>, targetId: string) => {
    const { chooseChainTargetMove } = require('../../moves/chooseChainTarget');
    const updatedG = chooseChainTargetMove(G, ctx, playerID, targetId);
    
    // After chain effect is resolved, transition to reaction phase
    if (!updatedG.pendingChainChoice) {
      // Chain effect completed, now allow reaction to the original card
      const opponentID = getOpponentId(G, playerID || '');
      if (opponentID && events) {
        switchToStage(events, opponentID, 'reaction');
      }
    }
    
    return updatedG;
  }
};