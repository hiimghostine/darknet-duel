/**
 * Game debug utilities
 * Centralizes all debug logging and provides configuration options
 */

// Enable debug mode for development
const DEBUG_MODE = import.meta.env.DEV || true;

/**
 * Configurable debug settings
 */
const debugSettings = {
  enabled: DEBUG_MODE,
  // You can toggle specific debug categories independently
  logGameState: true,
  logMoves: true,
  logConnection: true,
  logPerformance: false,
  // Specify formatting options
  includeTimestamp: true
};

/**
 * Configure debug settings
 */
export function configureDebug(settings: Partial<typeof debugSettings>) {
  Object.assign(debugSettings, settings);
}

/**
 * Check if debugging is enabled
 */
export function isDebugEnabled(): boolean {
  return debugSettings.enabled;
}

/**
 * Format and log game state
 */
export function logGameState(G: any, ctx: any, message?: string) {
  if (!debugSettings.enabled || !debugSettings.logGameState) return;
  
  const timestamp = debugSettings.includeTimestamp ? new Date().toLocaleTimeString() : '';
  
  console.group(`Game State ${timestamp} ${message || ''}`);
  console.log('G:', G);
  console.log('ctx:', ctx);
  console.log('Game phase:', ctx?.phase);
  console.log('Current player:', ctx?.currentPlayer);
  
  // Log active players if available
  if (ctx?.activePlayers) {
    console.log('Active players:', ctx.activePlayers);
  }
  console.groupEnd();
}

/**
 * Log move information
 */
export function logMoveAttempt(moveName: string, ...args: any[]) {
  if (!debugSettings.enabled || !debugSettings.logMoves) return;
  
  const timestamp = debugSettings.includeTimestamp ? new Date().toLocaleTimeString() : '';
  
  console.group(`Move Attempt ${timestamp} - ${moveName}`);
  console.log('Args:', ...args);
  
  // Store the last move for debugging purposes
  if (typeof window !== 'undefined') {
    window._debug = window._debug || {};
    window._debug.lastAction = moveName;
    window._debug.lastTimestamp = Date.now();
  }
  
  console.groupEnd();
}

/**
 * Log available moves for the current player
 */
export function logAvailableMoves(moves: any) {
  if (!debugSettings.enabled || !debugSettings.logMoves) return;
  
  const moveFunctions: string[] = [];
  
  if (moves) {
    for (const key in moves) {
      if (typeof moves[key] === 'function') {
        moveFunctions.push(key);
      }
    }
  }
  
  console.log('Available move functions:', moveFunctions);
}

/**
 * Log client initialization information
 */
export function logClientInit(matchID: string, playerID: string) {
  if (!debugSettings.enabled || !debugSettings.logConnection) return;
  
  console.log(`Initializing game client for match: ${matchID}, player: ${playerID}`);
}

/**
 * Log connection events
 */
export function logConnectionEvent(event: string, details?: any) {
  if (!debugSettings.enabled || !debugSettings.logConnection) return;
  
  const timestamp = debugSettings.includeTimestamp ? new Date().toLocaleTimeString() : '';
  console.log(`${timestamp} Connection: ${event}`, details || '');
}

/**
 * Measure performance of a function
 */
export function measurePerformance<T extends Function>(fn: T, name: string): (...args: any[]) => any {
  if (!debugSettings.enabled || !debugSettings.logPerformance) return fn as any;
  
  return (...args: any[]) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    console.log(`${name} took ${end - start}ms to execute`);
    return result;
  };
}

/**
 * Debug wildcard targeting issues
 */
export function debugWildcardTargeting(card: any, gameState: any) {
  if (!debugSettings.enabled) return;
  
  console.group(`🎴 Wildcard Targeting Debug: ${card.name}`);
  console.log('Card type:', card.type);
  console.log('Wildcard type:', card.wildcardType);
  
  if (gameState.infrastructure) {
    console.log('Infrastructure states:');
    gameState.infrastructure.forEach((infra: any) => {
      console.log(`  ${infra.name}: ${infra.state}`);
    });
    
    // Show what targets each card type would have
    const states = gameState.infrastructure.map((i: any) => i.state);
    console.log('Available states:', [...new Set(states)]);
    
    console.log('Potential targets by card type:');
    console.log('  exploit:', gameState.infrastructure.filter((i: any) =>
      i.state === 'secure' || i.state === 'fortified' || i.state === 'fortified_weaken').length);
    console.log('  attack:', gameState.infrastructure.filter((i: any) =>
      i.state === 'vulnerable').length);
    console.log('  shield:', gameState.infrastructure.filter((i: any) =>
      i.state !== 'shielded' && i.state !== 'fortified').length);
    console.log('  response:', gameState.infrastructure.filter((i: any) =>
      i.state === 'compromised').length);
  }
  
  console.groupEnd();
}

/**
 * Export the debug settings for reference
 */
export { debugSettings };

/**
 * Helper function to determine if we're running in development mode
 */
export function isDevelopment() {
  return import.meta.env.DEV;
}
