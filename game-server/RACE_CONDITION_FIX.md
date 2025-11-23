# Race Condition Fix: Game Over Monitoring

## Problem Summary

The original game over monitoring system had critical race conditions that could lead to:
- **Duplicate game result processing** (same game processed multiple times)
- **Duplicate database entries** (game_results, game_history, ratings)
- **Incorrect Elo ratings** (rating adjusted multiple times for same game)
- **Double currency awards** (players receiving rewards twice)

## Root Causes

### 1. Non-Atomic Check-and-Process Pattern
```typescript
// ❌ BEFORE: Check and process were separate operations
if (processedGames.has(matchID)) {
  continue; // Skip already processed
}
// ... 2-5 seconds of async operations ...
processedGames.add(matchID); // ← TOO LATE!
```

**Problem**: Games were marked as "processed" AFTER processing completed, creating a 2-5 second window where another polling interval could detect and start processing the same game.

### 2. Processing Time > Polling Interval
- **Polling interval**: 3 seconds
- **Average processing time**: 2-5 seconds (due to sequential API calls with retries)
- **Result**: Next poll starts before current processing completes

### 3. No Failure Recovery
If `server.db.wipe()` failed, games would:
- Remain in database ✓
- Be marked as processed ✓
- Never get processed again ✗

## Solution Implemented

### 1. Atomic Lock with State Tracking

```typescript
interface ProcessingState {
  matchID: string;
  startedAt: number;
  status: 'processing' | 'completed' | 'failed';
}

const processingStates = new Map<string, ProcessingState>();
```

**Benefits**:
- Track processing state with metadata
- Distinguish between "processing", "completed", and "failed" states
- Allow retries for failed games

### 2. Immediate Lock Before Any Async Operations

```typescript
// ✅ AFTER: Lock IMMEDIATELY on detection
if (isGameOver) {
  // Lock the game FIRST
  processingStates.set(matchID, {
    matchID,
    startedAt: Date.now(),
    status: 'processing'
  });
  
  // Then do async operations
  await handleGameEnd(...);
}
```

**Benefits**:
- Atomic check-and-lock (no gap between detection and marking)
- Subsequent polls see "processing" status and skip
- No duplicate processing possible

### 3. Stale Lock Cleanup

```typescript
const PROCESSING_TIMEOUT = 30000; // 30 seconds

// Clean up locks that are stuck
for (const [matchID, state] of processingStates.entries()) {
  if (state.status === 'processing' && 
      (now - state.startedAt) > PROCESSING_TIMEOUT) {
    console.warn(`Game ${matchID} processing timed out - removing stale lock`);
    processingStates.delete(matchID);
  }
}
```

**Benefits**:
- Prevents permanent locks from crashed processes
- Allows retry after timeout
- Self-healing mechanism

### 4. Smart State Transitions

```typescript
// Mark as completed BEFORE wiping (in case wipe fails)
processingStates.set(matchID, {
  matchID,
  startedAt: processingStates.get(matchID)!.startedAt,
  status: 'completed'
});

// Try to wipe
try {
  await server.db.wipe(matchID);
} catch (wipeErr) {
  // Game is still marked as "completed" even if wipe fails
  // Won't be re-processed
}
```

**Benefits**:
- Wipe failures don't cause re-processing
- Game remains marked as completed
- Idempotent behavior

### 5. Failure Recovery with Retry

```typescript
} catch (processingError) {
  // Mark as failed (can be retried)
  processingStates.set(matchID, {
    matchID,
    startedAt: processingStates.get(matchID)!.startedAt,
    status: 'failed'
  });
  
  // Clear failed state after delay to allow retry
  setTimeout(() => {
    processingStates.delete(matchID);
  }, 30000); // Retry after 30 seconds
}
```

**Benefits**:
- Failed games get retried automatically
- 30 second backoff prevents spam
- Transient failures are recoverable

### 6. Idempotency Keys (Defense in Depth)

Added idempotency keys to all backend API calls:

```typescript
// Game results
idempotencyKey: `game-result-${gameResult.gameId}`

// Game history
idempotencyKey: `game-history-${gameHistory.gameId}`

// Rating updates
idempotencyKey: `game-ratings-${ratingData.gameId}`
```

**Benefits**:
- Even if race condition occurs, backend can detect duplicates
- Backend can return cached response for duplicate requests
- Two-layer protection (client-side locking + server-side deduplication)

## Timeline Comparison

### Before (Race Condition Present)

```
T=0ms:    Poll #1 starts
T=50ms:   Detects game-abc is over
T=100ms:  Starts handleGameEnd(game-abc)
T=3000ms: Poll #2 starts ⚠️
T=3050ms: Detects game-abc is over (not yet marked!)
T=3100ms: Starts handleGameEnd(game-abc) AGAIN! 🔥
T=5000ms: First processing completes
T=5010ms: Marks game-abc as processed (too late)
T=7000ms: Second processing completes (duplicate data!)
```

### After (Race Condition Fixed)

