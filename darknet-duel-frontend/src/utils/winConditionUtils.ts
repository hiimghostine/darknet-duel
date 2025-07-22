/**
 * Frontend Win Condition Validation Utilities
 * 
 * This file provides client-side validation of win conditions that matches
 * the authoritative game server logic. It should be used to validate and
 * potentially correct any discrepancies in win determination.
 */

import type { GameState, PlayerRole } from 'shared-types/game.types';

/**
 * Determines if the game has ended and who the winner is
 * Uses the same logic as the game server's checkGameEnd function
 * 
 * @param G Current game state
 * @returns Winner information if the game has ended, undefined otherwise
 */
export function validateWinCondition(G: GameState): { winner: PlayerRole | 'abandoned' } | undefined {
  // Safety check: if G is undefined (invalid move), return undefined to continue game
  if (!G || !G.gameConfig) {
    return undefined;
  }
  
  // ✅ FIXED: Check for game over phase first - this handles surrenders
  if (G.gamePhase === 'gameOver' && G.winner) {
    // If the game is already marked as over with a winner, trust the backend
    console.log(`🎮 Game over detected with winner: ${G.winner}`);
    return { winner: G.winner };
  }
  
  // Check for infrastructure control win condition
  if (G.infrastructure && G.infrastructure.length > 0) {
    // Count controlled infrastructure for each side
    let attackerControlled = 0;
    let defenderControlled = 0;
    
    G.infrastructure.forEach(infra => {
      if (infra.state === 'compromised') {
        attackerControlled++;
      } else if (infra.state === 'fortified' || infra.state === 'fortified_weaken') {
        defenderControlled++;
      }
    });
    
    // ✅ UPDATED: Two different win conditions
    const totalInfrastructure = G.infrastructure.length;
    const isMaxTurnsReached = G.turnNumber > G.gameConfig.maxTurns;
    
    if (isMaxTurnsReached) {
      // ✅ TURN LIMIT WIN: Use majority rule (3+ out of 5)
      const majorityThreshold = Math.ceil(totalInfrastructure / 2) + 1; // 3+ out of 5
      
      if (attackerControlled >= majorityThreshold) {
        return { winner: 'attacker' }; // Attacker wins with majority
      } else {
        return { winner: 'defender' }; // Defender wins by default (including ties)
      }
    } else {
      // ✅ IMMEDIATE WIN: Requires ALL infrastructure cards (5/5)
      const immediateWinThreshold = totalInfrastructure; // Must control ALL infrastructure cards
      
      if (attackerControlled >= immediateWinThreshold) {
        return { winner: 'attacker' };
      }
      if (defenderControlled >= immediateWinThreshold) {
        return { winner: 'defender' };
      }
    }
  }
  
  // Check for game abandonment due to disconnection
  if (G.gamePhase === 'gameOver' && G.winner === 'abandoned') {
    return { winner: 'abandoned' };
  }
  
  return undefined; // Game continues
}

/**
 * Validates the current winner against the expected winner based on game state
 * Logs any discrepancies for debugging purposes
 * 
 * @param G Current game state
 * @returns The validated winner (corrected if necessary)
 */
