import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import TutorialMenu from './TutorialMenu';
import { useTutorial } from '../../hooks/useTutorial';

interface TutorialButtonProps {
  variant?: 'primary' | 'secondary' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

const TutorialButton: React.FC<TutorialButtonProps> = ({
  variant = 'primary',
  size = 'md',
  showProgress = false
}) => {
  const [showTutorialMenu, setShowTutorialMenu] = useState(false);
  const { getAvailableScripts, isScriptCompleted } = useTutorial();

  const availableScripts = getAvailableScripts();
  const completedScripts = availableScripts.filter(script => isScriptCompleted(script.id));
  const progressText = `${completedScripts.length}/${availableScripts.length} completed`;

  const getButtonClasses = () => {
    const baseClasses = "flex items-center gap-2 font-mono transition-all duration-200 btn-cyberpunk";
    
    const sizeClasses = {
      sm: "btn btn-sm",
      md: "btn btn-md", 
      lg: "btn btn-lg"
    };

    const variantClasses = {
      primary: "btn-primary",
      secondary: "btn-outline btn-primary",
      minimal: "bg-base-300/80 border-primary/30 hover:border-primary text-primary"
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`;
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'md': return 18;
      case 'lg': return 20;
      default: return 18;
    }
  };

  return (
    <>
      <button
        onClick={() => setShowTutorialMenu(true)}
        className={getButtonClasses()}
        title="Open Tutorial Center"
      >
        <BookOpen size={getIconSize()} />
        <span>TUTORIAL</span>
        {showProgress && (
          <span className="text-xs opacity-75">({progressText})</span>
        )}
      </button>

      <AnimatePresence>
        {showTutorialMenu && (
          <TutorialMenu
            onClose={() => setShowTutorialMenu(false)}
            onStartInteractiveTutorial={() => setShowTutorialMenu(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default TutorialButton;
