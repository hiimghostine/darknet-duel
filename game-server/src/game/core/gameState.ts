import { GameState, PlayerRole, InfrastructureState } from 'shared-types/game.types';

/**
 * Creates the initial game state
 * @returns Initial GameState object
 */
export const createInitialState = (): GameState => {
  return {
    currentTurn: 'attacker', // Attacker always goes first
    turnNumber: 1,
    currentRound: 1, // Start at round 1
    gamePhase: 'setup',
    actions: [],
    attackerScore: 0,
    defenderScore: 0,
    playerConnections: {},  // Track player connection state
    infrastructure: [],     // Infrastructure cards in play
    infrastructureDeck: [], // Available infrastructure cards
    gameConfig: {
      // Standard mode game configuration
      initialResources: 5,      // Starting resources for each player
      maxTurns: 15,            // Game length: 15 rounds maximum
      startingHandSize: 5,     // Each player draws 5 cards initially
      infrastructureCount: 5,   // 5 infrastructure cards (network, web, data, user, critical systems)
      initialActionPoints: 2,   // Starting AP at game start - both players start with 2 AP
      attackerActionPointsPerTurn: 2,  // Attacker gets 2 AP per turn
      defenderActionPointsPerTurn: 3,  // Defender gets 3 AP per turn
      maxActionPoints: 10,      // Maximum AP cap - AP carries over between turns up to 10
      freeCardCyclesPerTurn: 1, // Players can discard and draw one card for free per turn
      maxHandSize: 7,          // Maximum number of cards a player can hold
      cardsDrawnPerTurn: 2     // Number of cards drawn at end of each turn
    }
  };
};

/**
 * Determines if the game has ended and who the winner is
 * @param G Current game state
 * @returns Winner information if the game has ended, undefined otherwise
 */
export const checkGameEnd = (G: GameState) => {
  // Safety check: if G is undefined (invalid move), return undefined to continue game
  if (!G || !G.gameConfig) {
    return undefined;
  }
  
  // ✅ FIX: Check if game is already over (handles page refresh after game ends)
  if (G.gamePhase === 'gameOver' && G.winner) {
    console.log(`🎮 Game already finished with winner: ${G.winner}`);
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
  
  
  return undefined; // Game continues
};
