import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Play, BookOpen, Users, Zap, Brain, GraduationCap } from 'lucide-react';

// Import tutorial components
import MockGameBoard from '../components/tutorial/MockGameBoard';

// Import tutorial manager and scripts
import tutorialManager from '../services/tutorialManager';
import { tutorialScripts } from '../data/tutorialScripts';
import { mockGameStateProvider } from '../services/mockDataProvider';

// Import hooks
import { useTutorial } from '../hooks/useTutorial';
import { useThemeStore } from '../store/theme.store';

const TutorialPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme } = useThemeStore();
  
  // Tutorial state
  const [selectedScript, setSelectedScript] = useState<string | null>(null);
  const [isInTutorial, setIsInTutorial] = useState(false);
  const [tutorialRole, setTutorialRole] = useState<'attacker' | 'defender'>('attacker');
  
  const { tutorialState, startTutorial, cancelTutorial } = useTutorial();

  // Check URL params for auto-starting tutorial
  useEffect(() => {
    const scriptId = searchParams.get('script');
    const role = searchParams.get('role') as 'attacker' | 'defender';
    
    if (scriptId && tutorialScripts.find(s => s.id === scriptId)) {
      setSelectedScript(scriptId);
      if (role) {
        setTutorialRole(role);
      }
      handleStartTutorial(scriptId, role || 'attacker');
    }
  }, [searchParams]);

  // Handle tutorial start
  const handleStartTutorial = async (scriptId: string, role: 'attacker' | 'defender' = 'attacker') => {
    console.log('🎯 Starting tutorial:', { scriptId, role });
    
    // Reset mock game state
    mockGameStateProvider.reset();
    
    // Set tutorial role
    setTutorialRole(role);
    setSelectedScript(scriptId);
    
    // Start the tutorial
    const success = await startTutorial(scriptId);
    if (success) {
      setIsInTutorial(true);
      // Update URL
      setSearchParams({ script: scriptId, role });
    }
  };

  // Handle tutorial exit
  const handleExitTutorial = () => {
    console.log('🎯 Exiting tutorial');
    cancelTutorial();
    setIsInTutorial(false);
    setSelectedScript(null);
    mockGameStateProvider.reset();
    // Clear URL params
    setSearchParams({});
  };

  // Handle back to menu
  const handleBackToMenu = () => {
    navigate('/');
  };

  // Tutorial script icons
  const getScriptIcon = (scriptId: string) => {
    switch (scriptId) {
      case 'basic_gameplay':
        return <Play className="w-6 h-6" />;
      case 'defender_basics':
        return <Users className="w-6 h-6" />;
      case 'attacker_basics':
        return <Zap className="w-6 h-6" />;
      case 'card_encyclopedia':
        return <BookOpen className="w-6 h-6" />;
      case 'advanced_mechanics':
        return <Brain className="w-6 h-6" />;
      default:
        return <GraduationCap className="w-6 h-6" />;
    }
  };

  // If in tutorial, show the mock game board
  if (isInTutorial && selectedScript) {
    return (
      <div className="h-screen bg-base-100 text-base-content">
        {/* Mock game board with integrated tutorial header */}
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
    );
  }

  // Tutorial selection screen
  return (
    <div 
      className={`min-h-screen bg-base-100 text-base-content ${theme}`}
      data-theme={theme}
    >
      {/* Header */}
      <div className="bg-base-200 border-b border-primary/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToMenu}
              className="btn btn-ghost btn-sm gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Menu
            </button>
            
            <div className="divider divider-horizontal"></div>
            
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Interactive Tutorial</h1>
                <p className="text-base-content/70">Learn Darknet Duel with hands-on practice</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tutorial selection */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Introduction */}
        <div className="bg-base-200 border border-primary/20 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-primary/20 p-3 rounded-lg">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Welcome to Darknet Duel Training</h2>
              <p className="text-base-content/80 mb-4">
                Master the art of cybersecurity warfare through interactive tutorials. 
                Each tutorial provides hands-on experience with realistic game scenarios.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Interactive gameplay</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Step-by-step guidance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Progress tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tutorial scripts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutorialScripts.map((script) => {
            const isCompleted = tutorialManager.isScriptCompleted(script.id);
            const progress = tutorialManager.getScriptProgress(script.id);
            const isAvailable = tutorialManager.getAvailableScripts().some(s => s.id === script.id);
            
            return (
              <div
                key={script.id}
                className={`
                  bg-base-200 border rounded-xl p-6 transition-all duration-300
                  ${isAvailable 
                    ? 'border-primary/30 hover:border-primary/60 hover:shadow-lg cursor-pointer' 
                    : 'border-base-300 opacity-60 cursor-not-allowed'
                  }
                  ${isCompleted ? 'ring-2 ring-success/30' : ''}
                `}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`
                    p-3 rounded-lg
                    ${isCompleted 
                      ? 'bg-success/20 text-success' 
                      : isAvailable 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-base-300 text-base-content/50'
                    }
                  `}>
                    {getScriptIcon(script.id)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{script.name}</h3>
                    <p className="text-sm text-base-content/70 mb-2">{script.description}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="badge badge-outline badge-sm">
                        {script.estimatedDuration} min
                      </span>
                      {isCompleted && (
                        <span className="badge badge-success badge-sm">Completed</span>
                      )}
                      {progress && !isCompleted && (
                        <span className="badge badge-warning badge-sm">
                          In Progress ({progress.currentStep + 1}/{script.steps.length})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Prerequisites */}
                {script.prerequisites && script.prerequisites.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-base-content/60 mb-2">Prerequisites:</p>
                    <div className="flex flex-wrap gap-1">
                      {script.prerequisites.map(prereq => {
                        const prereqScript = tutorialScripts.find(s => s.id === prereq);
                        const prereqCompleted = tutorialManager.isScriptCompleted(prereq);
                        return (
                          <span
                            key={prereq}
                            className={`
                              badge badge-xs
                              ${prereqCompleted ? 'badge-success' : 'badge-error'}
                            `}
                          >
                            {prereqScript?.name || prereq}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                {isAvailable && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleStartTutorial(script.id, 'attacker')}
                        className="btn btn-primary btn-sm gap-1"
                      >
                        <Zap className="w-3 h-3" />
                        Attacker
                      </button>
                      <button
                        onClick={() => handleStartTutorial(script.id, 'defender')}
                        className="btn btn-secondary btn-sm gap-1"
                      >
                        <Users className="w-3 h-3" />
                        Defender
                      </button>
                    </div>
                    {progress && !isCompleted && (
                      <button
                        onClick={() => handleStartTutorial(script.id, tutorialRole)}
                        className="btn btn-outline btn-sm w-full gap-1"
                      >
                        <Play className="w-3 h-3" />
                        Resume Progress
                      </button>
                    )}
                  </div>
                )}

                {!isAvailable && (
                  <div className="text-center">
                    <p className="text-xs text-base-content/50">
                      Complete prerequisites to unlock
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tutorial tips */}
        <div className="mt-8 bg-info/10 border border-info/30 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-info" />
            Tutorial Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Getting Started</h4>
              <ul className="space-y-1 text-base-content/80">
                <li>• Start with "Basic Gameplay" if you're new</li>
                <li>• Choose your role: Attacker (Red) or Defender (Blue)</li>
                <li>• Follow the highlighted elements and instructions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Navigation</h4>
              <ul className="space-y-1 text-base-content/80">
                <li>• Use Next/Previous to navigate steps</li>
                <li>• Press ESC to cancel targeting</li>
                <li>• Click "Exit Tutorial" to return to menu</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialPage;
