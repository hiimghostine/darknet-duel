import { useState, useCallback } from 'react';
import { getMatchCredentials, setActiveMatch, clearActiveMatch } from '../utils/lobbyStorage';

/**
 * Hook for managing game credentials and player ID
 * Abstracts all the localStorage operations for credentials management
 */
export function useGameCredentials(matchID: string | undefined) {
  const [playerID, setPlayerID] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<string | null>(null);

  /**
   * Load credentials from localStorage
   */
  const loadStoredCredentials = useCallback(() => {
    if (!matchID) return { storedPlayerID: null, storedCredentials: null };
    
    const creds = getMatchCredentials(matchID);
    
    if (creds) {
      setPlayerID(creds.playerID);
      setCredentials(creds.credentials);
      return { storedPlayerID: creds.playerID, storedCredentials: creds.credentials };
    }
    
    setPlayerID(null);
    setCredentials(null);
    return { storedPlayerID: null, storedCredentials: null };
  }, [matchID]);

  /**
   * Save credentials to localStorage
   */
  const saveCredentials = useCallback((playerID: string, credentials: string) => {
    if (!matchID) return;
    
    setActiveMatch({
      matchID,
      playerID,
      credentials,
      timestamp: Date.now()
    });
    
    setPlayerID(playerID);
    setCredentials(credentials);
  }, [matchID]);

  /**
   * Clear credentials from localStorage
   */
  const clearCredentials = useCallback(() => {
    if (!matchID) return;
    
    clearActiveMatch();
    
    setPlayerID(null);
    setCredentials(null);
  }, [matchID]);

  /**
   * Check if we have stored credentials
   */
  const hasStoredCredentials = useCallback(() => {
    const { storedPlayerID, storedCredentials } = loadStoredCredentials();
    return !!(storedPlayerID && storedCredentials);
  }, [loadStoredCredentials]);

  return {
    playerID,
    credentials,
    loadStoredCredentials,
    saveCredentials,
    clearCredentials,
    hasStoredCredentials
  };
}
