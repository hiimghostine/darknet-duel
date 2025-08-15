import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import type { GameState } from '../../types/game.types';
import { useOptimizedGameState } from '../../hooks/useOptimizedGameState';

interface GameStateContextType {
  G: GameState;
  ctx: any;
  playerID: string | null;
  isActive: boolean;
  isAttacker: boolean;
}

const GameStateContext = createContext<GameStateContextType | null>(null);

interface GameStateProviderProps {
  G: GameState;
  ctx: any;
  playerID: string | null;
  isActive: boolean;
  children: ReactNode;
}

export function GameStateProvider({ 
  G, 
  ctx, 
  playerID, 
  isActive, 
  children 
}: GameStateProviderProps) {
  // Use optimized game state to minimize re-renders
  const optimizedState = useOptimizedGameState(G, ctx, playerID);
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => {
    const isAttacker = playerID === '0';
    
    return {
      G: optimizedState.G,
      ctx: optimizedState.ctx,
      playerID: optimizedState.playerID,
      isActive,
      isAttacker
    };
  }, [optimizedState.G, optimizedState.ctx, optimizedState.playerID, isActive]);

  return (
    <GameStateContext.Provider value={contextValue}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameStateContext() {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameStateContext must be used within a GameStateProvider');
  }
  return context;
}


