# cardEffects/index.ts

**Location:** `game-server/src/game/actions/throwCardMove/cardEffects/index.ts`

---

## File Overview

This file provides the main effect routing logic for card effects in the throw card move of Darknet Duel. It handles the application of effects for all card types, including wildcards, special effects, and standard card types, and manages persistent effects and chain effects.

- **Primary export:** `applyCardEffect`
- **Dependencies:** Shared game and card types, effect handlers for each card type, wildcard resolver, chain effects, temporary effects manager.
- **Purpose:** To centralize and route all card effect logic for the throw card action.

---

## Main Components

### 1. `applyCardEffect(cardType, currentInfra, infraIndex, allInfrastructure, card, attackVector?, playerID?, gameState?, chosenType?)`
- **Purpose:** Applies the effect of a card based on its type, returning the updated infrastructure array or special result.
- **Parameters:**
  - `cardType`: The type of card being played.
  - `currentInfra`: The target infrastructure card.
  - `infraIndex`: The index of the target infrastructure in the array.
  - `allInfrastructure`: The full array of infrastructure cards.
  - `card`: The card being played.
  - `attackVector`: (Optional) The attack vector being used.
  - `playerID`: (Optional) The ID of the acting player.
  - `gameState`: (Optional) The current game state.
  - `chosenType`: (Optional) The chosen type for wildcards.
- **Returns:**
  - Updated infrastructure array, or special result (`{ victory: true }`, `{ pendingChoice: true }`, or `null`).
- **Logic:**
  - Routes to the appropriate effect handler based on card type.
  - Handles wildcards and special effects, including chain effects and lateral movement.
  - Manages persistent effects after infrastructure state changes.

### 2. `handleWildcardEffect(...)`
- **Purpose:** Handles wildcard card effects, including player choice, auto-selection, and effect application.
- **Parameters:**
  - Same as `applyCardEffect`, with additional context for wildcards.
- **Returns:**
  - Updated infrastructure array, or special result (`{ pendingChoice: true }`, etc.).
- **Logic:**
  - Sets up pending choices for wildcards, applies effects, and routes to the correct handler.

### 3. `handleSpecialEffect(...)`
- **Purpose:** Handles special effect cards, such as chain effects and lateral movement.
- **Parameters:**
  - Same as `applyCardEffect`, with additional context for special effects.
- **Returns:**
  - Updated infrastructure array, or special result.
- **Logic:**
  - Applies the initial effect, then triggers chain effects and updates game state.

### 4. `processInfrastructureStateChange(gameState, oldInfrastructure, newInfrastructure)`
- **Purpose:** Processes persistent effects after infrastructure state changes.
- **Parameters:**
  - `gameState`: The current game state.
  - `oldInfrastructure`: The previous infrastructure array.
  - `newInfrastructure`: The updated infrastructure array.
- **Returns:**
  - Updated game state with persistent effects processed.

---

## Example Usage

Used by the main throw card move logic to apply card effects after validation and cost calculation.

---

## Related Files
- `exploitEffect.ts`, `attackEffect.ts`, `shieldEffect.ts`, `fortifyEffect.ts`, `responseEffect.ts`, `reactionEffect.ts`, `counterEffect.ts`: Effect handlers for each card type.
- `wildcardResolver.ts`: Handles wildcard-specific logic.
- `chainEffects.ts`: Handles chain and lateral movement effects.

---

## Notes
- The modular structure improves maintainability and testability.
- Debug logging is present for troubleshooting effect routing and application. 