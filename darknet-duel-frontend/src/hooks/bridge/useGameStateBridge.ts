import { useCallback, useMemo } from 'react';
import { useGameUIStore, gameUISelectors } from '../../store/game/gameUI.store';
import { useGameBoardStore, gameBoardSelectors } from '../../store/game/gameBoard.store';
import { useCardActionsStore, cardActionsSelectors } from '../../store/game/cardActions.store';
import type { GameState } from '../../types/game.types';

/**
 * Bridge hook that provides access to game state from both legacy props and new stores.
 * This allows components to gradually migrate from prop drilling to store-based state management.
 */
export function useGameStateBridge(legacyGameState?: GameState) {
  // Store selectors
  const uiState = gameUISelectors.useOverlayState();
  const targetingState = gameUISelectors.useTargeting();
  const statusState = gameUISelectors.useMessage();
  const effectsState = gameUISelectors.useEffects();
  
  const boardLayout = gameBoardSelectors.useBoardLayout();
  const infrastructureCards = gameBoardSelectors.useInfrastructureCards();
  const infrastructureStates = gameBoardSelectors.useInfrastructureStates();
  
  const selectedCard = cardActionsSelectors.useSelectedCard();
  const cardTargeting = cardActionsSelectors.useTargetMode();
  const validTargets = cardActionsSelectors.useValidTargets();
  const processing = cardActionsSelectors.useProcessing();
  
  // Store actions
  const gameUIStore = useGameUIStore();
  const gameBoardStore = useGameBoardStore();
  const cardActionsStore = useCardActionsStore();

  /**
   * Enhanced game state that combines legacy state with store state
   */
  const enhancedGameState = useMemo(() => {
    if (!legacyGameState) {
      return null;
    }

    return {
      ...legacyGameState,
      
      // Enhanced UI state from stores
      uiState: {
        isReactionMode: uiState.isReactionMode,
        isProcessing: uiState.isProcessing || processing,
        isNotificationVisible: uiState.isNotificationVisible,
        notificationMessage: uiState.notificationMessage,
        notificationColor: uiState.notificationColor,
        isEndTurnModalVisible: uiState.isEndTurnModalVisible,
        isSettingsModalVisible: uiState.isSettingsModalVisible,
        
        // Targeting state
        targetMode: targetingState.isTargetModeActive || cardTargeting,
        validTargets: targetingState.validTargets.length > 0 ? targetingState.validTargets : validTargets,
        highlightedTargets: targetingState.highlightedTargets,
        targetingMessage: targetingState.targetingMessage,
        
        // Status state
        currentMessage: statusState.message,
        messageColor: statusState.color,
        messageTimeout: statusState.timeout,
        
        // Effects state
        activeAnimations: effectsState.activeAnimations,
        particleEffects: effectsState.particleEffects,
        screenShake: effectsState.screenShake,
        flashEffect: effectsState.flashEffect,
      },
      
      // Enhanced board state from stores
      boardState: {
        layout: boardLayout,
        infrastructureCards: infrastructureCards.length > 0 ? infrastructureCards : legacyGameState.infrastructure,
        infrastructureStates,
        selectedInfrastructure: gameBoardSelectors.useSelectedInfrastructure(),
        hoveredInfrastructure: useGameBoardStore((state) => state.grid.hoveredInfrastructureId),
        targetableInfrastructure: gameBoardSelectors.useTargetableInfrastructure(),
        highlightedInfrastructure: gameBoardSelectors.useHighlightedInfrastructure(),
      },
      
      // Enhanced card actions state from stores
      cardActionsState: {
        selectedCard,
        targetMode: cardTargeting,
        validTargets,
        processing,
        targetedInfraId: cardActionsSelectors.useTargetedInfraId(),
        animatingThrow: cardActionsSelectors.useAnimatingThrow(),
        animatingPlay: cardActionsSelectors.useAnimatingPlay(),
        animatingCycle: cardActionsSelectors.useAnimatingCycle(),
        lastAction: cardActionsSelectors.useLastAction(),
        actionQueue: cardActionsSelectors.useActionQueue(),
        cardValidationStates: useCardActionsStore((state) => state.validation),
      },
    };
  }, [
    legacyGameState,
    uiState,
    targetingState,
    statusState,
    effectsState,
    boardLayout,
    infrastructureCards,
    infrastructureStates,
    selectedCard,
    cardTargeting,
    validTargets,
    processing,
    gameBoardStore,
    cardActionsStore
  ]);

  /**
   * Sync legacy state changes to stores
   */
  const syncLegacyToStores = useCallback((gameState: GameState) => {
    if (!gameState) return;

    // Sync infrastructure to board store
    if (gameState.infrastructure && gameState.infrastructure.length > 0) {
      gameBoardStore.setInfrastructureCards(gameState.infrastructure);
    }

    // Sync UI state
    if (gameState.message) {
      gameUIStore.setMessage(gameState.message, gameState.messageColor);
    }

    // Sync any processing states
    if (gameState.pendingWildcardChoice || gameState.pendingChainChoice || gameState.pendingHandChoice) {
      gameUIStore.setProcessing(true);
    } else {
      gameUIStore.setProcessing(false);
    }

    // Sync reaction mode
    if (gameState.pendingReactions && gameState.pendingReactions.length > 0) {
      gameUIStore.setReactionMode(true);
    } else {
      gameUIStore.setReactionMode(false);
    }
  }, [gameUIStore, gameBoardStore]);

  /**
   * Update infrastructure card in both legacy state and stores
   */
  const updateInfrastructure = useCallback((infraId: string, updates: any) => {
    // Update in board store
    gameBoardStore.updateInfrastructureCard(infraId, updates);
    
    // Trigger any necessary animations or effects
    if (updates.state && updates.state !== undefined) {
      gameBoardStore.addStateChangeAnimation(infraId, 'previous', updates.state);
      gameBoardStore.addGlowEffect(infraId, '#00ff00', 0.8, 1000);
    }
  }, [gameBoardStore]);

  /**
   * Handle card selection with store synchronization
   */
  const selectCard = useCallback((card: any) => {
    cardActionsStore.setSelectedCard(card);
    
    // Also update any legacy state handlers if provided
    if (card) {
      gameUIStore.setMessage(`Selected ${card.name}`, 'info', 2000);
    }
  }, [cardActionsStore, gameUIStore]);

  /**
   * Handle targeting mode with store synchronization
   */
  const setTargetMode = useCallback((active: boolean, validTargets: string[] = []) => {
    cardActionsStore.setTargetMode(active, active ? 'play' : undefined);
    cardActionsStore.setValidTargets(validTargets);
    gameUIStore.setTargetMode(active);
    gameUIStore.setValidTargets(validTargets);
    gameBoardStore.setTargetableInfrastructure(validTargets);
    
    if (active && validTargets.length > 0) {
      gameUIStore.setTargetingMessage(`Select target for ${selectedCard?.name || 'card'}`);
    } else {
      gameUIStore.setTargetingMessage(undefined);
    }
  }, [cardActionsStore, gameUIStore, gameBoardStore, selectedCard]);

  /**
   * Reset all stores to clean state
   */
  const resetGameStores = useCallback(() => {
    gameUIStore.reset();
    gameBoardStore.reset();
    cardActionsStore.reset();
  }, [gameUIStore, gameBoardStore, cardActionsStore]);

  return {
    // Enhanced state
    enhancedGameState,
    
    // Store states (for direct access)
    uiState,
    boardState: {
      layout: boardLayout,
      infrastructure: infrastructureCards,
      states: infrastructureStates,
    },
    cardActionsState: {
      selectedCard,
      targetMode: cardTargeting,
      validTargets,
      processing,
    },
    
    // Sync utilities
    syncLegacyToStores,
    updateInfrastructure,
    selectCard,
    setTargetMode,
    resetGameStores,
    
    // Store access (for advanced usage)
    stores: {
      ui: gameUIStore,
      board: gameBoardStore,
      cardActions: cardActionsStore,
    },
  };
}

