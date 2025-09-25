import { create } from 'zustand';
import type { InfrastructureCard } from '../../types/game.types';

// Interface for board layout and positioning
interface BoardLayoutState {
  gridSize: { rows: number; cols: number };
  cellSize: { width: number; height: number };
  boardDimensions: { width: number; height: number };
  infrastructurePositions: Record<string, { x: number; y: number; row: number; col: number }>;
  selectedPosition?: { row: number; col: number };
  hoveredPosition?: { row: number; col: number };
}

// Interface for infrastructure grid state
interface InfrastructureGridState {
  infrastructureCards: InfrastructureCard[];
  selectedInfrastructureId?: string;
  hoveredInfrastructureId?: string;
  targetableInfrastructureIds: string[];
  highlightedInfrastructureIds: string[];
  animatingInfrastructureIds: string[];
  infrastructureStates: Record<string, {
    isTargetable: boolean;
    isSelected: boolean;
    isHighlighted: boolean;
    isAnimating: boolean;
    animationType?: 'attack' | 'defend' | 'compromise' | 'restore' | 'shield' | 'fortify';
    lastStateChange?: number;
  }>;
}

// Interface for visual effects and animations
interface BoardVisualState {
  activeTransitions: string[];
  stateChangeAnimations: Record<string, {
    from: string;
    to: string;
    duration: number;
    startTime: number;
  }>;
  connectionLines: {
    id: string;
    from: { x: number; y: number };
    to: { x: number; y: number };
    type: 'attack' | 'defend' | 'chain' | 'effect';
    color: string;
    duration: number;
  }[];
  glowEffects: Record<string, {
    color: string;
    intensity: number;
    duration: number;
    startTime: number;
  }>;
}

// Interface for performance optimization state
interface BoardPerformanceState {
  lastUpdateTime: number;
  frameRate: number;
  enableAnimations: boolean;
  enableParticles: boolean;
  enableGlow: boolean;
  renderQueue: string[];
  visibleInfrastructure: string[];
}

// Main Game Board Store interface
interface GameBoardStore {
  // State
  layout: BoardLayoutState;
  grid: InfrastructureGridState;
  visuals: BoardVisualState;
  performance: BoardPerformanceState;
  
  // Layout actions
  setBoardDimensions: (width: number, height: number) => void;
  setGridSize: (rows: number, cols: number) => void;
  setCellSize: (width: number, height: number) => void;
  updateInfrastructurePosition: (infraId: string, x: number, y: number, row: number, col: number) => void;
  setSelectedPosition: (position?: { row: number; col: number }) => void;
  setHoveredPosition: (position?: { row: number; col: number }) => void;
  
  // Infrastructure grid actions
  setInfrastructureCards: (cards: InfrastructureCard[]) => void;
  addInfrastructureCard: (card: InfrastructureCard) => void;
  updateInfrastructureCard: (infraId: string, updates: Partial<InfrastructureCard>) => void;
  removeInfrastructureCard: (infraId: string) => void;
  setSelectedInfrastructure: (infraId?: string) => void;
  setHoveredInfrastructure: (infraId?: string) => void;
  setTargetableInfrastructure: (infraIds: string[]) => void;
  setHighlightedInfrastructure: (infraIds: string[]) => void;
  setInfrastructureState: (infraId: string, state: Partial<InfrastructureGridState['infrastructureStates']['']>) => void;
  clearInfrastructureStates: () => void;
  
  // Animation actions
  startInfrastructureAnimation: (infraId: string, type: 'attack' | 'defend' | 'compromise' | 'restore' | 'shield' | 'fortify', duration?: number) => void;
  stopInfrastructureAnimation: (infraId: string) => void;
  addStateChangeAnimation: (infraId: string, from: string, to: string, duration?: number) => void;
  removeStateChangeAnimation: (infraId: string) => void;
  addConnectionLine: (line: Omit<BoardVisualState['connectionLines'][0], 'id'>) => void;
  removeConnectionLine: (lineId: string) => void;
  clearConnectionLines: () => void;
  addGlowEffect: (infraId: string, color: string, intensity: number, duration: number) => void;
  removeGlowEffect: (infraId: string) => void;
  clearGlowEffects: () => void;
  
