# Player Actions Module

This directory contains the refactored player actions for Darknet Duel game. The code has been split from a monolithic `playerActions.ts` file into smaller, more focused modules while maintaining the same public API.

## Directory Structure

```
game-server/src/game/actions/
├── playerActions.ts          # Main entry point (re-exports everything)
├── cycleCardMove.ts          # Card cycling functionality
├── playCardMove.ts           # Playing cards to field
├── throwCardMove/            # Folder for complex throw card functionality
│   ├── index.ts              # Main throwCardMove export
│   ├── throwCardMove.ts      # Core implementation
│   └── cardEffects/          # Card effect implementations by type
│       ├── index.ts          # Effect router and exports
│       ├── attackEffect.ts   # Logic for attack cards
│       ├── counterEffect.ts  # Logic for counter-attack cards
│       ├── exploitEffect.ts  # Logic for exploit cards
│       ├── fortifyEffect.ts  # Logic for fortify cards
│       ├── reactionEffect.ts # Logic for reaction cards
│       ├── responseEffect.ts # Logic for response cards
│       └── shieldEffect.ts   # Logic for shield cards
├── turnManagement.ts         # End turn functionality
└── utils/                    # Shared utility functions
    ├── index.ts              # Exports all utilities
    ├── typeGuards.ts         # Type guards for card features
    ├── effectHandling.ts     # Special effect application
    ├── stateUpdates.ts       # Common state update patterns
    ├── validators.ts         # Card targeting validation
    └── scoring.ts            # Score calculation functions
```

## Improvements

1. **Better Organization**: Code is organized by functionality
2. **Improved Maintainability**: Smaller files with focused responsibilities
3. **Better Type Safety**: Proper handling of shared types
4. **Easier Testing**: Isolated components are easier to test
5. **Extensibility**: Adding new card types only requires new effect handlers
6. **Backward Compatibility**: Maintained through the main entry point

## Migration Guide

### Immediate Term

The main `playerActions.ts` file re-exports all the same functions as before, so no immediate changes are needed in the codebase. You can simply replace the original file with the refactored version:

```bash
# Backup the original file
mv playerActions.ts playerActions.ts.old

# Use the new implementation
mv playerActions.ts.new playerActions.ts
```

### Long Term

For better code organization, consider updating imports to use the specialized modules directly:

```typescript
// Before
import { throwCardMove } from '../actions/playerActions';

// After
import { throwCardMove } from '../actions/throwCardMove';
```

## Working with Shared Types

This codebase uses shared types between frontend and backend with some properties having flexible types:

1. `wildcardType` is defined as `CardType[] | string` - backend uses strings, frontend uses arrays
2. `vulnerabilities` is defined as `Vulnerability[] | string[]` - backend uses complex objects, frontend uses strings

The refactored code properly handles these variations with type checking.

## Adding New Card Types

To add a new card type:

1. Create a new effect handler in `throwCardMove/cardEffects/`
2. Add the new handler to the switch statement in `cardEffects/index.ts`
3. Update the `validateCardTargeting` function in `utils/validators.ts`

## Future Improvements

1. Add comprehensive unit tests for each module
2. Further separate infrastructure state management
3. Add better error handling and logging
4. Consider adding event emitters for game events
