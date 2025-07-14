import { GameState, InfrastructureCard } from 'shared-types/game.types';

/**
 * Calculate scores based on infrastructure states
 */
export function calculateScores(infrastructure: InfrastructureCard[]): { attackerScore: number, defenderScore: number } {
  let attackerScore = 0;
  let defenderScore = 0;
  
  // Count infrastructure control for score
  infrastructure.forEach(infra => {
    if (infra.state === 'compromised') {
      attackerScore++;
    } else if (infra.state === 'fortified') {
      defenderScore++;
    }
  });
  
  return { attackerScore, defenderScore };
}

/**
 * Check if attacker has won based on compromised infrastructure count
 */
export function checkAttackerVictory(infrastructure: InfrastructureCard[]): boolean {
  const compromisedCount = infrastructure.filter(
    infra => infra.state === 'compromised'
  ).length;
  
  // Win condition: if more than half the infrastructure is compromised
  const infrastructureThreshold = Math.ceil(infrastructure.length / 2) + 1; // 3+ out of 5
  
  return compromisedCount >= infrastructureThreshold;
}
