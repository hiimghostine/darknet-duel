import { useState, useEffect, useRef, useMemo } from 'react';
import { isEqual } from 'lodash';

/**
 * Hook to buffer game state and prevent flash during action processing
 * Maintains the last valid state when game state becomes empty/invalid
 */
export function useGameStateBuffer(G: any, ctx: any, playerID: string | null) {
  const [bufferedState, setBufferedState] = useState<any>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const lastValidStateRef = useRef<any>(null);
  const lastCtxRef = useRef<any>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check if current state is valid (has essential game data)
  const isValidState = useMemo(() => {
    if (!G || !ctx) return false;
    
    // State is valid if it has players and infrastructure
    return (
      G.attacker && 
      G.defender && 
      G.infrastructure && 
      Array.isArray(G.infrastructure) &&
      G.infrastructure.length > 0
    );
  }, [G, ctx]);
  
  // Detect turn transitions to avoid blocking legitimate state updates
  const isTurnTransition = useMemo(() => {
    if (!ctx || !lastCtxRef.current) return false;
    
    // Check if currentPlayer changed (turn handoff)
    return ctx.currentPlayer !== lastCtxRef.current.currentPlayer;
  }, [ctx]);
  
  // Detect if we're in an action processing state
  const isProcessingAction = useMemo(() => {
    if (!ctx) return false;
    
    // Never block during turn transitions
    if (isTurnTransition) return false;
    
    // Only consider it processing if we have an explicit processing phase
    // Don't block updates during normal turn transitions or when activePlayers is empty
    return (
      ctx.phase === 'processing' ||
      // Only block if state is truly invalid AND we're not in a normal game phase
      (!isValidState && ctx.phase !== 'playing' && ctx.phase !== 'setup')
    );
  }, [ctx, isValidState, isTurnTransition]);
  
  useEffect(() => {
    // Clear any existing transition timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    
    // Always update if we have a valid state, regardless of processing status
    // This ensures turn handoffs and legitimate state changes are never blocked
    if (isValidState) {
      if (!isEqual(G, lastValidStateRef.current)) {
        lastValidStateRef.current = G;
        
        if (isTransitioning) {
          // Smooth transition from buffered to new state
          setIsTransitioning(false);
          
          // Small delay to allow for smooth transition
          transitionTimeoutRef.current = setTimeout(() => {
            setBufferedState(G);
          }, 50);
        } else {
          setBufferedState(G);
        }
      }
    } else if (!isValidState && lastValidStateRef.current && isProcessingAction) {
      // Only buffer when state is invalid AND we're actually processing an action
      // This prevents blocking during normal turn transitions
      if (!isTransitioning) {
        setIsTransitioning(true);
        // Keep the current buffered state, don't update it
      }
    } else if (!isValidState && !lastValidStateRef.current) {
      // First time with invalid state - just use what we have
      setBufferedState(G);
    }
    
    // Update context reference for turn transition detection
    lastCtxRef.current = ctx;
  }, [G, ctx, isValidState, isProcessingAction, isTransitioning]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);
  
  return {
    // Return buffered state if we have it, otherwise current state
    gameState: bufferedState || G,
    context: ctx,
    isTransitioning,
    isProcessingAction,
    hasValidState: isValidState
  };
}
