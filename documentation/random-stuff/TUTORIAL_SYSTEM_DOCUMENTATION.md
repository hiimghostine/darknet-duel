# Darknet Duel Tutorial System Documentation

## Overview

The Darknet Duel tutorial system provides comprehensive onboarding for new players through both video and interactive tutorials. The system is designed to be modular, extensible, and seamlessly integrated with the existing game architecture.

## Architecture

### Core Components

#### 1. Tutorial Manager (`tutorialManager.ts`)
- **Purpose**: Central state management and script execution
- **Key Features**:
  - Script loading and validation
  - Progress tracking with localStorage persistence
  - Event system for tutorial lifecycle
  - Step validation and auto-advancement
  - Timeout and cleanup management

#### 2. Tutorial Types (`tutorial.types.ts`)
- **TutorialScript**: Complete tutorial definition with steps and metadata
- **TutorialStep**: Individual tutorial step with targeting and validation
- **TutorialState**: Current tutorial execution state
- **TutorialProgress**: Persistent progress tracking data

#### 3. Tutorial Scripts (`tutorialScripts.ts`)
- **Basic Gameplay**: Core mechanics for attackers (10 minutes)
- **Defender Basics**: Defensive strategies and mechanics (8 minutes)
- **Advanced Mechanics**: Wildcards, chain effects, special abilities (12 minutes)

### UI Components

#### 1. VideoTutorial (`VideoTutorial.tsx`)
- **Features**:
  - Full video player with controls (play, pause, volume, fullscreen)
  - Progress tracking and seeking
  - Responsive design with accessibility support
  - Auto-completion callbacks

#### 2. TutorialOverlay (`TutorialOverlay.tsx`)
- **Features**:
  - Dynamic positioning based on target elements
  - Progress visualization
  - Step navigation controls
  - Highlight management with backdrop

#### 3. TutorialMenu (`TutorialMenu.tsx`)
- **Features**:
  - Script selection with progress indicators
  - Prerequisites validation
  - Video tutorial access
  - Completion status tracking

#### 4. TutorialButton (`TutorialButton.tsx`)
- **Features**:
  - Configurable button variants and sizes
  - Progress display options
  - Easy integration into existing UI

#### 5. TutorialIntegration (`TutorialIntegration.tsx`)
- **Features**:
  - Game state validation integration
  - DOM element targeting and highlighting
  - Automatic cleanup and class management

## Tutorial Flow

### 1. Tutorial Initialization
```typescript
// Start a tutorial
const success = await tutorialManager.startTutorial('basic_gameplay');
```

### 2. Step Execution Pipeline
1. **Step Loading**: Load step configuration and validate prerequisites
2. **Target Highlighting**: Apply visual highlights to target elements
3. **Validation Setup**: Configure validation conditions (click, state, custom)
4. **User Interaction**: Wait for user action or auto-advance
5. **Validation Check**: Verify completion conditions
6. **Progress Update**: Save progress and advance to next step

### 3. Validation Types
- **Element Exists**: Check if DOM element is present
- **Element Clicked**: Validate user clicked specific element
- **Game State**: Validate game state conditions
- **Custom**: Custom validation functions

## Integration Points

### Game Board Integration
```typescript
// Add to BalatroGameBoard.tsx
import TutorialIntegration from '../tutorial/TutorialIntegration';

// In component render
<TutorialIntegration
  gameState={G}
  ctx={ctx}
  playerID={playerID}
/>
```

### Menu Integration
```typescript
// Add to main menu or lobby
import TutorialButton from '../tutorial/TutorialButton';

<TutorialButton 
  variant="primary" 
  size="md" 
  showProgress={true} 
/>
```

### Game State Validation
```typescript
// In game components, validate tutorial progress
useEffect(() => {
  if (gameState) {
    tutorialManager.validateGameState(gameState);
  }
}, [gameState]);
```

## Configuration

### Tutorial Script Structure
```typescript
const tutorialScript: TutorialScript = {
  id: 'unique_id',
  name: 'Display Name',
  description: 'Brief description',
  estimatedDuration: 10, // minutes
  prerequisites: ['other_tutorial_id'], // optional
  steps: [
    {
      id: 'step_id',
      title: 'Step Title',
      description: 'Step description',
      instruction: 'What the user should do',
      targetElement: '.css-selector', // optional
      position: 'top' | 'bottom' | 'left' | 'right' | 'center',
      validation: {
        type: 'element_clicked',
        condition: '.target-selector',
        timeout: 10000
      },
      autoAdvance: false,
      skipable: true
    }
  ]
};
```

### CSS Targeting Classes
The tutorial system adds these classes for targeting:
- `.tutorial-target`: Added to all targetable elements
- `.tutorial-highlight`: Added to currently highlighted elements
- `.infrastructure-grid`: Infrastructure card container
- `.player-hand`: Player's card hand
- `.action-points-display`: AP counter display
- `.end-turn-button`: End turn control

### Data Attributes
- `data-tutorial-type`: Card type for targeting specific card types
- `data-tutorial-state`: Infrastructure state for state-based targeting
- `data-testid`: Test identifiers for reliable element selection

## Styling and Theming

### Tutorial Highlight Animation
```css
.tutorial-highlight {
  position: relative;
  z-index: 41;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  animation: tutorialPulse 2s infinite;
}

@keyframes tutorialPulse {
  0%, 100% {
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.5);
  }
}
```

### Overlay Positioning
The tutorial overlay automatically positions itself relative to target elements:
- **Top**: Above the target element
- **Bottom**: Below the target element  
- **Left/Right**: To the side of the target element
- **Center**: Centered in viewport (default)

