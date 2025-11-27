# WebSocket-Based Private Lobby System - Design Document

**Version:** 1.0  
**Date:** 2025-11-23  
**Status:** Awaiting Approval

---

## Executive Summary

Replace the current polling-based private lobby system with a WebSocket implementation that **prevents users from joining empty private lobbies**. This solves the critical bug where User A creates a lobby, shares the code, leaves, and User B joins an empty lobby.

### Key Changes
- **Backend:** Add `/lobby` namespace to existing Socket.io server (backend-server)
- **Empty Lobby Enforcement:** Server-side check prevents joins when `activePlayerCount === 0`
- **Real-time Updates:** WebSocket events replace 2-second polling
- **Backward Compatible:** Public lobbies continue using boardgame.io's system

---

## Architecture Overview

### Current Stack Analysis

**Backend Server (Port 8000):**
- Already runs Socket.io server for chat (`chat-socket.service.ts`)
- Can handle lobby WebSocket events on same server
- Uses JWT authentication middleware (already implemented)

**Game Server (Port 8001):**
- Runs boardgame.io server
- Will continue handling game logic only
- No WebSocket changes needed here

**Decision:** Add lobby WebSocket namespace to **backend-server** (port 8000) where chat WebSocket already exists.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                         │
├─────────────────────────────────────────────────────────────┤
│  React Components                                           │
│    ├─ CreateLobby.tsx                                       │
│    ├─ LobbyBrowser.tsx                                      │
│    └─ LobbyDetail.tsx                                       │
│                                                              │
│  Services                                                    │
│    ├─ websocketLobby.service.ts (NEW)                       │
│    └─ Socket.io Client                                      │
│         ├─ /socket.io (chat) ← existing                     │
│         └─ /lobby (lobbies) ← NEW                           │
└──────────────────────────┬──────────────────────────────────┘
                           │ WebSocket + JWT
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            BACKEND SERVER (Port 8000)                       │
├─────────────────────────────────────────────────────────────┤
│  Socket.io Server                                           │
│    ├─ Default namespace (chat) ← existing                   │
│    └─ /lobby namespace (NEW)                                │
│         ├─ JWT Auth Middleware (reuse existing)             │
│         └─ Events: create, join, leave, ready, start        │
│                                                              │
│  LobbySocketService (NEW)                                   │
│    └─ Handles WebSocket events                              │
│                                                              │
│  LobbyManager (NEW)                                         │
│    ├─ In-memory Map<lobbyId, Lobby>                         │
│    ├─ Mutex locks for atomic operations                     │
│    └─ Empty lobby enforcement logic                         │
│                                                              │
│  LobbyCleanupService (NEW)                                  │
│    └─ Periodic cleanup (60s interval)                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│            GAME SERVER (Port 8001)                          │
├─────────────────────────────────────────────────────────────┤
│  boardgame.io Server                                        │
│    └─ Game logic only (no lobby management)                 │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow: Join Empty Lobby (BLOCKED)

```
Client                    Backend Server              LobbyManager
  │                             │                          │
  │─── lobby:join ────────────▶│                          │
  │    {lobbyId, userId}       │                          │
  │                            │                          │
  │                            │─── Validate JWT ────────▶│
  │                            │                          │
  │                            │                     ┌────▼────┐
  │                            │                     │ Check   │
  │                            │                     │ Lobby   │
  │                            │                     │ Exists  │
  │                            │                     └────┬────┘
  │                            │                          │
  │                            │                     ┌────▼────┐
  │                            │                     │ Count   │
  │                            │                     │ Active  │
  │                            │                     │ Players │
  │                            │                     └────┬────┘
  │                            │                          │
  │                            │                   activeCount = 0
  │                            │                          │
  │                            │◀─── REJECT ──────────────┤
  │◀── lobby:join:error ──────│                          │
  │    {error: 'LOBBY_EMPTY'} │                          │
  │                            │                          │
```

---

## Data Model

### Lobby States

```typescript
enum LobbyState {
  WAITING = 'waiting',      // Created, 0 players
  ACTIVE = 'active',        // 1+ players, accepting joins
  FULL = 'full',            // Max players reached
  STARTING = 'starting',    // Host clicked start
  IN_GAME = 'in_game',      // Game created in boardgame.io
  EMPTY = 'empty',          // All players left (60s grace period)
  CLOSED = 'closed'         // Permanently closed
}
```

### Core Data Structures

