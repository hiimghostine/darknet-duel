import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  slowRenders: number;
  totalRenderTime: number;
}

/**
 * Hook to monitor component render performance
 * Helps identify when boardgame.io is causing excessive re-renders
 */
export function usePerformanceMonitor(componentName: string, threshold = 16) {
  const metricsRef = useRef<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    slowRenders: 0,
    totalRenderTime: 0
  });

  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      const metrics = metricsRef.current;
      metrics.renderCount++;
      metrics.lastRenderTime = renderTime;
      metrics.totalRenderTime += renderTime;
      metrics.averageRenderTime = metrics.totalRenderTime / metrics.renderCount;
      
      if (renderTime > threshold) {
        metrics.slowRenders++;
        console.warn(
          `🐌 SLOW RENDER DETECTED: ${componentName} took ${renderTime.toFixed(2)}ms ` +
          `(threshold: ${threshold}ms). Total slow renders: ${metrics.slowRenders}/${metrics.renderCount}`
        );
      }
      
      // Log performance summary every 50 renders
      if (metrics.renderCount % 50 === 0) {
        console.log(
          `📊 ${componentName} Performance Summary:\n` +
          `  Renders: ${metrics.renderCount}\n` +
          `  Average: ${metrics.averageRenderTime.toFixed(2)}ms\n` +
          `  Slow renders: ${metrics.slowRenders} (${((metrics.slowRenders / metrics.renderCount) * 100).toFixed(1)}%)\n` +
          `  Last render: ${metrics.lastRenderTime.toFixed(2)}ms`
        );
      }
    };
  });
  
  return metricsRef.current;
}

/**
 * Hook to monitor boardgame.io state changes
 */
export function useBoardGameIOMonitor(G: any, ctx: any, playerID: string | null) {
  const prevStateRef = useRef<{
    G: any;
    ctx: any;
    playerID: string | null;
    timestamp: number;
  } | null>(null);

  useEffect(() => {
    const currentTime = performance.now();
    
    if (prevStateRef.current) {
      const { G: prevG, ctx: prevCtx, playerID: prevPlayerID, timestamp } = prevStateRef.current;
      const timeSinceLastUpdate = currentTime - timestamp;
      
      // Check for rapid state changes (potential boardgame.io issues)
      if (timeSinceLastUpdate < 50) { // Less than 50ms between updates
        console.warn(
          `⚡ RAPID STATE CHANGE: ${timeSinceLastUpdate.toFixed(2)}ms since last update. ` +
          `This might indicate boardgame.io sending unnecessary updates.`
        );
      }
      
      // Log what changed
      const changes = [];
      if (prevG.gamePhase !== G.gamePhase) changes.push('gamePhase');
      if (prevG.message !== G.message) changes.push('message');
      if (prevG.attacker?.hand?.length !== G.attacker?.hand?.length) changes.push('attackerHand');
      if (prevG.defender?.hand?.length !== G.defender?.hand?.length) changes.push('defenderHand');
      if (prevG.infrastructure?.length !== G.infrastructure?.length) changes.push('infrastructure');
      if (prevCtx.phase !== ctx.phase) changes.push('ctx.phase');
      if (prevCtx.currentPlayer !== ctx.currentPlayer) changes.push('ctx.currentPlayer');
      
      if (changes.length > 0) {
        console.log(`🔄 BoardGame.io State Change: ${changes.join(', ')}`);
      }
    }
    
    prevStateRef.current = {
      G,
      ctx,
      playerID,
      timestamp: currentTime
    };
  }, [G, ctx, playerID]);
}


