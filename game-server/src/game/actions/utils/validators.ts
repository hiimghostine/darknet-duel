import { InfrastructureCard, InfrastructureState } from 'shared-types/game.types';
import { AttackVector, Vulnerability } from 'shared-types/card.types';

/**
 * Validate that a card can target an infrastructure based on type and state
 */
export function validateCardTargeting(
  cardType: string, 
  infrastructure: InfrastructureCard,
  attackVector?: AttackVector
): { valid: boolean, message?: string } {
  // Default validation result
  const invalid = { valid: false, message: "Invalid target for this card" };
  
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
      return { valid: true };
      
    case 'attack':
      // Attack cards can only target vulnerable infrastructure with matching vulnerability
      if (infrastructure.state !== 'vulnerable') {
        return { valid: false, message: "Attack cards can only target vulnerable infrastructure" };
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
      // Shield cards can target any infrastructure except already shielded/fortified
      if (infrastructure.state === 'shielded' || infrastructure.state === 'fortified') {
        return { 
          valid: false, 
          message: "Shield cards cannot target already shielded or fortified infrastructure" 
        };
      }
      return { valid: true };
      
    case 'fortify':
      // Fortify cards can only target shielded infrastructure
      if (infrastructure.state !== 'shielded') {
        return { valid: false, message: "Fortify cards can only target shielded infrastructure" };
      }
      return { valid: true };
      
    case 'response':
      // Response cards can only target compromised infrastructure
      if (infrastructure.state !== 'compromised') {
        return { valid: false, message: "Response cards can only target compromised infrastructure" };
      }
      return { valid: true };
      
    case 'counter-attack':
    case 'counter':
      // Counter-attack cards should specifically target shielded infrastructure when in reaction mode
      if (infrastructure.state !== 'shielded') {
        return { valid: false, message: "Counter-attack cards can only target shielded infrastructure" };
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
