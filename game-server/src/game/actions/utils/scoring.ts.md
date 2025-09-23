# scoring.ts

**Location:** `game-server/src/game/actions/utils/scoring.ts`

---

## File Overview

This file provides utility functions for score calculation and victory checks in Darknet Duel. It includes logic for determining attacker and defender scores based on infrastructure states and checking for attacker victory conditions.

- **Primary exports:** `calculateScores`, `checkAttackerVictory`
- **Dependencies:** Shared game and card types.
- **Purpose:** To encapsulate logic for score calculation and victory checks.

---

## Main Components

### 1. `calculateScores(infrastructure)`
- **Purpose:** Calculates attacker and defender scores based on infrastructure states.
- **Parameters:**
  - `infrastructure`: The array of infrastructure cards.
- **Returns:**
  - `{ attackerScore, defenderScore }` — The calculated scores.
- **Logic:**
  - Attacker score is the number of compromised infrastructure cards.
  - Defender score is the number of fortified infrastructure cards.

### 2. `checkAttackerVictory(infrastructure)`
- **Purpose:** Checks if the attacker has won based on the number of compromised infrastructure cards.
- **Parameters:**
  - `infrastructure`: The array of infrastructure cards.
- **Returns:**
  - `true` if the attacker has won, `false` otherwise.
- **Logic:**
  - Attacker wins if more than half the infrastructure is compromised.

---

## Example Usage

Used by move handlers and effect logic to calculate scores and check for victory after card effects.

---

## Related Files
- `validators.ts`: For targeting validation.

---

## Notes
- The functions are robust to different infrastructure states and include safety checks for score calculation. 