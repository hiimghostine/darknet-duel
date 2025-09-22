# playerActions.ts

**Location:** `game-server/src/game/actions/playerActions.ts`

---

## File Overview

This file serves as the main entry point for all player actions in Darknet Duel. It re-exports functionality from specialized modules and utility functions for use throughout the codebase.

- **Primary exports:** `cycleCardMove`, `playCardMove`, `throwCardMove`, `endTurnMove`, and various utility functions
- **Purpose:** To provide a unified API for all player actions and related utilities.

---

## Main Components

### 1. Re-exports
- **cycleCardMove:** From `cycleCardMove.ts` — Handles discarding and drawing a card.
- **playCardMove:** From `playCardMove.ts` — Handles playing a card from hand.
- **throwCardMove:** From `throwCardMove/throwCardMove.ts` — Handles throwing a card at infrastructure.
- **endTurnMove:** From `turnManagement.ts` — Handles ending a player's turn.
- **applySpecialEffect:** From `utils/effectHandling.ts` — Applies special effects from cards.
- **hasCardFeatures:** From `utils/typeGuards.ts` — Type guard for card features.
- **validateCardTargeting:** From `utils/validators.ts` — Validates card targeting rules.
- **calculateScores, checkAttackerVictory:** From `utils/scoring.ts` — Score calculation and victory checks.
- **updatePlayerStateAfterCardPlay:** From `utils/stateUpdates.ts` — Updates player state after card play.
- **isCardPlayable:** From `../utils/cardUtils.ts` — Checks if a card is playable in the current context.

---

## Example Usage

Used by move handlers and phase logic to access all player action logic from a single import.

---

## Related Files
- `cycleCardMove.ts`, `playCardMove.ts`, `throwCardMove/throwCardMove.ts`, `turnManagement.ts`: Specialized action logic.
- `utils/`: Utility functions for card and player logic.

---

## Notes
- This file is primarily for organization and backward compatibility.
- All player action logic is accessible from this single entry point. 