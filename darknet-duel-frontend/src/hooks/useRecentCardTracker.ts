import { useState, useEffect, useCallback } from 'react';
import type { Card } from '../types/card.types';
import type { GameState } from '../types/game.types';

interface RecentCardPlay {
  card: Card;
  playerId: string;
  playerName: string;
  timestamp: number;
  targetId?: string;
}

interface UseRecentCardTrackerReturn {
  recentCardPlay: RecentCardPlay | null;
  dismissRecentCard: () => void;
}

/**
 * Hook to track recently played cards and show them to both players
 * Monitors game state changes to detect when cards are played
 */
export function useRecentCardTracker(
  gameState: GameState,
  currentPlayerID: string | null
): UseRecentCardTrackerReturn {
  const [recentCardPlay, setRecentCardPlay] = useState<RecentCardPlay | null>(null);
  const [lastActionCount, setLastActionCount] = useState(0);

  // Track game actions to detect new card plays
  useEffect(() => {
    if (!gameState?.actions || !currentPlayerID) return;

    const currentActionCount = gameState.actions.length;
    
    // Check if there are new actions
    if (currentActionCount > lastActionCount) {
      const newActions = gameState.actions.slice(lastActionCount);
      
      // Look for card play actions
      const cardPlayAction = newActions.find(action => 
        action.actionType === 'playCard' || 
        action.actionType === 'throwCard' ||
        action.actionType === 'cycleCard'
      );

      if (cardPlayAction && cardPlayAction.payload) {
        const payload = cardPlayAction.payload as any;
        const cardId = payload?.cardId as string;
        const cardName = payload?.cardName as string;
        const cardType = payload?.cardType as string;
        const targetId = payload?.targetId as string | undefined;
        
        // Get player info
        const playerId = cardPlayAction.playerRole === 'attacker' ? '0' : '1';
        const player = playerId === '0' ? gameState.attacker : gameState.defender;
        const playerName = player?.name || (cardPlayAction.playerRole === 'attacker' ? 'Attacker' : 'Defender');

        // Create card object from action data
        const playedCard: Card = {
          id: cardId || 'unknown',
          name: cardName || 'Unknown Card',
          type: (cardType || 'attack') as Card['type'],
          description: 'Card played by opponent',
          cost: 1,
          effects: []
        };

        // Set the recent card play
        setRecentCardPlay({
          card: playedCard,
          playerId,
          playerName,
          timestamp: cardPlayAction.timestamp,
          targetId
        });

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setRecentCardPlay(null);
        }, 5000);
      }

      setLastActionCount(currentActionCount);
    }
  }, [gameState?.actions, lastActionCount, currentPlayerID]);

  // Manual dismiss function
  const dismissRecentCard = useCallback(() => {
    setRecentCardPlay(null);
  }, []);

  return {
    recentCardPlay,
    dismissRecentCard
  };
}
