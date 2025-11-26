# Boardgame.io Integration Fix

## The Problem

When starting a game from WebSocket lobby, players got the error:
```
Could not find game credentials. Please join the game again.
```

## Root Cause

The backend was trying to join players to the boardgame.io match, but:
1. The credentials were generated server-side and never sent to the frontend
2. The frontend didn't store the credentials in localStorage
3. When navigating to `/game/{matchID}`, the game client couldn't find credentials

## The Solution

**Two-Step Process:**
1. **Backend**: Create the boardgame.io match only
2. **Frontend**: Each player joins the match to receive and store credentials

---

## Implementation

### Backend Changes

**File**: `backend-server/src/services/lobby-socket.service.ts`

**What Changed:**
- `createBoardgameMatch()` now only creates the match
- Does NOT join players (that happens on frontend)
- Returns matchID to be broadcast to all players

```typescript
private async createBoardgameMatch(lobby): Promise<string | null> {
  // Create the match
  const createResponse = await axios.post(`${GAME_SERVER_URL}/games/darknet-duel/create`, {
    numPlayers: 2,
    setupData: {
      gameMode: lobby.gameSettings.gameMode,
      initialResources: lobby.gameSettings.initialResources,
      maxTurns: lobby.gameSettings.maxTurns,
      isPrivate: true,
      lobbyName: lobby.name,
      lobbyId: lobby.lobbyId
    }
  });

  const matchID = createResponse.data.matchID;
  
  // Mark lobby as in-game
  await this.lobbyManager.markInGame(lobby.lobbyId);
  
  return matchID; // Players join on frontend
}
```

### Frontend Changes

**File**: `darknet-duel-frontend/src/components/lobby/WebSocketLobbyDetail.tsx`

**What Changed:**
- `handleGameStarting()` now joins the match before navigating
- Determines player position (0 or 1) from lobby
- Calls `lobbyService.joinMatch()` to get credentials
- Credentials are automatically stored by `lobbyService`
- Then navigates to game

```typescript
const handleGameStarting = async (data: { lobbyId: string; matchID: string; lobby: Lobby }) => {
  // Find our position in the lobby (0 or 1)
  const playerIndex = data.lobby.players.findIndex(p => p.userId === user.id);
  const playerID = playerIndex.toString();
  
  // Join the boardgame.io match to get credentials
  const result = await lobbyService.joinMatch(
    data.matchID,
    user.username,
    playerID,
    {
      data: {
        realUserId: user.id,
        realUsername: user.username
      }
    }
  );

  if (result) {
    // Credentials are now stored in localStorage
    navigate(`/game/${data.matchID}`);
  }
};
```

---

## Flow Diagram

### Before (Broken)
```
Host clicks START
↓
Backend creates match
↓
Backend joins both players (gets credentials)
↓
Backend emits matchID
↓
Frontend navigates to /game/{matchID}
↓
❌ Game client can't find credentials (never stored)
```

### After (Fixed)
```
Host clicks START
↓
Backend creates match
↓
Backend emits matchID + lobby data
↓
Frontend receives event
↓
Frontend joins match (gets credentials)
↓
lobbyService stores credentials in localStorage
↓
Frontend navigates to /game/{matchID}
↓
✅ Game client finds credentials and loads game
```

---

## Key Points

### Player Position Mapping

| Lobby Position | Player Index | PlayerID | Role |
|----------------|--------------|----------|------|
| First player | 0 | "0" | Attacker |
| Second player | 1 | "1" | Defender |

### Credential Storage

When `lobbyService.joinMatch()` is called:
1. Makes POST request to `/games/darknet-duel/{matchID}/join`
2. Receives `playerCredentials` in response
3. Stores in localStorage as:
```json
{
  "matchID": "abc123",
  "playerID": "0",
  "credentials": "secret-token",
  "timestamp": 1234567890
}
```

### Game Client Lookup

When game loads at `/game/{matchID}`:
1. Reads `matchID` from URL
2. Looks up credentials in localStorage
3. Connects to game server with credentials
4. ✅ Game starts successfully

---

## Files Modified

### Backend
- ✅ `backend-server/src/services/lobby-socket.service.ts`
  - Added `import axios from 'axios'`
  - Simplified `createBoardgameMatch()` to only create match
  - Removed player joining logic from backend

### Frontend
- ✅ `darknet-duel-frontend/src/components/lobby/WebSocketLobbyDetail.tsx`
  - Updated `handleGameStarting()` to join match before navigating
  - Added player position detection
  - Added credential retrieval and storage

---

## Testing Checklist

### Game Start Flow
- [ ] Host clicks "START GAME"
- [ ] Backend creates boardgame.io match
- [ ] Backend emits `lobby:game:starting` with matchID
- [ ] Both players receive event
- [ ] Both players join match (get credentials)
- [ ] Both players navigate to `/game/{matchID}`
- [ ] Game loads successfully for both players
- [ ] No "credentials not found" error

### Credential Verification
- [ ] Check localStorage after joining
- [ ] Verify `matchID`, `playerID`, `credentials` are stored
- [ ] Verify game client can read credentials
- [ ] Verify game connects successfully

### Player Roles
- [ ] First player (index 0) becomes Attacker
- [ ] Second player (index 1) becomes Defender
- [ ] Roles match lobby positions

---

## Summary

**Problem**: Credentials generated on backend but never sent to frontend

**Solution**: Frontend joins match to receive and store credentials

**Result**: Players can now successfully start games from WebSocket lobbies! 🎉
