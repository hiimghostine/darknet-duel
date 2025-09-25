import { create } from 'zustand';

interface AutoReactionStore {
  // Timer state
  isTimerActive: boolean;
  timeRemaining: number;
  isPaused: boolean;
  
  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  setTimeRemaining: (time: number) => void;
  
  // Reset function
  reset: () => void;
}

const AUTO_SKIP_DELAY = 20; // Fixed 20 seconds

export const useAutoReactionStore = create<AutoReactionStore>((set) => ({
  // Initial state
  isTimerActive: false,
  timeRemaining: 0,
  isPaused: false,
  
  // Actions
  startTimer: () => {
    set({ 
      isTimerActive: true, 
      timeRemaining: AUTO_SKIP_DELAY, 
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