import type { 
  TutorialScript, 
  TutorialStep, 
  TutorialState, 
  TutorialProgress, 
  TutorialEvent,
  TutorialEventType 
} from '../types/tutorial.types';
import { tutorialScripts } from '../data/tutorialScripts';

class TutorialManager {
  private state: TutorialState;
  private eventListeners: Map<TutorialEventType, ((event: TutorialEvent) => void)[]>;
  private validationTimeouts: Map<string, NodeJS.Timeout>;
  private stepTimeouts: Map<string, NodeJS.Timeout>;

  constructor() {
    this.state = {
      isActive: false,
      stepIndex: 0,
      progress: this.loadProgress(),
      showHighlight: false,
      overlayVisible: false
    };
    this.eventListeners = new Map();
    this.validationTimeouts = new Map();
    this.stepTimeouts = new Map();
  }

  // State Management
  getState(): TutorialState {
    return { ...this.state };
  }

  private setState(updates: Partial<TutorialState>) {
    this.state = { ...this.state, ...updates };
    this.saveProgress();
  }

  // Progress Persistence
  private loadProgress(): TutorialProgress[] {
    try {
      const saved = localStorage.getItem('darknet_duel_tutorial_progress');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load tutorial progress:', error);
      return [];
    }
  }

  private saveProgress() {
    try {
      localStorage.setItem('darknet_duel_tutorial_progress', JSON.stringify(this.state.progress));
    } catch (error) {
      console.error('Failed to save tutorial progress:', error);
    }
  }

  // Script Management
  getAvailableScripts(): TutorialScript[] {
    return tutorialScripts.filter(script => {
      if (!script.prerequisites) return true;
      return script.prerequisites.every(prereq => 
        this.state.progress.some(p => p.scriptId === prereq && p.completed)
      );
    });
  }

  getScriptById(id: string): TutorialScript | undefined {
    return tutorialScripts.find(script => script.id === id);
  }

  isScriptCompleted(scriptId: string): boolean {
    return this.state.progress.some(p => p.scriptId === scriptId && p.completed);
  }

  getScriptProgress(scriptId: string): TutorialProgress | undefined {
    return this.state.progress.find(p => p.scriptId === scriptId);
  }

  // Tutorial Execution
  async startTutorial(scriptId: string): Promise<boolean> {
    const script = this.getScriptById(scriptId);
    if (!script) {
      console.error(`Tutorial script not found: ${scriptId}`);
      return false;
    }

    // Check prerequisites
    if (script.prerequisites) {
      const missingPrereqs = script.prerequisites.filter(prereq => 
        !this.isScriptCompleted(prereq)
      );
      if (missingPrereqs.length > 0) {
        console.error(`Missing prerequisites: ${missingPrereqs.join(', ')}`);
        return false;
      }
    }

    // Initialize or resume progress
    let progress = this.getScriptProgress(scriptId);
    if (!progress) {
      progress = {
        scriptId,
        currentStep: 0,
        completed: false,
        startedAt: Date.now(),
        skippedSteps: []
      };
      this.state.progress.push(progress);
    }

    this.setState({
      isActive: true,
      currentScript: script,
      stepIndex: progress.currentStep,
      overlayVisible: true
    });

    this.emitEvent('tutorial_started', scriptId);
    await this.showStep(progress.currentStep);
    return true;
  }

  async showStep(stepIndex: number) {
    const { currentScript } = this.state;
    if (!currentScript || stepIndex >= currentScript.steps.length) {
      return this.completeTutorial();
    }

    const step = currentScript.steps[stepIndex];
    this.setState({
      currentStep: step,
      stepIndex,
      showHighlight: !!step.targetElement
    });

    this.emitEvent('step_started', currentScript.id, { stepId: step.id });

    // Apply step delay if specified
    if (step.delay) {
      const timeoutId = setTimeout(() => {
        this.stepTimeouts.delete(step.id);
        this.processStep(step);
      }, step.delay);
      this.stepTimeouts.set(step.id, timeoutId);
    } else {
      this.processStep(step);
    }
  }

