/**
 * Lobby Storage Utility
 * 
 * Manages a single active lobby in localStorage instead of accumulating
 * multiple lobby credentials. Only one lobby can be active at a time.
 */

export interface ActiveMatch {
  matchID: string;
  playerID: string;
  credentials: string;
  timestamp: number;
  isInGame?: boolean; // true if in /game/, false if in /lobbies/
}

const ACTIVE_MATCH_KEY = 'activeMatch';

/**
 * Get the currently active match from localStorage
 */
export const getActiveMatch = (): ActiveMatch | null => {
  try {
    const stored = localStorage.getItem(ACTIVE_MATCH_KEY);
    if (!stored) return null;
    
    const match = JSON.parse(stored) as ActiveMatch;
    return match;
  } catch (error) {
    console.error('Error reading active match from localStorage:', error);
    return null;
  }
};

/**
 * Set the active match in localStorage
 * This will overwrite any existing active match
 */
export const setActiveMatch = (match: ActiveMatch): void => {
  try {
    localStorage.setItem(ACTIVE_MATCH_KEY, JSON.stringify(match));
    console.log(`✅ Active match set: ${match.matchID}`);
  } catch (error) {
    console.error('Error saving active match to localStorage:', error);
  }
};

/**
 * Update the active match to mark it as in-game
 * This should be called when navigating from /lobbies/ to /game/
 */
export const updateMatchToGame = (): void => {
  try {
    const active = getActiveMatch();
    if (active) {
      active.isInGame = true;
      localStorage.setItem(ACTIVE_MATCH_KEY, JSON.stringify(active));
      console.log(`✅ Active match updated to game mode: ${active.matchID}`);
    }
  } catch (error) {
    console.error('Error updating active match to game:', error);
  }
};

/**
 * Clear the active match from localStorage
 */
export const clearActiveMatch = (): void => {
  try {
    localStorage.removeItem(ACTIVE_MATCH_KEY);
    console.log('✅ Active match cleared');
  } catch (error) {
    console.error('Error clearing active match from localStorage:', error);
  }
};

/**
 * Check if there's an active match for a specific matchID
 */
export const hasActiveMatch = (matchID?: string): boolean => {
  const active = getActiveMatch();
  if (!active) return false;
  
  if (matchID) {
    return active.matchID === matchID;
  }
  
  return true;
};

/**
 * Clean up old localStorage keys from previous implementation
 * This migrates users from the old match_${id}_* format to the new activeMatch format
 */
export const migrateOldLobbyStorage = (): void => {
  try {
    const keysToRemove: string[] = [];
    
    // Find all old-style keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('match_') && (key.includes('_credentials') || key.includes('_playerID')))) {
        keysToRemove.push(key);
      }
    }
    
    // Remove them
    if (keysToRemove.length > 0) {
      console.log(`🧹 Cleaning up ${keysToRemove.length} old lobby storage keys...`);
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log('✅ Old lobby storage cleaned up');
    }
  } catch (error) {
    console.error('Error migrating old lobby storage:', error);
  }
};

/**
 * Get credentials for a specific match (for backward compatibility)
 */
export const getMatchCredentials = (matchID: string): { playerID: string; credentials: string } | null => {
  const active = getActiveMatch();
  if (!active || active.matchID !== matchID) {
    return null;
  }
  
  return {
    playerID: active.playerID,
    credentials: active.credentials
  };
};
