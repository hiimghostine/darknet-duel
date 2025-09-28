import React, { useEffect, useState, useRef } from 'react';
import { ChevronRight, RotateCcw, BookOpen, X } from 'lucide-react';
import type { TutorialState } from '../../types/tutorial.types';
import tutorialManager from '../../services/tutorialManager';

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
  const overlayRef = useRef<HTMLDivElement>(null);

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
          element = document.querySelector('.infrastructure-grid');
          console.log('Step 3 - Infrastructure Grid:', element);
          break;
          
        case '.game-info-panel':
          element = document.querySelector('.game-info-panel');
          console.log('Step 4 - Game Info Panel:', element);
          break;
          
        case '.player-hand':
          // Target the entire player hand area container
          element = document.querySelector('.player-hand');
          console.log('Step 5 - Player Hand Container:', element);
          break;
          
        case '.player-hand .card:first-child':
          // Target the first card in the player hand
          element = document.querySelector('.player-hand .card:first-child');
          console.log('Step 6 - First Card in Hand:', element);
          if (!element) {
            // Fallback: try to find the first card with data-card-id
            element = document.querySelector('.player-hand [data-card-id]:first-child');
            console.log('Step 6 - Fallback First Card:', element);
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
            element = document.querySelector('[data-infra-id]');
            console.log('Step 7 - Fallback infrastructure card:', element);
          }
          break;
          
        case '.tactical-hand-label':
          // Target specifically the TACTICAL_HAND label
          element = document.querySelector('.tactical-hand-label');
          console.log('Step 5 - Tactical Hand Label:', element);
          if (!element) {
            // Fallback: try to find any element with TACTICAL_HAND text
            const allElements = document.querySelectorAll('*');
            for (const el of allElements) {
              if (el.textContent?.includes('TACTICAL_HAND')) {
                element = el;
                console.log('Step 5 - Found TACTICAL_HAND via text search:', element);
                break;
              }
            }
          }
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
              const extraSpacing = (currentStep.id === 'exploit_card' || currentStep.id === 'attack_card') ? 100 : 20;
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
        console.log('🎯 TUTORIAL: Validation check for step', currentStep.id, ':', result);
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
      {/* Clean highlight overlay - VERY LOW Z-INDEX to stay under all card interactions */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        {highlightRect && (
          <>
            {/* Enhanced border highlight with glow effect - NO BLUR, LOWER Z-INDEX */}
            <div
              className="absolute border-4 border-blue-400 rounded-lg shadow-lg animate-pulse bg-blue-400/10"
              style={{
                top: highlightRect.top - 8,
                left: highlightRect.left - 8,
                width: highlightRect.width + 16,
                height: highlightRect.height + 16,
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.5), inset 0 0 20px rgba(59, 130, 246, 0.1)',
                zIndex: 1
              }}
            />
            {/* Additional outer glow - LOWER Z-INDEX */}
            <div
              className="absolute border-2 border-blue-300/50 rounded-lg animate-ping"
              style={{
                top: highlightRect.top - 12,
                left: highlightRect.left - 12,
                width: highlightRect.width + 24,
                height: highlightRect.height + 24,
                zIndex: 1
              }}
            />
            {/* Single animated arrow */}
            <div
              className="absolute text-blue-400 animate-bounce"
              style={{
                top: highlightRect.top - 40,
                left: highlightRect.left + highlightRect.width / 2 - 12,
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
        className="fixed z-50 bg-gray-900 border border-gray-600 rounded-lg shadow-2xl max-w-md w-full mx-4"
        style={overlayPosition ? overlayPosition : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
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
                console.log('🎯 TUTORIAL: Exit tutorial clicked');
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
        <div className="flex items-center justify-between p-4 border-t border-gray-600">
          <div className="flex items-center space-x-2">
            {/* Next button */}
            <button
              onClick={onNext}
              disabled={!canGoNext}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-md transition-colors text-sm"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Reset Tutorial button */}
            <button
              onClick={() => {
                console.log('🎯 TUTORIAL: Reset tutorial clicked - refreshing page');
                window.location.reload();
              }}
              className="flex items-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors text-sm"
              title="Reset Tutorial (Refresh Page)"
            >
              <RotateCcw size={16} />
              <span>Reset Tutorial</span>
            </button>
          </div>
        </div>
      </div>

    </>
  );
};

export default TutorialOverlay;
