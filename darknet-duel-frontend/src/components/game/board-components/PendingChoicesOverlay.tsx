import React from 'react';
import WildcardChoiceUI from './WildcardChoiceUI';
import ChainEffectUI from './ChainEffectUI';
import HandDisruptionUI from './HandDisruptionUI';
import CardSelectionUI from './CardSelectionUI';
import type { GameState } from '../../../types/game.types';

interface PendingChoicesOverlayProps {
  memoizedG: GameState;
  playerID: string | null;
  infrastructureCards: any[];
  handleChooseWildcardType: (type: string) => void;
  handleChooseChainTarget: (targetId: string) => void;
  handleChooseHandDiscard: (cardIds: string[]) => void;
  handleChooseCardFromDeck: (cardId: string) => void;
}

/**
 * Overlay component for all pending choice UIs
 * Extracted from main component for better modularity and conditional rendering
 */
const PendingChoicesOverlay: React.FC<PendingChoicesOverlayProps> = ({
  memoizedG,
  playerID,
  infrastructureCards,
  handleChooseWildcardType,
  handleChooseChainTarget,
  handleChooseHandDiscard,
  handleChooseCardFromDeck
}) => {
  return (
    <>
      {/* Wildcard Type Choice UI - Phase 2 */}
      {memoizedG.pendingWildcardChoice && playerID === memoizedG.pendingWildcardChoice.playerId && (
        <WildcardChoiceUI
          pendingChoice={memoizedG.pendingWildcardChoice}
          playerId={playerID || ''}
          onChooseType={handleChooseWildcardType}
        />
      )}
      
      {/* Chain Effect UI */}
      {memoizedG.pendingChainChoice && playerID === memoizedG.pendingChainChoice.playerId && (
        <ChainEffectUI
          pendingChainChoice={memoizedG.pendingChainChoice}
          infrastructureCards={infrastructureCards}
          onChooseTarget={handleChooseChainTarget}
        />
      )}
      
      {/* Hand Disruption UI - Phase 3 */}
      {memoizedG.pendingHandChoice && playerID === memoizedG.pendingHandChoice.targetPlayerId && (
        <HandDisruptionUI
          pendingChoice={memoizedG.pendingHandChoice}
          playerId={playerID || ''}
          onChooseCards={handleChooseHandDiscard}
        />
      )}
      
      {/* Card Selection UI - AI-Powered Attack */}
      {memoizedG.pendingCardChoice && playerID === memoizedG.pendingCardChoice.playerId && (
        <CardSelectionUI
          pendingChoice={memoizedG.pendingCardChoice}
          onChooseCard={handleChooseCardFromDeck}
        />
      )}
    </>
  );
};

export default React.memo(PendingChoicesOverlay);