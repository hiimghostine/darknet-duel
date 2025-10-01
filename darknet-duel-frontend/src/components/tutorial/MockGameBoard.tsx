import React, { useCallback, useMemo, useEffect, useState } from 'react';
import type { GameState } from '../../types/game.types';
import { mockGameStateProvider } from '../../services/mockDataProvider';

// Import tutorial integration
import TutorialIntegration from './TutorialIntegration';

// Import board components (reusing existing ones)
import GameControlsBar from '../game/board-components/GameControlsBar';
import OpponentHandArea from '../game/board-components/OpponentHandArea';
import PlayerHandArea from '../game/board-components/PlayerHandArea';
import InfrastructureGrid from '../game/board-components/InfrastructureGrid';
import GameInfoPanels from '../game/board-components/GameInfoPanels';
import GameBackgroundElements from '../game/board-components/GameBackgroundElements';
import GameStatusOverlays from '../game/board-components/GameStatusOverlays';

// Import hooks
import { useThemeStore } from '../../store/theme.store';
import { useToastStore } from '../../store/toast.store';
import { useTutorial } from '../../hooks/useTutorial';

interface MockGameBoardProps {
  isAttacker?: boolean;
  tutorialScriptId?: string;
  tutorialInfo?: {
    scriptName: string;
    role: 'attacker' | 'defender';
    stepIndex: number;
    totalSteps: number;
    onExit: () => void;
  };
}

