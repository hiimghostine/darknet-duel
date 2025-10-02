import { useState, useEffect, useCallback, useRef } from 'react';
import type { ConnectionStatus } from './useHeartbeat';

export interface DisconnectionState {
  isOpponentDisconnected: boolean;
  isClientDisconnected: boolean;
  disconnectionStartTime: number | null;
  countdownRemaining: number;
  showDisconnectionAlert: boolean;
  showReconnectWindow: boolean;
}

export interface DisconnectionConfig {
  opponentDisconnectTimeout: number; // 30 seconds
  clientReconnectWindow: number; // 30 seconds
  inactivityTimeout: number; // 10 minutes
}

const DEFAULT_DISCONNECTION_CONFIG: DisconnectionConfig = {
  opponentDisconnectTimeout: 30000, // 30 seconds
  clientReconnectWindow: 30000, // 30 seconds
  inactivityTimeout: 600000 // 10 minutes
};

/**
 * Hook for managing disconnection alerts and forfeit logic
 */
export function useDisconnectionHandler(
  connectionStatus: ConnectionStatus,
  opponentStatus: ConnectionStatus,
  isActive: boolean,
  lastActivityTime: number,
  hasInitialized: boolean,
  config: Partial<DisconnectionConfig> = {}
) {
  const finalConfig = { ...DEFAULT_DISCONNECTION_CONFIG, ...config };
  
  const [disconnectionState, setDisconnectionState] = useState<DisconnectionState>({
    isOpponentDisconnected: false,
    isClientDisconnected: false,
    disconnectionStartTime: null,
    countdownRemaining: 0,
    showDisconnectionAlert: false,
    showReconnectWindow: false
  });
  
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track if opponent has ever been connected (to distinguish "never connected" from "disconnected")
  const opponentWasConnectedRef = useRef<boolean>(false);
  
  /**
   * Start countdown timer
   */
  const startCountdown = useCallback((duration: number, isOpponent: boolean) => {
    const startTime = Date.now();
    
    setDisconnectionState(prev => ({
      ...prev,
      disconnectionStartTime: startTime,
      countdownRemaining: duration,
      showDisconnectionAlert: isOpponent,
      showReconnectWindow: !isOpponent,
      isOpponentDisconnected: isOpponent,
      isClientDisconnected: !isOpponent
    }));
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    countdownIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      
      setDisconnectionState(prev => ({
        ...prev,
        countdownRemaining: remaining
      }));
      
      if (remaining <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        
        // Trigger forfeit
        if (isOpponent) {
          // Opponent forfeit - connected player wins
          console.log('Opponent forfeit due to disconnection');
        } else {
          // Client forfeit - opponent wins
          console.log('Client forfeit due to failed reconnection');
        }
      }
    }, 100);
  }, []);
  
  /**
   * Stop countdown timer
   */
  const stopCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    setDisconnectionState(prev => ({
      ...prev,
      disconnectionStartTime: null,
      countdownRemaining: 0,
      showDisconnectionAlert: false,
      showReconnectWindow: false,
      isOpponentDisconnected: false,
      isClientDisconnected: false
    }));
  }, []);
  
  /**
   * Handle inactivity timeout
   */
  const handleInactivityTimeout = useCallback(() => {
    if (isActive) {
      console.log('Active player forfeit due to inactivity');
      // Trigger forfeit for active player
    }
  }, [isActive]);
  
  // Monitor opponent connection status
  useEffect(() => {
    // Only trigger disconnection alerts after initial connection is established
    if (!hasInitialized) return;
    
    // Track if opponent has ever been connected
    if (opponentStatus.isConnected) {
      opponentWasConnectedRef.current = true;
    }
    
    // Only show disconnection alert if opponent WAS connected before (not just "never connected")
    if (!opponentStatus.isConnected && !disconnectionState.isOpponentDisconnected && opponentWasConnectedRef.current) {
      // Opponent just disconnected (was connected before)
      console.log('Opponent disconnected - starting countdown');
      startCountdown(finalConfig.opponentDisconnectTimeout, true);
    } else if (opponentStatus.isConnected && disconnectionState.isOpponentDisconnected) {
      // Opponent reconnected
      console.log('Opponent reconnected - stopping countdown');
      stopCountdown();
    }
  }, [hasInitialized, opponentStatus.isConnected, disconnectionState.isOpponentDisconnected, startCountdown, stopCountdown, finalConfig.opponentDisconnectTimeout]);
  
  // Monitor client connection status
  useEffect(() => {
    // Only trigger disconnection alerts after initial connection is established
    if (!hasInitialized) return;
    
    if (!connectionStatus.isConnected && !disconnectionState.isClientDisconnected) {
      // Client just disconnected
      startCountdown(finalConfig.clientReconnectWindow, false);
    } else if (connectionStatus.isConnected && disconnectionState.isClientDisconnected) {
      // Client reconnected
      stopCountdown();
    }
  }, [hasInitialized, connectionStatus.isConnected, disconnectionState.isClientDisconnected, startCountdown, stopCountdown, finalConfig.clientReconnectWindow]);
  
  // Monitor inactivity timeout
  useEffect(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    
    if (isActive && lastActivityTime > 0) {
      const timeUntilForfeit = finalConfig.inactivityTimeout - (Date.now() - lastActivityTime);
      
      if (timeUntilForfeit > 0) {
        inactivityTimeoutRef.current = setTimeout(handleInactivityTimeout, timeUntilForfeit);
      } else {
        // Already past inactivity timeout
        handleInactivityTimeout();
      }
    }
    
    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [isActive, lastActivityTime, finalConfig.inactivityTimeout, handleInactivityTimeout]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCountdown();
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [stopCountdown]);
  
  return {
    disconnectionState,
    stopCountdown,
    timeUntilInactivityForfeit: isActive && lastActivityTime > 0 
      ? Math.max(0, finalConfig.inactivityTimeout - (Date.now() - lastActivityTime))
      : 0
  };
}
