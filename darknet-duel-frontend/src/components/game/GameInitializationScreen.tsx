import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameInitializationScreenProps {
  matchID?: string;
  playerRole?: 'attacker' | 'defender';
}

interface LoadingPhase {
  id: string;
  title: string;
  description: string;
  progress: number;
  duration: number;
  systemMessages: string[];
}

const GameInitializationScreen: React.FC<GameInitializationScreenProps> = ({ 
  matchID = 'UNKNOWN',
  playerRole = 'attacker' 
}) => {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);

  const loadingPhases: LoadingPhase[] = [
    {
      id: 'server_init',
      title: 'INITIALIZING GAME SERVER',
      description: 'Establishing secure connection to Darknet infrastructure',
      progress: 15,
      duration: 800,
      systemMessages: [
        `> Connecting to match ${matchID.substring(0, 8)}...`,
        '> Validating player credentials...',
        '> Server handshake complete',
        '> Game server online'
      ]
    },
    {
      id: 'card_loading',
      title: 'LOADING CARD DATABASES',
      description: 'Compiling exploit libraries and defense protocols',
      progress: 35,
      duration: 700,
      systemMessages: [
        '> Loading attacker card collection...',
        '> Found 70 attack vectors in database',
        '> Loading defender card collection...',
        '> Found 66 defensive protocols',
        '> Shuffling decks with entropy generator'
      ]
    },
    {
      id: 'infrastructure',
      title: 'DEPLOYING INFRASTRUCTURE',
      description: 'Setting up network topology and target systems',
      progress: 55,
      duration: 600,
      systemMessages: [
        '> Initializing Enterprise Firewall...',
        '> Deploying Corporate Website...',
        '> Setting up Main Database Cluster...',
        '> Configuring Employee Workstations...',
        '> Activating Financial System...',
        '> Infrastructure deployment complete'
      ]
    },
    {
      id: 'player_setup',
      title: 'CONFIGURING PLAYER ROLES',
      description: 'Assigning roles and distributing starting resources',
      progress: 75,
      duration: 500,
      systemMessages: [
        `> Assigning role: ${playerRole.toUpperCase()}`,
        '> Distributing starting resources: 5 units',
        '> Setting action points: 2 AP',
        '> Drawing starting hand: 5 cards',
        '> Player initialization complete'
      ]
    },
    {
      id: 'game_state',
      title: 'FINALIZING GAME STATE',
      description: 'Synchronizing all systems and preparing battlefield',
      progress: 95,
      duration: 400,
      systemMessages: [
        '> Synchronizing game state...',
        '> Validating game configuration...',
        '> Setting turn order: Attacker first',
        '> All systems operational',
        '> Ready for combat'
      ]
    }
  ];

  // Progress animation
  useEffect(() => {
    const currentPhase = loadingPhases[currentPhaseIndex];
    if (!currentPhase) return;

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const targetProgress = currentPhase.progress;
        const increment = (targetProgress - (currentPhaseIndex > 0 ? loadingPhases[currentPhaseIndex - 1].progress : 0)) / 20;
        
        if (prev >= targetProgress) {
          clearInterval(progressInterval);
          
          // Move to next phase after a brief delay
          setTimeout(() => {
            if (currentPhaseIndex < loadingPhases.length - 1) {
              setCurrentPhaseIndex(prev => prev + 1);
              setCurrentMessageIndex(0);
            }
          }, 300);
          
          return targetProgress;
        }
        
        return prev + increment;
      });
    }, currentPhase.duration / 20);

    return () => clearInterval(progressInterval);
  }, [currentPhaseIndex]);

  // Terminal message animation
  useEffect(() => {
    const currentPhase = loadingPhases[currentPhaseIndex];
    if (!currentPhase) return;

    const messageInterval = setInterval(() => {
      if (currentMessageIndex < currentPhase.systemMessages.length) {
        const newMessage = currentPhase.systemMessages[currentMessageIndex];
        setTerminalLines(prev => [...prev.slice(-8), newMessage]); // Keep last 9 lines
        setCurrentMessageIndex(prev => prev + 1);
      } else {
        clearInterval(messageInterval);
      }
    }, currentPhase.duration / currentPhase.systemMessages.length);

    return () => clearInterval(messageInterval);
  }, [currentPhaseIndex, currentMessageIndex]);

  const currentPhase = loadingPhases[currentPhaseIndex];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-base-100"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated background */}
      <motion.div 
        className="absolute inset-0 grid-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      
      <motion.div 
        className="absolute inset-0 scanline"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Header Section */}
      <motion.div 
        className="text-center mb-8"
        variants={itemVariants}
      >
        <motion.div 
          className="text-4xl font-bold font-mono text-primary mb-2"
          animate={{ 
            textShadow: [
              '0 0 10px hsl(var(--p))',
              '0 0 20px hsl(var(--p))',
              '0 0 10px hsl(var(--p))'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          DARKNET DUEL
        </motion.div>
        <div className="text-sm font-mono text-base-content/70 uppercase tracking-wider">
          Battle Station Initialization
        </div>
        <div className="text-xs font-mono text-primary/80 mt-1">
          Match ID: {matchID.substring(0, 12)}...
        </div>
      </motion.div>

      {/* Main Loading Interface */}
      <motion.div 
        className="w-full max-w-4xl mx-auto px-6"
        variants={itemVariants}
      >
        {/* Phase Header */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase?.id}
            className="text-center mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-xl font-mono text-primary font-bold uppercase tracking-wide">
              {currentPhase?.title}
            </div>
            <div className="text-sm text-base-content/70 mt-1">
              {currentPhase?.description}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress Bar Section */}
        <motion.div 
          className="mb-8"
          variants={itemVariants}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-base-content/70">PROGRESS</span>
            <span className="text-xs font-mono text-primary font-bold">
              {Math.round(progress)}%
            </span>
          </div>
          
          <div className="relative h-4 bg-base-300 border border-primary/30 overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                boxShadow: '0 0 15px hsl(var(--p) / 0.8)'
              }}
            />
            
            {/* Scanning line effect */}
            <motion.div
              className="absolute top-0 w-1 h-full bg-white/80"
              animate={{ 
                left: ['0%', '100%'],
                opacity: [0, 1, 1, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>

          {/* Phase indicators */}
          <div className="flex justify-between mt-3">
            {loadingPhases.map((phase, index) => (
              <motion.div
                key={phase.id}
                className={`w-2 h-2 rounded-full border transition-all duration-300 ${
                  index <= currentPhaseIndex 
                    ? 'bg-primary border-primary shadow-lg' 
                    : 'bg-transparent border-base-content/30'
                }`}
                animate={index === currentPhaseIndex ? {
                  scale: [1, 1.3, 1],
                  boxShadow: [
                    '0 0 5px hsl(var(--p))',
                    '0 0 15px hsl(var(--p))',
                    '0 0 5px hsl(var(--p))'
                  ]
                } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />
            ))}
          </div>
        </motion.div>

        {/* Terminal Output */}
        <motion.div 
          className="bg-base-200/80 border border-primary/30 backdrop-blur-sm p-4 rounded-lg"
          variants={itemVariants}
        >
          <div className="flex items-center mb-3">
            <div className="flex gap-1 mr-3">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
            <div className="text-xs font-mono text-base-content/70">
              SYSTEM TERMINAL
            </div>
          </div>
          
          <div className="font-mono text-xs space-y-1 h-32 overflow-hidden">
            <AnimatePresence>
              {terminalLines.map((line, index) => (
                <motion.div
                  key={`${currentPhaseIndex}-${index}`}
                  className="text-green-400"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {line}
                  <motion.span
                    className="inline-block w-2 h-3 bg-green-400 ml-1"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Role and Status */}
        <motion.div 
          className="mt-6 flex justify-between items-center"
          variants={itemVariants}
        >
          <div className="text-xs font-mono">
            <span className="text-base-content/70">ROLE: </span>
            <span className={`font-bold uppercase ${
              playerRole === 'attacker' ? 'text-red-400' : 'text-blue-400'
            }`}>
              {playerRole}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 bg-primary rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-xs font-mono text-primary">SYSTEMS ONLINE</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating data particles */}
      {[...Array(8)].map((_, index) => (
        <motion.div
          key={index}
          className="absolute w-1 h-1 bg-primary/60 rounded-full"
          style={{
            left: `${10 + index * 10}%`,
            top: `${20 + (index % 3) * 20}%`
          }}
          animate={{
            y: [-10, -30, -10],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 4 + index * 0.5,
            repeat: Infinity,
            delay: index * 0.3
          }}
        />
      ))}
    </motion.div>
  );
};

export default GameInitializationScreen; 