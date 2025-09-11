import { useState, useEffect, useCallback } from 'react';

// Define the server URL from env var or fallback to localhost
const GAME_SERVER_URL = import.meta.env.VITE_GAME_SERVER_URL || 'http://localhost:8001';

/**
 * Hook for managing game server connection status and operations
 */
export function useGameConnection(matchID: string | undefined, playerID: string | null, credentials: string | null) {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected'>('connecting');
  const [lastConnectionAttempt, setLastConnectionAttempt] = useState<number>(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  /**
   * Check if the match exists on the server
   */
  const checkMatchExists = useCallback(async () => {
    if (!matchID) {
      setConnectionError('Match ID not provided');
      return false;
    }
    
    try {
      const response = await fetch(`${GAME_SERVER_URL}/games/darknet-duel/${matchID}`);
      if (!response.ok) {
        setConnectionError(`Match not found: ${response.statusText}`);
        return false;
      }
      
      return true;
    } catch (err) {
      setConnectionError(`Failed to connect to game server: ${(err as Error)?.message || 'Unknown error'}`);
      return false;
    }
  }, [matchID]);

  /**
   * Notify the server that a player is leaving
   */
  const leaveMatch = useCallback(async () => {
    if (!matchID || !playerID || !credentials) return;
    
    try {
      // Use fetch to notify the server about leaving
      const response = await fetch(`${GAME_SERVER_URL}/games/darknet-duel/${matchID}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerID,
          credentials
        })
      });
      
      if (!response.ok) {
        console.error('Error leaving match:', response.statusText);
      }
      
      return true;
    } catch (err) {
      console.error('Error sending leave notification:', err);
      return false;
    }
  }, [matchID, playerID, credentials]);

  /**
   * Get opponent connection status
   */
  const getOpponentConnectionStatus = useCallback(async () => {
    if (!matchID) return false;
    
    try {
      const response = await fetch(`${GAME_SERVER_URL}/games/darknet-duel/${matchID}`);
      if (!response.ok) return false;
      
      const gameInfo = await response.json();
      
      // Check if there's another connected player
      const players = gameInfo.players || [];
      const opponentConnected = players.some((player: any, index: number) => {
        // Skip the current player
        if (playerID === String(index)) return false;
        // Check if another player is connected
        return player && player.isConnected;
      });
      
      return opponentConnected;
    } catch (err) {
      console.error('Error checking opponent connection:', err);
      return false;
    }
  }, [matchID, playerID]);

  /**
   * Attempt to reconnect to the game
   */
  const attemptReconnect = useCallback(async () => {
    // Don't retry too frequently
    const now = Date.now();
    if (now - lastConnectionAttempt < 5000) return;
    
    setLastConnectionAttempt(now);
    setConnectionStatus('connecting');
    
    const exists = await checkMatchExists();
    if (exists) {
      setConnectionStatus('connected');
      setConnectionError(null);
    } else {
      setConnectionStatus('connecting');
    }
  }, [checkMatchExists, lastConnectionAttempt]);

  // Monitor connection status changes
  useEffect(() => {
    if (!matchID || !playerID) return;
    
    const checkConnectionStatus = async () => {
      try {
        const exists = await checkMatchExists();
        if (exists) {
          setConnectionStatus('connected');
          setConnectionError(null);
        } else {
          setConnectionStatus('connecting');
        }
      } catch (err) {
        setConnectionStatus('connecting');
        setConnectionError(`Connection error: ${(err as Error)?.message || 'Unknown error'}`);
      }
    };
    
    // Check immediately and then periodically
    checkConnectionStatus();
    const interval = setInterval(checkConnectionStatus, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [matchID, playerID, checkMatchExists]);
  
  return {
    connectionStatus,
    connectionError,
    checkMatchExists,
    leaveMatch,
    getOpponentConnectionStatus,
    attemptReconnect,
    GAME_SERVER_URL
  };
}
