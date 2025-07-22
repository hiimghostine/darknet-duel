/**
 * Wildcard Card Resolution System
 * 
 * Centralizes all wildcard card logic including type resolution,
 * validation, and effect application.
 */
import { Card, CardType, AttackVector } from 'shared-types/card.types';
import { GameState, InfrastructureState } from 'shared-types/game.types';
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
    
    // Special case for Incident Containment Protocol (D307) - can only be played as response
    if (card.id.startsWith('D307') || card.specialEffect === 'emergency_restore_shield') {
      return ['response'];
    }
    
    // Special handling for 'special' wildcards based on player role
    if (card.wildcardType === 'special') {
      if (context.playerRole === 'attacker') {
        // Attacker special wildcards (like Lateral Movement) can be exploit or attack
        return ['exploit', 'attack'];
      } else {
        // Defender special wildcards can be shield or fortify
        return ['shield', 'fortify'];
      }
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
    
    // Special case for Incident Containment Protocol (D307) - can only be played as response
    if (card.id.startsWith('D307') || card.specialEffect === 'emergency_restore_shield') {
      return asType === 'response';
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
        // Can exploit secure, fortified, or fortified_weaken infrastructure (NOT shielded - only counter-attacks can target shielded)
        return targetInfrastructure.state === 'secure' ||
               targetInfrastructure.state === 'fortified' ||
               targetInfrastructure.state === 'fortified_weaken';
      
      case 'attack':
        // Can only attack vulnerable infrastructure
        return targetInfrastructure.state === 'vulnerable';
      
      case 'shield':
        // Can shield secure or vulnerable infrastructure (not compromised)
        return targetInfrastructure.state === 'secure' ||
               targetInfrastructure.state === 'vulnerable';
      
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
        
      case 'D301': // Advanced Threat Defense
        if (context.targetInfrastructure) {
          // Prevents reactive attack cards from being played on this infrastructure
          updatedGameState = TemporaryEffectsManager.addEffect(updatedGameState, {
            type: 'prevent_reactions',
            targetId: context.targetInfrastructure.id,
            playerId: context.playerID,
            duration: 2, // Lasts for a full round (both attacker and defender turns)
            sourceCardId: card.id,
            metadata: {
              preventType: 'reactive_attacks',
              description: 'Target infrastructure cannot be compromised by reactive attack cards'
            }
          });
          
          updatedGameState.message = `${card.name} prevents reactive attacks on ${context.targetInfrastructure.name} for 1 turn`;
        }
        break;
        
      case 'D306': // Honeypot Network
        console.log(`🍯 Honeypot Network (${card.id}) detected! Applying temporary_tax effect`);
        
        // Add temporary effect that will tax exploit cards for the specified duration
        const duration = (card as any).duration || 2; // Use card duration or default to 2
        updatedGameState = TemporaryEffectsManager.addEffect(updatedGameState, {
          type: 'temporary_tax',
          playerId: context.playerID,
          duration: duration * 2, // Convert rounds to turns (each round = 2 turns)
          sourceCardId: card.id,
          metadata: {
            taxedCardType: 'exploit',
            taxAmount: 1, // Force discard 1 additional card
            description: 'Whenever attacker plays an exploit card, they must discard 1 additional card'
          }
        });
        
        updatedGameState.message = `${card.name}: Honeypot network deployed! Exploit cards will trigger additional discard for ${duration} rounds.`;
        console.log(`✅ Temporary tax effect applied for ${duration} rounds`);
        break;
        
      default:
        // Card-specific ID handling moved to specialEffect section to avoid duplication
        break;
        
    }
    
    // Handle card-specific effects based on card ID with flexible matching
    if (card.id.startsWith('D302')) { // Threat Intelligence Network
      console.log(`🎯 D302 Threat Intelligence Network detected! Card ID: ${card.id}`);
      
      // Determine target player (opponent)
      // FIXED: Use BoardGame.io player ID for consistent opponent resolution
      const isCurrentAttacker = context.playerID === '0';
      const opponentPlayerId = isCurrentAttacker ? '1' : '0';  // Opponent is always the other player
      
      if (opponentPlayerId) {
        const opponentRole = isCurrentAttacker ? 'defender' : 'attacker';
        console.log(`🎯 D302: Targeting opponent: ${opponentPlayerId} (${opponentRole})`);
        
        try {
          // Import the hand disruption handler
          const { handleHandDisruption } = require('./handDisruption');
          console.log(`🎯 D302: handleHandDisruption imported successfully:`, typeof handleHandDisruption);
          
          console.log(`🎯 D302: Calling handleHandDisruption with:`, {
            targetPlayerId: opponentPlayerId,
            effectType: 'view_and_discard',
            count: 2
          });
          
          // Use existing handDisruption system for view_and_discard effect
          const stateBeforeDisruption = { ...updatedGameState };
          updatedGameState = handleHandDisruption(
            updatedGameState,
            'view_and_discard',
            opponentPlayerId,
            2 // Force discard 2 cards
          );
          
          console.log(`🎯 D302: handleHandDisruption completed. State changes:`, {
            hadPendingHandChoice: !!stateBeforeDisruption.pendingHandChoice,
            hasPendingHandChoice: !!updatedGameState.pendingHandChoice,
            pendingHandChoice: updatedGameState.pendingHandChoice,
            messageChanged: stateBeforeDisruption.message !== updatedGameState.message
          });
        } catch (error) {
          console.error(`❌ D302: Error in handleHandDisruption:`, error);
          updatedGameState.message = `${card.name} failed: Hand disruption error`;
        }
        
        // Add card draw effect for the defender who played this card
        // FIXED: Use BoardGame.io player ID for consistent player resolution
        const isAttacker = context.playerID === '0';
        const currentPlayer = isAttacker ? updatedGameState.attacker : updatedGameState.defender;
        
        if (currentPlayer && currentPlayer.deck && currentPlayer.deck.length > 0) {
          const drawnCard = currentPlayer.deck[0];
          const newHand = [...currentPlayer.hand, drawnCard];
          const newDeck = currentPlayer.deck.slice(1);
          
          // Update the current player's hand and deck
          // FIXED: Use BoardGame.io player ID for consistent player updates
          if (isAttacker) {
            updatedGameState.attacker = {
              ...currentPlayer,
              hand: newHand,
              deck: newDeck
            };
          } else {
            updatedGameState.defender = {
              ...currentPlayer,
              hand: newHand,
              deck: newDeck
            };
          }
          
          console.log(`🎯 D302: Drew 1 card for ${context.playerRole}`);
        }
        
        updatedGameState.message = `${card.name}: Viewing opponent's hand and forcing discard of 2 cards. Drew 1 card.`;
        console.log(`🎯 D302: Effect applied successfully`);
      } else {
        console.error(`❌ D302: Could not determine opponent player`);
        updatedGameState.message = `${card.name} failed: Could not identify opponent`;
      }
    }
    
    // Handle Emergency Response Team (D303) by ID check first
    if (card.id === 'D303' || card.id.startsWith('D303')) {
      console.log(`🚨 Emergency Response Team (${card.id}) detected! Applying mass_restore effect`);
      
      // Restore ALL compromised infrastructure to secure state
      if (updatedGameState.infrastructure) {
        let restoredCount = 0;
        updatedGameState.infrastructure = updatedGameState.infrastructure.map(infra => {
          if (infra.state === 'compromised') {
            restoredCount++;
            console.log(`🔧 Restoring ${infra.name} from compromised to secure`);
            return {
              ...infra,
              state: 'secure' as InfrastructureState,
              vulnerabilities: [] // Clear vulnerabilities like regular response cards
            };
          }
          return infra;
        });
        
        if (restoredCount > 0) {
          updatedGameState.message = `${card.name}: Emergency Response activated! Restored ${restoredCount} compromised infrastructure to secure state.`;
          console.log(`✅ Mass restore completed: ${restoredCount} infrastructure restored`);
        } else {
          updatedGameState.message = `${card.name}: Emergency Response ready, but no compromised infrastructure found.`;
          console.log(`ℹ️ Mass restore completed: No compromised infrastructure to restore`);
        }
      } else {
        console.log(`❌ Mass restore failed: No infrastructure array found`);
        updatedGameState.message = `${card.name} failed: No infrastructure to restore`;
      }
      
      return updatedGameState; // Return early to avoid processing other card effects
    }

    // Handle other card-specific effects based on card ID
    switch (card.id) {
      case 'A307': // Memory Corruption Attack
        console.log(`🔥 Memory Corruption Attack (A307) detected! Applying discard_redraw effect`);
        
        // Import the hand disruption handler
        const { handleHandDisruption } = require('./handDisruption');
        
        // Determine target player (opponent)
        // FIXED: Use BoardGame.io player ID for consistent targeting
        const isAttackerForMemory = context.playerID === '0';
        const targetPlayerId = isAttackerForMemory ? '1' : '0';  // Target opponent
        
        if (targetPlayerId) {
          console.log(`💥 Memory Corruption Attack targeting player: ${targetPlayerId}`);
          updatedGameState = handleHandDisruption(
            updatedGameState,
            'discard_redraw',
            targetPlayerId
          );
          console.log(`✅ Memory Corruption Attack applied successfully`);
        } else {
          console.error(`❌ Memory Corruption Attack failed: Could not determine target player`);
          updatedGameState.message = `Memory Corruption Attack failed: Invalid target`;
        }
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
        
        case 'prevent_reactive_attacks':
          // Advanced Threat Defense - Prevent reactive attack cards for 1 round
          if (context.targetInfrastructure) {
            updatedGameState = TemporaryEffectsManager.addEffect(updatedGameState, {
              type: 'prevent_reactions',
              targetId: context.targetInfrastructure.id,
              playerId: context.playerID,
              duration: 2, // Lasts for a full round (both attacker and defender turns)
              sourceCardId: card.id,
              metadata: {
                preventType: 'reactive_attacks',
                description: 'Target infrastructure cannot be compromised by reactive attack cards'
              }
            });
            
            updatedGameState.message = `${card.name} prevents reactive attacks on ${context.targetInfrastructure.name} for 1 turn`;
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
          // Trigger chain vulnerability effect for Lateral Movement
          console.log(`🔗 Chain vulnerability effect triggered for ${card.name}`);
          const { handleChainVulnerability } = require('./chainEffects');
          
          // Check if there are available targets before triggering
          const secureInfrastructure = updatedGameState.infrastructure?.filter(infra => infra.state === 'secure') || [];
          console.log(`🔗 Available secure infrastructure for chain vulnerability: ${secureInfrastructure.length}`);
          
          if (secureInfrastructure.length === 0) {
            console.log(`🔗 No secure infrastructure available, skipping chain vulnerability effect`);
            updatedGameState.message = `${card.name} played successfully, but no additional infrastructure available to target.`;
          } else {
            updatedGameState = handleChainVulnerability(updatedGameState, card, context.playerID || '');
            console.log(`🔗 Chain vulnerability handler completed. PendingChainChoice: ${updatedGameState.pendingChainChoice ? 'YES' : 'NO'}`);
          }
          break;
        
        case 'chain_security':
          // Trigger chain security effect for Security Automation Suite
          console.log(`🔗 Chain security effect triggered for ${card.name}`);
          const { handleChainSecurity } = require('./chainEffects');
          
          // Check if there are available targets before triggering
          const secureInfrastructureForSecurity = updatedGameState.infrastructure?.filter(infra => infra.state === 'secure') || [];
          console.log(`🔗 Available secure infrastructure for chain security: ${secureInfrastructureForSecurity.length}`);
          
          if (secureInfrastructureForSecurity.length === 0) {
            console.log(`🔗 No secure infrastructure available, skipping chain security effect`);
            updatedGameState.message = `${card.name} played successfully, but no additional infrastructure available to shield.`;
          } else {
            updatedGameState = handleChainSecurity(updatedGameState, card, context.playerID || '');
            console.log(`🔗 Chain security handler completed. PendingChainChoice: ${updatedGameState.pendingChainChoice ? 'YES' : 'NO'}`);
          }
          break;
        
        case 'prevent_exploits':
          // Defensive Hardening Protocol - Prevent exploit cards for 1 round
          if (context.targetInfrastructure) {
            updatedGameState = TemporaryEffectsManager.addEffect(updatedGameState, {
              type: 'prevent_exploits',
              targetId: context.targetInfrastructure.id,
              playerId: context.playerID,
              duration: 2, // Lasts for a full round (both attacker and defender turns)
              sourceCardId: card.id,
              metadata: {
                preventType: 'exploits',
                description: 'Target infrastructure cannot be made vulnerable by Exploit cards'
              }
            });
            
            updatedGameState.message = `${card.name} prevents exploit cards on ${context.targetInfrastructure.name} for 1 turn`;
          }
          break;
        
        case 'discard_redraw':
          // Handle Memory Corruption Attack effect
          console.log(`🔥 Memory Corruption Attack (${card.id}) detected! Applying discard_redraw effect`);
          
          // Import the hand disruption handler
          const { handleHandDisruption } = require('./handDisruption');
          
          // Determine target player (opponent)
          // FIXED: Use BoardGame.io player ID for consistent targeting
          const isAttackerForDiscard = context.playerID === '0';
          const targetPlayerId = isAttackerForDiscard ? '1' : '0';  // Target opponent
          
          if (targetPlayerId) {
            console.log(`💥 Memory Corruption Attack targeting player: ${targetPlayerId}`);
            updatedGameState = handleHandDisruption(
              updatedGameState,
              'discard_redraw',
              targetPlayerId
            );
            console.log(`✅ Memory Corruption Attack applied successfully`);
          } else {
            console.error(`❌ Memory Corruption Attack failed: Could not determine target player`);
            updatedGameState.message = `Memory Corruption Attack failed: Invalid target`;
          }
          break;
          
        case 'intel_disrupt':
          // Handle Threat Intelligence Network effect via generic specialEffect
          console.log(`🎯 Intel disrupt effect detected for card: ${card.id}`);
          
          // Determine target player (opponent)
          // FIXED: Use BoardGame.io player ID for consistent opponent resolution
          const isCurrentAttackerForIntel = context.playerID === '0';
          const opponentPlayerIdForIntel = isCurrentAttackerForIntel ? '1' : '0';
          
          if (opponentPlayerIdForIntel) {
            // Import the hand disruption handler
            const { handleHandDisruption } = require('./handDisruption');
            
            // Use existing handDisruption system for view_and_discard effect
            updatedGameState = handleHandDisruption(
              updatedGameState,
              'view_and_discard',
              opponentPlayerIdForIntel,
              2 // Force discard 2 cards
            );
            
            // Add card draw effect for the defender who played this card
            // FIXED: Use BoardGame.io player ID for consistent player resolution
            const isAttackerForDraw = context.playerID === '0';
            const currentPlayer = isAttackerForDraw ? updatedGameState.attacker : updatedGameState.defender;
            
            if (currentPlayer && currentPlayer.deck && currentPlayer.deck.length > 0) {
              const drawnCard = currentPlayer.deck[0];
              const newHand = [...currentPlayer.hand, drawnCard];
              const newDeck = currentPlayer.deck.slice(1);
              
              // Update the current player's hand and deck
              // FIXED: Use BoardGame.io player ID for consistent player updates
              if (isAttackerForDraw) {
                updatedGameState.attacker = {
                  ...currentPlayer,
                  hand: newHand,
                  deck: newDeck
                };
              } else {
                updatedGameState.defender = {
                  ...currentPlayer,
                  hand: newHand,
                  deck: newDeck
                };
              }
            }
            
            updatedGameState.message = `Intelligence network activated: Opponent must discard 2 cards. Drew 1 card.`;
          }
          break;
          
        case 'mass_restore':
          // Handle Emergency Response Team (D303) effect
          console.log(`🚨 Emergency Response Team (${card.id}) detected! Applying mass_restore effect`);
          
          // Restore ALL compromised infrastructure to secure state
          if (updatedGameState.infrastructure) {
            let restoredCount = 0;
            updatedGameState.infrastructure = updatedGameState.infrastructure.map(infra => {
              if (infra.state === 'compromised') {
                restoredCount++;
                console.log(`🔧 Restoring ${infra.name} from compromised to secure`);
                return {
                  ...infra,
                  state: 'secure' as InfrastructureState,
                  vulnerabilities: [] // Clear vulnerabilities like regular response cards
                };
              }
              return infra;
            });
            
            if (restoredCount > 0) {
              updatedGameState.message = `${card.name}: Emergency Response activated! Restored ${restoredCount} compromised infrastructure to secure state.`;
              console.log(`✅ Mass restore completed: ${restoredCount} infrastructure restored`);
            } else {
              updatedGameState.message = `${card.name}: Emergency Response ready, but no compromised infrastructure found.`;
              console.log(`ℹ️ Mass restore completed: No compromised infrastructure to restore`);
            }
          } else {
            console.log(`❌ Mass restore failed: No infrastructure array found`);
            updatedGameState.message = `${card.name} failed: No infrastructure to restore`;
          }
          break;
          
        case 'temporary_tax':
          // Handle Honeypot Network (D306) effect
          console.log(`🍯 Honeypot Network (${card.id}) detected! Applying temporary_tax effect`);
          
          // Add temporary effect that will tax exploit cards for the specified duration
          const duration = (card as any).duration || 2; // Use card duration or default to 2
          updatedGameState = TemporaryEffectsManager.addEffect(updatedGameState, {
            type: 'temporary_tax',
            playerId: context.playerID,
            duration: duration * 2, // Convert rounds to turns (each round = 2 turns)
            sourceCardId: card.id,
            metadata: {
              taxedCardType: 'exploit',
              taxAmount: 1, // Force discard 1 additional card
              description: 'Whenever attacker plays an exploit card, they must discard 1 additional card'
            }
          });
          
          updatedGameState.message = `${card.name}: Honeypot network deployed! Exploit cards will trigger additional discard for ${duration} rounds.`;
          console.log(`✅ Temporary tax effect applied for ${duration} rounds`);
          break;
          
        case 'emergency_restore_shield':
          // Handle Incident Containment Protocol (D307) effect - MASS EFFECT
          console.log(`🚨 Incident Containment Protocol (${card.id}) detected! Applying emergency_restore_shield effect to ALL compromised infrastructure`);
          
          if (context.targetInfrastructure && context.targetInfrastructure.state === 'compromised') {
            // Restore ALL compromised infrastructure to shielded state (not just the target)
            if (updatedGameState.infrastructure) {
              let restoredCount = 0;
              updatedGameState.infrastructure = updatedGameState.infrastructure.map(infra => {
                if (infra.state === 'compromised') {
                  restoredCount++;
                  console.log(`🔧 Emergency containment: ${infra.name} from compromised to shielded`);
                  return {
                    ...infra,
                    state: 'shielded' as InfrastructureState, // Restore and immediately shield
                    vulnerabilities: [], // Clear vulnerabilities like regular response cards
                    shields: [
                      ...(infra.shields || []),
                      {
                        vector: 'network' as AttackVector, // Default shield type for emergency protocol
                        appliedBy: card.id,
                        appliedByPlayer: context.playerID || '',
                        timestamp: Date.now()
                      }
                    ]
                  };
                }
                return infra;
              });
              
              updatedGameState.message = `${card.name}: Emergency containment protocol activated! Restored and shielded ${restoredCount} compromised infrastructure.`;
              console.log(`✅ Emergency containment completed: ${restoredCount} infrastructure restored and shielded`);
            } else {
              console.log(`❌ Emergency containment failed: No infrastructure array found`);
              updatedGameState.message = `${card.name} failed: No infrastructure to restore`;
            }
          } else {
            console.log(`❌ Emergency containment failed: Target not compromised or missing`);
            updatedGameState.message = `${card.name} can only target compromised infrastructure`;
          }
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
      console.log(`🔍 DEBUG A305: context.playerID="${context.playerID}", context.playerRole="${context.playerRole}"`);
      console.log(`🔍 DEBUG A305: gameState.attacker.id="${context.gameState.attacker?.id}", gameState.defender.id="${context.gameState.defender?.id}"`);
      
      // CORRECTED: Multi-Stage Malware should only trigger on vulnerable → compromised
      // This is because A305 is an exploit wildcard, so it first makes infrastructure vulnerable
      const persistentEffect: PersistentEffect = {
        type: 'on_compromise',
        targetId: context.targetInfrastructure.id,
        playerId: context.playerID,
        sourceCardId: card.id,
        condition: {
          fromState: 'vulnerable',  // CORRECTED: Only trigger when going from vulnerable to compromised
          toState: 'compromised'
        },
        reward: {
          effect: 'gain_ap',
          amount: card.onCompromise?.amount || 2  // Use the correct amount from the card definition
        },
        autoRemove: true,  // Remove after triggering once
        triggered: false
      };
      
      console.log(`🔍 DEBUG A305: Created persistent effect with playerId="${persistentEffect.playerId}" (condition: ${persistentEffect.condition.fromState} → ${persistentEffect.condition.toState})`);
      updatedGameState = TemporaryEffectsManager.addPersistentEffect(updatedGameState, persistentEffect);
      updatedGameState.message = `${card.name} is monitoring ${context.targetInfrastructure.name} for compromise...`;
      
      console.log(`🎯 Persistent effect created for A305. Total persistent effects: ${updatedGameState.persistentEffects?.length || 0}`);
      console.log(`🎯 Persistent effects array:`, updatedGameState.persistentEffects);
    }

    // Handle A306 - AI-Powered Attack (with flexible ID matching)
    if (card.id.startsWith('A306') && context.playerID) {
      console.log(`🎯 A306 AI-Powered Attack detected! Card ID: ${card.id}`);
      
      // FIXED: Use BoardGame.io player ID for consistent player resolution
      const isAttacker = context.playerID === '0';  // ← Use actual playerID, not context.playerRole
      const currentPlayer = isAttacker ? updatedGameState.attacker : updatedGameState.defender;
      
      console.log(`🎯 A306: Player ID: ${context.playerID}, isAttacker: ${isAttacker}`);
      console.log(`🎯 A306: Player role (context): ${context.playerRole}, resolved role: ${isAttacker ? 'attacker' : 'defender'}`);
      console.log(`🎯 A306: Current player exists: ${!!currentPlayer}`);
      console.log(`🎯 A306: Deck exists: ${!!currentPlayer?.deck}`);
      console.log(`🎯 A306: Deck length: ${currentPlayer?.deck?.length || 0}`);
      
      if (currentPlayer && currentPlayer.deck && currentPlayer.deck.length > 0) {
        // Get top 3 cards from deck (or all remaining if less than 3)
        const cardsToShow = Math.min(3, currentPlayer.deck.length);
        const topCards = currentPlayer.deck.slice(0, cardsToShow);
        
        console.log(`🎯 A306: Cards to show: ${cardsToShow}`);
        console.log(`🎯 A306: Top cards:`, topCards.map(c => c.name));
        console.log(`🎯 A306: DECK STATE DEBUG - Current deck IDs:`, currentPlayer.deck.map(c => c.id));
        console.log(`🎯 A306: DECK STATE DEBUG - Top card IDs being offered:`, topCards.map(c => c.id));
        
        // ROBUST: Create deep copies of cards to prevent reference issues
        const availableCards = topCards.map(card => ({ ...card }));
        
        // Set up pending card choice with enhanced debugging
        updatedGameState.pendingCardChoice = {
          playerId: context.playerID,
          availableCards: availableCards,
          choiceType: 'deck_selection' as const,
          sourceCardId: card.id,
          timestamp: Date.now()
        };
        
        console.log(`🎯 A306: Created pendingCardChoice for player ${context.playerID}`);
        console.log(`🎯 A306: DECK STATE DEBUG - Original deck size: ${currentPlayer.deck.length}`);
        console.log(`🎯 A306: DECK STATE DEBUG - Original top card IDs: ${topCards.map(c => c.id)}`);
        console.log(`🎯 A306: DECK STATE DEBUG - pendingCardChoice availableCards IDs:`, availableCards.map(c => c.id));
        updatedGameState.message = `${card.name}: Choose a card from the top ${cardsToShow} cards of your deck`;
      } else {
        console.log(`🎯 A306: Failed to create card choice - missing requirements`);
        if (!currentPlayer) console.log(`🎯 A306: No current player`);
        if (!currentPlayer?.deck) console.log(`🎯 A306: No deck`);
        if (currentPlayer?.deck?.length === 0) console.log(`🎯 A306: Empty deck`);
      }
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
