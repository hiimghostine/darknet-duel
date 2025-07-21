/**
 * Integration tests for game stores
 * These tests verify that the stores work correctly together and maintain compatibility
 * with existing functionality patterns.
 */

import { useGameUIStore } from './gameUI.store';
import { useGameBoardStore } from './gameBoard.store';
import { useCardActionsStore } from './cardActions.store';
import { resetAllGameStores } from './index';

// Mock infrastructure card for testing
const mockInfrastructureCard = {
  id: 'infra-1',
  name: 'Test Server',
  type: 'network' as const,
  description: 'A test server',
  flavor: 'Test flavor',
  vulnerabilities: [],
  img: 'test.png',
  state: 'secure' as const,
};

// Mock card for testing
const mockCard = {
  id: 'card-1',
  name: 'Test Attack',
  type: 'attack' as const,
  description: 'A test attack card',
  cost: 2,
  img: 'test-card.png',
  requiresTarget: true,
};

describe('Game Stores Integration', () => {
  beforeEach(() => {
    // Reset all stores before each test
    resetAllGameStores();
  });

  describe('Store Initialization', () => {
    it('should initialize all stores with correct default values', () => {
      const uiStore = useGameUIStore.getState();
      const boardStore = useGameBoardStore.getState();
      const cardActionsStore = useCardActionsStore.getState();

      // UI Store defaults
      expect(uiStore.overlays.isReactionMode).toBe(false);
      expect(uiStore.overlays.isProcessing).toBe(false);
      expect(uiStore.targeting.targetMode).toBe(false);
      expect(uiStore.targeting.validTargets).toEqual([]);
      expect(uiStore.effects.activeAnimations).toEqual([]);

      // Board Store defaults
      expect(boardStore.layout.gridSize).toEqual({ rows: 3, cols: 4 });
      expect(boardStore.grid.infrastructureCards).toEqual([]);
      expect(boardStore.grid.targetableInfrastructureIds).toEqual([]);
      expect(boardStore.visuals.connectionLines).toEqual([]);

      // Card Actions Store defaults
      expect(cardActionsStore.selection.selectedCard).toBe(null);
      expect(cardActionsStore.targeting.targetMode).toBe(false);
      expect(cardActionsStore.animation.animatingThrow).toBe(false);
      expect(cardActionsStore.interaction.processing).toBe(false);
    });
  });

  describe('Cross-Store State Synchronization', () => {
    it('should synchronize targeting state across UI and Card Actions stores', () => {
      const uiStore = useGameUIStore.getState();
      const cardActionsStore = useCardActionsStore.getState();

      // Set target mode in card actions store
      cardActionsStore.setTargetMode(true, 'play');
      cardActionsStore.setValidTargets(['infra-1', 'infra-2']);

      // Set target mode in UI store
      uiStore.setTargetMode(true);
      uiStore.setValidTargets(['infra-1', 'infra-2']);

      // Both stores should have consistent state
      expect(useCardActionsStore.getState().targeting.targetMode).toBe(true);
      expect(useGameUIStore.getState().targeting.targetMode).toBe(true);
      expect(useCardActionsStore.getState().targeting.validTargets).toEqual(['infra-1', 'infra-2']);
      expect(useGameUIStore.getState().targeting.validTargets).toEqual(['infra-1', 'infra-2']);
    });

    it('should synchronize infrastructure state between Board store and infrastructure data', () => {
      const boardStore = useGameBoardStore.getState();

      // Add infrastructure to board store
      boardStore.setInfrastructureCards([mockInfrastructureCard]);
      boardStore.setTargetableInfrastructure(['infra-1']);
      boardStore.setHighlightedInfrastructure(['infra-1']);

      const state = useGameBoardStore.getState();
      expect(state.grid.infrastructureCards).toHaveLength(1);
      expect(state.grid.infrastructureCards[0].id).toBe('infra-1');
      expect(state.grid.targetableInfrastructureIds).toEqual(['infra-1']);
      expect(state.grid.highlightedInfrastructureIds).toEqual(['infra-1']);
    });
  });

  describe('Card Actions Integration', () => {
    it('should handle card selection and targeting workflow', () => {
      const cardActionsStore = useCardActionsStore.getState();
      const boardStore = useGameBoardStore.getState();
      const uiStore = useGameUIStore.getState();

      // Step 1: Select a card
      cardActionsStore.setSelectedCard(mockCard as any);
      expect(useCardActionsStore.getState().selection.selectedCard?.id).toBe('card-1');

      // Step 2: Enter targeting mode
      cardActionsStore.setTargetMode(true, 'throw');
      cardActionsStore.setValidTargets(['infra-1']);
      
      // Step 3: Set up board for targeting
      boardStore.setInfrastructureCards([mockInfrastructureCard]);
      boardStore.setTargetableInfrastructure(['infra-1']);

      // Step 4: Verify targeting state
      const cardState = useCardActionsStore.getState();
      const boardState = useGameBoardStore.getState();
      
      expect(cardState.targeting.targetMode).toBe(true);
      expect(cardState.targeting.validTargets).toEqual(['infra-1']);
      expect(boardState.grid.targetableInfrastructureIds).toEqual(['infra-1']);

      // Step 5: Target infrastructure
      cardActionsStore.setTargetedInfraId('infra-1');
      expect(useCardActionsStore.getState().targeting.targetedInfraId).toBe('infra-1');

      // Step 6: Reset targeting
      cardActionsStore.resetTargeting();
      const resetState = useCardActionsStore.getState();
      expect(resetState.targeting.targetMode).toBe(false);
      expect(resetState.selection.selectedCard).toBe(null);
      expect(resetState.targeting.targetedInfraId).toBe(null);
    });

    it('should handle animation states correctly', () => {
      const cardActionsStore = useCardActionsStore.getState();

      // Start throw animation
      cardActionsStore.setAnimatingThrow(true, 'infra-1');
      expect(useCardActionsStore.getState().animation.animatingThrow).toBe(true);
      expect(useCardActionsStore.getState().animation.throwAnimationTarget).toBe('infra-1');

      // Start play animation
      cardActionsStore.setAnimatingPlay(true, 'card-1');
      expect(useCardActionsStore.getState().animation.animatingPlay).toBe(true);
      expect(useCardActionsStore.getState().animation.playAnimationCard).toBe('card-1');

      // Add animation to queue
      cardActionsStore.addAnimationToQueue({
        type: 'throw',
        cardId: 'card-1',
        targetId: 'infra-1',
        duration: 1000,
      });

      expect(useCardActionsStore.getState().animation.animationQueue).toHaveLength(1);
      expect(useCardActionsStore.getState().animation.animationQueue[0].type).toBe('throw');
    });
  });

  describe('UI Effects and Visual State', () => {
    it('should handle overlay states correctly', () => {
      const uiStore = useGameUIStore.getState();

      // Test processing state
      uiStore.setProcessing(true);
      expect(useGameUIStore.getState().overlays.isProcessing).toBe(true);

      // Test notification
      uiStore.showNotification('Test message', 'success', 3000);
      const state = useGameUIStore.getState().overlays;
      expect(state.isNotificationVisible).toBe(true);
      expect(state.notificationMessage).toBe('Test message');
      expect(state.notificationColor).toBe('success');

      // Test reaction mode
      uiStore.setReactionMode(true);
      expect(useGameUIStore.getState().overlays.isReactionMode).toBe(true);
    });

    it('should handle visual effects correctly', () => {
      const uiStore = useGameUIStore.getState();

      // Add animation
      uiStore.addAnimation('card-throw-animation');
      expect(useGameUIStore.getState().effects.activeAnimations).toContain('card-throw-animation');

      // Add particle effect
      uiStore.addParticleEffect({
        type: 'attack',
        position: { x: 100, y: 200 },
        duration: 1000,
      });
      expect(useGameUIStore.getState().effects.particleEffects).toHaveLength(1);

      // Trigger screen shake
      uiStore.triggerScreenShake(500);
      expect(useGameUIStore.getState().effects.screenShake).toBe(true);

      // Trigger flash effect
      uiStore.triggerFlashEffect('#ff0000', 0.8, 200);
      const flashEffect = useGameUIStore.getState().effects.flashEffect;
      expect(flashEffect?.color).toBe('#ff0000');
      expect(flashEffect?.intensity).toBe(0.8);
    });
  });

  describe('Board Visual Effects', () => {
    it('should handle infrastructure animations', () => {
      const boardStore = useGameBoardStore.getState();

      // Add infrastructure
      boardStore.setInfrastructureCards([mockInfrastructureCard]);

      // Start animation
      boardStore.startInfrastructureAnimation('infra-1', 'attack', 1000);
      
      const state = useGameBoardStore.getState();
      expect(state.grid.animatingInfrastructureIds).toContain('infra-1');
      expect(state.grid.infrastructureStates['infra-1']?.isAnimating).toBe(true);
      expect(state.grid.infrastructureStates['infra-1']?.animationType).toBe('attack');

      // Add state change animation
      boardStore.addStateChangeAnimation('infra-1', 'secure', 'compromised', 800);
      expect(state.visuals.stateChangeAnimations['infra-1']).toBeDefined();
      expect(state.visuals.stateChangeAnimations['infra-1'].from).toBe('secure');
      expect(state.visuals.stateChangeAnimations['infra-1'].to).toBe('compromised');

      // Add connection line
      boardStore.addConnectionLine({
        from: { x: 0, y: 0 },
        to: { x: 100, y: 100 },
        type: 'attack',
        color: '#ff0000',
        duration: 1000,
      });
      expect(useGameBoardStore.getState().visuals.connectionLines).toHaveLength(1);

      // Add glow effect
      boardStore.addGlowEffect('infra-1', '#00ff00', 0.8, 1000);
      expect(useGameBoardStore.getState().visuals.glowEffects['infra-1']).toBeDefined();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid targets gracefully', () => {
      const cardActionsStore = useCardActionsStore.getState();

      // Set empty valid targets
      cardActionsStore.setValidTargets([]);
      expect(useCardActionsStore.getState().targeting.validTargets).toEqual([]);

      // Try to target invalid infrastructure
      cardActionsStore.setTargetedInfraId('invalid-id');
      expect(useCardActionsStore.getState().targeting.targetedInfraId).toBe('invalid-id');

      // Validation should catch this
      cardActionsStore.setCardValid('card-1', false, 'Invalid target');
      expect(useCardActionsStore.getState().validation.invalidCards).toContain('card-1');
      expect(useCardActionsStore.getState().validation.validationErrors['card-1']).toBe('Invalid target');
    });

    it('should handle store resets correctly', () => {
      const uiStore = useGameUIStore.getState();
      const boardStore = useGameBoardStore.getState();
      const cardActionsStore = useCardActionsStore.getState();

      // Set up some state
      uiStore.setTargetMode(true);
      boardStore.setInfrastructureCards([mockInfrastructureCard]);
      cardActionsStore.setSelectedCard(mockCard as any);

      // Verify state is set
      expect(useGameUIStore.getState().targeting.targetMode).toBe(true);
      expect(useGameBoardStore.getState().grid.infrastructureCards).toHaveLength(1);
      expect(useCardActionsStore.getState().selection.selectedCard).toBeTruthy();

      // Reset all stores
      resetAllGameStores();

      // Verify everything is reset
      expect(useGameUIStore.getState().targeting.targetMode).toBe(false);
      expect(useGameBoardStore.getState().grid.infrastructureCards).toEqual([]);
      expect(useCardActionsStore.getState().selection.selectedCard).toBe(null);
    });
  });

  describe('Performance and Memory Management', () => {
    it('should clean up animations and effects automatically', (done) => {
      const uiStore = useGameUIStore.getState();
      const boardStore = useGameBoardStore.getState();

      // Add short-duration effects
      uiStore.addParticleEffect({
        type: 'attack',
        position: { x: 0, y: 0 },
        duration: 100, // Very short duration for testing
      });

      boardStore.addGlowEffect('infra-1', '#ff0000', 1.0, 100); // Very short duration

      // Effects should be present initially
      expect(useGameUIStore.getState().effects.particleEffects).toHaveLength(1);
      expect(useGameBoardStore.getState().visuals.glowEffects['infra-1']).toBeDefined();

      // Wait for effects to be cleaned up
      setTimeout(() => {
        expect(useGameUIStore.getState().effects.particleEffects).toHaveLength(0);
        expect(useGameBoardStore.getState().visuals.glowEffects['infra-1']).toBeUndefined();
        done();
      }, 150); // Wait longer than effect duration
    }, 200);

    it('should handle large numbers of infrastructure cards efficiently', () => {
      const boardStore = useGameBoardStore.getState();

      // Create many infrastructure cards
      const manyCards = Array.from({ length: 100 }, (_, i) => ({
        ...mockInfrastructureCard,
        id: `infra-${i}`,
        name: `Server ${i}`,
      }));

      // Set all cards at once
      boardStore.setInfrastructureCards(manyCards);
      expect(useGameBoardStore.getState().grid.infrastructureCards).toHaveLength(100);

      // Set many as targetable
      const targetIds = manyCards.slice(0, 50).map(card => card.id);
      boardStore.setTargetableInfrastructure(targetIds);
      expect(useGameBoardStore.getState().grid.targetableInfrastructureIds).toHaveLength(50);

      // Performance check: operations should complete quickly
      const startTime = performance.now();
      boardStore.setHighlightedInfrastructure(targetIds);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(10); // Should complete in under 10ms
      expect(useGameBoardStore.getState().grid.highlightedInfrastructureIds).toHaveLength(50);
    });
  });
});

