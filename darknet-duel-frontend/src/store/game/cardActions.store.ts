import { create } from 'zustand';
import type { ExtendedCard } from '../../components/game/board-components/types';
import type { AttackVector } from '../../types/game.types';

// Interface for selected card state
interface SelectedCardState {
  selectedCard: ExtendedCard | null;
  selectedCardId?: string;
  selectedForThrow: ExtendedCard | null;
  selectedForPlay: ExtendedCard | null;
  lastSelectedCard?: ExtendedCard;
  selectionTime?: number;
}

// Interface for targeting state
interface CardTargetingState {
  targetMode: boolean;
  isTargetModeActive: boolean; // Alias for compatibility
  targetedInfraId: string | null;
  validTargets: string[];
  highlightedTargets: string[];
  targetingReason?: 'play' | 'throw' | 'react';
  requiresTarget: boolean;
  attackVector?: AttackVector;
}

// Interface for animation state
interface CardAnimationState {
  animatingThrow: boolean;
  animatingPlay: boolean;
  animatingCycle: boolean;
  throwAnimationTarget?: string;
  playAnimationCard?: string;
  cycleAnimationCard?: string;
  animationQueue: {
    id: string;
    type: 'throw' | 'play' | 'cycle';
    cardId: string;
    targetId?: string;
    duration: number;
    startTime: number;
  }[];
}

// Interface for card interaction state
interface CardInteractionState {
  processing: boolean;
  lastAction?: {
    type: 'play' | 'throw' | 'cycle';
    cardId: string;
    targetId?: string;
    timestamp: number;
  };
  actionQueue: {
    id: string;
    type: 'play' | 'throw' | 'cycle';
    cardId: string;
    targetId?: string;
    priority: number;
  }[];
  isCardPlayable: Record<string, boolean>;
  isCardTargetable: Record<string, boolean>;
  cardCooldowns: Record<string, number>;
}

// Interface for validation state
interface CardValidationState {
  invalidCards: string[];
  validationErrors: Record<string, string>;
  lastValidation?: {
    cardId: string;
    isValid: boolean;
    reason?: string;
    timestamp: number;
  };
  targetValidation: {
    [cardId: string]: {
      validTargets: string[];
      invalidTargets: string[];
      validationTime: number;
    };
  };
}

// Main Card Actions Store interface
interface CardActionsStore {
  // State
  selection: SelectedCardState;
  targeting: CardTargetingState;
  animation: CardAnimationState;
  interaction: CardInteractionState;
  validation: CardValidationState;
  
  // Selection actions
  setSelectedCard: (card: ExtendedCard | null) => void;
  setSelectedForThrow: (card: ExtendedCard | null) => void;
  setSelectedForPlay: (card: ExtendedCard | null) => void;
  clearSelection: () => void;
  
  // Targeting actions
  setTargetMode: (active: boolean, reason?: 'play' | 'throw' | 'react') => void;
  setTargetedInfraId: (infraId: string | null) => void;
  setValidTargets: (targets: string[]) => void;
  setHighlightedTargets: (targets: string[]) => void;
  setRequiresTarget: (requires: boolean) => void;
  setAttackVector: (vector?: AttackVector) => void;
  clearTargeting: () => void;
  
  // Animation actions
  setAnimatingThrow: (animating: boolean, targetId?: string) => void;
  setAnimatingPlay: (animating: boolean, cardId?: string) => void;
  setAnimatingCycle: (animating: boolean, cardId?: string) => void;
  addAnimationToQueue: (animation: Omit<CardAnimationState['animationQueue'][0], 'id' | 'startTime'>) => void;
  removeAnimationFromQueue: (animationId: string) => void;
  clearAnimationQueue: () => void;
  
  // Interaction actions
  setProcessing: (processing: boolean) => void;
  recordAction: (type: 'play' | 'throw' | 'cycle', cardId: string, targetId?: string) => void;
  addActionToQueue: (action: Omit<CardInteractionState['actionQueue'][0], 'id'>) => void;
  removeActionFromQueue: (actionId: string) => void;
  clearActionQueue: () => void;
  setCardPlayable: (cardId: string, playable: boolean) => void;
  setCardTargetable: (cardId: string, targetable: boolean) => void;
  setCardCooldown: (cardId: string, cooldown: number) => void;
  clearCardStates: () => void;
  
  // Validation actions
  setCardValid: (cardId: string, valid: boolean, reason?: string) => void;
  setValidationError: (cardId: string, error: string) => void;
  clearValidationError: (cardId: string) => void;
  setTargetValidation: (cardId: string, validTargets: string[], invalidTargets: string[]) => void;
  clearTargetValidation: (cardId: string) => void;
  recordValidation: (cardId: string, isValid: boolean, reason?: string) => void;
  
