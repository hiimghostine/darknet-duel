import { useState, useCallback } from 'react';
import type { BoardProps } from 'boardgame.io/react';
import type { GameState } from '../types/game.types';
import { logMoveAttempt } from '../utils/gameDebugUtils';

/**
 * Hook for managing turn-based actions in the game
 */
export function useTurnActions(props: BoardProps<GameState>) {
  const { ctx, moves, playerID, isActive } = props;
  const [processing, setProcessing] = useState<boolean>(false);
  
  /**
   * Handle ending the current turn
   */
  const handleEndTurn = useCallback(() => {
    if (!isActive) {
      console.log('Cannot end turn - player is not active');
      return;
    }
    
    logMoveAttempt('endTurn');
    setProcessing(true);
    
    // Execute the move after a short delay to allow for UI update
    setTimeout(() => {
      if (moves && typeof moves.endTurn === 'function') {
        moves.endTurn();
        console.log('Called endTurn move');
      } else {
        console.error('endTurn function not available');
      }
      
      // Reset processing state after a short delay
      setTimeout(() => setProcessing(false), 300);
    }, 50);
  }, [moves, isActive]);

  /**
   * Handle skipping reaction phase
   */
  const handleSkipReaction = useCallback(() => {
    // Only allow skipping reaction if it's the player's turn and they are active
    if (!isActive) {
      console.log('Cannot skip reaction - player is not active');
      return;
    }
    
    // Check if we're in the reaction stage
    const inReactionStage = ctx.activePlayers && 
      playerID && 
      ctx.activePlayers[playerID] === 'reaction';
      
    if (!inReactionStage) {
      console.log('Cannot skip reaction - not in reaction stage');
      return;
    }
    
    logMoveAttempt('skipReaction');
    setProcessing(true);
    
    // Execute the move after a short delay to allow for UI update
    setTimeout(() => {
      if (moves && typeof moves.skipReaction === 'function') {
        moves.skipReaction();
        console.log('Called skipReaction move');
      } else {
        console.error('skipReaction function not available');
      }
      
      // Reset processing state after a short delay
      setTimeout(() => setProcessing(false), 300);
    }, 50);
  }, [moves, isActive, ctx.activePlayers, playerID]);
  
  return {
    processing,
    handleEndTurn,
    handleSkipReaction,
    setProcessing
  };
}

export default useTurnActions;
