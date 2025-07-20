import { Ctx } from 'boardgame.io';
import { GameState, Player } from 'shared-types/game.types';
import { Card } from 'shared-types/card.types';
import { TemporaryEffectsManager } from '../actions/temporaryEffectsManager';

/**
 * Comprehensive check if a card is playable in the current game state
 * This considers all relevant factors:
 * - Is it the player's turn?
 * - Game phase check
 * - Action point costs
 * - Card type requirements
 * - Special game state conditions
 * 
 * @param G The current game state
 * @param ctx The boardgame.io context
 * @param playerID The ID of the player trying to play the card
 * @param card The card being evaluated
 * @param player The player object (containing action points, etc.)
 * @param debug Whether to log debugging info (default: false)
 * @returns Whether the card is playable
 */
export function isCardPlayable(
  G: GameState,
  ctx: Ctx,
  playerID: string,
  card: Card,
  player: Player,
  debug: boolean = false,
  targetInfrastructureId?: string
): boolean {
  // Get player information if not provided
  if (!player) {
    // FIXED: Use boardgame.io player IDs for validation
    const isAttacker = playerID === '0';
    player = isAttacker ? G.attacker! : G.defender!;
    
    // Safety check
    if (!player) {
      if (debug) console.log(`Card ${card.name} not playable: Player not found`);
      return false;
    }
  }

  // Only consider cards playable during playing phase
  if (G.gamePhase !== 'playing') {
    if (debug) console.log(`Card ${card.name} not playable: Game not in playing phase`);
    return false;
  }
  
  // Check if the player has enough action points to play this card
  if (player.actionPoints < card.cost) {
    if (debug) console.log(`Card ${card.name} not playable: Not enough action points (${player.actionPoints}/${card.cost})`);
    return false;
  }
  
  // Check if it's the player's turn for non-reactive cards
  // FIXED: Use boardgame.io player IDs for turn validation
  const isAttacker = playerID === '0';
  const isPlayerTurn = (G.currentTurn === 'attacker' && isAttacker) || 
                      (G.currentTurn === 'defender' && !isAttacker);
  
  // Check reaction-specific conditions
  // Check both the boardgame.io active player stage AND the pendingReactions array
  const playerStage = ctx.activePlayers?.[playerID];
  const isInReactionStage = playerStage === 'reaction';
  const hasPendingReactions = G.pendingReactions !== undefined && G.pendingReactions.length > 0;
  const isReactionPhase = isInReactionStage || hasPendingReactions;
  
  // Check if the card type and isReactive flag are consistent
  const isProperReactiveCard =
    (isAttacker && card.type === 'counter-attack') ||
    (!isAttacker && card.type === 'reaction') ||
    (card.type === 'wildcard' && card.isReactive) || // Allow reactive wildcard cards
    (card.id.startsWith('D307') || card.specialEffect === 'emergency_restore_shield'); // Specifically allow D307
  
  // Special handling for D307 - it's a reactive response-only wildcard
  const isD307 = card.id.startsWith('D307') || card.specialEffect === 'emergency_restore_shield';
  
  // During reaction phase, only proper reactive cards can be played
  if (isReactionPhase) {
    if ((!card.isReactive && !isD307) || !isProperReactiveCard) {
      if (debug) console.log(`Card ${card.name} not playable during reaction phase: Not a proper reaction card`);
      return false;
    }
    
    // Check if this reactive card is blocked by prevent_reactions effects (D301 Advanced Threat Defense)
    if (targetInfrastructureId && (card.type === 'counter-attack' || (card.type === 'wildcard' && card.isReactive))) {
      // Check if the target infrastructure has a prevent_reactions effect that blocks reactive attacks
      const hasPreventReactions = TemporaryEffectsManager.hasEffect(G, 'prevent_reactions', targetInfrastructureId);
      if (hasPreventReactions) {
        if (debug) console.log(`Reactive attack card ${card.name} blocked by prevent_reactions effect on infrastructure ${targetInfrastructureId}`);
        return false;
      }
    }
    
    // Special condition for D307: only playable if there's compromised infrastructure
    if (isD307) {
      const hasCompromisedInfra = G.infrastructure?.some(infra => infra.state === 'compromised');
      if (!hasCompromisedInfra) {
        if (debug) console.log(`Card ${card.name} not playable: No compromised infrastructure available`);
        return false;
      }
    }
    
    return true; // Reactive cards can be played during reaction phase
  }
  
  // Outside reaction phase, regular reactive cards shouldn't be played
  // BUT D307 is special - it can be played during normal turns AND reaction phases
  if (card.isReactive && !isD307) {
    if (debug) console.log(`Reactive card ${card.name} not playable: Not in reaction phase`);
    return false;
  }
  
  // D307 is playable in both normal turns and reaction phases (as long as there's compromised infrastructure)
  // This check was already done above
  
  // For regular cards during normal play
  if (!isPlayerTurn) {
    if (debug) console.log(`Card ${card.name} not playable: Not player's turn`);
    return false;
  }
  
  // Additional type-specific rules could be added here
  
  // For debugging
  if (debug) {
    console.log(`Card ${card.name} playability result:`, {
      isPlayerTurn,
      cardType: card.type,
      isReactive: card.isReactive,
      hasPendingReactions,
      actionPoints: `${player.actionPoints}/${card.cost}`,
      result: true
    });
  }
  
  return true; // If we got here, the card is playable
}
