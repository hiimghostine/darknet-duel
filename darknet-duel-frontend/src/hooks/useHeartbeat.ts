import { useState, useEffect, useCallback, useRef } from 'react';

export interface ConnectionStatus {
  isConnected: boolean;
  lastHeartbeat: number;
  latency: number;
  reconnectAttempts: number;
}

export interface HeartbeatConfig {
  interval: number; // Heartbeat interval in ms
  timeout: number; // Timeout for heartbeat response in ms
  maxReconnectAttempts: number;
  reconnectDelay: number;
}

const DEFAULT_CONFIG: HeartbeatConfig = {
  interval: 5000, // 5 seconds
  timeout: 3000, // 3 seconds
  maxReconnectAttempts: 6, // 30 seconds total (5s * 6)
  reconnectDelay: 5000
};

/**
 * Hook for managing heartbeat connection monitoring
 */
export function useHeartbeat(
  matchID: string | undefined,
  playerID: string | null,
  config: Partial<HeartbeatConfig> = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastHeartbeat: 0,
    latency: 0,
    reconnectAttempts: 0
  });
  
  const [opponentStatus, setOpponentStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastHeartbeat: 0,
    latency: 0,
    reconnectAttempts: 0
  });
  
  // Track if we've initialized the connection (prevents false disconnection alerts on load)
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const GAME_SERVER_URL = import.meta.env.VITE_GAME_SERVER_URL || 'http://localhost:8001';
  
  /**
   * Send heartbeat to server
   */
  const sendHeartbeat = useCallback(async () => {
    if (!matchID || !playerID) return;
    
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${GAME_SERVER_URL}/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchID,
          playerID,
          timestamp: startTime
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const latency = Date.now() - startTime;
        
        // Mark as initialized on first successful heartbeat
        if (!hasInitialized) {
          setHasInitialized(true);
        }
        
        setConnectionStatus(prev => ({
          ...prev,
          isConnected: true,
          lastHeartbeat: Date.now(),
          latency,
          reconnectAttempts: 0
        }));
        
        // Update opponent status if provided
        if (data.opponentStatus) {
          setOpponentStatus({
            isConnected: data.opponentStatus.isConnected,
            lastHeartbeat: data.opponentStatus.lastHeartbeat,
            latency: data.opponentStatus.latency || 0,
            reconnectAttempts: 0
          });
        }
      } else {
        throw new Error(`Heartbeat failed: ${response.status}`);
      }
    } catch (error) {
      console.warn('Heartbeat failed:', error);
      
      // Mark as initialized even on failure (after first attempt)
      if (!hasInitialized) {
        setHasInitialized(true);
      }
      
      setConnectionStatus(prev => ({
        ...prev,
        isConnected: false,
        reconnectAttempts: prev.reconnectAttempts + 1
      }));
    }
  }, [matchID, playerID, GAME_SERVER_URL, hasInitialized]);
  
  /**
   * Start heartbeat monitoring
   */
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    // Send initial heartbeat
    sendHeartbeat();
    
    // Set up interval
    heartbeatIntervalRef.current = setInterval(sendHeartbeat, finalConfig.interval);
  }, [sendHeartbeat, finalConfig.interval]);
  
  /**
   * Stop heartbeat monitoring
   */
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);
  
  /**
   * Attempt to reconnect
   */
  const attemptReconnect = useCallback(() => {
    if (connectionStatus.reconnectAttempts >= finalConfig.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }
    
    console.log(`Attempting to reconnect... (${connectionStatus.reconnectAttempts + 1}/${finalConfig.maxReconnectAttempts})`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      startHeartbeat();
    }, finalConfig.reconnectDelay);
  }, [connectionStatus.reconnectAttempts, finalConfig.maxReconnectAttempts, finalConfig.reconnectDelay, startHeartbeat]);
  
  // Start/stop heartbeat based on match and player availability
  useEffect(() => {
    if (matchID && playerID) {
      startHeartbeat();
    } else {
      stopHeartbeat();
    }
    
    return () => {
      stopHeartbeat();
    };
  }, [matchID, playerID, startHeartbeat, stopHeartbeat]);
  
  // Handle reconnection attempts
  useEffect(() => {
    if (!connectionStatus.isConnected && connectionStatus.reconnectAttempts > 0) {
      if (connectionStatus.reconnectAttempts < finalConfig.maxReconnectAttempts) {
        attemptReconnect();
      }
    }
  }, [connectionStatus.isConnected, connectionStatus.reconnectAttempts, attemptReconnect, finalConfig.maxReconnectAttempts]);
  
  return {
    connectionStatus,
    opponentStatus,
    sendHeartbeat,
    startHeartbeat,
    stopHeartbeat,
    hasInitialized,
    isReconnecting: connectionStatus.reconnectAttempts > 0 && connectionStatus.reconnectAttempts < finalConfig.maxReconnectAttempts,
    hasFailedToReconnect: connectionStatus.reconnectAttempts >= finalConfig.maxReconnectAttempts
  };
}
