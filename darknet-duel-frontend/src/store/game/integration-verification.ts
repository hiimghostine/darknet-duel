/**
 * Integration verification script for game stores
 * This can be run in the browser console to verify store functionality
 */

import { useGameUIStore } from './gameUI.store';
import { useGameBoardStore } from './gameBoard.store';
import { useCardActionsStore } from './cardActions.store';
import { resetAllGameStores } from './index';

// Mock data for testing
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

const mockCard = {
  id: 'card-1',
  name: 'Test Attack',
  type: 'attack' as const,
  description: 'A test attack card',
  cost: 2,
  img: 'test-card.png',
  requiresTarget: true,
};

/**
 * Verify that all stores are properly initialized
 */
export function verifyStoreInitialization(): boolean {
  console.log('🔍 Verifying store initialization...');
  
  resetAllGameStores();
  
  const uiStore = useGameUIStore.getState();
  const boardStore = useGameBoardStore.getState();
  const cardActionsStore = useCardActionsStore.getState();

  // Check UI store defaults
  const uiChecks = [
    uiStore.overlays.isReactionMode === false,
    uiStore.overlays.isProcessing === false,
    uiStore.targeting.targetMode === false,
    uiStore.targeting.validTargets.length === 0,
    uiStore.effects.activeAnimations.length === 0,
  ];

  // Check Board store defaults
  const boardChecks = [
    boardStore.layout.gridSize.rows === 3,
    boardStore.layout.gridSize.cols === 4,
    boardStore.grid.infrastructureCards.length === 0,
    boardStore.grid.targetableInfrastructureIds.length === 0,
    boardStore.visuals.connectionLines.length === 0,
  ];

  // Check Card Actions store defaults
  const cardChecks = [
    cardActionsStore.selection.selectedCard === null,
    cardActionsStore.targeting.targetMode === false,
    cardActionsStore.animation.animatingThrow === false,
    cardActionsStore.interaction.processing === false,
  ];

  const allPassed = [...uiChecks, ...boardChecks, ...cardChecks].every(check => check);
  
  console.log(allPassed ? '✅ Store initialization verified' : '❌ Store initialization failed');
  return allPassed;
}

/**
 * Verify cross-store state synchronization
 */
export function verifyCrossStoreSynchronization(): boolean {
  console.log('🔍 Verifying cross-store synchronization...');
  
  resetAllGameStores();
  
  const uiStore = useGameUIStore.getState();
  const cardActionsStore = useCardActionsStore.getState();
  
  // Set targeting state in both stores
  uiStore.setTargetMode(true);
  uiStore.setValidTargets(['infra-1', 'infra-2']);
  
  cardActionsStore.setTargetMode(true, 'play');
  cardActionsStore.setValidTargets(['infra-1', 'infra-2']);
  
  // Verify synchronization
  const uiState = useGameUIStore.getState();
  const cardState = useCardActionsStore.getState();
  
  const checks = [
    uiState.targeting.targetMode === true,
    cardState.targeting.targetMode === true,
    uiState.targeting.validTargets.length === 2,
    cardState.targeting.validTargets.length === 2,
    uiState.targeting.validTargets[0] === 'infra-1',
    cardState.targeting.validTargets[0] === 'infra-1',
  ];
  
  const allPassed = checks.every(check => check);
  
  console.log(allPassed ? '✅ Cross-store synchronization verified' : '❌ Cross-store synchronization failed');
  return allPassed;
}

/**
 * Verify card actions workflow
 */
