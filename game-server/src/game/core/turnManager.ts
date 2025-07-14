import { FnContext } from 'boardgame.io/dist/types/src/types';
import { GameState, PlayerRole } from 'shared-types/game.types';
import { drawCard, updateActionPoints } from './playerManager';

/**
 * Handles the start of a player's turn 
 * @param G Current game state
 * @param ctx Game context
 * @returns Updated game state
 */
export const handleTurnStart = (G: GameState, ctx: any) => {
  // Handle turn start logic (draw card, reset action points, etc.)
  const isAttackerTurn = G.currentTurn === 'attacker';
  const currentPlayer = isAttackerTurn ? G.attacker : G.defender;
  
  if (!currentPlayer) return G;
  
  // 1. Draw a card
  const playerWithCard = drawCard(currentPlayer);
  
  // 2. Update action points based on player role
  const updatedPlayer = updateActionPoints(
    playerWithCard, 
    isAttackerTurn ? 'attacker' : 'defender',
    G.gameConfig
  );
  
  return {
    ...G,
    attacker: isAttackerTurn ? updatedPlayer : G.attacker,
    defender: !isAttackerTurn ? updatedPlayer : G.defender,
  };
};
