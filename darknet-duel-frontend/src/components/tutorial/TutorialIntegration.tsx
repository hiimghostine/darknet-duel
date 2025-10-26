import React, { useEffect } from 'react';
import { useTutorial } from '../../hooks/useTutorial';
import TutorialOverlay from './TutorialOverlay';
import type { GameState } from '../../types/game.types';
import { tutorialLog } from '../../utils/tutorialLogger';

interface TutorialIntegrationProps {
  gameState?: GameState;
  ctx?: any;
  playerID?: string | null;
  onExit?: () => void;
}

const TutorialIntegration: React.FC<TutorialIntegrationProps> = ({
  gameState,
  ctx: _ctx,
  playerID: _playerID,
  onExit
}) => {
  const {
    tutorialState,
    isActive,
    nextStep,
    cancelTutorial,
    validateGameState
  } = useTutorial();

  // Validate game state changes for tutorial progression
  useEffect(() => {
    if (isActive && gameState) {
      validateGameState(gameState);
    }
  }, [gameState, isActive, validateGameState]);

  // Handle tutorial completion - listen for completion event
  useEffect(() => {
    if (!onExit) return;

    const handleTutorialCompleted = () => {
      tutorialLog('🎯 TUTORIAL: Tutorial completed event received, calling exit handler');
      // Small delay to ensure tutorial completion is processed
      setTimeout(() => {
        onExit();
      }, 100);
    };

    // Listen for tutorial completion event
    window.addEventListener('tutorial-completed', handleTutorialCompleted);
    
    return () => {
      window.removeEventListener('tutorial-completed', handleTutorialCompleted);
    };
  }, [onExit]);

  // Add tutorial-specific CSS classes to game elements
  useEffect(() => {
    if (isActive) {
      // Add data attributes to key game elements for tutorial targeting
      const addTutorialAttributes = () => {
        // Infrastructure grid - updated selector for new layout
        const infraGrid = document.querySelector('[class*="flex-1 flex flex-col lg:order-2"]');
        if (infraGrid) {
          infraGrid.classList.add('tutorial-target', 'infrastructure-grid');
        }

        // Player hand - the entire player hand area at the bottom
        const playerHand = document.querySelector('[class*="flex justify-between items-center gap-4 rounded-lg"][class*="backdrop-blur-md"]');
        if (playerHand) {
          playerHand.classList.add('tutorial-target', 'player-hand');
        }

        // Action points display - updated to match GameInfoPanels structure
        const apDisplay = document.querySelector('[data-testid="action-points"]');
        if (apDisplay) {
          apDisplay.classList.add('tutorial-target', 'action-points-display');
        }

        // Game info panel - left side panel with game state
        const gameInfoPanel = document.querySelector('[class*="flex flex-col gap-3 lg:w-64"][class*="lg:order-1"]');
        if (gameInfoPanel) {
          gameInfoPanel.classList.add('tutorial-target', 'game-info-panel');
        }

        // End turn button - look for button in GameControlsBar by finding buttons with END_TURN text
        const buttons = document.querySelectorAll('button');
        let endTurnBtn = null;
        for (const btn of buttons) {
          if (btn.textContent?.includes('END_TURN') || btn.textContent?.includes('END TURN')) {
            endTurnBtn = btn;
            break;
          }
        }
        if (endTurnBtn) {
          endTurnBtn.classList.add('tutorial-target', 'end-turn-button');
        }

        // Infrastructure cards - add network vector targeting
        document.querySelectorAll('.infrastructure-card, [data-infra-id]').forEach((card) => {
          card.classList.add('tutorial-target');
          const state = card.getAttribute('data-state');
          if (state) {
            card.setAttribute('data-tutorial-state', state);
          }
          
          // Add network vector attribute for tutorial targeting
          const infraId = card.getAttribute('data-infra-id');
          if (infraId === 'I001' || infraId === 'I005' || infraId === 'I009') {
            card.setAttribute('data-vectors', 'network');
            card.classList.add('tutorial-network-infra');
          }
        });

        // Player cards - add proper targeting attributes
        document.querySelectorAll('.player-hand .card, .player-hand [data-card-id]').forEach((card, index) => {
          card.classList.add('tutorial-target');
          const cardType = card.getAttribute('data-type');
          if (cardType) {
            card.setAttribute('data-tutorial-type', cardType);
          }
          // Add first-child class for easier targeting
          if (index === 0) {
            card.classList.add('tutorial-first-card');
          }
        });

        // Add targetable class for highlighted infrastructure
        document.querySelectorAll('.infrastructure-card.can-target, [data-infra-id].can-target').forEach((card) => {
          card.classList.add('targetable');
        });
        
        // Add tutorial-specific targeting for network infrastructure
        document.querySelectorAll('.tutorial-network-infra').forEach((card) => {
          card.classList.add('tutorial-targetable');
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
      onCancel={onExit || cancelTutorial}
    />
  );
};

export default TutorialIntegration;
