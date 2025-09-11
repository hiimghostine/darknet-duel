import { useState, useEffect, useCallback, useMemo } from 'react';
import { logGameState } from '../utils/gameDebugUtils';

/**
 * Hook to manage derived game state and player information
 */
export function useGameState(
  G: any,
  ctx: any,
  playerID: string | null
) {
  
  // Player and game phase state
  const [currentPlayerObj, setCurrentPlayerObj] = useState<any>(null);
  const [opponent, setOpponent] = useState<any>(null);
  const [currentPhase, setCurrentPhase] = useState<string>('');
  
  // Memoize key values to prevent unnecessary callback recreation
  const memoizedDependencies = useMemo(() => ({
    attackerId: G?.attacker?.id,
    defenderId: G?.defender?.id,
    isAttacker: G?.isAttacker,
    phase: ctx?.phase,
    playerInfo: ctx?.playerInfo,
    playerID
  }), [G?.attacker?.id, G?.defender?.id, G?.isAttacker, ctx?.phase, ctx?.playerInfo, playerID]);
  
  // Helper to extract player objects based on role and connection
  const updatePlayerObjects = useCallback(() => {
    if (!G || !ctx) return;
    
    // Log game state for debugging
    logGameState(G, ctx, 'Updating player objects');
    
    // Get the current player ID
    const currentPlayerID = playerID || '0';
    
    // Determine if player is attacker or defender using the explicit flags
    // Fall back to ID comparison only if those flags aren't available
    const isAttacker = G.isAttacker !== undefined ? G.isAttacker : G.attacker?.id === currentPlayerID;
    
    // Set current player and opponent based on role
    const currentPlayer = isAttacker ? G.attacker : G.defender;
    const opponentPlayer = isAttacker ? G.defender : G.attacker;
    
    setCurrentPlayerObj(currentPlayer);
    setOpponent(opponentPlayer);
    
    // Set the current phase
    setCurrentPhase(ctx.phase || '');
    
  }, [
    // Use specific dependencies instead of entire G/ctx objects
    memoizedDependencies.attackerId,
    memoizedDependencies.defenderId,
    memoizedDependencies.isAttacker,
    memoizedDependencies.phase,
    memoizedDependencies.playerInfo,
    memoizedDependencies.playerID,
    G?.attacker,
    G?.defender,
    ctx?.playerInfo
  ]);
  
  // Update player objects when the key dependencies change
  useEffect(() => {
    updatePlayerObjects();
  }, [updatePlayerObjects]);
  
  // Memoize role calculations to prevent recalculation
  const roleFlags = useMemo(() => ({
    isAttacker: G?.isAttacker !== undefined ? G.isAttacker : G?.attacker?.id === playerID,
    isDefender: G?.isDefender !== undefined ? G.isDefender : G?.defender?.id === playerID
  }), [G?.isAttacker, G?.isDefender, G?.attacker?.id, G?.defender?.id, playerID]);
  
  return {
    currentPlayerObj,
    opponent,
    currentPhase,
    
    // Use memoized role flags
    isAttacker: roleFlags.isAttacker,
    isDefender: roleFlags.isDefender
  };
}
