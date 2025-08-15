import React, { memo } from 'react';
import type { BoardProps } from 'boardgame.io/react';
import type { GameState } from '../../types/game.types';
import { GameStateProvider } from './GameStateProvider';
import { BalatroGameBoard } from '../BalatroGameBoard';

interface OptimizedGameBoardProps extends BoardProps<GameState> {
  client?: any;
}

/**
 * Optimized wrapper for the game board that implements advanced memoization
 * to handle boardgame.io's full state transmission limitation
 */
const OptimizedGameBoard = memo((props: OptimizedGameBoardProps) => {
  const { G, ctx, playerID, isActive, moves, client } = props;

  return (
    <GameStateProvider
      G={G}
      ctx={ctx}
      playerID={playerID}
      isActive={isActive}
    >
      <BalatroGameBoard
        G={G}
        ctx={ctx}
        playerID={playerID}
        isActive={isActive}
        moves={moves}
        client={client}
      />
    </GameStateProvider>
  );
}, (prevProps, nextProps) => {
  // Ultra-optimized comparison that only checks the most critical changes
  
  // Quick safety checks
  if (!prevProps.G || !nextProps.G || !prevProps.ctx || !nextProps.ctx) {
    return false;
  }

  // Player state changes (most important)
  if (prevProps.isActive !== nextProps.isActive ||
      prevProps.playerID !== nextProps.playerID) {
    return false;
  }

  // Game phase changes
  if (prevProps.ctx.phase !== nextProps.ctx.phase ||
      prevProps.ctx.currentPlayer !== nextProps.ctx.currentPlayer ||
      prevProps.ctx.gameover !== nextProps.ctx.gameover) {
    return false;
  }

  // Critical game state changes only
  if (prevProps.G.gamePhase !== nextProps.G.gamePhase ||
      prevProps.G.message !== nextProps.G.message ||
      prevProps.G.attackerScore !== nextProps.G.attackerScore ||
      prevProps.G.defenderScore !== nextProps.G.defenderScore) {
    return false;
  }

  // Player hand changes (very frequent)
  const prevAttackerHandLength = prevProps.G.attacker?.hand?.length || 0;
  const nextAttackerHandLength = nextProps.G.attacker?.hand?.length || 0;
  const prevDefenderHandLength = prevProps.G.defender?.hand?.length || 0;
  const nextDefenderHandLength = nextProps.G.defender?.hand?.length || 0;

  if (prevAttackerHandLength !== nextAttackerHandLength ||
      prevDefenderHandLength !== nextDefenderHandLength) {
    return false;
  }

  // Infrastructure changes
  const prevInfraLength = prevProps.G.infrastructure?.length || 0;
  const nextInfraLength = nextProps.G.infrastructure?.length || 0;
  
  if (prevInfraLength !== nextInfraLength) {
    return false;
  }

  // Pending choice changes
  const prevChainChoice = prevProps.G.pendingChainChoice?.playerId;
  const nextChainChoice = nextProps.G.pendingChainChoice?.playerId;
  const prevWildcardChoice = prevProps.G.pendingWildcardChoice?.playerId;
  const nextWildcardChoice = nextProps.G.pendingWildcardChoice?.playerId;
  const prevHandChoice = prevProps.G.pendingHandChoice?.targetPlayerId;
  const nextHandChoice = nextProps.G.pendingHandChoice?.targetPlayerId;
  const prevCardChoice = prevProps.G.pendingCardChoice?.playerId;
  const nextCardChoice = nextProps.G.pendingCardChoice?.playerId;

  if (prevChainChoice !== nextChainChoice ||
      prevWildcardChoice !== nextWildcardChoice ||
      prevHandChoice !== nextHandChoice ||
      prevCardChoice !== nextCardChoice) {
    return false;
  }

  // If we reach here, no critical changes detected
  return true;
});

OptimizedGameBoard.displayName = 'OptimizedGameBoard';

export default OptimizedGameBoard;


