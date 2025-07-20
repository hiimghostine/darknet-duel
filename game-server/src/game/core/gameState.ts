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
      initialActionPoints: 0,   // Starting AP at game start - both players start with 0 AP
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
  
  // Check for max turns - standard mode is 15 rounds max
  if (G.turnNumber > G.gameConfig.maxTurns) {
    // If we hit max rounds, defender wins (defenders advantage)
    return { winner: 'defender' };
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
    
    // For standard mode: if a player controls 3 or more infrastructure cards, they win
    const infrastructureThreshold = Math.ceil(G.infrastructure.length / 2) + 1; // 3+ out of 5
    
    if (attackerControlled >= infrastructureThreshold) {
      return { winner: 'attacker' };
    }
    if (defenderControlled >= infrastructureThreshold) {
      return { winner: 'defender' };
    }
  }
  
  // Check for game abandonment due to disconnection
  if (G.gamePhase === 'gameOver' && G.winner === 'abandoned') {
    return { winner: 'abandoned' };
  }
  
  return undefined; // Game continues
};
