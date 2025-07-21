// Export all bridge hooks for easy import
export { useCardActionsBridge } from './useCardActionsBridge';
export { 
  useGameStateBridge, 
  useGameUIBridge, 
  useGameBoardBridge, 
  useCardActionsBridgeSimple 
} from './useGameStateBridge';

// Re-export store hooks and selectors for convenience
export { 
  useGameUIStore, 
  gameUISelectors,
  useGameBoardStore, 
  gameBoardSelectors,
  useCardActionsStore, 
  cardActionsSelectors,
  resetAllGameStores 
} from '../../store/game';

/**
 * Migration Guide:
 * 
 * PHASE 1: Drop-in Replacement
 * - Replace `useCardActions` with `useCardActionsBridge`
 * - No other changes needed - same interface, same behavior
 * - Components continue to work exactly as before
 * 
 * PHASE 2: Enhanced Features
 * - Add `useGameStateBridge` to get enhanced state management
 * - Use new store-based features like animations, effects, validation
 * - Still maintains compatibility with existing prop drilling
 * 
 * PHASE 3: Pure Store Usage
 * - Replace bridge hooks with direct store usage
 * - Use `cardActionsSelectors.useSelectedCard()` instead of bridge
 * - Remove prop drilling entirely
 * 
 * Example Migration:
 * 
 * // Before (legacy)
 * const cardActions = useCardActions(props);
 * 
 * // Phase 1 (bridge)
 * const cardActions = useCardActionsBridge(props);
 * 
 * // Phase 2 (enhanced)
 * const cardActions = useCardActionsBridge(props);
 * const gameState = useGameStateBridge(props.G);
 * 
 * // Phase 3 (pure store)
 * const selectedCard = cardActionsSelectors.useSelectedCard();
 * const targetMode = cardActionsSelectors.useTargetMode();
 * const cardActionsStore = useCardActionsStore();
 */