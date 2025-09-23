# chainEffects.ts

**Location:** `game-server/src/game/actions/chainEffects.ts`

---

## File Overview

This file provides logic for chain effects in Darknet Duel, such as lateral movement across infrastructure. It includes utilities for handling, resolving, and applying chain vulnerability and chain compromise effects.

- **Primary exports:** `handleChainVulnerability`, `handleChainCompromise`, `resolveChainEffect`, `ChainEffect`
- **Dependencies:** Shared game and card types.
- **Purpose:** To encapsulate all logic for chain effects and pending chain choices.

---

## Main Components

### 1. `ChainEffect` Interface
- **Purpose:** Defines the structure for a pending chain effect (type, source card, player, available targets).

### 2. `handleChainVulnerability(gameState, sourceCard, playerId)`
- **Purpose:** Handles the chain vulnerability effect, allowing an attacker to mark additional infrastructure as vulnerable.
- **Parameters:**
  - `gameState`: The current game state.
  - `sourceCard`: The card that triggered the chain effect.
  - `playerId`: The ID of the player who played the card.
- **Returns:**
  - Updated game state with a pending chain choice for vulnerability.
- **Logic:**
  - Finds all secure infrastructure and sets up a pending choice for the player.

### 3. `handleChainCompromise(gameState, sourceCard, playerId)`
- **Purpose:** Handles the chain compromise effect, allowing an attacker to compromise additional infrastructure.
- **Parameters:**
  - `gameState`: The current game state.
  - `sourceCard`: The card that triggered the chain effect.
  - `playerId`: The ID of the player who played the card.
- **Returns:**
  - Updated game state with a pending chain choice for compromise.
- **Logic:**
  - Finds all vulnerable or secure infrastructure and sets up a pending choice for the player.

### 4. `resolveChainEffect(gameState, targetInfraId)`
- **Purpose:** Resolves a pending chain effect, applying the selected effect to the target infrastructure.
- **Parameters:**
  - `gameState`: The current game state.
  - `targetInfraId`: The ID of the target infrastructure.
- **Returns:**
  - Updated game state with the chain effect applied and pending choice cleared.
- **Logic:**
  - Applies the effect (vulnerability or compromise) to the selected infrastructure.
  - Records the action and checks for win conditions if compromising critical infrastructure.

---

## Example Usage

Used by move handlers and effect logic to process chain effects and resolve pending choices.

---

## Related Files
- `wildcardResolver.ts`: Can trigger chain effects.

---

## Notes
- The logic is robust to infrastructure state and includes safety checks for available targets.
- Debug logging is present for troubleshooting chain effect logic. 