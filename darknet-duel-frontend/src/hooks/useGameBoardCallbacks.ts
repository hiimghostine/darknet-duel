import { useCallback } from 'react';
import type { BoardProps } from 'boardgame.io/react';
import type { GameState } from '../types/game.types';

interface GameClient {
  moves: Record<string, ((...args: unknown[]) => unknown) | undefined> & {
    surrender?: () => void;
    sendChatMessage?: (content: string) => void;
    requestRematch?: () => void;
  };
  makeMove: (type: string, args: unknown[]) => void;
}

interface GameBoardProps extends BoardProps<GameState> {
  client?: GameClient;
}

/**
 * Custom hook for managing all callback handlers in the game board
 * Extracts callback logic from the main component for better separation of concerns
 */
export function useGameBoardCallbacks(props: GameBoardProps, moves: any) {
  // Handle player surrender - memoize callback to maintain referential equality
  const surrender = useCallback(() => {
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to surrender? This will end the game and count as a loss.');
    if (!confirmed) return;
    
    console.log('CLIENT: Executing surrender move');
    
    // First try using the moves.surrender function - use non-memoized moves
    if (moves && typeof moves.surrender === 'function') {
      try {
        moves.surrender();
        return; // If this succeeds, we're done
      } catch (error) {
        console.error('CLIENT: Error calling moves.surrender:', error);
        // Continue to try the fallbacks
      }
    } else {
      console.log('CLIENT: surrender move not available in moves, trying alternatives');
    }
    
    // Try using the client's makeMove function as a fallback
    if (props.client && props.client.moves && typeof props.client.moves.surrender === 'function') {
      try {
        props.client.moves.surrender();
        return;
      } catch (error) {
        console.error('CLIENT: Error calling client.moves.surrender:', error);
      }
    }
    
    // As a last resort, try manual move
    try {
      if (props.client) {
        props.client.makeMove('surrender', []);
      }
    } catch (error) {
      console.error('CLIENT: All surrender attempts failed:', error);
      alert('Unable to surrender. Please try again or refresh the page.');
    }
  }, [moves, props.client]);

  // Helper to make the chat message move correctly even if we have to fall back to other methods
  const sendChatMessage = useCallback((content: string) => {
    if (!content.trim()) return; // Don't send empty messages
    
    console.log('CLIENT: Trying to send chat message:', content);
    // Debug what moves are available
    console.log('CLIENT: Available moves:', Object.keys(moves || {}));
    
    // First try using the moves.sendChatMessage function directly
    if (moves && typeof moves.sendChatMessage === 'function') {
      try {
        console.log('CLIENT: Executing sendChatMessage move');
        moves.sendChatMessage(content);
        return; // If this succeeds, we're done
      } catch (error) {
        console.error('CLIENT: Error calling moves.sendChatMessage:', error);
        // Continue to try the fallbacks
      }
    } else {
      console.log('CLIENT: sendChatMessage not available in moves, trying alternatives');
    }
    
    // Try using the client's sendChatMessage function as a fallback
    if (props.client && props.client.moves && typeof props.client.moves.sendChatMessage === 'function') {
      try {
        console.log('CLIENT: Attempting to use client.moves.sendChatMessage as fallback');
        props.client.moves.sendChatMessage(content);
        return;
      } catch (error) {
        console.error('CLIENT: Error calling client.moves.sendChatMessage:', error);
      }
    }
    
    // As a last resort, try using the makeMove method directly
    try {
      if (props.client) {
        props.client.makeMove('sendChatMessage', [content]);
      }
    } catch (error) {
      console.error('CLIENT: All chat message attempts failed:', error);
    }
  }, [moves, props.client]);

  // Helper to make the rematch request move
  const requestRematch = useCallback(() => {
    console.log('CLIENT: Trying to request rematch');
    // Debug what moves are available
    console.log('CLIENT: Available moves for rematch:', Object.keys(moves));
      
    // Use non-memoized moves to ensure we have the latest functions
    if (moves && typeof moves.requestRematch === 'function') {
      try {
        console.log('CLIENT: Executing requestRematch move');
        moves.requestRematch();
      } catch (error) {
        console.error('CLIENT: Error requesting rematch:', error);
      }
    } else {
      console.error('CLIENT: requestRematch move is not defined or not a function');
      // Try using the client's makeMove function as a fallback
      if (props.client && props.client.moves && typeof props.client.moves.requestRematch === 'function') {
        console.log('CLIENT: Attempting to use client.moves.requestRematch as fallback');
        props.client.moves.requestRematch();
      }
    }
  }, [moves, props.client]);
  
  // Create the handler for chain target choice
  const handleChooseChainTarget = useCallback((targetId: string) => {
    console.log('🔥 Chain target handler called with:', targetId);
    console.log('🔥 Available moves:', Object.keys(moves || {}));
    console.log('🔥 chooseChainTarget function exists:', typeof moves.chooseChainTarget);
    
    if (moves.chooseChainTarget) {
      console.log('🔥 Calling moves.chooseChainTarget with:', targetId);
      moves.chooseChainTarget(targetId);
      console.log('🔥 Chain target selected:', targetId);
    } else {
      console.error('🔥 moves.chooseChainTarget is not available!');
    }
  }, [moves]);
  
  // Create the handler for wildcard type choice - Phase 2
  const handleChooseWildcardType = useCallback((type: string) => {
    if (moves.chooseWildcardType) {
      moves.chooseWildcardType({ type });
    }
  }, [moves]);
  
  // Create the handler for hand discard choice - Phase 3
  const handleChooseHandDiscard = useCallback((cardIds: string[]) => {
    if (moves.chooseHandDiscard) {
      moves.chooseHandDiscard({ cardIds });
      console.log('Hand cards selected for discard:', cardIds);
    }
  }, [moves]);
  
  // Create the handler for card selection from deck - AI-Powered Attack
  const handleChooseCardFromDeck = useCallback((cardId: string) => {
    if (moves.chooseCardFromDeck) {
      moves.chooseCardFromDeck({ cardId });
      console.log('Card selected from deck:', cardId);
    }
  }, [moves]);

  return {
    surrender,
    sendChatMessage,
    requestRematch,
    handleChooseChainTarget,
    handleChooseWildcardType,
    handleChooseHandDiscard,
    handleChooseCardFromDeck
  };
}