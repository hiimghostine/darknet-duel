import { useState, useCallback } from 'react';

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
    
    const storedPlayerID = localStorage.getItem(`match_${matchID}_playerID`);
    const storedCredentials = localStorage.getItem(`match_${matchID}_credentials`);
    
    setPlayerID(storedPlayerID);
    setCredentials(storedCredentials);
    
    return { storedPlayerID, storedCredentials };
  }, [matchID]);

  /**
   * Save credentials to localStorage
   */
  const saveCredentials = useCallback((playerID: string, credentials: string) => {
    if (!matchID) return;
    
    localStorage.setItem(`match_${matchID}_playerID`, playerID);
    localStorage.setItem(`match_${matchID}_credentials`, credentials);
    
    setPlayerID(playerID);
    setCredentials(credentials);
  }, [matchID]);

  /**
   * Clear credentials from localStorage
   */
  const clearCredentials = useCallback(() => {
    if (!matchID) return;
    
    localStorage.removeItem(`match_${matchID}_playerID`);
    localStorage.removeItem(`match_${matchID}_credentials`);
    
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
