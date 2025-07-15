import { useMemo } from 'react';
import type { GameState } from '../types/game.types';

/**
 * Custom hook for processing and memoizing game board data
 * Extracts data processing logic from the main component for better performance
 */
export function useGameBoardData(memoizedG: GameState, currentPhase: string) {
  // Optimized infrastructure data with performance utilities
  const infrastructureData = useMemo(() => ({
    cards: memoizedG?.infrastructure || [],
    length: memoizedG?.infrastructure?.length || 0,
    states: memoizedG?.infrastructure?.map(infra => ({ id: infra.id, state: infra.state })) || []
  }), [memoizedG?.infrastructure]);
  
  const playerData = useMemo(() => ({
    attacker: {
      id: memoizedG?.attacker?.id,
      handSize: memoizedG?.attacker?.hand?.length || 0
    },
    defender: {
      id: memoizedG?.defender?.id,
      handSize: memoizedG?.defender?.hand?.length || 0
    }
  }), [memoizedG?.attacker?.id, memoizedG?.attacker?.hand?.length, memoizedG?.defender?.id, memoizedG?.defender?.hand?.length]);
  
  // Performance utilities for child components
  const gameMetrics = useMemo(() => ({
    attackerScore: memoizedG?.attackerScore || 0,
    defenderScore: memoizedG?.defenderScore || 0,
    totalInfrastructure: infrastructureData.length,
    currentPhase,
    messagePresent: Boolean(memoizedG?.message)
  }), [memoizedG?.attackerScore, memoizedG?.defenderScore, infrastructureData.length, currentPhase, memoizedG?.message]);

  return {
    infrastructureData,
    playerData,
    gameMetrics
  };
}