/**
 * Hook for components that only need UI state
 */
export function useGameUIBridge() {
  return {
    overlays: gameUISelectors.useOverlayState(),
    targeting: gameUISelectors.useTargeting(),
    status: gameUISelectors.useMessage(),
    effects: gameUISelectors.useEffects(),
    actions: useGameUIStore(),
  };
}

/**
 * Hook for components that only need board state
 */
export function useGameBoardBridge() {
  return {
    layout: gameBoardSelectors.useBoardLayout(),
    infrastructure: gameBoardSelectors.useInfrastructureCards(),
    states: gameBoardSelectors.useInfrastructureStates(),
    visuals: gameBoardSelectors.useVisualEffects(),
    actions: useGameBoardStore(),
  };
}

/**
 * Hook for components that only need card actions state
 */
export function useCardActionsBridgeSimple() {
  return {
    selection: {
      selectedCard: cardActionsSelectors.useSelectedCard(),
      selectedForThrow: cardActionsSelectors.useSelectedForThrow(),
      selectedForPlay: cardActionsSelectors.useSelectedForPlay(),
    },
    targeting: {
      targetMode: cardActionsSelectors.useTargetMode(),
      targetedInfraId: cardActionsSelectors.useTargetedInfraId(),
      validTargets: cardActionsSelectors.useValidTargets(),
      requiresTarget: cardActionsSelectors.useRequiresTarget(),
    },
    animation: {
      animatingThrow: cardActionsSelectors.useAnimatingThrow(),
      animatingPlay: cardActionsSelectors.useAnimatingPlay(),
      animatingCycle: cardActionsSelectors.useAnimatingCycle(),
    },
    interaction: {
      processing: cardActionsSelectors.useProcessing(),
      lastAction: cardActionsSelectors.useLastAction(),
    },
    actions: useCardActionsStore(),
  };
}