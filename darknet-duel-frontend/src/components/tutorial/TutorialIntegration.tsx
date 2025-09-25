import React, { useEffect } from 'react';
import { useTutorial } from '../../hooks/useTutorial';
import TutorialOverlay from './TutorialOverlay';
import type { GameState } from '../../types/game.types';

interface TutorialIntegrationProps {
  gameState?: GameState;
  ctx?: any;
  playerID?: string | null;
}

const TutorialIntegration: React.FC<TutorialIntegrationProps> = ({
  gameState,
  ctx,
  playerID
}) => {
  const {
    tutorialState,
    isActive,
    nextStep,
    skipStep,
    pauseTutorial,
    resumeTutorial,
    cancelTutorial,
    validateGameState
  } = useTutorial();

  // Validate game state changes for tutorial progression
  useEffect(() => {
    if (isActive && gameState) {
      validateGameState(gameState);
    }
  }, [gameState, isActive, validateGameState]);

  // Add tutorial-specific CSS classes to game elements
  useEffect(() => {
    if (isActive) {
      // Add data attributes to key game elements for tutorial targeting
      const addTutorialAttributes = () => {
        // Infrastructure grid
        const infraGrid = document.querySelector('.infrastructure-grid');
        if (infraGrid) {
          infraGrid.classList.add('tutorial-target');
        }

        // Player hand
        const playerHand = document.querySelector('.player-hand');
        if (playerHand) {
          playerHand.classList.add('tutorial-target');
        }

        // Action points display
        const apDisplay = document.querySelector('[data-testid="action-points"]');
        if (apDisplay) {
          apDisplay.classList.add('tutorial-target', 'action-points-display');
        }

        // End turn button
        const endTurnBtn = document.querySelector('[data-testid="end-turn-button"]');
        if (endTurnBtn) {
          endTurnBtn.classList.add('tutorial-target', 'end-turn-button');
        }

        // Infrastructure cards
        document.querySelectorAll('.infrastructure-card').forEach((card, index) => {
          card.classList.add('tutorial-target');
          const state = card.getAttribute('data-state');
          if (state) {
            card.setAttribute('data-tutorial-state', state);
          }
        });

        // Player cards
        document.querySelectorAll('.player-hand .card').forEach((card) => {
          card.classList.add('tutorial-target');
          const cardType = card.getAttribute('data-type');
          if (cardType) {
            card.setAttribute('data-tutorial-type', cardType);
          }
        });

        // Add targetable class for highlighted infrastructure
        document.querySelectorAll('.infrastructure-card.can-target').forEach((card) => {
          card.classList.add('targetable');
        });
      };

      addTutorialAttributes();
      
      // Re-run when DOM updates
      const observer = new MutationObserver(addTutorialAttributes);
      observer.observe(document.body, { childList: true, subtree: true });

      return () => {
        observer.disconnect();
        // Clean up tutorial classes
        document.querySelectorAll('.tutorial-target, .tutorial-highlight').forEach(el => {
          el.classList.remove('tutorial-target', 'tutorial-highlight');
        });
      };
    }
  }, [isActive]);

  if (!isActive) {
    return null;
  }

  return (
    <TutorialOverlay
      tutorialState={tutorialState}
      onNext={nextStep}
      onSkip={skipStep}
      onPause={pauseTutorial}
      onResume={resumeTutorial}
      onCancel={cancelTutorial}
    />
  );
};

export default TutorialIntegration;
