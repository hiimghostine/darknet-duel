// Re-export all game stores and their selectors
export { useGameUIStore, gameUISelectors } from './gameUI.store';
export { useGameBoardStore, gameBoardSelectors } from './gameBoard.store';
export { useCardActionsStore, cardActionsSelectors } from './cardActions.store';

// Import stores for utility functions
import { useGameUIStore } from './gameUI.store';
import { useGameBoardStore } from './gameBoard.store';
import { useCardActionsStore } from './cardActions.store';

// Utility function to reset all game stores
export const resetAllGameStores = () => {
  useGameUIStore.getState().reset();
  useGameBoardStore.getState().reset();
  useCardActionsStore.getState().reset();
};

// Combined store hooks for convenience
export const useGameStores = () => ({
  ui: useGameUIStore,
  board: useGameBoardStore,
  cardActions: useCardActionsStore,
});