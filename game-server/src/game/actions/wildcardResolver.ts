/**
 * Wildcard Card Resolution System
 * 
 * Centralizes all wildcard card logic including type resolution,
 * validation, and effect application.
 */
import { Card, CardType, AttackVector } from 'shared-types/card.types';
import { GameState } from 'shared-types/game.types';
import { getAvailableCardTypes } from '../utils/wildcardUtils';
import { InfrastructureCard } from 'shared-types/game.types';
import { TemporaryEffectsManager, TemporaryEffect, PersistentEffect } from './temporaryEffectsManager';

export interface WildcardPlayContext {
  gameState: GameState;
  playerRole: 'attacker' | 'defender';
  card: Card;
  targetInfrastructure?: InfrastructureCard;
  chosenType?: CardType; // Player's choice
  playerID?: string;
}

export class WildcardResolver {
  /**
   * Resolve a wildcard card to a specific card type
   * Uses player's choice if provided, otherwise intelligently selects the best type
   * 
   * @param card The wildcard card
   * @param chosenType Optional player-chosen type
   * @returns The resolved card type
   */
  static resolveWildcardType(card: Card, chosenType?: CardType): CardType {
    // If card is not a wildcard, return its original type
    if (card.type !== 'wildcard' || !card.wildcardType) {
      return card.type;
    }
    
    // Get all available types for this wildcard
    const availableTypes = getAvailableCardTypes(card.wildcardType);
    
    // If player chose a type and it's valid, use it
    if (chosenType && availableTypes.includes(chosenType)) {
      return chosenType;
    }
    
    // If no valid choice, default to the first available type or the card's original type
    return availableTypes.length > 0 ? availableTypes[0] : card.type;
  }
  
  /**
   * Get all available card types that this wildcard can be played as
   * Filters based on current game context (e.g., valid targets)
   * 
   * @param card The wildcard card
   * @param context The current play context
   * @returns Array of valid card types
   */
  static getAvailableTypes(card: Card, context: WildcardPlayContext): CardType[] {
    if (card.type !== 'wildcard' || !card.wildcardType) {
      return [card.type]; // Not a wildcard, so only its own type is available
    }
    
    // Get basic available types from the card
    const basicTypes = getAvailableCardTypes(card.wildcardType);
    
    // Filter types based on context (target validity, game state, etc.)
    return basicTypes.filter(type => this.canPlayAs(card, type, context));
  }
  
  /**
   * Check if a wildcard card can be played as a specific type
   * in the current game context
   * 
   * @param card The wildcard card
   * @param asType The target card type to play as
   * @param context The current play context
   * @returns True if the card can be played as the specified type
   */
  static canPlayAs(card: Card, asType: CardType, context: WildcardPlayContext): boolean {
    // Not a wildcard, can only be played as its own type
    if (card.type !== 'wildcard') {
      return card.type === asType;
    }
    
    // No wildcardType specified, can't be played as anything
    if (!card.wildcardType) {
      return false;
    }
    
    // Check if the type is in the available types for this card
    const availableTypes = getAvailableCardTypes(card.wildcardType);
    if (!availableTypes.includes(asType)) {
      return false;
    }
    
    // Additional context-based validations
    const { targetInfrastructure, gameState } = context;
    
    // If no target infrastructure, only certain card types are valid
    if (!targetInfrastructure) {
      // These card types require no target
      return ['counter-attack', 'counter', 'reaction'].includes(asType);
    }
    
    // Check if the target infrastructure is valid for the card type
    switch (asType) {
      case 'exploit':
        // Can only exploit secure or shield-protected infrastructure
        return targetInfrastructure.state === 'secure' || 
               targetInfrastructure.state === 'shielded';
      
      case 'attack':
        // Can only attack vulnerable infrastructure
        return targetInfrastructure.state === 'vulnerable';
      
      case 'shield':
        // Can only shield secure or compromised infrastructure
        return targetInfrastructure.state === 'secure' || 
               targetInfrastructure.state === 'compromised';
      
      case 'fortify':
        // Can only fortify shielded infrastructure
        return targetInfrastructure.state === 'shielded';
      
      case 'response':
        // Can only respond to compromised infrastructure
        return targetInfrastructure.state === 'compromised';
      
      default:
        // For other types, no specific target validation
        return true;
    }
  }
  
