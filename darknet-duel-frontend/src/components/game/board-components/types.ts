// Import types from shared-types directly to ensure single source of truth
import type { Player, InfrastructureCard, GameState } from '../../../types/game.types';
import type { Card, CardType } from 'shared-types';

// Extended Player interface with additional runtime properties
export interface ExtendedPlayer extends Player {
  actionPoints: number;
  freeCardCyclesUsed: number;
}

// Extended infrastructure card type with additional properties
export interface ExtendedInfrastructureCard extends InfrastructureCard {
  currentHealth?: number;
  maxHealth?: number;
  effects?: Array<{type: string; duration: number}>;
}

/**
 * Extended Card type with runtime UI properties for the frontend
 * 
 * IMPORTANT: This extends the shared Card type and adds UI-specific properties
 * Be mindful of the flexible union types like wildcardType and vulnerabilities
 * as mentioned in our memory notes.
 */
export interface ExtendedCard extends Card {
  // Override wildcardType to ensure frontend components handle both formats correctly
  // This is a flexible type that can be CardType[] in frontend or string in backend
  wildcardType?: CardType[] | string;
  
  // UI state properties specific to frontend
  playable?: boolean;
  disabled?: boolean;
  highlighted?: boolean;
  selected?: boolean;
  
  // Card value properties for gameplay visualization
  attackValue?: number;
  defenseValue?: number;
  
  // Targeting and play state
  requiresTarget?: boolean;
  validTargets?: string[];
}

// Base props that all game components will use
export interface GameComponentProps {
  G: GameState;
  ctx: any;
  moves: any;
  playerID: string | null;
  isActive: boolean;
  isAttacker: boolean;
  currentPlayerObj?: Player;
  opponent?: Player;
}

// Player hand component props
export interface PlayerHandProps extends GameComponentProps {
  player?: Player;
  onPlayCard: (card: ExtendedCard, event?: React.MouseEvent) => void;
  onCycleCard: (cardId: string) => void;
  onSelectCardToThrow: (card: ExtendedCard) => void;
  targetMode: boolean;
  ctx: any; // Added explicitly even though it's in GameComponentProps for clarity
  playerID: string | null; // Added explicitly even though it's in GameComponentProps for clarity
}

// Player board component props
export interface PlayerBoardProps extends GameComponentProps {
  player?: Player;
  isCurrentPlayer: boolean;
}

// Infrastructure area props
export interface InfrastructureAreaProps extends GameComponentProps {
  infrastructureCards?: InfrastructureCard[];
  targetMode: boolean;
  targetedInfraId?: string | null;
  animatingThrow?: boolean;
  onTargetInfrastructure: (infrastructureId: string, event?: React.MouseEvent) => void;
}

// Game status props
export interface GameStatusProps extends GameComponentProps {
  message?: string;
  currentPhase?: string;
}

// Props for the player info component
export interface PlayerInfoProps extends GameComponentProps {
  player?: Player; // Keep this as Player for compatibility
  isOpponent?: boolean;
}

// Game controls props
export interface GameControlsProps extends GameComponentProps {
  targetMode: boolean;
  selectedCard: ExtendedCard | null; // Using ExtendedCard to match the actual type used in GameBoard
  onEndTurn: () => void;
  onCycleCard: (cardId: string) => void;
  onCancelThrow: () => void;
  onSkipReaction: () => void; // Handler for skipping reaction
  onSurrender?: () => void; // Handler for surrender action
  ctx: any; // Added explicitly even though it's in GameComponentProps for clarity
  playerID: string | null; // Added explicitly even though it's in GameComponentProps for clarity
}
