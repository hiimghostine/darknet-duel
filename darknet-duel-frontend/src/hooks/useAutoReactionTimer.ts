import { useEffect, useRef } from 'react';
import { useAutoReactionStore } from '../store/autoReaction.store';

interface UseAutoReactionTimerProps {
  isInReactionMode: boolean;
  isActive: boolean;
  targetMode: boolean;
  onAutoSkip: () => void;
}

export function useAutoReactionTimer({
  isInReactionMode,
  isActive,
  targetMode,
  onAutoSkip
}: UseAutoReactionTimerProps) {
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
  } = useAutoReactionStore();
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasAutoSkippedRef = useRef(false);

  // Start timer when entering reaction mode
  useEffect(() => {
    if (isInReactionMode && isActive && !targetMode) {
      console.log('🕒 Starting auto-reaction timer (20s)');
      startTimer();
      hasAutoSkippedRef.current = false;
    } else {
      // Stop timer when leaving reaction mode or becoming inactive
      if (isTimerActive) {
        console.log('🕒 Stopping auto-reaction timer');
        stopTimer();
        hasAutoSkippedRef.current = false;
      }
    }
  }, [isInReactionMode, isActive, targetMode, startTimer, stopTimer, isTimerActive]);

  // Pause timer when entering target mode (player is actively doing something)
  useEffect(() => {
    if (isTimerActive && targetMode && !isPaused) {
      console.log('⏸️ Pausing auto-reaction timer (player in target mode)');
      pauseTimer();
    } else if (isTimerActive && !targetMode && isPaused && isInReactionMode && isActive) {
      console.log('▶️ Resuming auto-reaction timer (player exited target mode)');
      resumeTimer();
    }
  }, [targetMode, isTimerActive, isPaused, pauseTimer, resumeTimer, isInReactionMode, isActive]);

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

  // Auto-skip when timer reaches 0
  useEffect(() => {
    if (isTimerActive && timeRemaining === 0 && !hasAutoSkippedRef.current && isInReactionMode && isActive) {
      console.log('⏰ Auto-skipping reaction (timer expired)');
      hasAutoSkippedRef.current = true;
      onAutoSkip();
      reset();
    }
  }, [timeRemaining, isTimerActive, onAutoSkip, reset, isInReactionMode, isActive]);

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