```typescript
interface Lobby {
  // Identity
  lobbyId: string;              // crypto.randomBytes(16).toString('hex')
  lobbyCode: string;            // 6-char code (e.g., "A3K7M9")
  
  // Configuration
  name: string;                 // Display name (3-50 chars or empty)
  visibility: 'public' | 'private';
  maxPlayers: number;           // Default: 2
  
  // State
  state: LobbyState;
  players: Map<string, LobbyPlayer>;
  
  // Metadata
  createdAt: number;            // Timestamp
  createdBy: string;            // Host userId
  lastActivity: number;         // For cleanup
  
  // Game settings (for boardgame.io handoff)
  gameSettings: {
    gameMode: 'standard' | 'blitz' | 'custom';
    initialResources: number;
    maxTurns: number;
  };
  
  // Lifecycle
  emptyGraceTimer?: NodeJS.Timeout;
}

interface LobbyPlayer {
  userId: string;               // From JWT
  username: string;             // From JWT
  socketId: string;             // Current connection
  connectionState: 'connected' | 'disconnected';
  isReady: boolean;
  isHost: boolean;              // First player = host
  joinedAt: number;
}
```

### State Machine

```
WAITING ──(player joins)──▶ ACTIVE ──(max players)──▶ FULL
   │                           │                         │
   │                           │                         │
   │                      (all leave)              (all ready + start)
   │                           │                         │
   │                           ▼                         │
   │                        EMPTY                        │
   │                      (60s timer)                    │
   │                           │                         │
   │                           ▼                         ▼
   └──────────────────────▶ CLOSED ◀────────────── STARTING ──▶ IN_GAME
```

---

## Security Model

### Authentication

**Reuse Existing Chat Auth:**
```typescript
// Same pattern as chat-socket.service.ts lines 37-66
io.of('/lobby').use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  const userId = await sessionService.validateSession(token);
  const user = await authService.findById(userId);
  
  socket.userId = user.id;
  socket.username = user.username;
  next();
});
```

### Empty Lobby Protection (CORE REQUIREMENT)

```typescript
function canJoinLobby(lobby: Lobby, userId: string): JoinResult {
  // 1. Lobby must exist and not be closed
  if (lobby.state === LobbyState.CLOSED) {
    return { allowed: false, reason: 'LOBBY_CLOSED' };
  }
  
  // 2. Lobby must not be in game
  if (lobby.state === LobbyState.IN_GAME) {
    return { allowed: false, reason: 'GAME_IN_PROGRESS' };
  }
  
  // 3. Lobby must not be full
  if (lobby.players.size >= lobby.maxPlayers) {
    return { allowed: false, reason: 'LOBBY_FULL' };
  }
  
  // 4. User must not already be in lobby
  if (lobby.players.has(userId)) {
    return { allowed: false, reason: 'ALREADY_IN_LOBBY' };
  }
  
  // 5. CRITICAL - Private lobbies must have active players
  if (lobby.visibility === 'private') {
    const activeCount = Array.from(lobby.players.values())
      .filter(p => p.connectionState === 'connected')
      .length;
    
    if (activeCount === 0) {
      return { allowed: false, reason: 'LOBBY_EMPTY' };
    }
  }
  
  return { allowed: true };
}
```

### Lobby Code Generation

```typescript
// Excludes ambiguous characters: 0, O, I, 1, L
const SAFE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateLobbyCode(): string {
  const bytes = crypto.randomBytes(6);
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += SAFE_CHARS[bytes[i] % SAFE_CHARS.length];
  }
  return code;
}

// Collision detection: retry up to 3 times
// Search space: 32^6 = 1,073,741,824 combinations
```

---

## Failure Modes & Mitigation

### 1. Socket Disconnection

**Problem:** User's connection drops, lobby thinks they're still present.

**Solution:**
```typescript
socket.on('disconnect', async () => {
  const lobbies = lobbyManager.getUserLobbies(socket.userId);
  
  for (const lobby of lobbies) {
    const player = lobby.players.get(socket.userId);
    player.connectionState = 'disconnected';
    
    // 30-second grace period
    setTimeout(() => {
      if (player.connectionState === 'disconnected') {
        lobbyManager.removePlayer(lobby.lobbyId, socket.userId);
      }
    }, 30000);
  }
});
```

### 2. Race Conditions (Concurrent Joins)

**Problem:** Two users join last slot simultaneously.

**Solution:** Mutex locks per lobby
```typescript
class LobbyManager {
  private locks = new Map<string, Promise<void>>();
  
  async joinLobby(lobbyId: string, userId: string) {
    await this.acquireLock(lobbyId);
    try {
      // Re-check conditions under lock
      const canJoin = this.canJoinLobby(lobby, userId);
      if (!canJoin.allowed) return canJoin;
      
      // Atomic add
      lobby.players.set(userId, createPlayer(userId));
      return { allowed: true };
    } finally {
      this.releaseLock(lobbyId);
    }
  }
}
```

### 3. Stale Lobbies

**Problem:** Lobbies accumulate in memory.