  /**
   * Apply special wildcard effects based on the card's specialEffect
   * and update the game state accordingly
   * 
   * @param card The wildcard card
   * @param context The current play context
   * @returns Updated game state with wildcard effects applied
   */
  static applyWildcardEffects(card: Card, context: WildcardPlayContext): GameState {
    const { gameState } = context;
    let updatedGameState = { ...gameState };
    
    // If not a wildcard, return unchanged
    if (card.type !== 'wildcard') {
      return updatedGameState;
    }
    
    // Handle card-specific effects based on card ID
    switch (card.id) {
      case 'A301': // Advanced Persistent Threat
        if (context.targetInfrastructure) {
          // Prevents reaction cards from being played on this infrastructure
          updatedGameState = TemporaryEffectsManager.addEffect(updatedGameState, {
            type: 'prevent_reactions',
            targetId: context.targetInfrastructure.id,
            playerId: context.playerID,
            duration: 2, // Lasts for a full round (both attacker and defender turns)
            sourceCardId: card.id
          });
          
          updatedGameState.message = `${card.name} prevents reactions on this infrastructure for 1 round`;
        }
        break;
        
      case 'A306': // AI-Powered Attack
        // Look at top 3 cards of deck and choose 1 to add to hand
        const isAttacker = context.playerRole === 'attacker';
        const currentPlayer = isAttacker ? updatedGameState.attacker : updatedGameState.defender;
        
        if (currentPlayer && currentPlayer.deck && currentPlayer.deck.length > 0 && context.playerID) {
          // Get top 3 cards from deck (or all remaining if less than 3)
          const cardsToShow = Math.min(3, currentPlayer.deck.length);
          const topCards = currentPlayer.deck.slice(0, cardsToShow);
          
          // Set up pending card choice
          updatedGameState.pendingCardChoice = {
            playerId: context.playerID,
            availableCards: topCards,
            choiceType: 'deck_selection',
            sourceCardId: card.id,
            timestamp: Date.now()
          };
          
          updatedGameState.message = `${card.name}: Choose a card from the top ${cardsToShow} cards of your deck`;
        }
        break;
        
      case 'A302': // Living Off The Land
        // Cost reduction is handled in the throwCardMove logic
        if (context.targetInfrastructure?.type === 'user') {
          updatedGameState.message = `${card.name} used efficiently on user systems (-1 AP)`;
        }
        break;
        
      case 'A304': // Privilege Escalation
        if (context.targetInfrastructure) {
          // Prevents restoration of this infrastructure for 1 round
          updatedGameState = TemporaryEffectsManager.addEffect(updatedGameState, {
            type: 'prevent_restore',
            targetId: context.targetInfrastructure.id,
            duration: 2, // Lasts for a full round (both attacker and defender turns)
            sourceCardId: card.id
          });
          
          updatedGameState.message = `${card.name} prevents restoration on this infrastructure for 1 round`;
        }
        break;
        
      case 'D301': // Zero Trust Architecture
        // This needs special handling in the validation system
        if (context.targetInfrastructure) {
          updatedGameState.message = `${card.name} requires 2 matching exploits to compromise`;
        }
        break;
        
      case 'D304': // Threat Intelligence
        // This needs special UI for hand viewing and selection
        // For now, just add a message
        updatedGameState.message = `${card.name} reveals attacker's hand`;
        break;
    }
    
    // Handle generic special effects
    if (card.specialEffect) {
      switch (card.specialEffect) {
        case 'prevent_reactions':
          // Prevent reactions for 1 round
          if (context.targetInfrastructure) {
            updatedGameState = TemporaryEffectsManager.addEffect(updatedGameState, {
              type: 'prevent_reactions',
              targetId: context.targetInfrastructure.id,
              playerId: context.playerID,
              duration: 2, // Lasts for a full round (both attacker and defender turns)
              sourceCardId: card.id
            });
          }
          break;
        
        case 'prevent_restore':
          // Prevent restore effects for 1 round
          if (context.targetInfrastructure) {
            updatedGameState = TemporaryEffectsManager.addEffect(updatedGameState, {
              type: 'prevent_restore',
              targetId: context.targetInfrastructure.id,
              duration: 2, // Lasts for a full round (both attacker and defender turns)
              sourceCardId: card.id
            });
          }
          break;
          
        case 'chain_vulnerability':
          // Mark that we need to make another infrastructure vulnerable
          updatedGameState = TemporaryEffectsManager.addEffect(updatedGameState, {
            type: 'chain_vulnerability',
            playerId: context.playerID,
            duration: 0, // Immediate effect
            sourceCardId: card.id
          });
          break;
        
        case 'discard_redraw':
          // Handle discard and redraw effect
          // This would normally be handled by a separate move
          break;
          
        default:
          // No recognized special effect
          break;
      }
    }
    
    // Handle other wildcard-specific effects
    if (card.draw && card.draw > 0) {
      // Logic to draw cards would go here
      // This is typically handled elsewhere in the game engine
    }
    
    // Handle looking at top cards
    if (card.lookAt && card.lookAt > 0) {
      // Logic to look at top cards would go here
    }
    
    // Handle specific card effects - check for A305 (Multi-Stage Malware) with flexible ID matching
    console.log(`🔍 Checking A305 condition: card.id="${card.id}", startsWith A305: ${card.id.startsWith('A305')}, hasTarget: ${!!context.targetInfrastructure}, hasPlayerID: ${!!context.playerID}`);
    
    if (card.id.startsWith('A305') && context.targetInfrastructure && context.playerID) {
      console.log(`✅ A305 Multi-Stage Malware detected! Creating persistent effect for ${context.targetInfrastructure.name}`);
      
      // Multi-Stage Malware: Create persistent effect to watch for compromise
      const persistentEffect: PersistentEffect = {
        type: 'on_compromise',
        targetId: context.targetInfrastructure.id,
        playerId: context.playerID,
        sourceCardId: card.id,
        condition: {
          fromState: 'vulnerable',  // Only trigger when going from vulnerable to compromised
          toState: 'compromised'
        },
        reward: {
          effect: 'gain_ap',
          amount: card.onCompromise?.amount || 1
        },
        autoRemove: true,  // Remove after triggering once
        triggered: false
      };
      
      updatedGameState = TemporaryEffectsManager.addPersistentEffect(updatedGameState, persistentEffect);
      updatedGameState.message = `${card.name} is monitoring ${context.targetInfrastructure.name} for compromise...`;
      
      console.log(`🎯 Persistent effect created for A305. Total persistent effects: ${updatedGameState.persistentEffects?.length || 0}`);
      console.log(`🎯 Persistent effects array:`, updatedGameState.persistentEffects);
    }

    // Handle on compromise effects (legacy support for other cards)
    if (card.onCompromise && context.targetInfrastructure?.state === 'compromised') {
      // Apply on compromise effects
      if (card.onCompromise.effect === 'gain_ap' && card.onCompromise.amount) {
        // Logic to add AP to the player
        // Would need access to player state
      }
    }
    
    return updatedGameState;
  }
}