  private processStep(step: TutorialStep) {
    // Clear ALL tutorial highlighting completely
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });
    
    // Update highlight target in state
    if (step.targetElement) {
      this.setState({ highlightTarget: step.targetElement });
      // Don't call highlightElement here - let TutorialOverlay handle it
    } else {
      this.setState({ highlightTarget: undefined });
    }

    // Emit step change event for tutorial components to listen to
    const stepChangeEvent = new CustomEvent('tutorial-step-changed', {
      detail: { stepId: step.id, stepIndex: this.state.stepIndex }
    });
    window.dispatchEvent(stepChangeEvent);

    // Set up validation if specified
    if (step.validation) {
      this.setupValidation(step);
    }

    // Handle auto-advance
    if (step.autoAdvance) {
      const timeout = setTimeout(() => {
        this.nextStep();
      }, step.validation?.timeout || 3000);
      this.stepTimeouts.set(step.id, timeout);
    }

    // Emit step event
    this.emitEvent('tutorial_started', step.id);
  }

  private setupValidation(step: TutorialStep) {
    if (!step.validation) return;
    
    // For custom validation, we want single auto-advance when condition is met
    if (step.validation.type === 'custom') {
      console.log('🔄 Setting up single auto-advance validation for step:', step.id);
      
      let hasAdvanced = false; // Prevent multiple advances
      
      const checkCustomValidation = () => {
        if (hasAdvanced) return; // Already advanced, stop checking
        
        if (typeof step.validation!.condition === 'function') {
          const isValid = (step.validation!.condition as Function)();
          console.log('🎯 TUTORIAL: Custom validation check for', step.id, ':', isValid);
          
          if (isValid) {
            hasAdvanced = true;
            console.log('✅ TUTORIAL: Auto-advancing step', step.id);
            setTimeout(() => {
              this.completeStep();
            }, 500); // Small delay for user to see the action result
          }
        }
      };
      
      // Set up periodic validation check
      const validationInterval = setInterval(checkCustomValidation, 500);
      
      // Set up timeout to stop checking after reasonable time
      const timeout = setTimeout(() => {
        clearInterval(validationInterval);
        this.validationTimeouts.delete(step.id);
      }, step.validation.timeout || 30000); // 30 second timeout
      
      this.validationTimeouts.set(step.id, timeout);
      
      // Initial check
      checkCustomValidation();
      return;
    }

    const checkValidation = () => {
      let isValid = false;

      switch (step.validation!.type) {
        case 'element_exists':
          isValid = !!document.querySelector(step.validation!.condition as string);
          break;
        case 'element_clicked':
          // This will be handled by click event listeners
          break;
        case 'game_state':
          if (typeof step.validation!.condition === 'function') {
            // Game state validation will be triggered externally
            return;
          }
          break;
        case 'custom':
          if (typeof step.validation!.condition === 'function') {
            isValid = (step.validation!.condition as Function)();
          }
          break;
      }

      if (isValid) {
        this.completeStep();
      }
    };

    // Set up periodic validation check
    const validationInterval = setInterval(checkValidation, 500);
    
    // Set up timeout
    const timeout = setTimeout(() => {
      clearInterval(validationInterval);
      this.validationTimeouts.delete(step.id);
      // Auto-advance on timeout if configured
      if (step.autoAdvance) {
        this.nextStep();
      }
    }, step.validation.timeout || 10000);

    this.validationTimeouts.set(step.id, timeout);

    // Initial check
    checkValidation();
  }

  validateGameState(gameState: any): boolean {
    const { currentStep } = this.state;
    if (!currentStep?.validation || currentStep.validation.type !== 'game_state') {
      return false;
    }

    if (typeof currentStep.validation.condition === 'function') {
      const isValid = currentStep.validation.condition(gameState);
      if (isValid) {
        this.completeStep();
        return true;
      }
    }

    return false;
  }

  handleElementClick(element: Element): boolean {
    const { currentStep } = this.state;
    if (!currentStep?.validation || currentStep.validation.type !== 'element_clicked') {
      return false;
    }

    const selector = currentStep.validation.condition as string;
    
    // Enhanced matching for tutorial-specific selectors
    let isMatch = false;
    
    if (selector === '.player-hand .card:first-child') {
      // Check if clicked element is the first card in hand
      const firstCard = document.querySelector('.player-hand .card:first-child, .player-hand [data-card-id]:first-child, .tutorial-first-card');
      isMatch = element === firstCard || element.closest('.card') === firstCard || element.classList.contains('tutorial-first-card');
    } else if (selector === '.infrastructure-card[data-vectors*="network"]') {
      // Check if clicked element is a network infrastructure card
      const infraId = element.getAttribute('data-infra-id') || element.closest('[data-infra-id]')?.getAttribute('data-infra-id');
      isMatch = infraId === 'I001' || infraId === 'I005' || infraId === 'I009' || element.classList.contains('tutorial-network-infra');
    } else {
      // Standard selector matching
      isMatch = element.matches(selector) || !!element.closest(selector);
    }
    
    if (isMatch) {
      console.log('✅ Tutorial click validated:', selector, element);
      this.completeStep();
      return true;
    }

    console.log('❌ Tutorial click not matched:', selector, element);
    return false;
  }

  private completeStep() {
    const { currentScript, currentStep, stepIndex } = this.state;
    if (!currentScript || !currentStep) return;

    // Clear any timeouts
    this.clearStepTimeouts(currentStep.id);

    // Update progress
    const progress = this.getScriptProgress(currentScript.id);
    if (progress) {
      progress.currentStep = Math.max(progress.currentStep, stepIndex + 1);
    }

    this.emitEvent('step_completed', currentScript.id, { stepId: currentStep.id });
    this.nextStep();
  }

  nextStep() {
    const { stepIndex, currentScript, currentStep } = this.state;
    if (!currentScript) return;

    // Store the current step's action to execute after advancing
    const actionToExecute = currentStep?.action?.type === 'custom' ? currentStep.action.customHandler : null;

    if (stepIndex + 1 >= currentScript.steps.length) {
      this.completeTutorial();
    } else {
      // First advance to the next step
      this.showStep(stepIndex + 1);
      
      // Then execute the custom action after a delay to prevent auto-advancement loops
      if (actionToExecute) {
        console.log('🎯 Executing custom action for previous step:', currentStep?.id);
        setTimeout(() => {
          try {
            actionToExecute();
          } catch (error) {
            console.error('❌ Custom action failed:', error);
          }
        }, 500); // Longer delay to ensure step transition is complete
      }
    }
  }

  previousStep() {
    const { stepIndex } = this.state;
    if (stepIndex > 0) {
      this.showStep(stepIndex - 1);
    }
  }

  skipStep() {
    const { currentScript, currentStep, stepIndex } = this.state;
    if (!currentScript || !currentStep || !currentStep.skipable) return;

    // Clear timeouts
    this.clearStepTimeouts(currentStep.id);

    // Update progress
    const progress = this.getScriptProgress(currentScript.id);
    if (progress) {
      progress.skippedSteps.push(currentStep.id);
      progress.currentStep = Math.max(progress.currentStep, stepIndex + 1);
    }

    this.emitEvent('step_skipped', currentScript.id, { stepId: currentStep.id });
    this.nextStep();
  }

  pauseTutorial() {
    const { currentScript } = this.state;
    if (!currentScript) return;

    this.setState({ isActive: false, overlayVisible: false });
    this.clearAllTimeouts();
    this.emitEvent('tutorial_paused', currentScript.id);
  }

  resumeTutorial() {
    const { currentScript, stepIndex } = this.state;
    if (!currentScript) return;

    this.setState({ isActive: true, overlayVisible: true });
    this.emitEvent('tutorial_resumed', currentScript.id);
    this.showStep(stepIndex);
  }

  cancelTutorial() {
    const { currentScript } = this.state;
    if (!currentScript) return;

    this.clearAllTimeouts();
    this.setState({
      isActive: false,
      currentScript: undefined,
      currentStep: undefined,
      stepIndex: 0,
      showHighlight: false,
      highlightTarget: undefined,
      overlayVisible: false
    });

    this.emitEvent('tutorial_cancelled', currentScript.id);
  }

  private completeTutorial() {
    const { currentScript } = this.state;
    if (!currentScript) return;

    // Update progress
    const progress = this.getScriptProgress(currentScript.id);
    if (progress) {
      progress.completed = true;
      progress.completedAt = Date.now();
    }

    this.clearAllTimeouts();
    this.setState({
      isActive: false,
      currentScript: undefined,
      currentStep: undefined,
      stepIndex: 0,
      showHighlight: false,
      highlightTarget: undefined,
      overlayVisible: false
    });

    this.emitEvent('tutorial_completed', currentScript.id);
  }

  // Utility Methods - REMOVED highlightElement completely
  // All highlighting is now handled by TutorialOverlay component

  private clearStepTimeouts(stepId: string) {
    const timeout = this.stepTimeouts.get(stepId);
    if (timeout) {
      clearTimeout(timeout);
      this.stepTimeouts.delete(stepId);
    }

    const validationTimeout = this.validationTimeouts.get(stepId);
    if (validationTimeout) {
      clearTimeout(validationTimeout);
      this.validationTimeouts.delete(stepId);
    }
  }

  private clearAllTimeouts() {
    this.stepTimeouts.forEach(timeout => clearTimeout(timeout));
    this.validationTimeouts.forEach(timeout => clearTimeout(timeout));
    this.stepTimeouts.clear();
    this.validationTimeouts.clear();
  }

  // Event System
  addEventListener(type: TutorialEventType, listener: (event: TutorialEvent) => void) {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)!.push(listener);
  }

  removeEventListener(type: TutorialEventType, listener: (event: TutorialEvent) => void) {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emitEvent(type: TutorialEventType, scriptId: string, data?: any) {
    const event: TutorialEvent = {
      type,
      scriptId,
      timestamp: Date.now(),
      stepId: this.state.currentStep?.id,
      data
    };

    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Tutorial event listener error:', error);
        }
      });
    }
  }

  // Reset Methods
  resetProgress(scriptId?: string) {
    if (scriptId) {
      this.state.progress = this.state.progress.filter(p => p.scriptId !== scriptId);
    } else {
      this.state.progress = [];
    }
    this.saveProgress();
  }

  resetAllProgress() {
    this.state.progress = [];
    this.saveProgress();
    localStorage.removeItem('darknet_duel_tutorial_progress');
  }
}

// Export singleton instance
export const tutorialManager = new TutorialManager();
export default tutorialManager;
