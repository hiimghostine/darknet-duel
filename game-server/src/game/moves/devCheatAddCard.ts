import { Ctx } from 'boardgame.io';
import { GameState, GameAction } from 'shared-types/game.types';
import { Card } from 'shared-types/card.types';

/**
 * DEVELOPER CHEAT MOVE - Add any card to player's hand
 * This move is for testing and development purposes only
 */
export const devCheatAddCardMove = (
  G: GameState,
  ctx: Ctx,
  playerID: string,
  card: any
): GameState => {
  // Only allow in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!isDevelopment) {
    console.warn(`CHEAT ATTEMPT: Player ${playerID} tried to add card in production mode`);
    return {
      ...G,
      message: "Cheat commands are not available in this mode"
    };
  }

  // ENHANCED DEBUGGING: Log the exact card object structure
  console.log(`🔧 DEV CHEAT: Raw card object received:`, card);
  console.log(`🔧 DEV CHEAT: Card type:`, typeof card);
  console.log(`🔧 DEV CHEAT: Card keys:`, Object.keys(card || {}));
  console.log(`🔧 DEV CHEAT: Card.name:`, card?.name);
  console.log(`🔧 DEV CHEAT: Card.id:`, card?.id);

  // Validate card object has required properties
  if (!card || typeof card !== 'object') {
    console.error(`🔧 DEV CHEAT: Invalid card object - not an object:`, card);
    return {
      ...G,
      message: "Invalid card object provided"
    };
  }

  if (!card.name || !card.id) {
    console.error(`🔧 DEV CHEAT: Card missing required properties - name: ${card.name}, id: ${card.id}`);
    return {
      ...G,
      message: "Card missing required properties (name/id)"
    };
  }

  console.log(`🔧 DEV CHEAT: Player ${playerID} adding card ${card.name} (${card.id}) to hand`);

  // Use the same robust player identification logic as in playerView.ts
  // to handle cases where playerID might be '0'/'1' instead of actual UUIDs
  const attackerId = String(G.attacker?.id);
  const defenderId = String(G.defender?.id);
  const playerIdStr = String(playerID);
  
  // Try multiple methods to determine player role (similar to playerView.ts)
  let isAttacker = false;
  
  // Method 1: Direct ID comparison
  if (playerIdStr === attackerId) {
    isAttacker = true;
  } else if (playerIdStr === defenderId) {
    isAttacker = false;
  }
  // Method 2: Fall back to positional logic (BoardGame.io uses '0'/'1')
  else if (playerIdStr === '0') {
    isAttacker = true;
  } else if (playerIdStr === '1') {
    isAttacker = false;
  }
  
  const player = isAttacker ? G.attacker : G.defender;

  if (!player) {
    console.error(`🔧 DEV CHEAT: No valid player found for ID ${playerID}`);
    return {
      ...G,
      message: "Invalid player for cheat command"
    };
  }

  // Create a deep copy of the card to ensure all properties are preserved
  const cardCopy = JSON.parse(JSON.stringify(card));

  // Add the card to the player's hand
  const updatedPlayer = {
    ...player,
    hand: [...player.hand, cardCopy]
  };

  // Record the cheat action for debugging
  const newAction: GameAction = {
    playerRole: isAttacker ? 'attacker' : 'defender',
    actionType: 'devCheatAddCard',
    timestamp: Date.now(),
    payload: { 
      cardId: card.id, 
      cardName: card.name, 
      cardType: card.type,
      cheatMode: true 
    }
  };

  console.log(`🔧 DEV CHEAT: Added ${card.name} to ${isAttacker ? 'attacker' : 'defender'}'s hand. New hand size: ${updatedPlayer.hand.length}`);

  return {
    ...G,
    attacker: isAttacker ? updatedPlayer : G.attacker,
    defender: !isAttacker ? updatedPlayer : G.defender,
    actions: [...G.actions, newAction],
    message: `🔧 DEV: Added ${card.name} to hand`
  };
}; 