  // Performance actions
  updatePerformanceMetrics: (frameRate: number) => void;
  setAnimationSettings: (animations: boolean, particles: boolean, glow: boolean) => void;
  addToRenderQueue: (infraId: string) => void;
  clearRenderQueue: () => void;
  setVisibleInfrastructure: (infraIds: string[]) => void;
  
  // Utility actions
  getInfrastructureById: (infraId: string) => InfrastructureCard | undefined;
  getInfrastructurePosition: (infraId: string) => { x: number; y: number; row: number; col: number } | undefined;
  isInfrastructureTargetable: (infraId: string) => boolean;
  isInfrastructureAnimating: (infraId: string) => boolean;
  
  // Reset function
  reset: () => void;
}

// Initial state values
const initialLayoutState: BoardLayoutState = {
  gridSize: { rows: 3, cols: 4 },
  cellSize: { width: 120, height: 180 },
  boardDimensions: { width: 800, height: 600 },
  infrastructurePositions: {},
};

const initialGridState: InfrastructureGridState = {
  infrastructureCards: [],
  targetableInfrastructureIds: [],
  highlightedInfrastructureIds: [],
  animatingInfrastructureIds: [],
  infrastructureStates: {},
};

const initialVisualState: BoardVisualState = {
  activeTransitions: [],
  stateChangeAnimations: {},
  connectionLines: [],
  glowEffects: {},
};

const initialPerformanceState: BoardPerformanceState = {
  lastUpdateTime: 0,
  frameRate: 60,
  enableAnimations: true,
  enableParticles: true,
  enableGlow: true,
  renderQueue: [],
  visibleInfrastructure: [],
};