export function verifyCardActionsWorkflow(): boolean {
  console.log('🔍 Verifying card actions workflow...');
  
  resetAllGameStores();
  
  const cardActionsStore = useCardActionsStore.getState();
  const boardStore = useGameBoardStore.getState();
  
  // Step 1: Select a card
  cardActionsStore.setSelectedCard(mockCard as any);
  let state = useCardActionsStore.getState();
  if (state.selection.selectedCard?.id !== 'card-1') {
    console.log('❌ Card selection failed');
    return false;
  }
  
  // Step 2: Enter targeting mode
  cardActionsStore.setTargetMode(true, 'throw');
  cardActionsStore.setValidTargets(['infra-1']);
  
  state = useCardActionsStore.getState();
  if (!state.targeting.targetMode || state.targeting.validTargets.length !== 1) {
    console.log('❌ Targeting mode failed');
    return false;
  }
  
  // Step 3: Set up board
  boardStore.setInfrastructureCards([mockInfrastructureCard]);
  boardStore.setTargetableInfrastructure(['infra-1']);
  
  const boardState = useGameBoardStore.getState();
  if (boardState.grid.infrastructureCards.length !== 1) {
    console.log('❌ Board setup failed');
    return false;
  }
  
  // Step 4: Target infrastructure
  cardActionsStore.setTargetedInfraId('infra-1');
  
  state = useCardActionsStore.getState();
  if (state.targeting.targetedInfraId !== 'infra-1') {
    console.log('❌ Infrastructure targeting failed');
    return false;
  }
  
  // Step 5: Reset targeting
  cardActionsStore.resetTargeting();
  
  state = useCardActionsStore.getState();
  if (state.targeting.targetMode || state.selection.selectedCard) {
    console.log('❌ Targeting reset failed');
    return false;
  }
  
  console.log('✅ Card actions workflow verified');
  return true;
}

/**
 * Verify UI effects and animations
 */
export function verifyUIEffects(): boolean {
  console.log('🔍 Verifying UI effects...');
  
  resetAllGameStores();
  
  const uiStore = useGameUIStore.getState();
  
  // Test notification
  uiStore.showNotification('Test message', 'success', 3000);
  let state = useGameUIStore.getState();
  
  if (!state.overlays.isNotificationVisible || 
      state.overlays.notificationMessage !== 'Test message' ||
      state.overlays.notificationColor !== 'success') {
    console.log('❌ Notification failed');
    return false;
  }
  
  // Test animation
  uiStore.addAnimation('test-animation');
  state = useGameUIStore.getState();
  
  if (!state.effects.activeAnimations.includes('test-animation')) {
    console.log('❌ Animation failed');
    return false;
  }
  
  // Test particle effect
  uiStore.addParticleEffect({
    type: 'attack',
    position: { x: 100, y: 200 },
    duration: 1000,
  });
  
  state = useGameUIStore.getState();
  if (state.effects.particleEffects.length !== 1) {
    console.log('❌ Particle effect failed');
    return false;
  }
  
  // Test screen shake
  uiStore.triggerScreenShake(500);
  state = useGameUIStore.getState();
  
  if (!state.effects.screenShake) {
    console.log('❌ Screen shake failed');
    return false;
  }
  
  console.log('✅ UI effects verified');
  return true;
}

/**
 * Verify board visual effects
 */
export function verifyBoardEffects(): boolean {
  console.log('🔍 Verifying board effects...');
  
  resetAllGameStores();
  
  const boardStore = useGameBoardStore.getState();
  
  // Add infrastructure
  boardStore.setInfrastructureCards([mockInfrastructureCard]);
  
  // Test infrastructure animation
  boardStore.startInfrastructureAnimation('infra-1', 'attack', 1000);
  
  let state = useGameBoardStore.getState();
  if (!state.grid.animatingInfrastructureIds.includes('infra-1') ||
      !state.grid.infrastructureStates['infra-1']?.isAnimating) {
    console.log('❌ Infrastructure animation failed');
    return false;
  }
  
  // Test state change animation
  boardStore.addStateChangeAnimation('infra-1', 'secure', 'compromised', 800);
  
  state = useGameBoardStore.getState();
  if (!state.visuals.stateChangeAnimations['infra-1'] ||
      state.visuals.stateChangeAnimations['infra-1'].from !== 'secure') {
    console.log('❌ State change animation failed');
    return false;
  }
  
  // Test connection line
  boardStore.addConnectionLine({
    from: { x: 0, y: 0 },
    to: { x: 100, y: 100 },
    type: 'attack',
    color: '#ff0000',
    duration: 1000,
  });
  
  state = useGameBoardStore.getState();
  if (state.visuals.connectionLines.length !== 1) {
    console.log('❌ Connection line failed');
    return false;
  }
  
  // Test glow effect
  boardStore.addGlowEffect('infra-1', '#00ff00', 0.8, 1000);
  
  state = useGameBoardStore.getState();
  if (!state.visuals.glowEffects['infra-1']) {
    console.log('❌ Glow effect failed');
    return false;
  }
  
  console.log('✅ Board effects verified');
  return true;
}

