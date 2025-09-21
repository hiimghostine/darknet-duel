import React, { useEffect, useState, useRef } from 'react';
import { ChevronRight, ChevronLeft, X, Play, Pause, RotateCcw, BookOpen } from 'lucide-react';
import type { TutorialStep, TutorialState } from '../../types/tutorial.types';
import tutorialManager from '../../services/tutorialManager';

interface TutorialOverlayProps {
  tutorialState: TutorialState;
  onNext?: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  tutorialState,
  onNext,
  onPrevious,
  onSkip,
  onPause,
  onResume,
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
      const element = document.querySelector(highlightTarget);
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
              left = rect.right + 20;
              break;
            case 'center':
            default:
              top = (viewportHeight - overlayRect.height) / 2;
              left = (viewportWidth - overlayRect.width) / 2;
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

  const canGoNext = stepIndex < currentScript.steps.length - 1;
  const canGoPrevious = stepIndex > 0;
  const canSkip = currentStep.skipable !== false;

  return (
    <>
      {/* Backdrop with highlight cutout */}
      <div className="fixed inset-0 z-40 pointer-events-none">
        {highlightRect && (
          <div className="absolute inset-0 bg-black bg-opacity-60">
            {/* Highlight cutout */}
            <div
              className="absolute bg-transparent border-4 border-blue-400 rounded-lg shadow-lg animate-pulse"
              style={{
                top: highlightRect.top - 8,
                left: highlightRect.left - 8,
                width: highlightRect.width + 16,
                height: highlightRect.height + 16,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)'
              }}
            />
            {/* Animated arrow pointing to target */}
            <div
              className="absolute text-blue-400 animate-bounce"
              style={{
                top: highlightRect.top - 40,
                left: highlightRect.left + highlightRect.width / 2 - 12,
              }}
            >
              <div className="text-2xl">↓</div>
            </div>
          </div>
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
              onClick={onCancel}
              className="text-gray-400 hover:text-red-400 transition-colors"
              title="Cancel Tutorial"
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
            {/* Previous button */}
            <button
              onClick={onPrevious}
              disabled={!canGoPrevious}
              className="flex items-center space-x-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-md transition-colors text-sm"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            {/* Pause/Resume button */}
            <button
              onClick={isActive ? onPause : onResume}
              className="flex items-center space-x-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-md transition-colors text-sm"
              title={isActive ? "Pause Tutorial" : "Resume Tutorial"}
            >
              {isActive ? <Pause size={16} /> : <Play size={16} />}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Skip button */}
            {canSkip && (
              <button
                onClick={onSkip}
                className="px-3 py-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Skip
              </button>
            )}

            {/* Next button */}
            <button
              onClick={onNext}
              className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors text-sm font-medium"
            >
              <span>{canGoNext ? 'Next' : 'Complete'}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Tutorial-specific CSS */}
      <style jsx global>{`
        .tutorial-highlight {
          position: relative;
          z-index: 41;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3) !important;
          border-radius: 8px;
          animation: tutorialPulse 2s infinite;
        }
        
        @keyframes tutorialPulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.5);
          }
        }
        
        .tutorial-overlay-backdrop {
          backdrop-filter: blur(2px);
        }
      `}</style>
    </>
  );
};

export default TutorialOverlay;