export const useGameBoardStore = create<GameBoardStore>((set, get) => ({
  // Initial state
  layout: initialLayoutState,
  grid: initialGridState,
  visuals: initialVisualState,
  performance: initialPerformanceState,
  
  // Layout actions
  setBoardDimensions: (width: number, height: number) =>
    set((state) => ({
      layout: { ...state.layout, boardDimensions: { width, height } }
    })),
    
  setGridSize: (rows: number, cols: number) =>
    set((state) => ({
      layout: { ...state.layout, gridSize: { rows, cols } }
    })),
    
  setCellSize: (width: number, height: number) =>
    set((state) => ({
      layout: { ...state.layout, cellSize: { width, height } }
    })),
    
  updateInfrastructurePosition: (infraId: string, x: number, y: number, row: number, col: number) =>
    set((state) => ({
      layout: {
        ...state.layout,
        infrastructurePositions: {
          ...state.layout.infrastructurePositions,
          [infraId]: { x, y, row, col }
        }
      }
    })),
    
  setSelectedPosition: (position) =>
    set((state) => ({
      layout: { ...state.layout, selectedPosition: position }
    })),
    
  setHoveredPosition: (position) =>
    set((state) => ({
      layout: { ...state.layout, hoveredPosition: position }
    })),
  
  // Infrastructure grid actions
  setInfrastructureCards: (cards: InfrastructureCard[]) =>
    set((state) => ({
      grid: { ...state.grid, infrastructureCards: cards }
    })),
    
  addInfrastructureCard: (card: InfrastructureCard) =>
    set((state) => ({
      grid: {
        ...state.grid,
        infrastructureCards: [...state.grid.infrastructureCards, card]
      }
    })),
    
  updateInfrastructureCard: (infraId: string, updates: Partial<InfrastructureCard>) =>
    set((state) => ({
      grid: {
        ...state.grid,
        infrastructureCards: state.grid.infrastructureCards.map(card =>
          card.id === infraId ? { ...card, ...updates } : card
        )
      }
    })),
    
  removeInfrastructureCard: (infraId: string) =>
    set((state) => ({
      grid: {
        ...state.grid,
        infrastructureCards: state.grid.infrastructureCards.filter(card => card.id !== infraId)
      }
    })),
    
  setSelectedInfrastructure: (infraId) =>
    set((state) => ({
      grid: { ...state.grid, selectedInfrastructureId: infraId }
    })),
    
  setHoveredInfrastructure: (infraId) =>
    set((state) => ({
      grid: { ...state.grid, hoveredInfrastructureId: infraId }
    })),
    
  setTargetableInfrastructure: (infraIds: string[]) =>
    set((state) => ({
      grid: { ...state.grid, targetableInfrastructureIds: infraIds }
    })),
    
  setHighlightedInfrastructure: (infraIds: string[]) =>
    set((state) => ({
      grid: { ...state.grid, highlightedInfrastructureIds: infraIds }
    })),
    
  setInfrastructureState: (infraId: string, state: Partial<InfrastructureGridState['infrastructureStates']['']>) =>
    set((prevState) => ({
      grid: {
        ...prevState.grid,
        infrastructureStates: {
          ...prevState.grid.infrastructureStates,
          [infraId]: {
            ...prevState.grid.infrastructureStates[infraId],
            ...state,
            lastStateChange: Date.now(),
          }
        }
      }
    })),
    
  clearInfrastructureStates: () =>
    set((state) => ({
      grid: { ...state.grid, infrastructureStates: {} }
    })),
  
  // Animation actions
  startInfrastructureAnimation: (infraId: string, type, duration = 1000) => {
    set((state) => ({
      grid: {
        ...state.grid,
        animatingInfrastructureIds: [...new Set([...state.grid.animatingInfrastructureIds, infraId])],
        infrastructureStates: {
          ...state.grid.infrastructureStates,
          [infraId]: {
            ...state.grid.infrastructureStates[infraId],
            isAnimating: true,
            animationType: type,
          }
        }
      }
    }));
    
    // Auto-stop animation after duration
    setTimeout(() => {
      get().stopInfrastructureAnimation(infraId);
    }, duration);
  },
    
  stopInfrastructureAnimation: (infraId: string) =>
    set((state) => ({
      grid: {
        ...state.grid,
        animatingInfrastructureIds: state.grid.animatingInfrastructureIds.filter(id => id !== infraId),
        infrastructureStates: {
          ...state.grid.infrastructureStates,
          [infraId]: {
            ...state.grid.infrastructureStates[infraId],
            isAnimating: false,
            animationType: undefined,
          }
        }
      }
    })),
    
  addStateChangeAnimation: (infraId: string, from: string, to: string, duration = 800) => {
    set((state) => ({
      visuals: {
        ...state.visuals,
        stateChangeAnimations: {
          ...state.visuals.stateChangeAnimations,
          [infraId]: { from, to, duration, startTime: Date.now() }
        }
      }
    }));
    
    // Auto-remove animation after duration
    setTimeout(() => {
      get().removeStateChangeAnimation(infraId);
    }, duration);
  },
    
  removeStateChangeAnimation: (infraId: string) =>
    set((state) => ({
      visuals: {
        ...state.visuals,
        stateChangeAnimations: Object.fromEntries(
          Object.entries(state.visuals.stateChangeAnimations).filter(([id]) => id !== infraId)
        )
      }
    })),
    
  addConnectionLine: (line) => {
    const lineId = `line_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    set((state) => ({
      visuals: {
        ...state.visuals,
        connectionLines: [...state.visuals.connectionLines, { ...line, id: lineId }]
      }
    }));
    
    // Auto-remove line after duration
    setTimeout(() => {
      get().removeConnectionLine(lineId);
    }, line.duration);
  },
    
  removeConnectionLine: (lineId: string) =>
    set((state) => ({
      visuals: {
        ...state.visuals,
        connectionLines: state.visuals.connectionLines.filter(line => line.id !== lineId)
      }
    })),
    
  clearConnectionLines: () =>
    set((state) => ({
      visuals: { ...state.visuals, connectionLines: [] }
    })),
    
  addGlowEffect: (infraId: string, color: string, intensity: number, duration: number) => {
    set((state) => ({
      visuals: {
        ...state.visuals,
        glowEffects: {
          ...state.visuals.glowEffects,
          [infraId]: { color, intensity, duration, startTime: Date.now() }
        }
      }
    }));
    
    // Auto-remove glow after duration
    setTimeout(() => {
      get().removeGlowEffect(infraId);
    }, duration);
  },
    
  removeGlowEffect: (infraId: string) =>
    set((state) => ({
      visuals: {
        ...state.visuals,
        glowEffects: Object.fromEntries(
          Object.entries(state.visuals.glowEffects).filter(([id]) => id !== infraId)
        )
      }
    })),
    
  clearGlowEffects: () =>
    set((state) => ({
      visuals: { ...state.visuals, glowEffects: {} }
    })),
  
  // Performance actions
  updatePerformanceMetrics: (frameRate: number) =>
    set((state) => ({
      performance: {
        ...state.performance,
        frameRate,
        lastUpdateTime: Date.now()
      }
    })),
    
  setAnimationSettings: (animations: boolean, particles: boolean, glow: boolean) =>
    set((state) => ({
      performance: {
        ...state.performance,
        enableAnimations: animations,
        enableParticles: particles,
        enableGlow: glow
      }
    })),
    
  addToRenderQueue: (infraId: string) =>
    set((state) => ({
      performance: {
        ...state.performance,
        renderQueue: [...new Set([...state.performance.renderQueue, infraId])]
      }
    })),
    
  clearRenderQueue: () =>
    set((state) => ({
      performance: { ...state.performance, renderQueue: [] }
    })),
    
  setVisibleInfrastructure: (infraIds: string[]) =>
    set((state) => ({
      performance: { ...state.performance, visibleInfrastructure: infraIds }
    })),
  
  // Utility actions
  getInfrastructureById: (infraId: string) => {
    const state = get();
    return state.grid.infrastructureCards.find(card => card.id === infraId);
  },
    
  getInfrastructurePosition: (infraId: string) => {
    const state = get();
    return state.layout.infrastructurePositions[infraId];
  },
    
  isInfrastructureTargetable: (infraId: string) => {
    const state = get();
    return state.grid.targetableInfrastructureIds.includes(infraId);
  },
    
  isInfrastructureAnimating: (infraId: string) => {
    const state = get();
    return state.grid.animatingInfrastructureIds.includes(infraId);
  },
  
  // Reset function
  reset: () =>
    set({
      layout: initialLayoutState,
      grid: initialGridState,
      visuals: initialVisualState,
      performance: initialPerformanceState,
    }),
}));

// Export selectors for optimized component subscriptions
export const gameBoardSelectors = {
  // Layout selectors
  useBoardLayout: () => useGameBoardStore((state) => state.layout),
  useBoardDimensions: () => useGameBoardStore((state) => state.layout.boardDimensions),
  useGridSize: () => useGameBoardStore((state) => state.layout.gridSize),
  useInfrastructurePositions: () => useGameBoardStore((state) => state.layout.infrastructurePositions),
  
  // Grid selectors
  useInfrastructureCards: () => useGameBoardStore((state) => state.grid.infrastructureCards),
  useSelectedInfrastructure: () => useGameBoardStore((state) => state.grid.selectedInfrastructureId),
  useTargetableInfrastructure: () => useGameBoardStore((state) => state.grid.targetableInfrastructureIds),
  useHighlightedInfrastructure: () => useGameBoardStore((state) => state.grid.highlightedInfrastructureIds),
  useInfrastructureStates: () => useGameBoardStore((state) => state.grid.infrastructureStates),
  
  // Visual selectors
  useVisualEffects: () => useGameBoardStore((state) => state.visuals),
  useConnectionLines: () => useGameBoardStore((state) => state.visuals.connectionLines),
  useGlowEffects: () => useGameBoardStore((state) => state.visuals.glowEffects),
  useStateChangeAnimations: () => useGameBoardStore((state) => state.visuals.stateChangeAnimations),
  
  // Performance selectors
  usePerformanceState: () => useGameBoardStore((state) => state.performance),
  useAnimationSettings: () => useGameBoardStore((state) => ({
    animations: state.performance.enableAnimations,
    particles: state.performance.enableParticles,
    glow: state.performance.enableGlow,
  })),
  
  // Utility selectors
  useInfrastructureById: (infraId: string) => 
    useGameBoardStore((state) => state.grid.infrastructureCards.find(card => card.id === infraId)),
};