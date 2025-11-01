import { useState, useEffect, useCallback } from 'react';
import type { TutorialState, TutorialScript } from '../types/tutorial.types';
import tutorialManager from '../services/tutorialManager';

export const useTutorial = () => {
  const [tutorialState, setTutorialState] = useState<TutorialState>(tutorialManager.getState());

  // Update state when tutorial manager state changes
  useEffect(() => {
    const updateState = () => {
      setTutorialState(tutorialManager.getState());
    };

    // Listen to all tutorial events to update state
    const eventTypes = [
      'tutorial_started',
      'tutorial_completed',
      'tutorial_paused',
      'tutorial_resumed',
      'tutorial_cancelled',
      'step_started',
      'step_completed',
      'step_skipped'
    ] as const;

    eventTypes.forEach(eventType => {
      tutorialManager.addEventListener(eventType, updateState);
    });

    return () => {
      eventTypes.forEach(eventType => {
        tutorialManager.removeEventListener(eventType, updateState);
      });
    };
  }, []);

  // Tutorial control methods
  const startTutorial = useCallback(async (scriptId: string) => {
    return await tutorialManager.startTutorial(scriptId);
  }, []);

  const nextStep = useCallback(() => {
    tutorialManager.nextStep();
  }, []);

  const previousStep = useCallback(() => {
    tutorialManager.previousStep();
  }, []);

  const skipStep = useCallback(() => {
    tutorialManager.skipStep();
  }, []);

  const pauseTutorial = useCallback(() => {
    tutorialManager.pauseTutorial();
  }, []);

  const resumeTutorial = useCallback(() => {
    tutorialManager.resumeTutorial();
  }, []);

  const cancelTutorial = useCallback(() => {
    tutorialManager.cancelTutorial();
  }, []);

  const validateGameState = useCallback((gameState: any) => {
    return tutorialManager.validateGameState(gameState);
  }, []);

  // Utility methods
  const getAvailableScripts = useCallback((): TutorialScript[] => {
    return tutorialManager.getAvailableScripts();
  }, []);

  const isScriptCompleted = useCallback((scriptId: string): boolean => {
    return tutorialManager.isScriptCompleted(scriptId);
  }, []);

  const getScriptProgress = useCallback((scriptId: string) => {
    return tutorialManager.getScriptProgress(scriptId);
  }, []);

  const resetProgress = useCallback((scriptId?: string) => {
    tutorialManager.resetProgress(scriptId);
  }, []);

  const markTutorialComplete = useCallback((scriptId: string) => {
    tutorialManager.markTutorialComplete(scriptId);
  }, []);

  return {
    // State
    tutorialState,
    isActive: tutorialState.isActive,
    currentScript: tutorialState.currentScript,
    currentStep: tutorialState.currentStep,
    
    // Control methods
    startTutorial,
    nextStep,
    previousStep,
    skipStep,
    pauseTutorial,
    resumeTutorial,
    cancelTutorial,
    validateGameState,
    
    // Utility methods
    getAvailableScripts,
    isScriptCompleted,
    getScriptProgress,
    resetProgress,
    markTutorialComplete
  };
};
