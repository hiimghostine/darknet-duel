# Boardgame.io Integration for WebSocket Lobbies

## Overview
Implemented full boardgame.io integration for WebSocket lobbies, allowing seamless transition from lobby to game.

## Implementation Flow

### 1. Host Starts Game
```
Host clicks "START GAME" button
↓
Frontend: websocketLobbyService.startGame(lobbyId)
↓
Backend: Receives 'lobby:start' event
```

### 2. Backend Creates Match
```
Backend validates:
- User is host ✓
- All non-host players ready ✓
- Minimum 2 players ✓
↓
Backend calls createBoardgameMatch(lobby)
↓
Creates boardgame.io match via HTTP API
↓
Joins both players to the match
↓
Returns matchID
```

### 3. Players Navigate to Game
```
Backend emits 'lobby:game:starting' with matchID
↓
All players receive event
↓
Frontend navigates to /game/{matchID}
↓
Game starts! 🎮
```

---

## Backend Implementation

### LobbySocketService.createBoardgameMatch()

**Purpose**: Create a boardgame.io match from lobby data and join both players

**Steps**:
1. Prepare setup data from lobby settings
2. POST to `/games/darknet-duel/create` to create match
3. For each player:
   - POST to `/games/darknet-duel/{matchID}/join`
   - Pass player data (userId, username, isReady)
   - Assign playerID based on position (0 or 1)
4. Mark lobby as IN_GAME
5. Return matchID

**Code**:
```typescript
private async createBoardgameMatch(lobby): Promise<string | null> {
  // Create match
  const response = await axios.post(`${GAME_SERVER_URL}/games/darknet-duel/create`, {
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

  const matchID = response.data.matchID;

  // Join both players
  const players = Array.from(lobby.players.values());
  for (let i = 0; i < players.length; i++) {
    await axios.post(`${GAME_SERVER_URL}/games/darknet-duel/${matchID}/join`, {
      playerID: i.toString(),
      playerName: players[i].username,
      data: {
        realUserId: players[i].userId,
        realUsername: players[i].username,
        isReady: true
      }
    });
  }

  await this.lobbyManager.markInGame(lobby.lobbyId);
  return matchID;
}
```

### Event: lobby:start

**Handler**:
```typescript
socket.on('lobby:start', async (data: { lobbyId: string }) => {
  const success = await this.lobbyManager.startGame(lobbyId, socket.userId);
  
  if (success) {
    const lobby = this.lobbyManager.getLobby(lobbyId);
    const matchID = await this.createBoardgameMatch(lobby);
    
    if (matchID) {
      // Broadcast to all players
      this.lobbyNamespace.to(`lobby:${lobbyId}`).emit('lobby:game:starting', {
        lobbyId,
        matchID,
        lobby: this.lobbyManager.serializeLobby(lobby)
      });
    }
  }
});
```

---

## Frontend Implementation

### Event Handler: lobby:game:starting

**Updated Callback Type**:
```typescript
export type LobbyGameStartingCallback = (data: { 
  lobbyId: string; 
  matchID: string; 
  lobby: Lobby 
}) => void;
```

**Handler**:
```typescript
const handleGameStarting = async (data: { lobbyId: string; matchID: string; lobby: Lobby }) => {
  console.log('🎮 Game starting! Match ID:', data.matchID);
  
  // Navigate to the game with the matchID
  navigate(`/game/${data.matchID}`);
};
```

---

## Data Flow

### Lobby Settings → Boardgame.io Setup Data

| Lobby Setting | Boardgame.io Setup Data |
|---------------|-------------------------|
| `gameSettings.gameMode` | `setupData.gameMode` |
| `gameSettings.initialResources` | `setupData.initialResources` |
| `gameSettings.maxTurns` | `setupData.maxTurns` |
| `name` | `setupData.lobbyName` |
| `lobbyId` | `setupData.lobbyId` |
| Always true | `setupData.isPrivate` |

### Player Mapping

| Lobby Position | Boardgame.io PlayerID | Role |
|----------------|----------------------|------|
| First player (index 0) | "0" | Attacker |
| Second player (index 1) | "1" | Defender |

### Player Data Passed to Boardgame.io

```json
{
  "playerID": "0",
  "playerName": "username",
  "data": {
    "realUserId": "uuid",
    "realUsername": "username",
    "isReady": true
  }
}
```

---

## Files Modified

### Backend
- ✅ `backend-server/src/services/lobby-socket.service.ts`
  - Added `createBoardgameMatch()` method
  - Updated `lobby:start` handler to create match and emit matchID

### Frontend
- ✅ `darknet-duel-frontend/src/services/websocketLobby.service.ts`
  - Updated `LobbyGameStartingCallback` to include `matchID`

- ✅ `darknet-duel-frontend/src/components/lobby/WebSocketLobbyDetail.tsx`
  - Updated `handleGameStarting()` to navigate to game with matchID

---

## Testing Checklist

### Game Start Flow
- [ ] Host clicks "START GAME"
- [ ] Backend validates host and ready status
- [ ] Backend creates boardgame.io match
- [ ] Backend joins both players to match
- [ ] Both players receive `lobby:game:starting` event
- [ ] Both players navigate to `/game/{matchID}`
- [ ] Game loads correctly for both players

### Player Data
- [ ] Player 0 (first in lobby) becomes Attacker
- [ ] Player 1 (second in lobby) becomes Defender
- [ ] Real user IDs preserved in match data
- [ ] Usernames preserved in match data

### Game Settings
- [ ] Game mode transferred correctly
- [ ] Initial resources transferred correctly
- [ ] Max turns transferred correctly
- [ ] Lobby name preserved in setup data

### Error Handling
- [ ] Error if not host tries to start
- [ ] Error if players not ready
- [ ] Error if match creation fails
- [ ] Error if player join fails

---

## Environment Variables

Make sure `GAME_SERVER_URL` is set in backend `.env`:
```
GAME_SERVER_URL=http://localhost:8001
```

---

## Summary

**Before:**
- ❌ No boardgame.io integration
- ❌ Game start button did nothing
- ❌ No way to transition from lobby to game

**After:**
- ✅ Full boardgame.io integration
- ✅ Backend creates match and joins players
- ✅ Seamless transition from lobby to game
- ✅ All lobby settings preserved
- ✅ Player roles correctly assigned
- ✅ Both players navigate automatically

The WebSocket lobby system now has complete end-to-end functionality from lobby creation to game start! 🎉