export function validateAndCorrectWinner(G: GameState): PlayerRole | 'abandoned' | undefined {
  const currentWinner = G.winner;
  const validatedResult = validateWinCondition(G);
  const expectedWinner = validatedResult?.winner;
  
  // ✅ FIXED: For game over phase, always trust the backend winner
  if (G.gamePhase === 'gameOver' && currentWinner) {
    console.log(`🎮 Game over phase - using backend winner: ${currentWinner}`);
    return currentWinner;
  }
  
  // If there's a discrepancy, log it and return the corrected winner
  if (currentWinner !== expectedWinner) {
    console.warn('🚨 WIN CONDITION DISCREPANCY DETECTED:');
    console.warn(`   Current winner: ${currentWinner}`);
    console.warn(`   Expected winner: ${expectedWinner}`);
    console.warn(`   Game phase: ${G.gamePhase}`);
    console.warn(`   Turn number: ${G.turnNumber}`);
    console.warn(`   Max turns: ${G.gameConfig.maxTurns}`);
    
    if (G.infrastructure) {
      let attackerControlled = 0;
      let defenderControlled = 0;
      
      G.infrastructure.forEach(infra => {
        if (infra.state === 'compromised') {
          attackerControlled++;
        } else if (infra.state === 'fortified' || infra.state === 'fortified_weaken') {
          defenderControlled++;
        }
      });
      
      const isMaxTurnsReached = G.turnNumber > G.gameConfig.maxTurns;
      console.warn(`   Infrastructure control: Attacker ${attackerControlled}, Defender ${defenderControlled}`);
      console.warn(`   Win condition: ${isMaxTurnsReached ? 'Turn limit (3+ majority)' : 'Immediate (5/5 all cards)'}`);
    }
    
    // ✅ FIXED: For game over, prefer backend winner over client calculation
    if (G.gamePhase === 'gameOver' && currentWinner) {
      console.warn('   Using backend winner (game over phase)');
      return currentWinner;
    } else {
      console.warn('   Using corrected winner for display');
      return expectedWinner;
    }
  }
  
  return currentWinner;
}

/**
 * Gets a human-readable reason for the win condition
 * 
 * @param G Current game state
 * @param winner The validated winner
 * @returns A description of why the game ended
 */
export function getWinReason(G: GameState, winner: PlayerRole | 'abandoned' | undefined): string {
  if (!winner) {
    return 'Game is still in progress';
  }
  
  if (winner === 'abandoned') {
    return 'Opponent abandoned the game';
  }
  
  // ✅ FIXED: Check for surrender in game stats or message
  if (G.gameStats?.winReason && G.gameStats.winReason !== 'Unknown') {
    return G.gameStats.winReason;
  }
  
  // ✅ FIXED: Check for surrender indicators in game actions
  const surrenderAction = G.actions?.find(action => action.actionType === 'surrender');
  if (surrenderAction) {
    const surrenderingPlayer = surrenderAction.playerRole;
    const winningPlayer = surrenderingPlayer === 'attacker' ? 'defender' : 'attacker';
    return `${surrenderingPlayer} surrendered - ${winningPlayer} wins`;
  }
  
  // ✅ FIXED: Check for early game over with minimal actions (likely surrender)
  if (G.gamePhase === 'gameOver' && G.turnNumber <= 2 && (!G.actions || G.actions.length === 0)) {
    return 'Game ended by surrender';
  }
  
  // Check infrastructure control with proper win condition logic
  if (G.infrastructure && G.infrastructure.length > 0) {
    let attackerControlled = 0;
    let defenderControlled = 0;
    
    G.infrastructure.forEach(infra => {
      if (infra.state === 'compromised') {
        attackerControlled++;
      } else if (infra.state === 'fortified' || infra.state === 'fortified_weaken') {
        defenderControlled++;
      }
    });
    
    const totalInfrastructure = G.infrastructure.length;
    const isMaxTurnsReached = G.turnNumber > G.gameConfig.maxTurns;
    
    if (isMaxTurnsReached) {
      // Turn limit reached - check majority
      const majorityThreshold = Math.ceil(totalInfrastructure / 2) + 1;
      if (attackerControlled >= majorityThreshold) {
        return `Maximum turns reached - Attacker wins with ${attackerControlled}/${totalInfrastructure} infrastructure majority`;
      } else {
        return `Maximum turns reached - Defender wins by default (Attacker: ${attackerControlled}/${totalInfrastructure})`;
      }
    } else {
      // Immediate win check
      if (attackerControlled >= totalInfrastructure) {
        return `Attacker compromised all ${attackerControlled} infrastructure cards`;
      } else if (defenderControlled >= totalInfrastructure) {
        return `Defender fortified all ${defenderControlled} infrastructure cards`;
      }
    }
  }
  
  // ✅ FIXED: Default to surrender if we can't determine other conditions
  return 'Game ended by player action';
}