/**
 * Verify performance with large datasets
 */
export function verifyPerformance(): boolean {
  console.log('🔍 Verifying performance...');
  
  resetAllGameStores();
  
  const boardStore = useGameBoardStore.getState();
  
  // Create large dataset
  const manyCards = Array.from({ length: 100 }, (_, i) => ({
    ...mockInfrastructureCard,
    id: `infra-${i}`,
    name: `Server ${i}`,
  }));
  
  // Measure performance
  const startTime = performance.now();
  boardStore.setInfrastructureCards(manyCards);
  
  const targetIds = manyCards.slice(0, 50).map(card => card.id);
  boardStore.setTargetableInfrastructure(targetIds);
  boardStore.setHighlightedInfrastructure(targetIds);
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`⏱️ Performance test completed in ${duration.toFixed(2)}ms`);
  
  // Verify results
  const state = useGameBoardStore.getState();
  const checks = [
    state.grid.infrastructureCards.length === 100,
    state.grid.targetableInfrastructureIds.length === 50,
    state.grid.highlightedInfrastructureIds.length === 50,
    duration < 50, // Should complete in under 50ms
  ];
  
  const allPassed = checks.every(check => check);
  
  console.log(allPassed ? '✅ Performance verified' : '❌ Performance failed');
  return allPassed;
}

/**
 * Run all verification tests
 */
export function runFullVerification(): { passed: number; total: number; success: boolean } {
  console.log('🧪 Running full store integration verification...');
  console.log('================================================');
  
  const tests = [
    { name: 'Store Initialization', fn: verifyStoreInitialization },
    { name: 'Cross-Store Synchronization', fn: verifyCrossStoreSynchronization },
    { name: 'Card Actions Workflow', fn: verifyCardActionsWorkflow },
    { name: 'UI Effects', fn: verifyUIEffects },
    { name: 'Board Effects', fn: verifyBoardEffects },
    { name: 'Performance', fn: verifyPerformance },
  ];
  
  let passed = 0;
  const total = tests.length;
  
  for (const test of tests) {
    console.log(`\n🔬 Running ${test.name}...`);
    try {
      if (test.fn()) {
        passed++;
      }
    } catch (error) {
      console.error(`❌ ${test.name} threw an error:`, error);
    }
  }
  
  console.log('\n================================================');
  console.log(`📊 Results: ${passed}/${total} tests passed`);
  
  const success = passed === total;
  if (success) {
    console.log('🎉 All store integration tests passed!');
    console.log('✅ Stores are ready for production use');
  } else {
    console.log('⚠️ Some tests failed - review implementation');
  }
  
  return { passed, total, success };
}

/**
 * Quick verification for development
 */
export function quickVerification(): boolean {
  console.log('⚡ Quick verification...');
  
  resetAllGameStores();
  
  // Test basic functionality
  const uiStore = useGameUIStore.getState();
  const boardStore = useGameBoardStore.getState();
  const cardActionsStore = useCardActionsStore.getState();
  
  uiStore.setTargetMode(true);
  boardStore.setInfrastructureCards([mockInfrastructureCard]);
  cardActionsStore.setSelectedCard(mockCard as any);
  
  const uiState = useGameUIStore.getState();
  const boardState = useGameBoardStore.getState();
  const cardState = useCardActionsStore.getState();
  
  const success = uiState.targeting.targetMode &&
                  boardState.grid.infrastructureCards.length === 1 &&
                  cardState.selection.selectedCard?.id === 'card-1';
  
  console.log(success ? '✅ Quick verification passed' : '❌ Quick verification failed');
  return success;
}

// Export for global access in browser console
(window as any).storeVerification = {
  runFullVerification,
  quickVerification,
  verifyStoreInitialization,
  verifyCrossStoreSynchronization,
  verifyCardActionsWorkflow,
  verifyUIEffects,
  verifyBoardEffects,
  verifyPerformance,
};

console.log('🔧 Store verification tools loaded. Run window.storeVerification.runFullVerification() to test.');