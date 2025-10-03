import { create } from 'zustand';

/**
 * Store for managing auto turn timer state
 * Automatically ends turn after 120 seconds of inactivity
 */

interface AutoTurnStore {
  // State
  isTimerActive: boolean;
  timeRemaining: number;
  isPaused: boolean;
  
  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  setTimeRemaining: (time: number) => void;
  reset: () => void;
}

const AUTO_END_TURN_DELAY = 120; // 120 seconds (2 minutes)

export const useAutoTurnStore = create<AutoTurnStore>((set) => ({
  // Initial state
  isTimerActive: false,
  timeRemaining: 0,
  isPaused: false,
  
  // Actions
  startTimer: () => {
    set({ 
      isTimerActive: true, 
      timeRemaining: AUTO_END_TURN_DELAY, 
      isPaused: false 
    });
  },
  
  pauseTimer: () => set({ isPaused: true }),
  
  resumeTimer: () => set({ isPaused: false }),
  
  stopTimer: () => set({ 
    isTimerActive: false, 
    timeRemaining: 0, 
    isPaused: false 
  }),
  
  setTimeRemaining: (time: number) => 
    set({ timeRemaining: Math.max(0, time) }),
    
  reset: () => set({
    isTimerActive: false,
    timeRemaining: 0,
    isPaused: false
  })
}));

