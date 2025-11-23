import React, { useEffect, useState, useRef } from 'react';
import { ChevronRight, BookOpen, X } from 'lucide-react';
import type { TutorialState } from '../../types/tutorial.types';
import tutorialManager from '../../services/tutorialManager';
import { tutorialLog } from '../../utils/tutorialLogger';

interface TutorialOverlayProps {
  tutorialState: TutorialState;
  onNext?: () => void;
  onCancel?: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  tutorialState,
  onNext,
  onCancel
}) => {
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [overlayPosition, setOverlayPosition] = useState<{ top: number; left: number } | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const highlightedElementRef = useRef<Element | null>(null);

  const { currentStep, currentScript, stepIndex, isActive, overlayVisible, highlightTarget } = tutorialState;

  // Update highlight and overlay position when target changes
  useEffect(() => {
    if (!highlightTarget || !isActive) {
      setHighlightRect(null);
      setOverlayPosition(null);
      return;
    }

    const updatePosition = () => {
      // NEW HIGHLIGHTING SYSTEM - Direct element targeting by step
      let element = null;
      
      // Step-specific element selection
      switch (highlightTarget) {
        case '.infrastructure-grid':
          // Target the infrastructure grid container - updated for new layout
          element = document.querySelector('.tutorial-target.infrastructure-grid') ||
                    document.querySelector('[class*="flex-1 flex flex-col lg:order-2"]');
          console.log('Step 3 - Infrastructure Grid:', element);
          break;
          
        case '.game-info-panel':
          // Target the left game info panel - updated for new layout
          element = document.querySelector('.tutorial-target.game-info-panel') ||
                    document.querySelector('[class*="flex flex-col gap-3 lg:w-64"][class*="lg:order-1"]');
          console.log('Step 4 - Game Info Panel:', element);
          break;
          
        case '.player-hand':
          // Target the entire player hand area container - updated for new layout
          element = document.querySelector('.tutorial-target.player-hand') ||
                    document.querySelector('[class*="flex justify-between items-center gap-4 rounded-lg"][class*="backdrop-blur-md"]');
          console.log('Step 5 - Player Hand Container:', element);
          break;
          
        case '.player-hand .card:first-child':
          // Target the Log4Shell card (A003) for exploit step - use data-card-id instead of position
          element = document.querySelector('[data-card-id="A003"]');
          console.log('Step 6 - Exploit Card (Log4Shell A003):', element);
          if (!element) {
            // Fallback: find first playable exploit card
            const playableCards = document.querySelectorAll('[data-card-id]');
            element = Array.from(playableCards).find(card => {
              const cardElement = card as HTMLElement;
              return !cardElement.classList.contains('opacity-50') &&
                     !cardElement.classList.contains('cursor-not-allowed');
            }) as HTMLElement || playableCards[0] as HTMLElement || null;
            console.log('Step 6 - Fallback First Playable Card:', element);
          }
          break;
          
        case '.player-hand .card:nth-child(2)':
          // Target the Firewall card (D001) for shield step - use data-card-id instead of position
          element = document.querySelector('[data-card-id="D001"]');
          console.log('Step (Defender) - Shield Card (Firewall D001):', element);
          if (!element) {
            // Fallback: find first playable shield card
            const playableCards = document.querySelectorAll('[data-card-id]');
            element = Array.from(playableCards).find(card => {
              const cardElement = card as HTMLElement;
              return !cardElement.classList.contains('opacity-50');
            }) as HTMLElement || playableCards[0] as HTMLElement || null;
            console.log('Step (Defender) - Fallback Shield Card:', element);
          }
          break;
          
        case '.player-hand .card:nth-child(4)':
          // Target the Incident Response Team card (D201) for response step - use data-card-id
          element = document.querySelector('[data-card-id="D201"]');
          console.log('Step (Defender) - Response Card (Incident Response Team D201):', element);
          if (!element) {
            // Fallback: find first playable response card
            const playableCards = document.querySelectorAll('[data-card-id]');
            element = Array.from(playableCards).find(card => {
              const cardElement = card as HTMLElement;
              return !cardElement.classList.contains('opacity-50');
            }) as HTMLElement || playableCards[0] as HTMLElement || null;
            console.log('Step (Defender) - Fallback Response Card:', element);
          }
          break;
          
        // Card ID-based selectors - these will match regardless of hand sorting
        case '[data-card-id="A003"]': // Log4Shell - Exploit card
        case '[data-card-id="A101"]': // DDoS Attack - Attack card
        case '[data-card-id="A205"]': // Social Engineer - Counter-attack card
        case '[data-card-id="A002"]': // Packet Sniffer - First fortified exploit
        case '[data-card-id="A001"]': // Port Scanner - Second fortified exploit
        case '[data-card-id="D001"]': // Firewall - Shield card
        case '[data-card-id="D101"]': // DMZ Implementation - Fortify card
        case '[data-card-id="D201"]': // Incident Response Team - Response card
        case '[data-card-id="D007"]': // Phishing Defense - Reaction card
          element = document.querySelector(highlightTarget);
          console.log(`Card ID selector ${highlightTarget}:`, element);
          if (!element) {
            // Fallback: find first playable card
            const playableCards = document.querySelectorAll('[data-card-id]');
            element = Array.from(playableCards).find(card => {
              const cardElement = card as HTMLElement;
              return !cardElement.classList.contains('opacity-50') &&
                     !cardElement.classList.contains('cursor-not-allowed');
            }) as HTMLElement || playableCards[0] as HTMLElement || null;
            console.log(`Fallback for ${highlightTarget}:`, element);
          }
          break;
          
        case '.infrastructure-card[data-vectors*="network"]':
          // Target infrastructure cards with network vectors
          const networkCards = document.querySelectorAll('[data-infra-id]');
          console.log('Step 7 - Looking for network infrastructure cards:', networkCards.length);
          
          // Find infrastructure cards that have network vulnerability
          for (const card of networkCards) {
            const infraId = card.getAttribute('data-infra-id');
            // Check if this is a network-vulnerable infrastructure
            if (infraId === 'I001' || infraId === 'I005' || infraId === 'I009') { // Enterprise Firewall, Main Database, Financial System
              element = card;
              console.log('Step 7 - Found network infrastructure:', infraId, element);
              break;
            }
          }
          
          if (!element) {
            // Fallback: just target the first infrastructure card
            element = document.querySelector('[data-infra-id]') ||
                     document.querySelector('[class*="infrastructure"]');
            console.log('Step 7 - Fallback infrastructure card:', element);
          }
          break;
          
        case '.tactical-hand-label':
          // This selector is no longer used in the new layout
          // Fallback to player hand container
          element = document.querySelector('.tutorial-target.player-hand') ||
                    document.querySelector('[class*="flex justify-between items-center gap-4 rounded-lg"]');
          console.log('Step 5 - Tactical Hand Label (fallback to player hand):', element);
          break;
          
        case '.end-turn-button':
          // Target the end turn button in GameControlsBar
          element = document.querySelector('.tutorial-target.end-turn-button') ||
                    document.querySelector('button[class*="END_TURN"]') ||
                    Array.from(document.querySelectorAll('button')).find(btn =>
                      btn.textContent?.includes('END_TURN') || btn.textContent?.includes('END TURN')
                    );
          console.log('End Turn Button:', element);
          break;
          
        default:
          if (highlightTarget) {
            element = document.querySelector(highlightTarget);
            console.log('Other step - Target:', highlightTarget, element);
          }
          break;
      }
      
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightRect(rect);
        
        // Store reference to highlighted element for hover detection
        highlightedElementRef.current = element;
        
        // Calculate overlay position based on step position preference
        if (currentStep && overlayRef.current) {
          const overlayRect = overlayRef.current.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          
          let top = 0;
          let left = 0;
          
          switch (currentStep.position) {
            case 'top':
              top = rect.top - overlayRect.height - 20;
              left = rect.left + (rect.width - overlayRect.width) / 2;
              break;
            case 'bottom':
              top = rect.bottom + 20;
              left = rect.left + (rect.width - overlayRect.width) / 2;
              break;
            case 'left':
              top = rect.top + (rect.height - overlayRect.height) / 2;
              left = rect.left - overlayRect.width - 20;
              break;
            case 'right':
              top = rect.top + (rect.height - overlayRect.height) / 2;
              // Add extra spacing for card selection steps to avoid covering the expanded card on hover
              const extraSpacing = (currentStep.id === 'exploit_card' || currentStep.id === 'attack_card' || currentStep.id === 'reaction_phase') ? 100 : 20;
              left = rect.right + extraSpacing;
              break;
            case 'center':
            default:
              top = (viewportHeight - overlayRect.height) / 2;
              left = (viewportWidth - overlayRect.width) / 2 + 100; // Move 100px to the right
              break;
          }
          
          // Ensure overlay stays within viewport
          top = Math.max(20, Math.min(top, viewportHeight - overlayRect.height - 20));
          left = Math.max(20, Math.min(left, viewportWidth - overlayRect.width - 20));
          
          setOverlayPosition({ top, left });
        }
      }
    };

    updatePosition();
    
    // Update position on window resize
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [highlightTarget, currentStep, isActive]);

  // Handle hover state on highlighted element
  useEffect(() => {
    const element = highlightedElementRef.current;
    if (!element || !isActive) {
      setIsHovering(false);
      return;
    }

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [highlightedElementRef.current, isActive]);

  // Handle click events for validation
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.target instanceof Element) {
        tutorialManager.handleElementClick(event.target);
      }
    };

    if (isActive) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [isActive]);

  if (!isActive || !overlayVisible || !currentStep || !currentScript) {
    return null;
  }

  // Check if current step validation is satisfied
  const [validationTrigger, setValidationTrigger] = React.useState(0);
  
  // Trigger validation re-check periodically for dynamic validation
  React.useEffect(() => {
    const interval = setInterval(() => {
      setValidationTrigger(prev => prev + 1);
    }, 500); // Check every 500ms
    
    return () => clearInterval(interval);
  }, [currentStep]);
  
  const isCurrentStepValid = React.useMemo(() => {
    // Force re-evaluation by including validationTrigger
    validationTrigger; // This ensures the memo re-runs
    
    if (!currentStep?.validation) return true; // No validation required
    
    if (currentStep.validation.type === 'custom' && typeof currentStep.validation.condition === 'function') {
      try {
        const result = currentStep.validation.condition();
        tutorialLog('🎯 TUTORIAL: Validation check for step', currentStep.id, ':', result);
        return result;
      } catch (error) {
        console.error('Tutorial validation error:', error);
        return false;
      }
    }
    
    return true; // Default to valid for other validation types
  }, [currentStep, validationTrigger]);

  const canGoNext = stepIndex < currentScript.steps.length - 1 && isCurrentStepValid;

  return (
    <>
      {/* Clean highlight overlay - hides when user hovers over highlighted element */}
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        {highlightRect && !isHovering && (
          <>
            {/* Enhanced border highlight - fades out on hover */}
            <div
              className="absolute border-4 border-blue-400 rounded-lg shadow-lg animate-pulse bg-blue-400/10 transition-opacity duration-200"
              style={{
                top: highlightRect.top - 8,
                left: highlightRect.left - 8,
                width: highlightRect.width + 16,
                height: highlightRect.height + 16,
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.5), inset 0 0 20px rgba(59, 130, 246, 0.1)'
              }}
            />
            {/* Additional outer glow - fades out on hover */}
            <div
              className="absolute border-2 border-blue-300/50 rounded-lg animate-ping transition-opacity duration-200"
              style={{
                top: highlightRect.top - 12,
                left: highlightRect.left - 12,
                width: highlightRect.width + 24,
                height: highlightRect.height + 24
              }}
            />
            {/* Single animated arrow - fades out on hover */}
            <div
              className="absolute text-blue-400 animate-bounce transition-opacity duration-200"
              style={{
                top: highlightRect.top - 40,
                left: highlightRect.left + highlightRect.width / 2 - 12
              }}
            >
              <div className="text-2xl">↓</div>
            </div>
          </>
        )}
      </div>

      {/* Tutorial overlay panel */}
      <div
        ref={overlayRef}
        className="fixed z-[9999] bg-gray-900 border border-gray-600 rounded-lg shadow-2xl max-w-md w-full mx-4"
        style={overlayPosition ? overlayPosition : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        data-tutorial-step={currentStep.id}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <div className="flex items-center space-x-2">
            <BookOpen className="text-blue-400" size={20} />
            <h3 className="text-lg font-semibold text-white">
              {currentStep.title}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {/* Progress indicator */}
            <span className="text-sm text-gray-400">
              {stepIndex + 1} / {currentScript.steps.length}
            </span>
            <button
              onClick={() => {
                tutorialLog('🎯 TUTORIAL: Exit tutorial clicked');
                if (onCancel) onCancel();
              }}
              className="text-gray-400 hover:text-red-400 transition-colors"
              title="Exit Tutorial"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Description */}
          {currentStep.description && (
            <p className="text-gray-300 mb-3 text-sm">
              {currentStep.description}
            </p>
          )}
          
          {/* Main instruction */}
          <div className="bg-blue-900/30 border border-blue-600/50 rounded-lg p-3 mb-4">
            <p className="text-blue-100 font-medium">
              {currentStep.instruction}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{Math.round(((stepIndex + 1) / currentScript.steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((stepIndex + 1) / currentScript.steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer with controls */}
        <div className="flex items-center justify-center p-4 border-t border-gray-600">
          {/* Next/Custom Action button */}
          <button
            onClick={() => {
              if (currentStep.customButtonAction === 'exit_tutorial') {
                tutorialLog('🎯 TUTORIAL: Finish tutorial clicked - completing tutorial');
                // Complete the tutorial properly by calling onNext, which will trigger completeTutorial()
                if (onNext) onNext();
              } else {
                if (onNext) onNext();
              }
            }}
            disabled={!canGoNext && !currentStep.customButtonAction}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-md transition-colors text-sm"
          >
            <span>{currentStep.customButtonText || 'Next'}</span>
            {!currentStep.customButtonAction && <ChevronRight size={16} />}
          </button>
        </div>
      </div>

    </>
  );
};

export default TutorialOverlay;