  // Utility actions
  isCardSelected: (cardId: string) => boolean;
  isCardAnimating: (cardId: string) => boolean;
  isCardInQueue: (cardId: string) => boolean;
  getCardValidationStatus: (cardId: string) => { isValid: boolean; reason?: string } | null;
  getValidTargetsForCard: (cardId: string) => string[];
  
  // Bridge methods for useCardActions compatibility
  resetTargeting: () => void;
  cancelTargeting: () => void;
  
  // Reset function
  reset: () => void;
}

// Initial state values
const initialSelectionState: SelectedCardState = {
  selectedCard: null,
  selectedForThrow: null,
  selectedForPlay: null,
};

const initialTargetingState: CardTargetingState = {
  targetMode: false,
  isTargetModeActive: false,
  targetedInfraId: null,
  validTargets: [],
  highlightedTargets: [],
  requiresTarget: false,
};

const initialAnimationState: CardAnimationState = {
  animatingThrow: false,
  animatingPlay: false,
  animatingCycle: false,
  animationQueue: [],
};

const initialInteractionState: CardInteractionState = {
  processing: false,
  actionQueue: [],
  isCardPlayable: {},
  isCardTargetable: {},
  cardCooldowns: {},
};

const initialValidationState: CardValidationState = {
  invalidCards: [],
  validationErrors: {},
  targetValidation: {},
};

