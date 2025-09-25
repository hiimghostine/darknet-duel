import { create } from 'zustand';

// Interface for UI overlay states
interface UIOverlayState {
  isReactionMode: boolean;
  isProcessing: boolean;
  isNotificationVisible: boolean;
  notificationMessage?: string;
  notificationColor?: string;
  isEndTurnModalVisible: boolean;
  isSettingsModalVisible: boolean;
}

// Interface for targeting UI state
interface UITargetingState {
  isTargetModeActive: boolean;
  targetMode: boolean; // Legacy compatibility
  validTargets: string[];
  highlightedTargets: string[];
  targetingMessage?: string;
}

// Interface for status display state
interface UIStatusState {
  currentMessage?: string;
  messageColor?: string;
  messageTimeout?: number;
  statusIcons: {
    connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
    audioStatus: 'on' | 'off' | 'muted';
    notificationStatus: 'on' | 'off';
  };
}

// Interface for visual effects state
interface UIEffectsState {
  activeAnimations: string[];
  particleEffects: {
    id: string;
    type: 'attack' | 'defend' | 'compromise' | 'restore';
    position: { x: number; y: number };
    duration: number;
  }[];
  screenShake: boolean;
  flashEffect?: {
    color: string;
    intensity: number;
    duration: number;
  };
}

// Main Game UI Store interface
interface GameUIStore {
  // State
  overlays: UIOverlayState;
  targeting: UITargetingState;
  status: UIStatusState;
  effects: UIEffectsState;
  
  // Overlay actions
  setReactionMode: (active: boolean) => void;
  setProcessing: (processing: boolean) => void;
  showNotification: (message: string, color?: string, duration?: number) => void;
  hideNotification: () => void;
  toggleEndTurnModal: (visible?: boolean) => void;
  toggleSettingsModal: (visible?: boolean) => void;
  
  // Targeting actions
  setTargetMode: (active: boolean) => void;
  setValidTargets: (targets: string[]) => void;
  setHighlightedTargets: (targets: string[]) => void;
  setTargetingMessage: (message?: string) => void;
  clearTargeting: () => void;
  
  // Status actions
  setMessage: (message: string, color?: string, timeout?: number) => void;
  clearMessage: () => void;
  updateConnectionStatus: (status: 'connected' | 'disconnected' | 'reconnecting') => void;
  updateAudioStatus: (status: 'on' | 'off' | 'muted') => void;
  updateNotificationStatus: (status: 'on' | 'off') => void;
  
  // Effects actions
  addAnimation: (animationId: string) => void;
  removeAnimation: (animationId: string) => void;
  clearAnimations: () => void;
  addParticleEffect: (effect: Omit<UIEffectsState['particleEffects'][0], 'id'>) => void;
  removeParticleEffect: (effectId: string) => void;
  clearParticleEffects: () => void;
  triggerScreenShake: (duration?: number) => void;
  triggerFlashEffect: (color: string, intensity: number, duration: number) => void;
  clearEffects: () => void;
  
  // Reset function
  reset: () => void;
}

// Initial state values
const initialOverlayState: UIOverlayState = {
  isReactionMode: false,
  isProcessing: false,
  isNotificationVisible: false,
  isEndTurnModalVisible: false,
  isSettingsModalVisible: false,
};

const initialTargetingState: UITargetingState = {
  isTargetModeActive: false,
  targetMode: false,
  validTargets: [],
  highlightedTargets: [],
};

const initialStatusState: UIStatusState = {
  statusIcons: {
    connectionStatus: 'connected',
    audioStatus: 'on',
    notificationStatus: 'on',
  },
};

const initialEffectsState: UIEffectsState = {
  activeAnimations: [],
  particleEffects: [],
  screenShake: false,
};

