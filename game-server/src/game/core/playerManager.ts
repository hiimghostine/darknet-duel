import { Player, GameState, PlayerRole } from 'shared-types/game.types';
import { createAttackerDeck } from '../cards/attackerCardLoader';
import { createDefenderDeck } from '../cards/defenderCardLoader';

/**
 * Initialize a player with role-specific deck and starting resources
 * @param playerId Player unique identifier
 * @param role Player role (attacker/defender)
 * @param gameConfig Game configuration settings
 * @returns Fully initialized Player object
 */
export const initializePlayer = (playerId: string, role: PlayerRole, gameConfig: GameState['gameConfig']): Player => {
  // Load appropriate deck based on player role
  const deck = role === 'attacker' ? createAttackerDeck() : createDefenderDeck();
  
  console.log(`Created ${role} deck with ${deck.length} cards for player ${playerId}`);

  return {
    id: playerId,
    name: `Player ${playerId}`, // Adding name property with a default value
    role: role, // Explicitly set the player role
    resources: gameConfig.initialResources,
    // Initialize action points based on game config
    actionPoints: gameConfig.initialActionPoints,
    freeCardCyclesUsed: 0, // Reset card cycles used counter
    deck: deck,
    hand: [],
    field: [],
    discard: []
  };
};

/**
 * Initialize a player with real user data
 * @param playerId Boardgame.io player identifier ("0", "1")
 * @param role Player role (attacker/defender)
 * @param gameConfig Game configuration settings
 * @param userData Real user data with id and name
 * @returns Fully initialized Player object with real user data
 */
export const initializePlayerWithData = (
  playerId: string,
  role: PlayerRole,
  gameConfig: GameState['gameConfig'],
  userData: { id: string; name: string }
): Player => {
  // Load appropriate deck based on player role
  const deck = role === 'attacker' ? createAttackerDeck() : createDefenderDeck();
  
  console.log(`Created ${role} deck with ${deck.length} cards for player ${userData.name} (UUID: ${userData.id}, BGio ID: ${playerId})`);

  return {
    id: playerId,                // ✅ Use boardgame.io player ID ("0" or "1")
    name: userData.name,         // ✅ Use real user name
    realUserId: userData.id,     // ✅ Store real user UUID separately
    role: role,
    resources: gameConfig.initialResources,
    actionPoints: gameConfig.initialActionPoints,
    freeCardCyclesUsed: 0,
    deck: deck,
    hand: [],
    field: [],
    discard: []
  };
};

/**
 * Draw a card from player's deck
 * @param player Current player state
 * @returns Updated player state with a new card in hand
 */
export const drawCard = (player: Player): Player => {
  if (player.deck.length === 0) {
    console.log(`[DRAW DEBUG] Deck is empty for player ${player.id}`);
    return player;
  }
  
  // DEBUG: Log deck state before drawing
  console.log(`[DRAW DEBUG] Player ${player.id} deck size: ${player.deck.length}`);
  console.log(`[DRAW DEBUG] Next 3 cards in deck:`,
    player.deck.slice(0, 3).map(c => ({ id: c.id, name: c.name })));
  
  const [card, ...remainingDeck] = player.deck;
  
  // Create a deep copy of the card to ensure all properties are preserved during serialization
  const cardCopy = JSON.parse(JSON.stringify(card));
  
  console.log(`[DRAW DEBUG] Drew card: ${cardCopy.id} (${cardCopy.name}), deck now has ${remainingDeck.length} cards`);
  
  return {
    ...player,
    deck: remainingDeck,
    hand: [...player.hand, cardCopy]
  };
};

/**
 * Draw starting hand for a player
 * @param player Current player state
 * @param handSize Number of cards to draw
 * @returns Updated player with initial hand
 */
export const drawStartingHand = (player: Player, handSize: number): Player => {
  let updatedPlayer = { ...player };
  for (let i = 0; i < handSize; i++) {
    updatedPlayer = drawCard(updatedPlayer);
  }
  return updatedPlayer;
};

/**
 * Update player's action points at the start of their turn
 * @param player Current player state
 * @param role Player role (attacker/defender)
 * @param gameConfig Game configuration
 * @returns Updated player with new action points
 */
export const updateActionPoints = (
  player: Player, 
  role: PlayerRole,
  gameConfig: GameState['gameConfig']
): Player => {
  // Add replenished action points for the new turn based on player role
  // Keep existing points and add new ones, but cap at maximum (10 AP)
  const actionPointsToAdd = role === 'attacker' 
    ? gameConfig.attackerActionPointsPerTurn  // Attacker gets 2 AP per turn
    : gameConfig.defenderActionPointsPerTurn; // Defender gets 3 AP per turn
    
  const newActionPoints = Math.min(
    (player.actionPoints || 0) + actionPointsToAdd,
    gameConfig.maxActionPoints
  );
  
  return {
    ...player,
    // Update with new action points (existing + role-specific AP, capped at 10 max)
    actionPoints: newActionPoints,
    // Reset card cycles used for the new turn
    freeCardCyclesUsed: 0
  };
};