## Progress Tracking

### LocalStorage Schema
```typescript
interface TutorialProgress {
  scriptId: string;
  currentStep: number;
  completed: boolean;
  startedAt: number;
  completedAt?: number;
  skippedSteps: string[];
}
```

### Progress Methods
```typescript
// Check completion status
const isCompleted = tutorialManager.isScriptCompleted('basic_gameplay');

// Get detailed progress
const progress = tutorialManager.getScriptProgress('basic_gameplay');

// Reset progress
tutorialManager.resetProgress('basic_gameplay'); // specific script
tutorialManager.resetAllProgress(); // all scripts
```

## Event System

### Available Events
- `tutorial_started`: Tutorial begins
- `tutorial_completed`: Tutorial finishes successfully
- `tutorial_paused`: Tutorial paused by user
- `tutorial_resumed`: Tutorial resumed
- `tutorial_cancelled`: Tutorial cancelled
- `step_started`: New step begins
- `step_completed`: Step completed successfully
- `step_skipped`: Step skipped by user

### Event Handling
```typescript
tutorialManager.addEventListener('step_completed', (event) => {
  console.log(`Step ${event.stepId} completed in ${event.scriptId}`);
});
```

## Accessibility Features

### Keyboard Navigation
- **Tab**: Navigate between tutorial controls
- **Enter/Space**: Activate buttons
- **Escape**: Cancel/close tutorial

### Screen Reader Support
- ARIA labels on all interactive elements
- Semantic HTML structure
- Focus management during tutorial steps

### Visual Accessibility
- High contrast highlighting
- Configurable animation preferences
- Scalable UI elements

## Video Tutorial Setup

### Video File Requirements
- **Format**: MP4 (H.264 codec recommended)
- **Resolution**: 1920x1080 or 1280x720
- **Duration**: 5-10 minutes recommended
- **File Size**: < 50MB for web optimization

### Video Placement
Place video files in: `public/assets/videos/darknet-duel-tutorial.mp4`

### Video Integration
```typescript
<VideoTutorial
  videoSrc="/assets/videos/darknet-duel-tutorial.mp4"
  title="Darknet Duel Tutorial"
  onComplete={() => {
    // Handle completion
  }}
  autoPlay={false}
/>
```

## Testing Guidelines

### Manual Testing Checklist
- [ ] All tutorial scripts load correctly
- [ ] Step progression works in both directions
- [ ] Validation triggers properly for each step type
- [ ] Visual highlights appear on correct elements
- [ ] Progress saves and restores correctly
- [ ] Video player controls function properly
- [ ] Responsive design works on different screen sizes
- [ ] Keyboard navigation works throughout
- [ ] Tutorial can be paused/resumed/cancelled at any point

### Automated Testing
```typescript
// Example test structure
describe('Tutorial System', () => {
  test('should start tutorial successfully', async () => {
    const result = await tutorialManager.startTutorial('basic_gameplay');
    expect(result).toBe(true);
  });

  test('should validate game state changes', () => {
    const mockGameState = { infrastructure: [{ state: 'vulnerable' }] };
    const result = tutorialManager.validateGameState(mockGameState);
    expect(result).toBe(true);
  });
});
```

## Troubleshooting

### Common Issues

#### Tutorial Not Starting
- Check script ID is correct
- Verify prerequisites are met
- Ensure tutorial manager is initialized

#### Highlights Not Appearing
- Verify target element selectors are correct
- Check CSS classes are being applied
- Ensure elements exist in DOM when tutorial runs

#### Progress Not Saving
- Check localStorage permissions
- Verify browser storage limits
- Test in incognito mode to rule out extensions

#### Video Not Loading
- Verify video file path is correct
- Check video file format compatibility
- Test network connectivity and file size

### Debug Mode
Enable debug logging:
```typescript
localStorage.setItem('tutorial_debug', 'true');
```

## Future Enhancements

### Planned Features
- **Branching Tutorials**: Different paths based on user choices
- **Adaptive Difficulty**: Adjust tutorial based on user performance  
- **Multiplayer Tutorials**: Synchronized tutorials for both players
- **Analytics Integration**: Track tutorial completion rates and drop-off points
- **Internationalization**: Multi-language tutorial support
- **Voice Narration**: Audio guidance for accessibility

### Extension Points
- Custom validation functions
- Additional tutorial script formats
- Theme customization options
- Integration with external analytics
- Custom UI component variants

## API Reference

### TutorialManager Methods
```typescript
// Core functionality
startTutorial(scriptId: string): Promise<boolean>
nextStep(): void
skipStep(): void
pauseTutorial(): void
resumeTutorial(): void
cancelTutorial(): void

// State management
getState(): TutorialState
validateGameState(gameState: any): boolean
handleElementClick(element: Element): boolean

// Progress management
getAvailableScripts(): TutorialScript[]
isScriptCompleted(scriptId: string): boolean
getScriptProgress(scriptId: string): TutorialProgress | undefined
resetProgress(scriptId?: string): void

// Event system
addEventListener(type: TutorialEventType, listener: Function): void
removeEventListener(type: TutorialEventType, listener: Function): void
```

### React Hooks
```typescript
// Main tutorial hook
const {
  tutorialState,
  isActive,
  startTutorial,
  nextStep,
  skipStep,
  // ... other methods
} = useTutorial();
```

This comprehensive tutorial system provides a robust foundation for onboarding new players to Darknet Duel while maintaining flexibility for future enhancements and customizations.