export const useGameUIStore = create<GameUIStore>((set, get) => ({
  // Initial state
  overlays: initialOverlayState,
  targeting: initialTargetingState,
  status: initialStatusState,
  effects: initialEffectsState,
  
  // Overlay actions
  setReactionMode: (active: boolean) =>
    set((state) => ({
      overlays: { ...state.overlays, isReactionMode: active }
    })),
    
  setProcessing: (processing: boolean) =>
    set((state) => ({
      overlays: { ...state.overlays, isProcessing: processing }
    })),
    
  showNotification: (message: string, color = 'info', duration = 3000) =>
    set((state) => ({
      overlays: {
        ...state.overlays,
        isNotificationVisible: true,
        notificationMessage: message,
        notificationColor: color,
      }
    })),
    
  hideNotification: () =>
    set((state) => ({
      overlays: {
        ...state.overlays,
        isNotificationVisible: false,
        notificationMessage: undefined,
        notificationColor: undefined,
      }
    })),
    
  toggleEndTurnModal: (visible) =>
    set((state) => ({
      overlays: {
        ...state.overlays,
        isEndTurnModalVisible: visible !== undefined ? visible : !state.overlays.isEndTurnModalVisible
      }
    })),
    
  toggleSettingsModal: (visible) =>
    set((state) => ({
      overlays: {
        ...state.overlays,
        isSettingsModalVisible: visible !== undefined ? visible : !state.overlays.isSettingsModalVisible
      }
    })),
  
  // Targeting actions
  setTargetMode: (active: boolean) =>
    set((state) => ({
      targeting: {
        ...state.targeting,
        isTargetModeActive: active,
        targetMode: active, // Legacy compatibility
      }
    })),
    
  setValidTargets: (targets: string[]) =>
    set((state) => ({
      targeting: { ...state.targeting, validTargets: targets }
    })),
    
  setHighlightedTargets: (targets: string[]) =>
    set((state) => ({
      targeting: { ...state.targeting, highlightedTargets: targets }
    })),
    
  setTargetingMessage: (message?: string) =>
    set((state) => ({
      targeting: { ...state.targeting, targetingMessage: message }
    })),
    
  clearTargeting: () =>
    set((state) => ({
      targeting: {
        ...initialTargetingState,
        // Preserve any ongoing target mode if still needed
        isTargetModeActive: state.targeting.isTargetModeActive,
        targetMode: state.targeting.targetMode,
      }
    })),
  
  // Status actions
  setMessage: (message: string, color = 'info', timeout = 5000) =>
    set((state) => ({
      status: {
        ...state.status,
        currentMessage: message,
        messageColor: color,
        messageTimeout: timeout,
      }
    })),
    
  clearMessage: () =>
    set((state) => ({
      status: {
        ...state.status,
        currentMessage: undefined,
        messageColor: undefined,
        messageTimeout: undefined,
      }
    })),
    
  updateConnectionStatus: (status) =>
    set((state) => ({
      status: {
        ...state.status,
        statusIcons: { ...state.status.statusIcons, connectionStatus: status }
      }
    })),
    
  updateAudioStatus: (status) =>
    set((state) => ({
      status: {
        ...state.status,
        statusIcons: { ...state.status.statusIcons, audioStatus: status }
      }
    })),
    
  updateNotificationStatus: (status) =>
    set((state) => ({
      status: {
        ...state.status,
        statusIcons: { ...state.status.statusIcons, notificationStatus: status }
      }
    })),
  
  // Effects actions
  addAnimation: (animationId: string) =>
    set((state) => ({
      effects: {
        ...state.effects,
        activeAnimations: [...state.effects.activeAnimations, animationId]
      }
    })),
    
  removeAnimation: (animationId: string) =>
    set((state) => ({
      effects: {
        ...state.effects,
        activeAnimations: state.effects.activeAnimations.filter(id => id !== animationId)
      }
    })),
    
  clearAnimations: () =>
    set((state) => ({
      effects: { ...state.effects, activeAnimations: [] }
    })),
    
  addParticleEffect: (effect) => {
    const effectId = `particle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    set((state) => ({
      effects: {
        ...state.effects,
        particleEffects: [...state.effects.particleEffects, { ...effect, id: effectId }]
      }
    }));
    
    // Auto-remove effect after duration
    setTimeout(() => {
      get().removeParticleEffect(effectId);
    }, effect.duration);
  },
    
  removeParticleEffect: (effectId: string) =>
    set((state) => ({
      effects: {
        ...state.effects,
        particleEffects: state.effects.particleEffects.filter(effect => effect.id !== effectId)
      }
    })),
    
  clearParticleEffects: () =>
    set((state) => ({
      effects: { ...state.effects, particleEffects: [] }
    })),
    
  triggerScreenShake: (duration = 300) => {
    set((state) => ({
      effects: { ...state.effects, screenShake: true }
    }));
    
    setTimeout(() => {
      set((state) => ({
        effects: { ...state.effects, screenShake: false }
      }));
    }, duration);
  },
    
  triggerFlashEffect: (color: string, intensity: number, duration: number) => {
    set((state) => ({
      effects: {
        ...state.effects,
        flashEffect: { color, intensity, duration }
      }
    }));
    
    setTimeout(() => {
      set((state) => ({
        effects: { ...state.effects, flashEffect: undefined }
      }));
    }, duration);
  },
    
  clearEffects: () =>
    set((state) => ({
      effects: initialEffectsState
    })),
  
  // Reset function
  reset: () =>
    set({
      overlays: initialOverlayState,
      targeting: initialTargetingState,
      status: initialStatusState,
      effects: initialEffectsState,
    }),
}));

// Export selectors for optimized component subscriptions
export const gameUISelectors = {
  // Overlay selectors
  useOverlayState: () => useGameUIStore((state) => state.overlays),
  useReactionMode: () => useGameUIStore((state) => state.overlays.isReactionMode),
  useProcessing: () => useGameUIStore((state) => state.overlays.isProcessing),
  useNotification: () => useGameUIStore((state) => ({
    visible: state.overlays.isNotificationVisible,
    message: state.overlays.notificationMessage,
    color: state.overlays.notificationColor,
  })),
  
  // Targeting selectors
  useTargeting: () => useGameUIStore((state) => state.targeting),
  useTargetMode: () => useGameUIStore((state) => state.targeting.isTargetModeActive),
  useValidTargets: () => useGameUIStore((state) => state.targeting.validTargets),
  
  // Status selectors
  useMessage: () => useGameUIStore((state) => ({
    message: state.status.currentMessage,
    color: state.status.messageColor,
    timeout: state.status.messageTimeout,
  })),
  useStatusIcons: () => useGameUIStore((state) => state.status.statusIcons),
  
  // Effects selectors
  useEffects: () => useGameUIStore((state) => state.effects),
  useAnimations: () => useGameUIStore((state) => state.effects.activeAnimations),
  useParticleEffects: () => useGameUIStore((state) => state.effects.particleEffects),
};