# BoardGame.io Performance Optimizations

## The Problem

BoardGame.io has a fundamental limitation: it sends the **entire game state** to all clients on every move, not just the changed parts. This causes:

1. **Excessive Re-renders**: Every state change triggers full component re-renders
2. **Performance Issues**: Large game states cause slow UI updates
3. **Unnecessary Network Traffic**: Full state transmission on every update

## Solutions Implemented

### 1. **Optimized Game State Hook** (`useOptimizedGameState`)

This hook intelligently determines when the game state has actually changed in meaningful ways:

```typescript
const optimizedState = useOptimizedGameState(G, ctx, playerID);
const memoizedG = optimizedState.G;
const memoizedCtx = optimizedState.ctx;
```

**Benefits:**
- Only updates when critical changes occur
- Prevents re-renders for minor state changes
- Maintains referential equality when possible

### 2. **Section-Specific Memoization** (`useMemoizedGameSection`)

Memoizes specific parts of the game state with custom comparison functions:

```typescript
const memoizedInfrastructure = useMemoizedGameSection(
  memoizedG.infrastructure,
  'infrastructure',
  (prev, next) => (prev?.length || 0) === (next?.length || 0)
);
```

**Benefits:**
- Granular control over what triggers re-renders
- Custom comparison logic for different data types
- Prevents unnecessary updates for unchanged sections

### 3. **Performance Monitoring** (`usePerformanceMonitor`)

Monitors render performance and identifies bottlenecks:

```typescript
const performanceMetrics = usePerformanceMonitor('ComponentName', 16);
```

**Features:**
- Tracks render count and timing
- Identifies slow renders (>16ms threshold)
- Logs performance summaries every 50 renders

### 4. **BoardGame.io State Monitor** (`useBoardGameIOMonitor`)

Specifically monitors BoardGame.io state changes:

```typescript
useBoardGameIOMonitor(G, ctx, playerID);
```

**Features:**
- Detects rapid state changes (<50ms intervals)
- Logs what specific parts of state changed
- Helps identify unnecessary BoardGame.io updates

## Usage Example

```typescript
import { useOptimizedGameState, useMemoizedGameSection } from '../../hooks/useOptimizedGameState';
import { usePerformanceMonitor, useBoardGameIOMonitor } from '../../hooks/usePerformanceMonitor';

const GameComponent = ({ G, ctx, playerID, isActive }) => {
  // Performance monitoring
  const performanceMetrics = usePerformanceMonitor('GameComponent', 16);
  useBoardGameIOMonitor(G, ctx, playerID);
  
  // Optimized state management
  const optimizedState = useOptimizedGameState(G, ctx, playerID);
  const memoizedG = optimizedState.G;
  
  // Section-specific memoization
  const memoizedHand = useMemoizedGameSection(
    memoizedG.attacker?.hand,
    'attackerHand',
    (prev, next) => prev?.length === next?.length
  );
  
  return (
    <div>
      {/* Your optimized component */}
    </div>
  );
};
```

## Performance Improvements

With these optimizations, you should see:

1. **Reduced Re-renders**: Components only re-render when necessary
2. **Better Performance**: Faster UI updates, especially with large game states
3. **Improved UX**: Smoother animations and interactions
4. **Better Debugging**: Clear logs showing what's causing re-renders

## Monitoring Performance

Check the browser console for performance logs:

- `🐌 SLOW RENDER DETECTED`: Components taking >16ms to render
- `⚡ RAPID STATE CHANGE`: BoardGame.io sending updates too frequently
- `📊 Performance Summary`: Regular performance reports
- `🔄 BoardGame.io State Change`: What parts of state are changing

## Best Practices

1. **Use Section Memoization**: Memoize large arrays and objects separately
2. **Monitor Performance**: Always include performance monitoring in development
3. **Custom Comparisons**: Write specific comparison functions for your data types
4. **Avoid Deep Comparisons**: Use shallow comparisons when possible
5. **Profile Regularly**: Check performance metrics during development


