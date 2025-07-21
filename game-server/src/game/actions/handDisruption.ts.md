# handDisruption.ts

**Location:** `game-server/src/game/actions/handDisruption.ts`

---

## File Overview

This file provides logic for hand disruption effects in Darknet Duel, such as discarding and redrawing hands or forcing an opponent to discard specific cards. It includes utilities for handling, resolving, and shuffling hand disruption effects.

- **Primary exports:** `handleHandDisruption`, `resolveHandChoice`, `PendingHandChoice`
- **Dependencies:** Shared game and card types.
- **Purpose:** To encapsulate all logic for hand disruption effects and pending hand choices.

---

## Main Components

### 1. `PendingHandChoice` Interface
- **Purpose:** Defines the structure for a pending hand disruption choice (type, target, revealed hand, count).

### 2. `handleHandDisruption(gameState, effectType, targetPlayerId, count?)`
- **Purpose:** Handles hand disruption effects like Memory Corruption and Threat Intelligence.
- **Parameters:**
  - `gameState`: The current game state.
  - `effectType`: The type of hand disruption effect ('discard_redraw' or 'view_and_discard').
  - `targetPlayerId`: The ID of the player whose hand is being disrupted.
  - `count`: Optional number of cards to affect (for view_and_discard).
- **Returns:**
  - Updated game state with the hand disruption applied or pending.
- **Logic:**
  - For 'discard_redraw', discards the entire hand and redraws.
  - For 'view_and_discard', sets up a pending choice for the opponent to select cards to discard.

### 3. `resolveHandChoice(gameState, cardIds)`
- **Purpose:** Resolves a pending hand choice, discarding the selected cards.
- **Parameters:**
  - `gameState`: The current game state.
  - `cardIds`: IDs of the cards to discard.
- **Returns:**
  - Updated game state with the cards discarded and pending choice cleared.
- **Logic:**
  - Removes selected cards from hand, adds to discard, and records the action.

### 4. `shuffleArray(array)`
- **Purpose:** Helper function to shuffle an array using the Fisher-Yates algorithm.
- **Parameters:**
  - `array`: The array to shuffle.
- **Returns:**
  - The shuffled array.

---

## Example Usage

Used by move handlers and effect logic to process hand disruption effects and resolve pending choices.

---

## Related Files
- `wildcardResolver.ts`: Triggers hand disruption effects.

---

## Notes
- The logic is robust to deck/hand size and includes safety checks for shuffling and redrawing.
- Debug logging is present for troubleshooting hand disruption logic. 