**Solution:** Cleanup service (60s interval)
```typescript
class LobbyCleanupService {
  cleanup() {
    const now = Date.now();
    for (const lobby of lobbies) {
      const shouldClose = 
        (lobby.state === LobbyState.EMPTY && 
         now - lobby.lastActivity > 60000) ||
        (lobby.state === LobbyState.WAITING && 
         now - lobby.lastActivity > 600000);
      
      if (shouldClose) {
        lobbyManager.closeLobby(lobby.lobbyId);
      }
    }
  }
}
```

### 4. Memory Leaks

**Solution:**
- Clear timers on lobby close
- Remove socket listeners
- Use LRU cache for closed lobby metadata (max 1000 entries)

---

## Migration Plan

### Phase 1: Parallel Systems (Week 1-2)
- New WebSocket system for **private lobbies only**
- Old boardgame.io system for **public lobbies**
- Both systems run simultaneously

### Phase 2: Feature Flag (Week 3)
```typescript
// Environment variable
const USE_WEBSOCKET_LOBBIES = process.env.USE_WEBSOCKET_LOBBIES === 'true';

// Client-side
if (USE_WEBSOCKET_LOBBIES && lobby.visibility === 'private') {
  await websocketLobbyService.create(config);
} else {
  await oldLobbyService.createMatch(config);
}
```

### Phase 3: Full Migration (Week 4+)
- All lobbies use WebSocket
- Remove old lobby code

### Rollback Strategy

**Level 1 (Instant):** Set `USE_WEBSOCKET_LOBBIES=false`, restart
**Level 2 (5 min):** Redeploy previous Docker image
**Level 3 (30 min):** Git revert + rebuild

---

## Implementation Stages

### Stage 1: Backend Infrastructure (Week 1)

**Goal:** Add WebSocket lobby namespace and manager to backend-server

**Files to Create:**
- `backend-server/src/services/lobby-socket.service.ts`
- `backend-server/src/services/lobby-manager.service.ts`
- `backend-server/src/services/lobby-cleanup.service.ts`
- `backend-server/src/types/lobby.types.ts`

**Files to Modify:**
- `backend-server/src/server.ts` (add lobby namespace)

**Tasks:**
1. Create `LobbyManager` class with in-memory Map
2. Add `/lobby` namespace to existing Socket.io server
3. Reuse JWT auth middleware from chat
4. Implement events: `lobby:create`, `lobby:join`, `lobby:leave`
5. Add mutex locks for atomic operations
6. Implement empty lobby check in `canJoinLobby()`

**Validation Criteria:**
- [ ] Can create private lobby via WebSocket
- [ ] Can join lobby with valid code
- [ ] Cannot join empty private lobby (gets error)
- [ ] Lobby auto-closes after 60s when empty

**Rollback:** Remove new files, revert `server.ts`

---

### Stage 2: Client Integration (Week 2)

**Goal:** Update React components to use WebSocket for private lobbies

**Files to Create:**
- `frontend/src/services/websocketLobby.service.ts`

**Files to Modify:**
- `frontend/src/components/lobby/CreateLobby.tsx`
- `frontend/src/components/lobby/LobbyBrowser.tsx`
- `frontend/src/components/lobby/LobbyDetail.tsx`

**Tasks:**
1. Create WebSocket lobby service wrapper
2. Update CreateLobby to use new service for private lobbies
3. Add error handling for `LOBBY_EMPTY` error
4. Implement real-time lobby updates (remove polling)
5. Add reconnection logic

**Validation Criteria:**
- [ ] UI shows "Lobby is empty" error when joining empty lobby
- [ ] Real-time updates work (no polling)
- [ ] Reconnection works after disconnect

**Rollback:** Revert frontend changes, use old service

---

### Stage 3: Testing (Week 3)

**Goal:** Create comprehensive test file

**Files to Create:**
- `backend-server/tests/lobby.test.ts`

