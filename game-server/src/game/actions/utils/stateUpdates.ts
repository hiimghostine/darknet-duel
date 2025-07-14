import { GameState, Player, GameAction } from 'shared-types/game.types';
import { Card } from 'shared-types/card.types';

/**
 * Updates player state after playing a card
 */
export function updatePlayerStateAfterCardPlay(
  G: GameState,
  player: Player,
  isAttacker: boolean,
  card: Card,
  cardIndex: number,
  actionType: string,
  payload: Record<string, any> = {}
): GameState {
  // Remove card from hand
  const newHand = [...player.hand];
  newHand.splice(cardIndex, 1);
  
  // Create a deep copy of the card to ensure all properties are preserved during serialization
  const cardCopy = JSON.parse(JSON.stringify(card));
  
  // Update player state
  const updatedPlayer = {
    ...player,
    hand: newHand,
    discard: [...player.discard, cardCopy],
    actionPoints: player.actionPoints - card.cost // Use action points
  };
  
  // Record action
  const newAction: GameAction = {
    playerRole: isAttacker ? 'attacker' : 'defender',
    actionType,
    timestamp: Date.now(),
    payload: { cardId: card.id, ...payload }
  };
  
  // Return updated game state with preserved properties
  return {
    ...G,
    attacker: isAttacker ? updatedPlayer : G.attacker,
    defender: !isAttacker ? updatedPlayer : G.defender,
    actions: [...G.actions, newAction],
    // Explicitly preserve these critical properties
    playerRole: G.playerRole,
    isAttacker: G.isAttacker,
    isDefender: G.isDefender,
    playerID: G.playerID
  };
}
