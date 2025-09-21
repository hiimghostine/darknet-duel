export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  instruction: string;
  targetElement?: string; // CSS selector for highlighting
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: TutorialAction;
  validation?: TutorialValidation;
  autoAdvance?: boolean;
  delay?: number; // milliseconds to wait before showing step
  skipable?: boolean;
}

export interface TutorialAction {
  type: 'click' | 'hover' | 'input' | 'wait' | 'custom';
  target?: string; // CSS selector
  value?: string; // for input actions
  customHandler?: () => void;
}

export interface TutorialValidation {
  type: 'element_exists' | 'element_clicked' | 'game_state' | 'custom';
  condition: string | ((gameState?: any) => boolean);
  timeout?: number; // milliseconds to wait for validation
}

// Tutorial script definition
export interface TutorialScript {
  id: string;
  name: string;
  description: string;
  steps: TutorialStep[];
  prerequisites?: string[];
  estimatedDuration: number; // in minutes
}

export interface TutorialProgress {
  scriptId: string;
  currentStep: number;
  completed: boolean;
  startedAt: number;
  completedAt?: number;
  skippedSteps: string[];
}

export interface TutorialState {
  isActive: boolean;
  currentScript?: TutorialScript;
  currentStep?: TutorialStep;
  stepIndex: number;
  progress: TutorialProgress[];
  showHighlight: boolean;
  highlightTarget?: string;
  overlayVisible: boolean;
}

export type TutorialEventType = 
  | 'step_started'
  | 'step_completed' 
  | 'step_skipped'
  | 'tutorial_started'
  | 'tutorial_completed'
  | 'tutorial_paused'
  | 'tutorial_resumed'
  | 'tutorial_cancelled';

export interface TutorialEvent {
  type: TutorialEventType;
  stepId?: string;
  scriptId: string;
  timestamp: number;
  data?: any;
}
