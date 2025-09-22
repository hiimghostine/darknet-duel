# playCardMove.ts

**Location:** `game-server/src/game/actions/playCardMove.ts`

---

## File Overview

This file provides the main logic for playing a card from a player's hand onto the field in Darknet Duel. It handles both standard and wildcard cards, applies special effects, and manages action points and hand/discard updates.

- **Primary export:** `playCardMove`
- **Dependencies:** boardgame.io context, shared game and card types, card utility functions, effect handling, wildcard utilities, temporary effects manager.
- **Purpose:** To encapsulate the logic for playing cards, including validation, effect application, and state updates.

---

## Main Components

### 1. `playCardMove({ G, ctx, playerID }, cardId, targetId?)`
- **Purpose:** Handles the action of playing a card from hand, including wildcards, cost reductions, and effect application.
- **Parameters:**
  - `G`: The current game state.
  - `ctx`: The boardgame.io context.
  - `playerID`: The ID of the player playing the card.
  - `cardId`: The ID of the card to play.
  - `targetId`: Optional target infrastructure/card ID.
- **Returns:**
  - Updated game state with the card played, effects applied, and state updated.
- **Logic:**
  - Handles wildcards and pending choices.
  - Applies cost reductions and checks for sufficient action points.
  - Validates playability for counter/reaction cards.
  - Applies special effects and manages hand/discard updates.
  - Records the action in the game log.

---

## Example Usage

Used by move handlers and phase logic to process card plays.

---

## Related Files
- `temporaryEffectsManager.ts`: For cost reduction and effect management.
- `wildcardResolver.ts`: For wildcard card logic.

---

## Notes
- The function is robust to different card types and includes validation for playability and cost.
- Debug logging is present for troubleshooting card play logic. 