export const useCardActionsStore = create<CardActionsStore>((set, get) => ({
  // Initial state
  selection: initialSelectionState,
  targeting: initialTargetingState,
  animation: initialAnimationState,
  interaction: initialInteractionState,
  validation: initialValidationState,
  
  // Selection actions
  setSelectedCard: (card: ExtendedCard | null) =>
    set((state) => ({
      selection: {
        ...state.selection,
        selectedCard: card,
        selectedCardId: card?.id,
        lastSelectedCard: state.selection.selectedCard || undefined,
        selectionTime: card ? Date.now() : undefined,
      }
    })),
    
  setSelectedForThrow: (card: ExtendedCard | null) =>
    set((state) => ({
      selection: { ...state.selection, selectedForThrow: card }
    })),
    
  setSelectedForPlay: (card: ExtendedCard | null) =>
    set((state) => ({
      selection: { ...state.selection, selectedForPlay: card }
    })),
    
  clearSelection: () =>
    set((state) => ({
      selection: {
        ...initialSelectionState,
        lastSelectedCard: state.selection.selectedCard || undefined,
      }
    })),
  
  // Targeting actions
  setTargetMode: (active: boolean, reason?: 'play' | 'throw' | 'react') =>
    set((state) => ({
      targeting: {
        ...state.targeting,
        targetMode: active,
        isTargetModeActive: active,
        targetingReason: reason,
      }
    })),
    
  setTargetedInfraId: (infraId: string | null) =>
    set((state) => ({
      targeting: { ...state.targeting, targetedInfraId: infraId }
    })),
    
  setValidTargets: (targets: string[]) =>
    set((state) => ({
      targeting: { ...state.targeting, validTargets: targets }
    })),
    
  setHighlightedTargets: (targets: string[]) =>
    set((state) => ({
      targeting: { ...state.targeting, highlightedTargets: targets }
    })),
    
  setRequiresTarget: (requires: boolean) =>
    set((state) => ({
      targeting: { ...state.targeting, requiresTarget: requires }
    })),
    
  setAttackVector: (vector?: AttackVector) =>
    set((state) => ({
      targeting: { ...state.targeting, attackVector: vector }
    })),
    
  clearTargeting: () =>
    set((state) => ({
      targeting: initialTargetingState
    })),
  
  // Animation actions
  setAnimatingThrow: (animating: boolean, targetId?: string) =>
    set((state) => ({
      animation: {
        ...state.animation,
        animatingThrow: animating,
        throwAnimationTarget: animating ? targetId : undefined,
      }
    })),
    
  setAnimatingPlay: (animating: boolean, cardId?: string) =>
    set((state) => ({
      animation: {
        ...state.animation,
        animatingPlay: animating,
        playAnimationCard: animating ? cardId : undefined,
      }
    })),
    
  setAnimatingCycle: (animating: boolean, cardId?: string) =>
    set((state) => ({
      animation: {
        ...state.animation,
        animatingCycle: animating,
        cycleAnimationCard: animating ? cardId : undefined,
      }
    })),
    
  addAnimationToQueue: (animation) => {
    const animationId = `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    set((state) => ({
      animation: {
        ...state.animation,
        animationQueue: [...state.animation.animationQueue, {
          ...animation,
          id: animationId,
          startTime: Date.now(),
        }]
      }
    }));
    
    // Auto-remove animation after duration
    setTimeout(() => {
      get().removeAnimationFromQueue(animationId);
    }, animation.duration);
  },
    
  removeAnimationFromQueue: (animationId: string) =>
    set((state) => ({
      animation: {
        ...state.animation,
        animationQueue: state.animation.animationQueue.filter(anim => anim.id !== animationId)
      }
    })),
    
  clearAnimationQueue: () =>
    set((state) => ({
      animation: { ...state.animation, animationQueue: [] }
    })),
  
  // Interaction actions
  setProcessing: (processing: boolean) =>
    set((state) => ({
      interaction: { ...state.interaction, processing }
    })),
    
  recordAction: (type: 'play' | 'throw' | 'cycle', cardId: string, targetId?: string) =>
    set((state) => ({
      interaction: {
        ...state.interaction,
        lastAction: { type, cardId, targetId, timestamp: Date.now() }
      }
    })),
    
  addActionToQueue: (action) => {
    const actionId = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    set((state) => ({
      interaction: {
        ...state.interaction,
        actionQueue: [...state.interaction.actionQueue, { ...action, id: actionId }]
          .sort((a, b) => b.priority - a.priority) // Higher priority first
      }
    }));
  },
    
  removeActionFromQueue: (actionId: string) =>
    set((state) => ({
      interaction: {
        ...state.interaction,
        actionQueue: state.interaction.actionQueue.filter(action => action.id !== actionId)
      }
    })),
    
  clearActionQueue: () =>
    set((state) => ({
      interaction: { ...state.interaction, actionQueue: [] }
    })),
    
  setCardPlayable: (cardId: string, playable: boolean) =>
    set((state) => ({
      interaction: {
        ...state.interaction,
        isCardPlayable: { ...state.interaction.isCardPlayable, [cardId]: playable }
      }
    })),
    
  setCardTargetable: (cardId: string, targetable: boolean) =>
    set((state) => ({
      interaction: {
        ...state.interaction,
        isCardTargetable: { ...state.interaction.isCardTargetable, [cardId]: targetable }
      }
    })),
    
  setCardCooldown: (cardId: string, cooldown: number) => {
    set((state) => ({
      interaction: {
        ...state.interaction,
        cardCooldowns: { ...state.interaction.cardCooldowns, [cardId]: cooldown }
      }
    }));
    
    // Auto-clear cooldown after duration
    if (cooldown > 0) {
      setTimeout(() => {
        set((state) => ({
          interaction: {
            ...state.interaction,
            cardCooldowns: Object.fromEntries(
              Object.entries(state.interaction.cardCooldowns).filter(([id]) => id !== cardId)
            )
          }
        }));
      }, cooldown);
    }
  },
    
  clearCardStates: () =>
    set((state) => ({
      interaction: {
        ...state.interaction,
        isCardPlayable: {},
        isCardTargetable: {},
        cardCooldowns: {},
      }
    })),
  
  // Validation actions
  setCardValid: (cardId: string, valid: boolean, reason?: string) =>
    set((state) => ({
      validation: {
        ...state.validation,
        invalidCards: valid
          ? state.validation.invalidCards.filter(id => id !== cardId)
          : [...new Set([...state.validation.invalidCards, cardId])],
        validationErrors: valid
          ? Object.fromEntries(Object.entries(state.validation.validationErrors).filter(([id]) => id !== cardId))
          : { ...state.validation.validationErrors, [cardId]: reason || 'Invalid card' }
      }
    })),
    
  setValidationError: (cardId: string, error: string) =>
    set((state) => ({
      validation: {
        ...state.validation,
        validationErrors: { ...state.validation.validationErrors, [cardId]: error }
      }
    })),
    
  clearValidationError: (cardId: string) =>
    set((state) => ({
      validation: {
        ...state.validation,
        validationErrors: Object.fromEntries(
          Object.entries(state.validation.validationErrors).filter(([id]) => id !== cardId)
        )
      }
    })),
    
  setTargetValidation: (cardId: string, validTargets: string[], invalidTargets: string[]) =>
    set((state) => ({
      validation: {
        ...state.validation,
        targetValidation: {
          ...state.validation.targetValidation,
          [cardId]: { validTargets, invalidTargets, validationTime: Date.now() }
        }
      }
    })),
    
  clearTargetValidation: (cardId: string) =>
    set((state) => ({
      validation: {
        ...state.validation,
        targetValidation: Object.fromEntries(
          Object.entries(state.validation.targetValidation).filter(([id]) => id !== cardId)
        )
      }
    })),
    
  recordValidation: (cardId: string, isValid: boolean, reason?: string) =>
    set((state) => ({
      validation: {
        ...state.validation,
        lastValidation: { cardId, isValid, reason, timestamp: Date.now() }
      }
    })),
  
  // Utility actions
  isCardSelected: (cardId: string) => {
    const state = get();
    return state.selection.selectedCard?.id === cardId;
  },
    
  isCardAnimating: (cardId: string) => {
    const state = get();
    return state.animation.animationQueue.some(anim => anim.cardId === cardId) ||
           (state.animation.animatingPlay && state.animation.playAnimationCard === cardId) ||
           (state.animation.animatingCycle && state.animation.cycleAnimationCard === cardId);
  },
    
  isCardInQueue: (cardId: string) => {
    const state = get();
    return state.interaction.actionQueue.some(action => action.cardId === cardId);
  },
    
  getCardValidationStatus: (cardId: string) => {
    const state = get();
    const isInvalid = state.validation.invalidCards.includes(cardId);
    const error = state.validation.validationErrors[cardId];
    return isInvalid ? { isValid: false, reason: error } : { isValid: true };
  },
    
  getValidTargetsForCard: (cardId: string) => {
    const state = get();
    return state.validation.targetValidation[cardId]?.validTargets || [];
  },
  
  // Bridge methods for useCardActions compatibility
  resetTargeting: () => {
    get().clearTargeting();
    get().clearSelection();
  },
    
  cancelTargeting: () => {
    get().clearTargeting();
  },
  
  // Reset function
  reset: () =>
    set({
      selection: initialSelectionState,
      targeting: initialTargetingState,
      animation: initialAnimationState,
      interaction: initialInteractionState,
      validation: initialValidationState,
    }),
}));

// Export selectors for optimized component subscriptions
export const cardActionsSelectors = {
  // Selection selectors
  useSelectedCard: () => useCardActionsStore((state) => state.selection.selectedCard),
  useSelectedCardId: () => useCardActionsStore((state) => state.selection.selectedCardId),
  useSelectedForThrow: () => useCardActionsStore((state) => state.selection.selectedForThrow),
  useSelectedForPlay: () => useCardActionsStore((state) => state.selection.selectedForPlay),
  
  // Targeting selectors
  useTargetMode: () => useCardActionsStore((state) => state.targeting.targetMode),
  useTargetedInfraId: () => useCardActionsStore((state) => state.targeting.targetedInfraId),
  useValidTargets: () => useCardActionsStore((state) => state.targeting.validTargets),
  useRequiresTarget: () => useCardActionsStore((state) => state.targeting.requiresTarget),
  useAttackVector: () => useCardActionsStore((state) => state.targeting.attackVector),
  
  // Animation selectors
  useAnimatingThrow: () => useCardActionsStore((state) => state.animation.animatingThrow),
  useAnimatingPlay: () => useCardActionsStore((state) => state.animation.animatingPlay),
  useAnimatingCycle: () => useCardActionsStore((state) => state.animation.animatingCycle),
  useAnimationQueue: () => useCardActionsStore((state) => state.animation.animationQueue),
  
  // Interaction selectors
  useProcessing: () => useCardActionsStore((state) => state.interaction.processing),
  useLastAction: () => useCardActionsStore((state) => state.interaction.lastAction),
  useActionQueue: () => useCardActionsStore((state) => state.interaction.actionQueue),
  useCardPlayableStates: () => useCardActionsStore((state) => state.interaction.isCardPlayable),
  useCardCooldowns: () => useCardActionsStore((state) => state.interaction.cardCooldowns),
  
  // Validation selectors
  useInvalidCards: () => useCardActionsStore((state) => state.validation.invalidCards),
  useValidationErrors: () => useCardActionsStore((state) => state.validation.validationErrors),
  useTargetValidation: () => useCardActionsStore((state) => state.validation.targetValidation),
  
  // Utility selectors
  useIsCardSelected: (cardId: string) => 
    useCardActionsStore((state) => state.selection.selectedCard?.id === cardId),
  useIsCardPlayable: (cardId: string) => 
    useCardActionsStore((state) => state.interaction.isCardPlayable[cardId] ?? true),
  useCardValidationStatus: (cardId: string) => 
    useCardActionsStore((state) => ({
      isValid: !state.validation.invalidCards.includes(cardId),
      error: state.validation.validationErrors[cardId],
    })),
};