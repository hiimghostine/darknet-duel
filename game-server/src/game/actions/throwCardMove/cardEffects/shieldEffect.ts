import { InfrastructureCard, InfrastructureState } from 'shared-types/game.types';
import { Card, AttackVector, Shield } from 'shared-types/card.types';

/**
 * Apply shield card effect to target infrastructure
 */
export function shieldEffect(
  currentInfra: InfrastructureCard,
  infraIndex: number,
  updatedInfrastructure: InfrastructureCard[],
  card: Card,
  attackVector?: AttackVector,
  playerID?: string
): InfrastructureCard[] {
  if (!attackVector) {
    return updatedInfrastructure;
  }
  
  // Make a copy of the infrastructure array
  const newInfrastructure = [...updatedInfrastructure];
  
  const newShield: Shield = {
    vector: attackVector,
    appliedBy: card.id,
    appliedByPlayer: playerID || '',
    timestamp: Date.now()
  };
  
  // Create new shields array
  const shieldArray = currentInfra.shields ? [...currentInfra.shields] : [];
  shieldArray.push(newShield);
  
  // Determine the correct target state based on current infrastructure state
  let targetState: InfrastructureState;
  if (currentInfra.state === 'fortified_weaken') {
    // fortified_weaken + shield -> return to fortified state
    targetState = 'fortified';
  } else {
    // secure + shield -> shielded state (normal behavior)
    targetState = 'shielded';
  }
  
  // Create a new infra object with updated state and shields
  newInfrastructure[infraIndex] = {
    ...currentInfra,
    shields: shieldArray,
    state: targetState
  };
  
  return newInfrastructure;
}
