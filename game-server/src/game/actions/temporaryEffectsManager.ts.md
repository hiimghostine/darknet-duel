# temporaryEffectsManager.ts

**Location:** `game-server/src/game/actions/temporaryEffectsManager.ts`

---

## File Overview

This file defines the `TemporaryEffectsManager` class, which manages temporary and persistent effects in Darknet Duel. It provides methods for adding, processing, and cleaning up effects, as well as applying rewards for persistent effects.

- **Primary export:** `TemporaryEffectsManager` class
- **Dependencies:** Shared game types.
- **Purpose:** To centralize and manage all effect logic for temporary and persistent effects in the game.

---

## Main Components

### 1. `TemporaryEffect` Interface
- **Purpose:** Defines the structure of a temporary effect (type, target, player, duration, source card, metadata).

### 2. `PersistentEffect` Interface
- **Purpose:** Defines the structure of a persistent effect (type, target, player, source card, condition, reward, auto-remove, triggered).

### 3. `TemporaryEffectsManager` Class

#### `processTurnStart(gameState)`
- **Purpose:** Processes effects at the start of a turn, decrementing durations and removing expired effects.
- **Parameters:**
  - `gameState`: The current game state.
- **Returns:**
  - Updated game state with active effects only.

#### `addEffect(gameState, effect)`
- **Purpose:** Adds a new temporary effect to the game state.
- **Parameters:**
  - `gameState`: The current game state.
  - `effect`: The temporary effect to add.
- **Returns:**
  - Updated game state with the new effect added.

#### `hasEffect(gameState, type, targetId?)`
- **Purpose:** Checks if an effect of a specified type exists, optionally for a specific target.
- **Parameters:**
  - `gameState`: The current game state.
  - `type`: The effect type.
  - `targetId`: Optional target ID.
- **Returns:**
  - `true` if the effect exists, `false` otherwise.

#### `addPersistentEffect(gameState, effect)`
- **Purpose:** Adds a new persistent effect to the game state.
- **Parameters:**
  - `gameState`: The current game state.
  - `effect`: The persistent effect to add.
- **Returns:**
  - Updated game state with the new persistent effect added.

#### `processPersistentEffects(gameState, infrastructureId, oldState, newState)`
- **Purpose:** Checks for persistent effect triggers when infrastructure state changes and applies rewards.
- **Parameters:**
  - `gameState`: The current game state.
  - `infrastructureId`: The ID of the infrastructure.
  - `oldState`: The previous state.
  - `newState`: The new state.
- **Returns:**
  - Updated game state with rewards applied and triggered effects updated/removed.

#### `applyPersistentReward(gameState, effect)` (private)
- **Purpose:** Applies the reward from a persistent effect to the appropriate player.
- **Parameters:**
  - `gameState`: The current game state.
  - `effect`: The persistent effect.
- **Returns:**
  - Updated game state with the reward applied.

#### `cleanupPersistentEffects(gameState, infrastructureId?)`
- **Purpose:** Cleans up persistent effects when infrastructure is removed or the game ends.
- **Parameters:**
  - `gameState`: The current game state.
  - `infrastructureId`: Optional infrastructure ID to clean up effects for.
- **Returns:**
  - Updated game state with effects removed.

#### `hasPersistentEffect(gameState, type, targetId?)`
- **Purpose:** Checks if a persistent effect exists for a specific condition.
- **Parameters:**
  - `gameState`: The current game state.
  - `type`: The persistent effect type.
  - `targetId`: Optional target ID.
- **Returns:**
  - `true` if the effect exists, `false` otherwise.

---

## Example Usage

Used by move handlers and phase logic to manage temporary and persistent effects throughout the game.

---

## Related Files
- `wildcardResolver.ts`: Applies effects using this manager.

---

## Notes
- The class is designed for extensibility and centralizes all effect logic for maintainability.
- Debug logging is present for troubleshooting effect application and cleanup. 