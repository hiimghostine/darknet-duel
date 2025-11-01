import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Play,
  Target,
  Clock,
  CheckCircle,
  Shield,
  Globe
} from 'lucide-react';
import type { TutorialScript } from '../../types/tutorial.types';
import { useTutorial } from '../../hooks/useTutorial';
import VideoTutorial from './VideoTutorial';
import CardEncyclopedia from './CardEncyclopedia';
import RealWorldCybersecurity from './RealWorldCybersecurity';
import MockGameBoard from './MockGameBoard';
import { tutorialScripts } from '../../data/tutorialScripts';
import { mockGameStateProvider } from '../../services/mockDataProvider';
import { tutorialLog } from '../../utils/tutorialLogger';

interface TutorialMenuProps {
  onClose?: () => void;
}

const TutorialMenu: React.FC<TutorialMenuProps> = ({ onClose }) => {
  const [showVideoTutorial, setShowVideoTutorial] = useState(false);
  const [showCardEncyclopedia, setShowCardEncyclopedia] = useState(false);
  const [showRealWorldCybersecurity, setShowRealWorldCybersecurity] = useState(false);
  
  // Tutorial execution state
  const [isInTutorial, setIsInTutorial] = useState(false);
  const [selectedScript, setSelectedScript] = useState<string | null>(null);
  const [tutorialRole, setTutorialRole] = useState<'attacker' | 'defender'>('attacker');
  
  const { 
    getAvailableScripts, 
    isScriptCompleted, 
    startTutorial,
    tutorialState,
    cancelTutorial
  } = useTutorial();

  const availableScripts = getAvailableScripts();

  const handleStartInteractiveTutorial = async (scriptId: string) => {
    if (scriptId === 'card_encyclopedia') {
      setShowCardEncyclopedia(true);
      return;
    }
    
    // Show Real-World Cybersecurity modal
    if (scriptId === 'real_world_cybersecurity') {
      setShowRealWorldCybersecurity(true);
      return;
    }
    
    // Reset mock game state
    mockGameStateProvider.reset();
    
    // Set tutorial role based on script (defender_basics gets defender role)
    const role = scriptId === 'defender_basics' ? 'defender' : 'attacker';
    setTutorialRole(role);
    setSelectedScript(scriptId);
    
    // Handle tutorial execution directly in the modal
    tutorialLog('🎯 Starting tutorial:', { scriptId, role });
    
    // Start the tutorial
    const success = await startTutorial(scriptId);
    if (success) {
      setIsInTutorial(true);
    }
  };

  // Handle tutorial exit
  const handleExitTutorial = () => {
    tutorialLog('🎯 Exiting tutorial');
    cancelTutorial();
    setIsInTutorial(false);
    setSelectedScript(null);
    mockGameStateProvider.reset();
  };

  const getScriptIcon = (scriptId: string) => {
    switch (scriptId) {
      case 'attacker_basics':
        return <Target className="text-primary" size={24} />;
      case 'defender_basics':
        return <Shield className="text-primary" size={24} />;
      case 'real_world_cybersecurity':
        return <Globe className="text-primary" size={24} />;
      default:
        return <BookOpen className="text-primary" size={24} />;
    }
  };

  const formatDuration = (minutes: number) => {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  };

  const getCompletionStatus = (script: TutorialScript) => {
    const isCompleted = isScriptCompleted(script.id);
    
    if (isCompleted) {
      return { status: 'completed', text: 'COMPLETED', color: 'text-success' };
    } else {
      return { status: 'not_started', text: 'NOT_STARTED', color: 'text-base-content/60' };
    }
  };

  // Matrix-style animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const modalVariants = {
    hidden: { 
      scale: 0.8,
      opacity: 0,
      rotateX: -15,
      y: 50
    },
    visible: { 
      scale: 1,
      opacity: 1,
      rotateX: 0,
      y: 0,
      transition: { 
        duration: 0.4,
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      scale: 0.9,
      opacity: 0,
      rotateX: 15,
      y: -30,
      transition: { 
        duration: 0.3
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.2,
        duration: 0.3
      }
    }
  };

  const modalContent = (
    <motion.div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClose}
    >
        {isInTutorial && selectedScript ? (
          // Tutorial execution view with MockGameBoard
          <div className="w-full h-full bg-base-100 text-base-content" onClick={(e) => e.stopPropagation()}>
            <MockGameBoard 
              isAttacker={tutorialRole === 'attacker'}
              tutorialScriptId={selectedScript}
              tutorialInfo={{
                scriptName: tutorialScripts.find(s => s.id === selectedScript)?.name || '',
                role: tutorialRole,
                stepIndex: tutorialState.stepIndex,
                totalSteps: tutorialState.currentScript?.steps.length || 0,
                onExit: handleExitTutorial
              }}
            />
          </div>
        ) : showVideoTutorial ? (
          <motion.div
            key="video"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <VideoTutorial
              videoSrc="/assets/videos/darknet-duel-tutorial.mp4"
              title="Darknet Duel - Video Tutorial"
              onClose={() => setShowVideoTutorial(false)}
              onComplete={() => {
                setShowVideoTutorial(false);
              }}
              autoPlay={true}
            />
          </motion.div>
        ) : (
          <motion.div 
            key="menu"
            className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm w-[60%] h-[60%]"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div 
              className="bg-base-200 border border-primary/20 relative h-full flex flex-col"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary/20 flex-shrink-0">
              <div className="flex items-center gap-3">
                <BookOpen className="text-primary" size={28} />
                <h2 className="text-2xl font-bold font-mono text-primary">TUTORIAL_CENTER</h2>
              </div>
              <button
                onClick={onClose}
                className="text-base-content/70 hover:text-primary transition-colors text-xl font-bold font-mono"
              >
                [X]
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 flex flex-col h-full">
              {/* Introduction */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold font-mono text-primary mb-3">TUTORIAL_OPTIONS</h3>
                <p className="text-base-content/80 font-mono text-base leading-relaxed">
                  Choose your learning path for Darknet Duel mastery. Master the art of cybersecurity warfare 
                  with our comprehensive tutorial system.
                </p>
              </div>

              {/* Video Tutorial Section */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold font-mono text-primary mb-4 flex items-center">
                  <Play className="mr-2 text-primary" size={20} style={{transform: 'translateY(-2px)'}} />
                  VIDEO_TUTORIAL
                </h4>
                <div className="border border-primary/30 bg-base-300/50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium font-mono text-primary mb-2">COMPLETE_GAME_OVERVIEW</h5>
                      <p className="text-base-content/70 text-sm mb-3 font-mono">
                        Watch a comprehensive video introduction to Darknet Duel's gameplay, 
                        mechanics, and strategies.
                      </p>
                      <div className="flex items-center text-sm text-base-content/60 font-mono">
                        <Clock size={16} className="mr-1" style={{transform: 'translateY(-2px)'}} />
                        <span>~5 minutes</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowVideoTutorial(true)}
                      className="btn btn-primary font-mono flex items-center gap-2"
                    >
                      <Play size={16} style={{transform: 'translateY(-2px)'}} />
                      <span>WATCH_VIDEO</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive Tutorials Section */}
              <div className="flex-1">
                <h4 className="text-lg font-semibold font-mono text-primary mb-4 flex items-center">
                  <Target className="mr-2 text-primary" size={20} style={{transform: 'translateY(-2px)'}} />
                  INTERACTIVE_TUTORIALS
                </h4>
                <div className="space-y-4 overflow-y-auto">
                  {availableScripts.map((script) => {
                    const completion = getCompletionStatus(script);
                    const isLocked = script.prerequisites && 
                      script.prerequisites.some(prereq => !isScriptCompleted(prereq));

                    return (
                      <div
                        key={script.id}
                        className={`border border-primary/30 bg-base-300/50 p-4 transition-all ${
                          isLocked 
                            ? 'opacity-60' 
                            : 'hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            {/* Icon */}
                            <div className="flex-shrink-0 mt-1">
                              {getScriptIcon(script.id)}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h5 className="font-semibold font-mono text-primary">{script.name.toUpperCase()}</h5>
                                {completion.status === 'completed' && (
                                  <CheckCircle className="text-success" size={16} style={{transform: 'translateY(-2px)'}} />
                                )}
                              </div>
                              
                              <p className="text-base-content/70 text-sm mb-3 font-mono">
                                {script.description}
                              </p>
                              
                              <div className="flex items-center gap-4 text-sm font-mono">
                                <div className="flex items-center text-base-content/60">
                                  <Clock size={14} className="mr-1" style={{transform: 'translateY(-2px)'}} />
                                  <span>{formatDuration(script.estimatedDuration)}</span>
                                </div>
                                
                                {script.id !== 'card_encyclopedia' && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-base-content/60">STATUS:</span>
                                    <span className={completion.color}>{completion.text}</span>
                                  </div>
                                )}
                                
                                {script.prerequisites && (
                                  <div className="flex items-center text-base-content/60">
                                    <span>REQUIRES: {script.prerequisites.join(', ').toUpperCase()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Button */}
                          <div className="flex-shrink-0 ml-4">
                            <button
                              onClick={() => handleStartInteractiveTutorial(script.id)}
                              disabled={isLocked}
                              className={`btn btn-sm font-mono flex items-center gap-2 ${
                                isLocked
                                  ? 'btn-disabled'
                                  : completion.status === 'completed'
                                  ? 'btn-success'
                                  : completion.status === 'in_progress'
                                  ? 'btn-warning'
                                  : 'btn-primary'
                              }`}
                            >
                              {completion.status === 'completed' ? (
                                <>
                                  <CheckCircle size={16} style={{transform: 'translateY(-3px)'}} />
                                  <span style={{transform: 'translateY(-1px)'}}>REPLAY</span>
                                </>
                              ) : completion.status === 'in_progress' ? (
                                <>
                                  <Play size={16} style={{transform: 'translateY(-3px)'}} />
                                  <span style={{transform: 'translateY(-1px)'}}>CONTINUE</span>
                                </>
                              ) : (
                                <>
                                  <Play size={16} style={{transform: 'translateY(-3px)'}} />
                                  <span style={{transform: 'translateY(-1px)'}}>START</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tips Section */}
              <div className="mt-6 border border-primary/30 bg-primary/10 p-4">
                <h4 className="text-lg font-semibold font-mono text-primary mb-2">💡 SYSTEM_TIPS</h4>
                <ul className="text-base-content/80 text-sm space-y-1 font-mono">
                  <li>• Start with BASIC_GAMEPLAY tutorial to learn fundamental mechanics</li>
                  <li>• Complete tutorials in order to unlock advanced content</li>
                  <li>• You can pause, skip steps, or restart tutorials at any time</li>
                  <li>• Your progress is automatically saved and can be resumed later</li>
                </ul>
              </div>
              </div>
            </div>
            </motion.div>
          </motion.div>
        )}
        
        {/* Card Encyclopedia Modal */}
        {showCardEncyclopedia && (
          <CardEncyclopedia onClose={() => setShowCardEncyclopedia(false)} />
        )}
        
        {/* Real-World Cybersecurity Modal */}
        {showRealWorldCybersecurity && (
          <RealWorldCybersecurity onClose={() => setShowRealWorldCybersecurity(false)} />
        )}
    </motion.div>
  );

  return createPortal(modalContent, document.body);
};

export default TutorialMenu;