const MockGameBoard: React.FC<MockGameBoardProps> = ({ 
  isAttacker = true,
  tutorialScriptId: _tutorialScriptId,
  tutorialInfo
}) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    // For defender tutorial, ensure we start with defender's turn
    if (!isAttacker) {
      mockGameStateProvider.setCurrentTurn('defender');
    }
    return mockGameStateProvider.generateMockGameState(isAttacker);
  });
  const [context, setContext] = useState(() => {
    const mockContext = mockGameStateProvider.generateMockContext(isAttacker);
    console.log('🎯 TUTORIAL: Mock context generated:', mockContext);
    return mockContext;
  });
  
  // Tutorial state
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [targetMode, setTargetMode] = useState(false);
  const [targetedInfraId, setTargetedInfraId] = useState<string | null>(null);
  const [validTargets, setValidTargets] = useState<string[]>([]);
  const [persistentHand, setPersistentHand] = useState<any[]>(() => {
    const initialState = mockGameStateProvider.generateMockGameState(isAttacker);
    return isAttacker ? initialState.attacker?.hand || [] : initialState.defender?.hand || [];
  });
  
  // Hooks
  const { theme } = useThemeStore();
  const { addToast } = useToastStore();
  const { tutorialState } = useTutorial();

  // Mock player data
  const playerID = isAttacker ? '0' : '1';
  
  // Tutorial-specific card filtering based on current step
  const [tutorialStep, setTutorialStep] = useState<string | null>(null);
  
  // Reaction mode state for tutorial
  const [tutorialReactionMode, setTutorialReactionMode] = useState(false);
  
  // Listen for tutorial step changes
  useEffect(() => {
    const handleTutorialStep = (event: CustomEvent) => {
      const newStepId = event.detail.stepId;
      setTutorialStep(newStepId);
      console.log('🎯 TUTORIAL: Step changed to:', newStepId);
      // Handle step-specific state changes
      if (newStepId === 'target_infrastructure' && selectedCard && targetMode) {
        // Transitioning from step 6 to step 7 - enable targeting ONLY for Enterprise Firewall
        console.log('🎯 TUTORIAL: Enabling targeting for step 7 - Enterprise Firewall only');
        setValidTargets(['I001']); // Only Enterprise Firewall for tutorial
      } else if (newStepId === 'shield_card' || newStepId === 'fortify_card' || newStepId === 'response_card') {
        // Defender tutorial: Ensure defender is in active phase for card playability
        console.log(`🎯 TUTORIAL: Setting up defender turn for ${tutorialStep}`);
        mockGameStateProvider.setCurrentTurn('defender');
        const newGameState = mockGameStateProvider.generateMockGameState(isAttacker);
        const newContext = mockGameStateProvider.generateMockContext(isAttacker);
        setGameState(newGameState);
        setContext(newContext);
        console.log('🎯 TUTORIAL: Set to defender turn for card playability', { 
          currentTurn: newGameState.currentTurn, 
          isAttacker, 
          playerID,
          step: tutorialStep
        });
        
        // For fortify_card step, ensure Enterprise Firewall is shielded
        if (tutorialStep === 'fortify_card') {
          mockGameStateProvider.setInfrastructureState('I001', 'shielded');
          console.log('🎯 TUTORIAL: Set Enterprise Firewall to shielded for fortify step');
        }
        
        // Add a small delay to ensure DOM is updated before validation
        setTimeout(() => {
          const firstCard = document.querySelector('.player-hand .card:first-child');
          console.log('🎯 TUTORIAL: First card after setup:', firstCard);
          if (firstCard) {
            console.log('🎯 TUTORIAL: Card classes:', firstCard.className);
            console.log('🎯 TUTORIAL: Card data attributes:', (firstCard as HTMLElement).dataset);
          }
          
          // Also check for alternative selectors
          const playerHand = document.querySelector('.player-hand');
          console.log('🎯 TUTORIAL: Player hand container:', playerHand);
          if (playerHand) {
            const allCards = playerHand.querySelectorAll('.card, [data-card-id], [class*="card"]');
            console.log('🎯 TUTORIAL: All cards in hand:', allCards.length, Array.from(allCards));
          }
        }, 100);
      } else if (newStepId === 'shield_infrastructure' && selectedCard && targetMode) {
        // Defender tutorial: Transitioning from shield_card to shield_infrastructure - enable targeting for Enterprise Firewall
        console.log('🎯 TUTORIAL: Enabling targeting for defender shield step - Enterprise Firewall only');
        setValidTargets(['I001']); // Only Enterprise Firewall for tutorial
        
        // Ensure we're in defender's turn for card playability
        mockGameStateProvider.setCurrentTurn('defender');
        const newGameState = mockGameStateProvider.generateMockGameState(isAttacker);
        const newContext = mockGameStateProvider.generateMockContext(isAttacker);
        setGameState(newGameState);
        setContext(newContext);
        console.log('🎯 TUTORIAL: Set to defender turn for shield targeting', { 
          currentTurn: newGameState.currentTurn, 
          isAttacker, 
          playerID 
        });
      } else if (newStepId === 'attack_vulnerable' && selectedCard && targetMode) {
        // Transitioning from step 9 to step 10 - enable targeting ONLY for vulnerable Enterprise Firewall
        console.log('🎯 TUTORIAL: Enabling targeting for step 10 - Vulnerable Enterprise Firewall only');
        setValidTargets(['I001']); // Only Enterprise Firewall for tutorial
      } else if (newStepId === 'reaction_phase') {
        // Transitioning to step 12 - setup reaction phase
        console.log('🎯 TUTORIAL: Setting up reaction phase - shielding Corporate Website and enabling reaction mode');
        mockGameStateProvider.setupReactionPhase();
        setTutorialReactionMode(true);
        
        // Check if Social Engineer is already in hand, if not add it
        setPersistentHand(prevHand => {
          // Check if Social Engineer (A205) is already in the hand
          const hasSocialEngineer = prevHand.some(card => card.id === 'A205');
          
          if (hasSocialEngineer) {
            console.log('🎯 TUTORIAL: Social Engineer already in hand, keeping existing cards');
            return prevHand; // Don't change anything if Social Engineer is already there
          }
          
          // Only add Social Engineer if it's not already in the hand
          const socialEngineerCard = {
            id: "A205",
            name: "Social Engineer",
            type: "counter-attack",
            category: "social",
            cost: 1,
            description: "Manipulates security personnel",
            flavor: "The most sophisticated firewalls can be bypassed with a simple phone call",
            effect: "Cancel a Shield card being played on infrastructure.",
            img: "social_engineer",
            isReactive: true,
            target: "shield",
            counterType: "cancel",
            playable: true
          };
          
          const newHand = [socialEngineerCard, ...prevHand.slice(1)]; // Replace first card with Social Engineer
          console.log('🎯 TUTORIAL: Added Social Engineer to hand for reaction mode:', newHand.map(c => c.name));
          return newHand;
        });
        
        // Refresh context to include reaction mode
        const newContext = mockGameStateProvider.generateMockContext(isAttacker);
        setContext(newContext);
        console.log('🎯 TUTORIAL: Updated context for reaction mode:', newContext);
      } else if (newStepId === 'target_shielded' && selectedCard && targetMode) {
        // Transitioning from step 12 to step 13 - enable targeting ONLY for shielded Corporate Website
        console.log('🎯 TUTORIAL: Enabling targeting for step 13 - Shielded Corporate Website only');
        setValidTargets(['I003']); // Only Corporate Website for tutorial
      }
    };
    
    window.addEventListener('tutorial-step-changed', handleTutorialStep as EventListener);
    return () => window.removeEventListener('tutorial-step-changed', handleTutorialStep as EventListener);
  }, [selectedCard, targetMode]);
  
  // Apply tutorial-specific card filtering using persistent hand
  const applyTutorialCardFiltering = (player: any) => {
    if (!persistentHand.length) return player;
    
    const filteredHand = persistentHand.map((c: any, index: number) => {
      let playable = false;
      
      // Tutorial step-based card availability
      switch (tutorialStep) {
        case 'exploit_card':
          // Step 6: Only allow the first card (Log4Shell) to be playable
          playable = index === 0;
          break;
        case 'target_infrastructure':
          // Step 7: Keep first card playable during targeting
          playable = index === 0;
          break;
        case 'infrastructure_vulnerable':
          // Step 8: After exploit, Log4Shell should be gone, so no cards playable yet
          playable = false;
          break;
        case 'attack_card':
          // Step 9: Allow first card (now a DDoS Attack card) to be playable
          playable = index === 0;
          break;
        case 'attack_vulnerable':
          // Step 10: Keep first card playable during targeting
          playable = index === 0;
          break;
        case 'infrastructure_compromised':
          // Step 11: After attack, DDoS card should be gone, so no cards playable yet
          playable = false;
          break;
        case 'reaction_phase':
          // Step 12: Allow first card (now a Shield Breaker Counter-Attack card) to be playable
          playable = index === 0;
          console.log('🎯 TUTORIAL: Step 12 - Card filtering:', { index, cardName: c.name, cardType: c.type, isReactive: c.isReactive, playable });
          break;
        case 'target_shielded':
          // Step 13: Keep first card playable during targeting
          playable = index === 0;
          break;
        case null:
        case undefined:
        default:
          // Before step 6 or unknown steps, disable all cards
          playable = false;
          break;
      }
      
      return {
        ...c,
        playable
      };
    });
    
    return {
      ...player,
      hand: filteredHand
    };
  };
  
  // Get the current player and apply tutorial filtering
  const rawCurrentPlayer = isAttacker ? gameState.attacker : gameState.defender;
  const currentPlayerObj = applyTutorialCardFiltering(rawCurrentPlayer);
  const opponent = isAttacker ? gameState.defender : gameState.attacker;

  // Mock action handlers for tutorial interactions

  // Mock moves object for tutorial interactions
  const mockMoves = useMemo(() => ({
    playCard: (cardId: string, targetId?: string) => {
      console.log('🎯 TUTORIAL: Mock playCard called', { cardId, targetId });
      
      if (!selectedCard || !targetId) return;
      
      // Simulate card effects based on type
      const card = selectedCard;
      if (card.type === 'exploit') {
        console.log('🎯 TUTORIAL: Simulating exploit on', targetId);
        mockGameStateProvider.simulateExploit(targetId);
      } else if (card.type === 'attack') {
        console.log('🎯 TUTORIAL: Simulating attack on', targetId);
        mockGameStateProvider.simulateAttack(targetId);
      } else if (card.type === 'shield') {
        console.log('🎯 TUTORIAL: Simulating shield on', targetId);
        mockGameStateProvider.simulateShield(targetId);
      } else if (card.type === 'fortify') {
        console.log('🎯 TUTORIAL: Simulating fortify on', targetId);
        mockGameStateProvider.simulateFortify(targetId);
      } else if (card.type === 'response') {
        console.log('🎯 TUTORIAL: Simulating response on', targetId);
        mockGameStateProvider.simulateResponse(targetId);
      } else if (card.type === 'counter-attack') {
        console.log('🎯 TUTORIAL: Simulating counter-attack on', targetId);
        mockGameStateProvider.simulateResponse(targetId); // Counter-attacks use same logic as response
        
        // After counter-attack is played, exit reaction mode and return to action mode
        if (tutorialStep === 'target_shielded') {
          console.log('🎯 TUTORIAL: Counter-attack played, returning to action mode');
          setTutorialReactionMode(false);
          
          // Exit reaction phase in the mock provider
          mockGameStateProvider.exitReactionPhase();
          
          // Update context to return to action mode
          const newContext = mockGameStateProvider.generateMockContext(isAttacker);
          setContext(newContext);
          console.log('🎯 TUTORIAL: Updated context back to action mode:', newContext);
        }
      }
      
      // Update persistent hand by removing the played card
      setPersistentHand(prevHand => {
        const updatedHand = prevHand.filter((c: any) => c.id !== cardId);
        console.log('🎯 TUTORIAL: Removed card from persistent hand, remaining cards:', updatedHand.length);
        return updatedHand;
      });
      
      // Update the current game state with fresh infrastructure states
      setGameState(prevState => {
        // Get fresh game state with updated infrastructure from the simulation
        const freshState = mockGameStateProvider.generateMockGameState(isAttacker);
        
        console.log('🎯 TUTORIAL: Updated infrastructure states:', freshState.infrastructure?.map(i => ({ id: i.id, state: i.state })));
        
        return freshState;
      });
      
      // Clear selection
      setSelectedCard(null);
      setTargetMode(false);
      setTargetedInfraId(null);
      setValidTargets([]);
      
      addToast({
        type: 'success',
        title: 'Card Played',
        message: `${card.name} played successfully!`,
        duration: 2000
      });
    },
    
    cycleCard: (cardId: string) => {
      console.log('🎯 TUTORIAL: Mock cycleCard called', { cardId });
      // Find card in hand
      const hand = currentPlayerObj.hand;
      const card = hand.find(c => c.id === cardId);
      if (card) {
        setSelectedCard(card);
        
        // Determine valid targets based on card type
        const targets: string[] = [];
        if (card.type === 'exploit') {
          // Exploits target secure infrastructure matching vulnerability
          gameState.infrastructure.forEach(infra => {
            if (infra.state === 'secure' && infra.vulnerabilities.includes(card.vulnerability)) {
              targets.push(infra.id);
            }
          });
        } else if (card.type === 'attack') {
          // Attacks target vulnerable infrastructure
          gameState.infrastructure.forEach(infra => {
            if (infra.state === 'vulnerable') {
              targets.push(infra.id);
            }
          });
        } else if (card.type === 'shield') {
          // Shields target secure infrastructure
          gameState.infrastructure.forEach(infra => {
            if (infra.state === 'secure') {
              targets.push(infra.id);
            }
          });
        } else if (card.type === 'fortify') {
          // Fortify targets shielded infrastructure
          gameState.infrastructure.forEach(infra => {
            if (infra.state === 'shielded') {
              targets.push(infra.id);
            }
          });
        }
        
        setValidTargets(targets);
        setTargetMode(targets.length > 0);
      }
    },
    
    endTurn: () => {
      console.log('🎯 TUTORIAL: Mock endTurn called');
      const newTurn = gameState.currentTurn === 'attacker' ? 'defender' : 'attacker';
      mockGameStateProvider.setCurrentTurn(newTurn);
      setGameState(mockGameStateProvider.generateMockGameState(isAttacker));
      setContext(mockGameStateProvider.generateMockContext(isAttacker));
    },
    
    skipReaction: () => {
      console.log('🎯 TUTORIAL: Mock skipReaction called');
    },
    
    surrender: () => {
      console.log('🎯 TUTORIAL: Mock surrender called');
    },
    
    sendChatMessage: (content: string) => {
      console.log('🎯 TUTORIAL: Mock sendChatMessage called', { content });
    }
  }), [selectedCard, currentPlayerObj.hand, gameState, isAttacker, addToast]);

  // Mock card actions
  const playCard = useCallback((card: any, _event?: React.MouseEvent) => {
    console.log('🎯 TUTORIAL: playCard called', { card });
    // For cards that don't need targeting, play them directly
    if (card.type === 'wildcard' || !['exploit', 'attack', 'shield', 'fortify', 'response', 'reaction', 'counter-attack', 'counter'].includes(card.type)) {
      // Simulate direct play
      addToast({
        type: 'success',
        title: 'Card Played',
        message: `${card.name} played successfully!`,
        duration: 2000
      });
    }
  }, [addToast]);

  const cycleCard = useCallback((cardId: string) => {
    console.log('🎯 TUTORIAL: cycleCard called', { cardId });
    // Mock card cycling
    addToast({
      type: 'info',
      title: 'Card Cycled',
      message: 'Card cycled successfully!',
      duration: 2000
    });
  }, [addToast]);

  const selectCardToThrow = useCallback((card: any) => {
    console.log('🎯 TUTORIAL: selectCardToThrow called', { card, tutorialStep });
    setSelectedCard(card);
    setTargetMode(true);
    
    // Tutorial step-specific behavior
    if (tutorialStep === 'exploit_card') {
      // Step 6: Card is selected but no targeting allowed yet
      setValidTargets([]); // No valid targets in step 6
      addToast({
        type: 'info',
        title: 'Card Selected',
        message: `${card.name} selected! Click "Next" to learn about targeting.`,
        duration: 3000
      });
    } else if (tutorialStep === 'target_infrastructure') {
      // Step 7: Only allow targeting Enterprise Firewall for tutorial
      setValidTargets(['I001']); // Only Enterprise Firewall
      
      addToast({
        type: 'info',
        title: 'Card Selected',
        message: `${card.name} selected. Target the Enterprise Firewall.`,
        duration: 2000
      });
    } else if (tutorialStep === 'attack_card') {
      // Step 9: Card is selected but no targeting allowed yet (similar to step 6)
      setValidTargets([]); // No valid targets in step 9
      addToast({
        type: 'info',
        title: 'Card Selected',
        message: `${card.name} selected! This will automatically advance to targeting.`,
        duration: 3000
      });
    } else if (tutorialStep === 'attack_vulnerable') {
      // Step 10: Only allow targeting vulnerable Enterprise Firewall for tutorial
      setValidTargets(['I001']); // Only Enterprise Firewall (should be vulnerable)
      
      addToast({
        type: 'info',
        title: 'Card Selected',
        message: `${card.name} selected. Target the vulnerable Enterprise Firewall.`,
        duration: 2000
      });
    } else if (tutorialStep === 'reaction_phase') {
      // Step 12: Card is selected but no targeting allowed yet (similar to step 6)
      setValidTargets([]); // No valid targets in step 12
      addToast({
        type: 'info',
        title: 'Card Selected',
        message: `${card.name} selected! This will automatically advance to targeting.`,
        duration: 3000
      });
    } else if (tutorialStep === 'target_shielded') {
      // Step 13: Only allow targeting shielded Corporate Website for tutorial
      setValidTargets(['I003']); // Only Corporate Website (should be shielded)
      
      addToast({
        type: 'info',
        title: 'Card Selected',
        message: `${card.name} selected. Target the shielded Corporate Website.`,
        duration: 2000
      });
    } else if (tutorialStep === 'shield_card') {
      // Defender tutorial: Filter infrastructure by card's attack vector
      const cardCategory = card.category?.toLowerCase();
      console.log('🎯 TUTORIAL: Defender card selected:', { cardName: card.name, cardCategory });
      
      if (cardCategory) {
        const compatibleInfra = gameState.infrastructure?.filter(infra => {
          const hasMatchingVector = infra.vulnerabilities?.includes(cardCategory) || 
                                   infra.vulnerableVectors?.includes(cardCategory);
          console.log('🎯 TUTORIAL: Infrastructure compatibility check:', {
            infraName: infra.name,
            infraId: infra.id,
            vulnerabilities: infra.vulnerabilities,
            vulnerableVectors: infra.vulnerableVectors,
            cardCategory,
            hasMatchingVector
          });
          return hasMatchingVector;
        }) || [];
        
        const validTargetIds = compatibleInfra.map(infra => infra.id);
        console.log('🎯 TUTORIAL: Valid targets for', card.name, ':', validTargetIds);
        setValidTargets(validTargetIds);
        
        addToast({
          type: 'info',
          title: 'Shield Card Selected',
          message: `${card.name} selected. Target infrastructure with ${cardCategory} vulnerabilities.`,
          duration: 3000
        });
      } else {
        // Fallback if no category
        setValidTargets(['I001']);
        addToast({
          type: 'info',
          title: 'Shield Card Selected',
          message: `${card.name} selected. Target the Enterprise Firewall.`,
          duration: 2000
        });
      }
    } else if (tutorialStep === 'fortify_card') {
      // Defender tutorial: Fortify cards can only target shielded infrastructure
      const cardCategory = card.category?.toLowerCase();
      console.log('🎯 TUTORIAL: Fortify card selected:', { cardName: card.name, cardCategory });
      
      if (cardCategory) {
        // For tutorial, only allow targeting shielded Enterprise Firewall
        setValidTargets(['I001']); // Enterprise Firewall should be shielded
        
        addToast({
          type: 'info',
          title: 'Fortify Card Selected',
          message: `${card.name} selected. Target the shielded Enterprise Firewall to fortify it.`,
          duration: 3000
        });
      } else {
        // Fallback
        setValidTargets(['I001']);
        addToast({
          type: 'info',
          title: 'Fortify Card Selected',
          message: `${card.name} selected. Target the shielded infrastructure.`,
          duration: 2000
        });
      }
    } else if (tutorialStep === 'response_card') {
      // Defender tutorial: Response cards can target compromised infrastructure
      const cardCategory = card.category?.toLowerCase();
      console.log('🎯 TUTORIAL: Response card selected:', { cardName: card.name, cardCategory });
      
      // For tutorial, we'll just show the concept without requiring compromised infrastructure
      setValidTargets([]); // No targeting needed for tutorial - just show the card selection
      
      addToast({
        type: 'info',
        title: 'Response Card Selected',
        message: `${card.name} selected. Response cards restore compromised infrastructure to secure state.`,
        duration: 3000
      });
    } else {
      // Default behavior for other steps
      setValidTargets(['I001', 'I003', 'I005', 'I007', 'I009']);
      addToast({
        type: 'info',
        title: 'Card Selected',
        message: `${card.name} selected. Choose a target.`,
        duration: 2000
      });
    }
  }, [addToast, tutorialStep]);

  const handleInfrastructureTarget = useCallback((infraId: string, _event?: React.MouseEvent) => {
    console.log('🎯 TUTORIAL: Infrastructure target selected', { infraId, targetMode, selectedCard, tutorialStep });
    
    if (!targetMode || !selectedCard) return;
    
    // Prevent targeting during step 6 - users must click "Next" first
    if (tutorialStep === 'exploit_card') {
      addToast({
        type: 'warning',
        title: 'Tutorial in Progress',
        message: 'Click "Next" to learn about targeting infrastructure.',
        duration: 2000
      });
      return;
    }
    
    if (validTargets.includes(infraId)) {
      setTargetedInfraId(infraId);
      mockMoves.playCard(selectedCard.id, infraId);
    } else {
      addToast({
        type: 'error',
        title: 'Invalid Target',
        message: 'This infrastructure cannot be targeted with the selected card.',
        duration: 3000
      });
    }
  }, [targetMode, selectedCard, validTargets, mockMoves, addToast, tutorialStep]);

  const cancelTargeting = useCallback(() => {
    console.log('🎯 TUTORIAL: cancelTargeting called', { tutorialStep, currentStep: tutorialState.currentStep });
    
    // Check if current tutorial step prevents target mode exit
    const currentStep = tutorialState.currentStep;
    if (currentStep?.preventTargetModeExit) {
      addToast({
        type: 'warning',
        title: 'Tutorial in Progress',
        message: 'Complete the current tutorial step to continue. You cannot exit target mode during this step.',
        duration: 3000
      });
      return; // Don't allow canceling when preventTargetModeExit is true
    }
    
    // Allow canceling in other steps
    setSelectedCard(null);
    setTargetMode(false);
    setTargetedInfraId(null);
    setValidTargets([]);
  }, [tutorialStep, tutorialState.currentStep, addToast]);

  const handleEndTurn = useCallback(() => {
    mockMoves.endTurn();
  }, [mockMoves]);

  const handleSkipReaction = useCallback(() => {
    mockMoves.skipReaction();
  }, [mockMoves]);

  // Mock processing states
  const isProcessingMove = false;
  const expectedRole = isAttacker ? 'attacker' : 'defender';
  const isActive = gameState.currentTurn === expectedRole;
  const isInReactionMode = tutorialReactionMode;
  
  // Debug logging for defender tutorial
  if (!isAttacker) {
    console.log('🎯 TUTORIAL: Defender isActive check:', {
      gameStateCurrentTurn: gameState.currentTurn,
      expectedRole,
      isAttacker,
      isActive,
      playerID
    });
  }

  // Optimized infrastructure data
  const optimizedInfrastructureData = useMemo(() => ({
    cards: gameState.infrastructure || [],
    length: gameState.infrastructure?.length || 0,
    states: gameState.infrastructure?.map(infra => ({ id: infra.id, state: infra.state })) || []
  }), [gameState.infrastructure]);

  // Periodic infrastructure state refresh for tutorial (but preserve hand changes)
  useEffect(() => {
    const interval = setInterval(() => {
      // Only refresh infrastructure states, preserve persistent hand
      setGameState(prevState => {
        const freshState = mockGameStateProvider.generateMockGameState(isAttacker);
        
        // Use persistent hand instead of fresh hand
        const currentPlayer = isAttacker ? freshState.attacker : freshState.defender;
        if (currentPlayer) {
          currentPlayer.hand = persistentHand;
        }
        
        return freshState;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAttacker, persistentHand]);

  return (
    <div 
      className={`min-h-screen bg-base-100 text-base-content flex flex-col transition-all duration-500 ${
        isActive ? 'ring-2 ring-current/30' : ''
      } ${targetMode ? 'target-mode' : ''}`}
      data-theme={theme}
      data-tutorial-target-mode={targetMode}
    >
      {/* Tutorial Integration */}
      <TutorialIntegration
        gameState={gameState}
        ctx={context}
        playerID={playerID}
        onExit={tutorialInfo?.onExit}
      />

      {/* Game Background Elements */}
      <GameBackgroundElements isAttacker={isAttacker} />

      {/* Game Status Overlays */}
      <GameStatusOverlays
        targetMode={targetMode}
        selectedCard={selectedCard}
        cancelTargeting={cancelTargeting}
        isInReactionMode={isInReactionMode}
        isTimerActive={false}
        timeRemaining={0}
        isPaused={false}
        isProcessingMove={isProcessingMove}
        G={gameState}
        ctx={context}
        playerID={playerID}
        isActive={isActive}
        moves={mockMoves}
        isAttacker={isAttacker}
      />

      {/* Header - Game Controls Bar with integrated tutorial info */}
      <GameControlsBar
        G={gameState}
        ctx={context}
        moves={mockMoves}
        playerID={playerID}
        isActive={isActive}
        isAttacker={isAttacker}
        currentPlayerObj={currentPlayerObj}
        isProcessingMove={isProcessingMove}
        handleEndTurn={handleEndTurn}
        handleSkipReaction={handleSkipReaction}
        cycleCard={cycleCard}
        surrender={mockMoves.surrender}
        isInReactionMode={isInReactionMode}
        isTimerActive={false}
        timeRemaining={0}
        tutorialInfo={tutorialInfo}
      />

      {/* Enhanced status bar with turn indicator */}
      <div className={`
        px-4 py-3 border-b transition-all duration-500
        ${isActive 
          ? isAttacker
            ? 'bg-gradient-to-r from-red-600/20 via-red-500/10 to-red-600/20 border-red-500/50' 
            : 'bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-blue-600/20 border-blue-500/50'
          : isAttacker
            ? 'bg-red-900/50 border-red-800/30'
            : 'bg-blue-900/50 border-blue-800/30'
        }
      `}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          
          {/* Tutorial mode indicator */}
          <div className="flex items-center gap-2">
            <div className="badge badge-info bg-purple-600 text-purple-100 border-purple-400 gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-100 animate-pulse"></span>
              TUTORIAL MODE
            </div>
          </div>
          
          {/* Turn status */}
          {isActive && (
            <div className="flex items-center gap-2">
              <div className={`
                badge gap-2 animate-pulse
                ${isAttacker 
                  ? 'badge-error bg-red-600 text-red-100 border-red-400' 
                  : 'badge-info bg-blue-600 text-blue-100 border-blue-400'
                }
              `}>
                <span className={`
                  w-2 h-2 rounded-full animate-ping
                  ${isAttacker ? 'bg-red-100' : 'bg-blue-100'}
                `}></span>
                YOUR TURN - TAKE ACTION
              </div>
            </div>
          )}
          
          {!isActive && (
            <div className="flex items-center gap-2">
              <div className={`
                badge gap-2
                ${isAttacker 
                  ? 'badge-ghost bg-red-800/50 text-red-300 border-red-700' 
                  : 'badge-ghost bg-blue-800/50 text-blue-300 border-blue-700'
                }
              `}>
                <span className="loading loading-dots loading-xs"></span>
                WAITING FOR OPPONENT
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main game area */}
      <main className="flex-1 flex flex-col gap-4 p-4 w-full">
        {/* Opponent area */}
        <div className={`${!isActive ? 'ring-2 ring-current/50 shadow-lg shadow-current/20' : ''}`}>
          <OpponentHandArea
            opponent={opponent}
            isAttacker={isAttacker}
            G={gameState}
            ctx={context}
            playerID={playerID}
            isActive={isActive}
            moves={mockMoves}
          />
        </div>

        {/* Game content wrapper */}
        <div className="flex gap-4 flex-1 min-h-0 lg:flex-row flex-col">
          <GameInfoPanels
            G={gameState}
            ctx={context}
            playerID={playerID}
            isActive={isActive}
            moves={mockMoves}
            isAttacker={isAttacker}
            currentPlayerObj={currentPlayerObj}
            opponent={opponent}
            currentPhase="playing"
            optimizedInfrastructureData={optimizedInfrastructureData}
            sendChatMessage={mockMoves.sendChatMessage}
          />

          {/* Center column - Infrastructure */}
          <div className="flex-1 flex flex-col lg:order-2 order-1">
            <div className="bg-base-200 border border-primary/30 rounded-xl p-6 relative flex-1 lg:min-h-80 min-h-60 flex flex-col items-center justify-center backdrop-blur-sm infrastructure-grid">
              {/* Network grid label */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-base-200 text-primary px-4 py-1 border border-primary/30 rounded-full text-xs font-bold font-mono uppercase tracking-wider">
                NETWORK_GRID
              </div>
              
              {/* Corner bracket */}
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
              
              <InfrastructureGrid
                G={gameState}
                playerID={playerID}
                targetMode={targetMode}
                validTargets={validTargets}
                targetedInfraId={targetedInfraId}
                isAttacker={isAttacker}
                onInfrastructureTarget={handleInfrastructureTarget}
              />
            </div>
          </div>
        </div>

        {/* Player area */}
        <PlayerHandArea
          G={gameState}
          ctx={context}
          playerID={playerID}
          isActive={isActive}
          moves={mockMoves}
          isAttacker={isAttacker}
          currentPlayerObj={currentPlayerObj}
          selectedCard={selectedCard}
          targetMode={targetMode}
          isTransitioning={false}
          playCard={playCard}
          cycleCard={cycleCard}
          selectCardToThrow={selectCardToThrow}
          cancelTargeting={cancelTargeting}
        />
      </main>

    </div>
  );
};

export default MockGameBoard;