**Test Cases:**
```typescript
describe('Lobby System', () => {
  test('Create private lobby', async () => {
    const lobby = await lobbyManager.createLobby({
      name: 'Test Lobby',
      visibility: 'private',
      createdBy: userId
    });
    expect(lobby.lobbyId).toBeDefined();
    expect(lobby.lobbyCode).toHaveLength(6);
  });
  
  test('Cannot join empty private lobby', async () => {
    const lobby = await lobbyManager.createLobby({...});
    await lobbyManager.leaveLobby(lobby.lobbyId, hostUserId);
    
    const result = await lobbyManager.joinLobby(lobby.lobbyId, otherUserId);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('LOBBY_EMPTY');
  });
  
  test('Concurrent joins to last slot', async () => {
    const lobby = await lobbyManager.createLobby({maxPlayers: 2});
    
    const [result1, result2] = await Promise.all([
      lobbyManager.joinLobby(lobby.lobbyId, user1),
      lobbyManager.joinLobby(lobby.lobbyId, user2)
    ]);
    
    expect(result1.allowed || result2.allowed).toBe(true);
    expect(result1.allowed && result2.allowed).toBe(false);
  });
  
  test('Lobby auto-closes after 60s empty', async () => {
    const lobby = await lobbyManager.createLobby({...});
    await lobbyManager.leaveLobby(lobby.lobbyId, hostUserId);
    
    await sleep(61000);
    
    const exists = lobbyManager.getLobby(lobby.lobbyId);
    expect(exists).toBeNull();
  });
  
  test('Disconnect grace period', async () => {
    const lobby = await lobbyManager.createLobby({...});
    simulateDisconnect(socket);
    
    await sleep(15000); // 15s < 30s grace
    expect(lobby.players.has(userId)).toBe(true);
    
    await sleep(20000); // Total 35s > 30s grace
    expect(lobby.players.has(userId)).toBe(false);
  });
});
```

**Validation Criteria:**
- [ ] All tests pass
- [ ] Race condition tests pass
- [ ] Cleanup tests pass

**Rollback:** N/A (tests only)

---

### Stage 4: Feature Flag Rollout (Week 4)

**Goal:** Gradual rollout with feature flag

**Files to Modify:**
- `backend-server/.env` (add `USE_WEBSOCKET_LOBBIES`)
- `frontend/src/services/lobby.service.ts` (add feature flag check)

**Tasks:**
1. Add environment variable
2. Update client to check flag
3. Deploy to production with flag=false
4. Enable flag for private lobbies only
5. Monitor for 48 hours

**Validation Criteria:**
- [ ] No errors in production logs
- [ ] Empty lobby joins blocked successfully
- [ ] No performance degradation

**Rollback:** Set flag to false

---

## WebSocket Events API

### Client → Server

```typescript
// Create lobby
socket.emit('lobby:create', {
  name: string,
  visibility: 'public' | 'private',
  maxPlayers: number,
  gameSettings: {...}
});

// Join lobby
socket.emit('lobby:join', {
  lobbyId: string
});

// Leave lobby
socket.emit('lobby:leave', {
  lobbyId: string
});

// Toggle ready
socket.emit('lobby:ready', {
  lobbyId: string,
  isReady: boolean
});

// Start game (host only)
socket.emit('lobby:start', {
  lobbyId: string
});
```

### Server → Client

```typescript
// Lobby created
socket.on('lobby:created', (data: {
  lobby: Lobby
}));

// Join success
socket.on('lobby:joined', (data: {
  lobby: Lobby
}));

// Join error
socket.on('lobby:join:error', (data: {
  error: 'LOBBY_EMPTY' | 'LOBBY_FULL' | 'LOBBY_CLOSED' | 'ALREADY_IN_LOBBY'
}));

// Lobby updated (broadcast to all in lobby)
socket.on('lobby:updated', (data: {
  lobby: Lobby
}));

// Player joined (broadcast)
socket.on('lobby:player:joined', (data: {
  userId: string,
  username: string
}));

// Player left (broadcast)
socket.on('lobby:player:left', (data: {
  userId: string,
  username: string
}));

// Game starting
socket.on('lobby:game:starting', (data: {
  matchId: string,
  gameServerUrl: string
}));
```

---

## Success Metrics

### Functional Requirements
- [x] Empty private lobbies cannot be joined
- [x] Real-time updates (no polling)
- [x] Atomic operations (no race conditions)
- [x] Automatic cleanup of stale lobbies
- [x] Graceful disconnect handling

### Performance Requirements
- WebSocket connection latency < 100ms
- Lobby state updates < 50ms
- Memory usage < 10MB per 100 lobbies
- Cleanup runs every 60s without blocking

### Reliability Requirements
- 99.9% uptime
- Zero data loss on disconnect
- Graceful degradation (fallback to HTTP polling if needed)

---

## Open Questions

1. **Persistence:** Should lobbies persist across server restarts? (Recommendation: No, keep in-memory only)
2. **Scaling:** Will we need multiple server instances? (Recommendation: Add Redis in Stage 5 if needed)
3. **Public Lobbies:** Should public lobbies also use WebSocket? (Recommendation: Yes, in Phase 3)

---

## Approval Checklist

Before proceeding to Stage 1 implementation:

- [ ] Architecture approved
- [ ] Data model approved
- [ ] Security model approved
- [ ] Migration plan approved
- [ ] Test strategy approved
- [ ] Timeline approved (4 weeks)

---

**Next Steps:** Awaiting approval to proceed with Stage 1 implementation.
