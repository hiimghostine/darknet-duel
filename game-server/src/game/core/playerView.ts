import { Ctx } from 'boardgame.io';
import { GameState, Player } from 'shared-types/game.types';
import { Card } from 'shared-types/card.types';
import { isCardPlayable } from '../utils/cardUtils';

/**
 * Restricts the information available to each player
 * @param G Current game state
 * @param ctx Game context
 * @param playerID Player viewing the game
 * @returns Limited game state with hidden opponent information
 */
export const createPlayerView = ({ G, ctx, playerID }: { 
  G: GameState; 
  ctx: Ctx; 
  playerID: string | null 
}): GameState => {
  // EXTENSIVE DEBUG LOGGING
  console.log('======== PLAYER VIEW DEBUG ========');
  console.log(`playerID from client: ${playerID} (${typeof playerID})`);
  console.log('ctx.playOrder:', ctx.playOrder);
  console.log('ctx.playOrderPos:', ctx.playOrderPos);
  console.log('ctx.currentPlayer:', ctx.currentPlayer);
  
  if (G.attacker) {
    console.log(`G.attacker.id: ${G.attacker.id} (${typeof G.attacker.id})`);
    console.log(`G.attacker.role: ${G.attacker.role}`);
  } else {
    console.log('G.attacker is not initialized');
  }
  
  if (G.defender) {
    console.log(`G.defender.id: ${G.defender.id} (${typeof G.defender.id})`);
    console.log(`G.defender.role: ${G.defender.role}`);
  } else {
    console.log('G.defender is not initialized');
  }
  
  // For spectators or if no player ID, hide sensitive information from both sides
  if (playerID === null) {
    console.log('Spectator view - no playerID');
    return filterGameStateForSpectators(G);
  }
  
  // Skip if attacker or defender aren't initialized yet
  if (!G.attacker || !G.defender) {
    console.log('Game state not fully initialized yet');
    return G;
  }
  
  // ATTEMPT FIX #1: Force string comparison since there might be type issues
  const attackerId = String(G.attacker.id);
  const defenderId = String(G.defender.id);
  const playerIdStr = String(playerID);
  
  // Try a more reliable role detection
  let isAttacker, isDefender;
  
  // ATTEMPT FIX #2: Try multiple ways of determining roles
  // Method 1: Direct ID comparison from game state
  const directIdMatch = playerIdStr === attackerId || playerIdStr === defenderId;
  if (directIdMatch) {
    isAttacker = playerIdStr === attackerId;
    isDefender = playerIdStr === defenderId;
    console.log(`Role determined by direct ID match: ${isAttacker ? 'attacker' : 'defender'}`);
  } 
  // Method 2: Use playOrder from ctx
  else if (ctx.playOrder.includes(playerIdStr)) {
    isAttacker = ctx.playOrder.indexOf(playerIdStr) === 0;
    isDefender = ctx.playOrder.indexOf(playerIdStr) === 1;
    console.log(`Role determined by playOrder: ${isAttacker ? 'attacker' : 'defender'}`);
  }
  // Method 3: Last resort - use playerID directly
  else {
    isAttacker = playerIdStr === '0';
    isDefender = playerIdStr === '1';
    console.log(`Role determined by playerID: ${isAttacker ? 'attacker' : 'defender'}`);
  }
  
  // If player ID doesn't match either player, show spectator view
  if (!isAttacker && !isDefender) {
    console.log(`Player ${playerID} is a spectator`);
    return filterGameStateForSpectators(G);
  }
  
  console.log(`FINAL ROLE: Player ${playerID} is ${isAttacker ? 'attacker' : 'defender'}`);
  
  // Create a hidden version of the opponent's information
  const opponentHidden = isAttacker 
    ? {
        ...G.defender,
        hand: G.defender.hand.map(card => hideCardDetails(card)),
        deck: G.defender.deck.map(card => hideCardDetails(card))
      }
    : {
        ...G.attacker,
        hand: G.attacker.hand.map(card => hideCardDetails(card)),
        deck: G.attacker.deck.map(card => hideCardDetails(card))
      };
  
  // Process player's hand to mark cards as playable or not
  const currentPlayerData = isAttacker ? G.attacker : G.defender;
  let processedPlayer;
  
  if (currentPlayerData) {
    // Add playable property to each card in the player's hand
    const processedHand = currentPlayerData.hand.map(card => {
      return {
        ...card,
        playable: isCardPlayable(G, ctx, playerID, card, currentPlayerData, true) // Enable debug logs
      };
    });
    
    processedPlayer = {
      ...currentPlayerData,
      hand: processedHand
    };
    
    console.log(`Processed hand for player ${playerID} - Cards playability:`, 
      processedHand.map(c => ({ name: c.name, playable: c.playable })));
  }
  
  // Create a copy of the game state with player-specific information
  const playerView: GameState = {
    ...G,
    // Keep attacker and defender in their original positions, but hide opponent's cards
    attacker: isAttacker ? (processedPlayer || G.attacker) : opponentHidden,
    defender: isDefender ? (processedPlayer || G.defender) : opponentHidden,
    // Add metadata for easy role identification on the client
    playerRole: isAttacker ? 'attacker' : 'defender',
    isAttacker: isAttacker,
    isDefender: isDefender,
    playerID: playerID,
    // Add debug info that will be visible on the client
    debug: {
      attackerId: attackerId,
      defenderId: defenderId,
      playerIdStr: playerIdStr,
      directIdMatch: directIdMatch,
      playOrderIndex: ctx.playOrder.indexOf(playerIdStr),
      roleDetectionMethod: directIdMatch ? 'directIdMatch' : 
                          ctx.playOrder.includes(playerIdStr) ? 'playOrder' : 'playerID'
    }
  };
  
  console.log(`Sending view to ${playerID} as ${playerView.playerRole}`);
  console.log('======== END PLAYER VIEW DEBUG ========');
  return playerView;
};

/**
 * Filters the game state for spectators (viewers who aren't players)
 * @param G Current game state
 * @returns Filtered game state for spectators
 */
const filterGameStateForSpectators = (G: GameState): GameState => {
  // Spectators can see the game board but not the cards in players' hands
  const filteredAttacker = G.attacker ? filterPlayerForSpectator(G.attacker) : undefined;
  const filteredDefender = G.defender ? filterPlayerForSpectator(G.defender) : undefined;
  
  return {
    ...G,
    attacker: filteredAttacker,
    defender: filteredDefender,
    playerRole: 'spectator' // Flag as spectator view
  };
};

/**
 * Filters player information for spectators
 * @param player Player object to filter
 * @returns Filtered player object
 */
const filterPlayerForSpectator = (player: Player): Player => {
  return {
    ...player,
    hand: player.hand.map(card => hideCardDetails(card)),
    deck: player.deck.map(card => hideCardDetails(card))
  };
};

/**
 * Hides sensitive card details but keeps card count
 * @param card Card to hide details for
 * @returns Card with hidden details
 */
const hideCardDetails = (card: Card): Card => {
  // Keep id and card type but hide other details
  return {
    id: card.id,
    type: card.type,
    name: '???', // Hide card name
    description: '???', // Hide card description
    cost: 0, // Hide card cost
    power: 0, // Hide card power but include required property
    effects: [], // Hide card effects
    metadata: { 
      category: '???' // Hide card metadata
    }
  };
};
