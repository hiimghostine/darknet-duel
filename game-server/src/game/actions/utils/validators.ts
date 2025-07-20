import { InfrastructureCard, InfrastructureState, GameState } from 'shared-types/game.types';
import { AttackVector, Vulnerability, Card } from 'shared-types/card.types';
import { TemporaryEffectsManager, TemporaryEffect } from '../temporaryEffectsManager';

/**
 * Validate that a card can target an infrastructure based on type and state
 * Also checks for temporary effects that might prevent certain actions
 */
export function validateCardTargeting(
  cardType: string,
  infrastructure: InfrastructureCard,
  attackVector?: AttackVector,
  gameState?: GameState,
  card?: Card,
  playerID?: string // Added playerID to check player-specific effects
): { valid: boolean, message?: string, bypassCost?: boolean } { // Added bypassCost flag
  // Default validation result
  const invalid = { valid: false, message: "Invalid target for this card" };
  
  console.log(`DEBUG VALIDATION: Card type: ${cardType}, Infrastructure: ${infrastructure.name} (${infrastructure.state}), Attack Vector: ${attackVector}`);
  
  // Check temporary effects that might prevent certain actions
  if (gameState) {
    // Check if reactions are prevented
    if (cardType === 'reaction' && 
        TemporaryEffectsManager.hasEffect(gameState as GameState, 'prevent_reactions', infrastructure.id)) {
      return { valid: false, message: "This infrastructure is protected from reactions" };
    }
    
    // Check if restoration is prevented
    if (cardType === 'response' && 
        TemporaryEffectsManager.hasEffect(gameState as GameState, 'prevent_restore', infrastructure.id)) {
      return { valid: false, message: "This infrastructure cannot be restored" };
    }
    
    // PHASE 2: Check for chain vulnerability - makes all exploits valid on this infra
    if (cardType === 'exploit' && 
        TemporaryEffectsManager.hasEffect(gameState as GameState, 'chain_vulnerability' as any, infrastructure.id)) {
      // If the infrastructure has chain_vulnerability, all exploits are valid
      // This overrides other validation checks for exploits
      return { valid: true, message: "Exploit valid due to chain vulnerability" };
    }
    
    // PHASE 2: Check infrastructure targeting restrictions
    if (playerID && TemporaryEffectsManager.hasEffect(gameState as GameState, 'restrict_targeting' as any, playerID)) {
      // Get the effect details to see what targets are restricted
      const restrictionEffects = gameState.temporaryEffects?.filter(e => 
        (e as TemporaryEffect).type === 'restrict_targeting' && e.targetId === playerID) || [];
      
      for (const effect of restrictionEffects as TemporaryEffect[]) {
        // Check if this specific infrastructure is in the restricted list
        if (effect.metadata && effect.metadata.restrictedTargets?.includes(infrastructure.id)) {
          return { valid: false, message: "You cannot target this infrastructure due to effect restrictions" };
        }
        
        // Check if this infrastructure type is in the restricted list
        if (effect.metadata && effect.metadata.restrictedTypes?.includes(infrastructure.type)) {
          return { valid: false, message: `You cannot target ${infrastructure.type} infrastructure due to effect restrictions` };
        }
      }
    }
    
    // Handle Zero Trust Architecture special validation (requires 2 matching exploits)
    if (card && card.id === 'D301' && infrastructure.state === 'secure') {
      // Only if we're trying to exploit it
      if (cardType === 'exploit' && attackVector) {
        // Count matching vulnerabilities
        const existingVulns = infrastructure.vulnerabilities?.filter(v => {
          if (typeof v === 'string') {
            return v === attackVector;
          } else if (typeof v === 'object' && v !== null) {
            return v.vector === attackVector;
          }
          return false;
        }).length || 0;
        
        if (existingVulns < 1) {
          return { valid: false, message: "Zero Trust Architecture requires matching exploits" };
        }
      }
    }
    
    // PHASE 2: Handle Quantum Resistant Cryptography (D304) - requires specific attack vectors
    if (card && card.id === 'D304' && cardType === 'shield') {
      // Additional validation for Quantum Resistant Cryptography
      // Check if the infrastructure already has quantum protection
      const hasQuantumProtection = gameState.temporaryEffects?.some(
        e => (e as TemporaryEffect).type === 'quantum_protection' && e.targetId === infrastructure.id
      ) || false;
      
      if (hasQuantumProtection) {
        return { valid: false, message: "This infrastructure already has quantum protection" };
      }
    }
    
    // PHASE 2: Handle Honeypot (D303) - can only be applied to vulnerable infrastructure
    if (card && card.id === 'D303' && infrastructure.state !== 'vulnerable') {
      return { valid: false, message: "Honeypot can only be applied to vulnerable infrastructure" };
    }
  }
  
  // Helper function to check if attack vector matches infrastructure vulnerabilities
  const checkVectorCompatibility = (attackVector?: AttackVector): { valid: boolean; message?: string } => {
    if (!attackVector) {
      return { valid: true }; // No vector specified, allow it
    }
    
    // Check if infrastructure has vulnerableVectors (for targeting)
    if (infrastructure.vulnerableVectors && infrastructure.vulnerableVectors.length > 0) {
      if (!infrastructure.vulnerableVectors.includes(attackVector)) {
        return {
          valid: false,
          message: `This infrastructure is not vulnerable to ${attackVector} attacks. Vulnerable to: ${infrastructure.vulnerableVectors.join(', ')}`
        };
      }
    }
    
    return { valid: true };
  };

  switch (cardType) {
    case 'exploit':
      // Exploit cards can target secure, fortified, or fortified_weaken infrastructure
      if (infrastructure.state !== 'secure' &&
          infrastructure.state !== 'fortified' &&
          infrastructure.state !== 'fortified_weaken') {
        return {
          valid: false,
          message: "Exploit cards can only target secure or fortified infrastructure"
        };
      }
      
      // Check attack vector compatibility for exploit cards
      const exploitVectorCheck = checkVectorCompatibility(attackVector);
      if (!exploitVectorCheck.valid) {
        return exploitVectorCheck;
      }
      
      return { valid: true };
      
    case 'attack':
      // Attack cards can only target vulnerable infrastructure with matching vulnerability
      if (infrastructure.state !== 'vulnerable') {
        return { valid: false, message: "Attack cards can only target vulnerable infrastructure" };
      }
      
      // PHASE 2: Special handling for Living Off The Land (A302)
      // It can bypass attack vector restrictions when targeting user infrastructure
      if (card && card.id === 'A302' && infrastructure.type === 'user') {
        // Living Off The Land can always target user infrastructure regardless of vector
        // and gets a cost reduction
        return { valid: true, message: "Living Off The Land can target any user infrastructure", bypassCost: true };
      }
      
      // If attack vector is specified, check for matching vulnerability
      if (attackVector && (!infrastructure.vulnerabilities || 
          !infrastructure.vulnerabilities.some(v => {
            // Handle both string vulnerabilities and object vulnerabilities
            if (typeof v === 'string') {
              return v === attackVector;
            } else if (typeof v === 'object' && v !== null) {
              return v.vector === attackVector;
            }
            return false;
          }))) {
        return { 
          valid: false, 
          message: `This infrastructure is not vulnerable to ${attackVector} attacks` 
        };
      }
      return { valid: true };
      
    case 'shield':
      // Shield cards can target secure or vulnerable infrastructure (not compromised, shielded, or fortified)
      if (infrastructure.state !== 'secure' && infrastructure.state !== 'vulnerable') {
        return {
          valid: false,
          message: "Shield cards can only target secure or vulnerable infrastructure"
        };
      }
      
      // Check attack vector compatibility for shield cards
      const shieldVectorCheck = checkVectorCompatibility(attackVector);
      if (!shieldVectorCheck.valid) {
        return shieldVectorCheck;
      }
      
      return { valid: true };
      
    case 'fortify':
      // Fortify cards can only target shielded infrastructure
      if (infrastructure.state !== 'shielded') {
        return { valid: false, message: "Fortify cards can only target shielded infrastructure" };
      }
      
      // Check attack vector compatibility for fortify cards
      const fortifyVectorCheck = checkVectorCompatibility(attackVector);
      if (!fortifyVectorCheck.valid) {
        return fortifyVectorCheck;
      }
      
      return { valid: true };
      
    case 'response':
      // Response cards can only target compromised infrastructure
      if (infrastructure.state !== 'compromised') {
        return { valid: false, message: "Response cards can only target compromised infrastructure" };
      }
      
      // Check attack vector compatibility for response cards
      const responseVectorCheck = checkVectorCompatibility(attackVector);
      if (!responseVectorCheck.valid) {
        return responseVectorCheck;
      }
      
      return { valid: true };
      
    case 'counter-attack':
    case 'counter':
      // Counter-attack cards should specifically target shielded infrastructure when in reaction mode
      if (infrastructure.state !== 'shielded') {
        return { valid: false, message: "Counter-attack cards can only target shielded infrastructure" };
      }
      
      // Check attack vector compatibility for counter-attack cards
      const counterVectorCheck = checkVectorCompatibility(attackVector);
      if (!counterVectorCheck.valid) {
        return counterVectorCheck;
      }
      
      return { valid: true };

    case 'reaction':
      // Reaction cards can target vulnerable or compromised infrastructure
      if (infrastructure.state !== 'vulnerable' &&
          infrastructure.state !== 'compromised' &&
          (!infrastructure.vulnerabilities || infrastructure.vulnerabilities.length === 0)) {
        return {
          valid: false,
          message: "Reaction cards can only target vulnerable or compromised infrastructure"
        };
      }
      
      // Check attack vector compatibility for reaction cards
      const reactionVectorCheck = checkVectorCompatibility(attackVector);
      if (!reactionVectorCheck.valid) {
        return reactionVectorCheck;
      }
      
      return { valid: true };
      
    case 'special':
      // Special effect cards (like lateral movement) can generally target any infrastructure
      // but prioritize compromised infrastructure for chain effects
      return { valid: true };
      
    // Handle legacy card types for backward compatibility
    case 'attack':
    case 'defense':
    case 'utility':
      return { valid: true };
      
    default:
      return invalid;
  }
}