/**
 * Manual Integration Test (to be run in browser console)
 * This provides a quick way to test store integration manually
 */
export const manualIntegrationTest = () => {
  console.log('🧪 Starting manual integration test...');
  
  // Reset stores
  resetAllGameStores();
  console.log('✅ Stores reset');

  // Test UI store
  const uiStore = useGameUIStore.getState();
  uiStore.setTargetMode(true);
  uiStore.showNotification('Test notification', 'success');
  console.log('✅ UI store working');

  // Test Board store
  const boardStore = useGameBoardStore.getState();
  boardStore.setInfrastructureCards([mockInfrastructureCard]);
  boardStore.startInfrastructureAnimation('infra-1', 'attack');
  console.log('✅ Board store working');

  // Test Card Actions store
  const cardActionsStore = useCardActionsStore.getState();
  cardActionsStore.setSelectedCard(mockCard as any);
  cardActionsStore.setTargetMode(true, 'play');
  console.log('✅ Card Actions store working');

  // Test cross-store synchronization
  const uiState = useGameUIStore.getState();
  const boardState = useGameBoardStore.getState();
  const cardState = useCardActionsStore.getState();

  console.log('📊 Final state check:');
  console.log('- UI targeting:', uiState.targeting.targetMode);
  console.log('- Board infrastructure count:', boardState.grid.infrastructureCards.length);
  console.log('- Card selected:', cardState.selection.selectedCard?.name);
  console.log('- Card targeting:', cardState.targeting.targetMode);

  console.log('🎉 Manual integration test completed!');
  
  return {
    ui: uiState,
    board: boardState,
    cardActions: cardState,
  };
};