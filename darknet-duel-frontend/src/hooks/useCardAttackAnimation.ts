import { useState, useRef, useCallback, useEffect } from 'react';

interface AttackAnimationState {
  isActive: boolean;
  attackingCardId: string | null;
  targetInfraId: string | null;
  attackingCardElement: HTMLElement | null;
  targetInfraElement: HTMLElement | null;
  phase: 'idle' | 'preparing' | 'animating' | 'stateChanging' | 'complete';
}

interface UseCardAttackAnimationReturn {
  animationState: AttackAnimationState;
  startAttackAnimation: (
    cardId: string,
    targetId: string,
    cardElement: HTMLElement,
    targetElement: HTMLElement
  ) => Promise<void>;
  onAnimationComplete: () => void;
  onStateChangeReady: () => void;
  resetAnimation: () => void;
}

export const useCardAttackAnimation = (
  onStateUpdate?: () => void
): UseCardAttackAnimationReturn => {
  const [animationState, setAnimationState] = useState<AttackAnimationState>({
    isActive: false,
    attackingCardId: null,
    targetInfraId: null,
    attackingCardElement: null,
    targetInfraElement: null,
    phase: 'idle'
  });

  const animationPromiseRef = useRef<{
    resolve: () => void;
    reject: (error: Error) => void;
  } | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Start the attack animation sequence
  const startAttackAnimation = useCallback((
    cardId: string,
    targetId: string,
    cardElement: HTMLElement,
    targetElement: HTMLElement
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Store promise handlers
      animationPromiseRef.current = { resolve, reject };

      // Set up animation state
      setAnimationState({
        isActive: true,
        attackingCardId: cardId,
        targetInfraId: targetId,
        attackingCardElement: cardElement,
        targetInfraElement: targetElement,
        phase: 'preparing'
      });

      // Start animation after a brief delay to ensure DOM is ready
      timeoutRef.current = setTimeout(() => {
        setAnimationState(prev => ({
          ...prev,
          phase: 'animating'
        }));
      }, 100);
    });
  }, []);

  // Called when the net reaches the target and state should change
  const onStateChangeReady = useCallback(() => {
    setAnimationState(prev => ({
      ...prev,
      phase: 'stateChanging'
    }));

    // Trigger the actual game state update
    if (onStateUpdate) {
      onStateUpdate();
    }
  }, [onStateUpdate]);

  // Called when the entire animation sequence is complete
  const onAnimationComplete = useCallback(() => {
    setAnimationState(prev => ({
      ...prev,
      phase: 'complete'
    }));

    // Resolve the promise to indicate animation is done
    if (animationPromiseRef.current) {
      animationPromiseRef.current.resolve();
      animationPromiseRef.current = null;
    }

    // Reset after a brief delay
    timeoutRef.current = setTimeout(() => {
      setAnimationState({
        isActive: false,
        attackingCardId: null,
        targetInfraId: null,
        attackingCardElement: null,
        targetInfraElement: null,
        phase: 'idle'
      });
    }, 500);
  }, []);

  // Reset animation state
  const resetAnimation = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (animationPromiseRef.current) {
      animationPromiseRef.current.reject(new Error('Animation cancelled'));
      animationPromiseRef.current = null;
    }

    setAnimationState({
      isActive: false,
      attackingCardId: null,
      targetInfraId: null,
      attackingCardElement: null,
      targetInfraElement: null,
      phase: 'idle'
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    animationState,
    startAttackAnimation,
    onAnimationComplete,
    onStateChangeReady,
    resetAnimation
  };
};
