import { useState, useEffect, useCallback } from 'react';
import { logGameState } from '../utils/gameDebugUtils';

/**
 * Hook to manage derived game state and player information
 */
export function useGameState(
  G: any,
  ctx: any,
  playerID: string | null
) {
  // Track opponent connection status
  const [opponentDisconnected, setOpponentDisconnected] = useState<boolean>(false);
  
  // Player and game phase state
  const [currentPlayerObj, setCurrentPlayerObj] = useState<any>(null);
  const [opponent, setOpponent] = useState<any>(null);
  const [currentPhase, setCurrentPhase] = useState<string>('');
  
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
    
    // Check opponent connection (if playerID exists in ctx.playerInfo)
    if (ctx.playerInfo) {
      const opponentID = isAttacker ? G.defender?.id : G.attacker?.id;
      const opponentInfo = ctx.playerInfo[opponentID];
      
      if (opponentInfo && opponentInfo.hasOwnProperty('isConnected')) {
        setOpponentDisconnected(!opponentInfo.isConnected);
      }
    }
  }, [G, ctx, playerID]);
  
  // Update player objects when the game state changes
  useEffect(() => {
    if (G && ctx) {
      updatePlayerObjects();
    }
  }, [G, ctx, updatePlayerObjects]);
  
  return {
    currentPlayerObj,
    opponent,
    opponentDisconnected,
    currentPhase,
    
    // Check if the player is attacker or defender
    isAttacker: G?.isAttacker !== undefined ? G.isAttacker : G?.attacker?.id === playerID,
    isDefender: G?.isDefender !== undefined ? G.isDefender : G?.defender?.id === playerID
  };
}
