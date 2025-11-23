import { useEffect, useRef } from 'react';
import { useAutoTurnStore } from '../store/autoTurn.store';

interface UseAutoTurnTimerProps {
  isActive: boolean;
  isInReactionMode: boolean;
  targetMode: boolean;
  onAutoEndTurn: () => void;
}

export function useAutoTurnTimer({
  isActive,
  isInReactionMode,
  targetMode,
  onAutoEndTurn
}: UseAutoTurnTimerProps) {
  const {
    isTimerActive,
    timeRemaining,
    isPaused,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    setTimeRemaining,
    reset
  } = useAutoTurnStore();
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasAutoEndedRef = useRef(false);

  // Start timer when it's the player's active turn (not in reaction mode)
  useEffect(() => {
    if (isActive && !isInReactionMode && !targetMode) {
      console.log('🕒 Starting auto-turn timer (60s)');
      startTimer();
      hasAutoEndedRef.current = false;
    } else {
      // Stop timer when turn ends or enters reaction mode
      if (isTimerActive) {
        console.log('🕒 Stopping auto-turn timer');
        stopTimer();
        hasAutoEndedRef.current = false;
      }
    }
  }, [isActive, isInReactionMode, targetMode, startTimer, stopTimer, isTimerActive]);

  // Pause timer when entering target mode (player is actively doing something)
  useEffect(() => {
    if (isTimerActive && targetMode && !isPaused) {
      console.log('⏸️ Pausing auto-turn timer (player in target mode)');
      pauseTimer();
    } else if (isTimerActive && !targetMode && isPaused && isActive && !isInReactionMode) {
      console.log('▶️ Resuming auto-turn timer');
      resumeTimer();
    }
  }, [targetMode, isTimerActive, isPaused, pauseTimer, resumeTimer, isActive, isInReactionMode]);

  // Main timer countdown logic
  useEffect(() => {
    if (isTimerActive && !isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isTimerActive, isPaused, timeRemaining, setTimeRemaining]);

  // Auto-end turn when timer reaches 0
  useEffect(() => {
    if (isTimerActive && timeRemaining === 0 && !hasAutoEndedRef.current && isActive && !isInReactionMode) {
      console.log('⏰ Auto-ending turn (timer expired)');
      hasAutoEndedRef.current = true;
      onAutoEndTurn();
      reset();
    }
  }, [timeRemaining, isTimerActive, onAutoEndTurn, reset, isActive, isInReactionMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      reset();
    };
  }, [reset]);

  return {
    isTimerActive,
    timeRemaining,
    isPaused
  };
}