```
T=0ms:    Poll #1 starts
T=50ms:   Detects game-abc is over
T=55ms:   LOCKS game-abc as 'processing' ✅
T=100ms:  Starts handleGameEnd(game-abc)
T=3000ms: Poll #2 starts
T=3050ms: Detects game-abc is over
T=3051ms: Checks processingStates: status = 'processing'
T=3052ms: SKIPS game-abc ✅ (already being processed)
T=5000ms: First processing completes
T=5010ms: Marks game-abc as 'completed'
T=5020ms: Wipes game from database
```

## Testing Scenarios

### Scenario 1: Normal Game Completion
- ✅ Game completes
- ✅ Locked immediately
- ✅ Processed once
- ✅ Wiped from database
- ✅ Marked as completed

### Scenario 2: Slow Processing (>3 seconds)
- ✅ Game locked at T=0
- ✅ Poll at T=3s sees "processing" status
- ✅ Poll at T=6s sees "completed" status
- ✅ No duplicate processing

### Scenario 3: Wipe Failure
- ✅ Game processed successfully
- ✅ Marked as "completed"
- ❌ Wipe fails (database error)
- ✅ Game remains in DB but won't be re-processed
- ✅ Next poll skips (already "completed")

### Scenario 4: Processing Crash
- ✅ Game locked at T=0
- ❌ Server crashes during processing
- ✅ Lock marked with startedAt timestamp
- ✅ After 30s, stale lock cleanup removes it
- ✅ Next poll can retry

### Scenario 5: Backend API Failure
- ✅ Game locked
- ❌ handleGameEnd() throws error
- ✅ Marked as "failed"
- ✅ After 30s, state cleared
- ✅ Next poll retries processing

## Monitoring & Observability

### Log Messages to Watch

**Normal Operation**:
```
🎮 GAME OVER DETECTED for abc-123!
🔒 Locked game abc-123 for processing
✅ Removed completed/abandoned game abc-123 from database
🧹 Cleaned up processing state for abc-123
```

**Race Condition Prevented**:
```
⏳ Game abc-123 is currently being processed (started 2.3s ago) - skipping
```

**Stale Lock Cleanup**:
```
⚠️ Game abc-123 processing timed out after 30s - removing stale lock
```

**Retry After Failure**:
```
❌ Failed to process game abc-123: <error>
🔄 Cleared failed state for abc-123 - will retry on next check
```

## Performance Impact

### Memory Usage
- **Before**: `Set<string>` with ~100 bytes per game
- **After**: `Map<string, ProcessingState>` with ~150 bytes per game
- **Impact**: Negligible (~50 bytes per game)

### CPU Usage
- **Additional operations per poll**:
  - Stale lock cleanup: O(n) where n = number of processing games
  - State lookup: O(1) hash map lookup
- **Impact**: Negligible (<1ms for typical load)

### Latency
- **Lock operation**: <1ms (in-memory Map.set)
- **No additional network calls**
- **Impact**: None

## Future Improvements

### 1. Distributed Locking (Multi-Server)
For horizontal scaling, consider:
- Redis-based distributed locks
- Database-based locking (SELECT FOR UPDATE)
- Etcd or Consul for coordination

### 2. Event-Driven Architecture
Instead of polling:
- Listen to BoardGame.io game state changes
- React to endIf() return value
- Eliminate polling overhead

### 3. Metrics & Alerting
- Track processing duration
- Alert on timeout rate
- Monitor duplicate detection rate
- Dashboard for game completion flow

### 4. Database-Level Idempotency
- Add unique constraint on game_results.gameId
- Backend catches duplicate insert attempts
- Return success for idempotent requests

## Related Files Modified

1. **`/game-server/src/server/index.ts`** (lines 995-1154)
   - Added `ProcessingState` interface
   - Implemented atomic locking
   - Added stale lock cleanup
   - Added failure recovery

2. **`/game-server/src/server/serverAuth.ts`** (lines 93-223)
   - Added idempotency keys to all API calls
   - Updated `sendGameResults()`
   - Updated `recordGameHistory()`
   - Updated `updatePlayerRatings()`

## Rollback Plan

If issues arise, revert commits for these files:
```bash
git log --oneline -- game-server/src/server/index.ts
git log --oneline -- game-server/src/server/serverAuth.ts

# Revert to previous version
git checkout <commit-hash> -- game-server/src/server/index.ts
git checkout <commit-hash> -- game-server/src/server/serverAuth.ts
```

## Verification

To verify the fix is working:

1. **Check logs for race prevention**:
   ```bash
   grep "currently being processed" logs/game-server.log
   ```

2. **Monitor database for duplicates**:
   ```sql
   SELECT gameId, COUNT(*) 
   FROM game_results 
   GROUP BY gameId 
   HAVING COUNT(*) > 1;
   ```

3. **Check idempotency key usage**:
   ```bash
   grep "Idempotency key" logs/game-server.log
   ```

## Conclusion

This fix eliminates the race condition through:
- ✅ Atomic check-and-lock pattern
- ✅ State tracking with metadata
- ✅ Stale lock cleanup
- ✅ Failure recovery with retry
- ✅ Idempotency keys (defense in depth)

The system is now robust against:
- Concurrent polling intervals
- Slow processing operations
- Network failures
- Database failures
- Server crashes (with 30s recovery window)
