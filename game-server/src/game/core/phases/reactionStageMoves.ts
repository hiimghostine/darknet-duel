import type { GameState, GameAction } from 'shared-types/game.types';
import { handleChatMessage } from './chatMoveHandler';
import { handleSurrender } from './surrenderMoveHandler';
import { switchToStage, switchCurrentPlayerToStage, MoveParams } from './phaseUtils';

/**
 * Reaction stage moves for the playing phase
 * Contains all moves available during the reaction stage
 */

export const reactionStageMoves = {
  // Chat functionality
  sendChatMessage: ({ G, playerID }: MoveParams<GameState>, content: string) => {
    handleChatMessage({ G, playerID }, content);
  },

  // Surrender functionality
  surrender: handleSurrender,
  
  // Allow both standard playCard and throwCard moves during reaction stage
  // The isCardPlayable function will ensure only reactive cards can be played
  playCard: function playCard({ G, ctx, playerID, events }: MoveParams<GameState>, cardId: string) {
    // Import and forward to the main playCardMove function
    const { playCardMove } = require('../../actions/playerActions');
    const newG = playCardMove({ G, ctx, playerID }, cardId);
    
    // Return to the action player's action stage after playing a reaction
    if (G.currentActionPlayer && events) {
      switchToStage(events, G.currentActionPlayer, 'action');
    } else if (events) {
      switchCurrentPlayerToStage(events, 'action');
    }
    
    return newG;
  },
  
  throwCard: function throwCard({ G, ctx, playerID, events }: MoveParams<GameState>, cardId: string, targetInfrastructureId: string) {
    // Import and forward to the main throwCardMove function
    const { throwCardMove } = require('../../actions/playerActions');
    const newG = throwCardMove({ G, ctx, playerID }, cardId, targetInfrastructureId);
    
    // Check if the move was successful by comparing if the game state actually changed
    // If only the message changed, it means the move was blocked/invalid
    const moveWasSuccessful = newG !== G && (
      JSON.stringify(G.attacker?.hand) !== JSON.stringify(newG.attacker?.hand) ||
      JSON.stringify(G.defender?.hand) !== JSON.stringify(newG.defender?.hand) ||
      JSON.stringify(G.infrastructure) !== JSON.stringify(newG.infrastructure) ||
      G.attacker?.actionPoints !== newG.attacker?.actionPoints ||
      G.defender?.actionPoints !== newG.defender?.actionPoints
    );
    
    // Only proceed with phase transitions if the move was successful
    if (moveWasSuccessful) {
      // Clear pending reactions for this player
      const updatedPendingReactions = G.pendingReactions ?
        G.pendingReactions.filter(reaction => reaction.target !== playerID) : [];
          
      // Return to the action player's action stage after playing a reaction
      if (G.currentActionPlayer && events) {
        switchToStage(events, G.currentActionPlayer, 'action');
      } else if (events) {
        switchCurrentPlayerToStage(events, 'action');
      }
      
      // Update the game state to include cleared pending reactions
      return {
        ...newG,
        pendingReactions: updatedPendingReactions,
        reactionComplete: updatedPendingReactions.length === 0
      };
    } else {
      // Move was blocked/invalid - stay in reaction mode and just return the error state
      console.log('🚫 REACTION: Move was blocked, staying in reaction mode');
      return newG;
    }
  },
  
  // Keep the legacy playReaction for backward compatibility
  playReaction: function playReaction({ G, ctx, playerID, events }: MoveParams<GameState>, cardId: string) {
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
    if (G.currentActionPlayer && events) {
      switchToStage(events, G.currentActionPlayer, 'action');
    } else if (events) {
      // Fallback to current player if somehow currentActionPlayer is not set
      switchCurrentPlayerToStage(events, 'action');
    }
    
    return updatedG;
  },
  
  skipReaction: function skipReaction({ G, ctx, playerID, events }: MoveParams<GameState>) {
    console.log(`🔄 SKIP REACTION: Player ${playerID} is skipping reaction`);
    
    // Skip the reaction and clear pending reactions for this player
    
    // Clear pending reactions for this player
    const updatedPendingReactions = G.pendingReactions ?
      G.pendingReactions.filter(reaction => reaction.target !== playerID) : [];
    
    console.log(`🔄 SKIP REACTION: Pending reactions before: ${G.pendingReactions?.length || 0}, after: ${updatedPendingReactions.length}`);
    
    // Return control to the action player if no more pending reactions
    if (updatedPendingReactions.length === 0) {
      console.log(`🔄 SKIP REACTION: No more pending reactions, returning to action stage`);
      if (G.currentActionPlayer && events) {
        console.log(`🔄 SKIP REACTION: Switching to action stage for player ${G.currentActionPlayer}`);
        switchToStage(events, G.currentActionPlayer, 'action');
      } else if (events) {
        // Fallback to current player if somehow currentActionPlayer is not set
        console.log(`🔄 SKIP REACTION: Fallback - switching current player to action stage`);
        switchCurrentPlayerToStage(events, 'action');
      }
    } else {
      console.log(`🔄 SKIP REACTION: Still have ${updatedPendingReactions.length} pending reactions`);
    }
    
    // Record the action of skipping a reaction
    const isAttacker = playerID === G.attacker?.id;
    const newAction: GameAction = {
      playerRole: isAttacker ? 'attacker' : 'defender',
      actionType: 'skipReaction',
      timestamp: Date.now(),
      payload: {}
    };
    
    console.log(`🔄 SKIP REACTION: Completed for ${isAttacker ? 'attacker' : 'defender'}`);
    
    return {
      ...G,
      pendingReactions: updatedPendingReactions,
      reactionComplete: updatedPendingReactions.length === 0,
      actions: [...G.actions, newAction],
      message: 'Reaction skipped'
    };
  },
  
  // Hand discard selection functionality (D302 Threat Intelligence Network)
  chooseHandDiscard: ({ G, ctx, playerID, events }: MoveParams<GameState>, args: any) => {
    // Extract cardIds from the parameter object
    const cardIds = Array.isArray(args) ? args : args?.cardIds || [];
    console.log('DEBUG: reactionStage chooseHandDiscard received args:', args);
    console.log('DEBUG: reactionStage extracted cardIds:', cardIds);
    
    const { chooseHandDiscardMove } = require('../../moves/chooseHandDiscard');
    const updatedG = chooseHandDiscardMove(G, ctx, playerID, cardIds);
    
    // After hand choice is resolved, return to action stage
    if (!updatedG.pendingHandChoice) {
      console.log('DEBUG: Hand discard selection completed during reaction, returning to action stage');
      // Hand discard completed, return to action player's action stage
      if (G.currentActionPlayer && events) {
        switchToStage(events, G.currentActionPlayer, 'action');
      } else if (events) {
        switchCurrentPlayerToStage(events, 'action');
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