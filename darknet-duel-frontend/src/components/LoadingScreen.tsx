import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  text?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ text = 'SYSTEM INITIALIZING' }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  
  const statusMessages = [
    'ESTABLISHING CONNECTION',
    'AUTHENTICATING USER',
    'LOADING ENCRYPTION KEYS',
    'ACCESSING NETWORK',
    'INITIALIZING INTERFACE'
  ];

  // Animate loading progress
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Cycle through status messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatusIndex(prev => (prev + 1) % statusMessages.length);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-base-100"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated Grid background */}
      <motion.div 
        className="absolute inset-0 grid-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      
      {/* Enhanced Scanlines with motion */}
      <motion.div 
        className="absolute inset-0 scanline"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.7, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Dynamic decorative lines */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5 }}
      />
      <motion.div 
        className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay: 0.2 }}
      />
      <motion.div 
        className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-primary to-transparent"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.5, delay: 0.4 }}
      />
      <motion.div 
        className="absolute right-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-primary to-transparent"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.5, delay: 0.6 }}
      />
      
      {/* Enhanced Logo with glow effect */}
      <motion.div 
        className="relative mb-8"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <motion.div 
          className="absolute inset-0 rounded-full bg-primary/30 filter blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        />
        <motion.div 
          className="text-6xl font-bold font-mono text-primary text-flicker"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            duration: 1,
            type: "spring",
            stiffness: 100
          }}
          whileHover={{ scale: 1.1 }}
          style={{
            filter: 'drop-shadow(0 0 20px hsl(var(--p)))'
          }}
        >
          D
        </motion.div>
      </motion.div>
      
      {/* Enhanced Loading hexagon animation with multiple layers */}
      <motion.div 
        className="relative w-32 h-32 mb-6"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, delay: 1 }}
      >
        {/* Outer rotating hexagon */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{
            duration: 3,
            ease: "linear",
            repeat: Infinity
          }}
        >
          <div 
            className="w-24 h-24 border-4 border-primary/30"
            style={{
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
              filter: 'drop-shadow(0 0 10px hsl(var(--p) / 0.5))'
            }}
          />
        </motion.div>
        
        {/* Middle counter-rotating hexagon */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: -360 }}
          transition={{
            duration: 2,
            ease: "linear",
            repeat: Infinity
          }}
        >
          <div 
            className="w-16 h-16 border-4 border-primary/50"
            style={{
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
              filter: 'drop-shadow(0 0 8px hsl(var(--p) / 0.7))'
            }}
          />
        </motion.div>
        
        {/* Inner pulsing hexagon */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        >
          <div 
            className="w-8 h-8 bg-primary/70"
            style={{
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
              filter: 'drop-shadow(0 0 15px hsl(var(--p)))'
            }}
          />
        </motion.div>

        {/* Orbiting dots */}
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="absolute w-2 h-2 bg-primary rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transformOrigin: '0 0'
            }}
            animate={{
              rotate: 360,
              x: 40 * Math.cos((index * 2 * Math.PI) / 3),
              y: 40 * Math.sin((index * 2 * Math.PI) / 3)
            }}
            transition={{
              duration: 2 + index * 0.5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </motion.div>
      
      {/* Enhanced Loading text with typewriter effect */}
      <motion.div 
        className="text-center"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <motion.h2 
          className="text-xl font-mono text-primary mb-2"
          key={text}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            filter: 'drop-shadow(0 0 10px hsl(var(--p) / 0.8))'
          }}
        >
          {text}
        </motion.h2>
        
        {/* Animated loading dots */}
        <div className="flex justify-center gap-1">
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              className="w-2 h-2 bg-primary rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.2
              }}
            />
          ))}
        </div>
      </motion.div>
      
      {/* Enhanced Status section with progress bar */}
      <motion.div 
        className="absolute bottom-6 w-full max-w-md mx-auto px-4"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, delay: 1.4 }}
      >
        {/* Progress bar */}
        <motion.div 
          className="mb-4 bg-base-300 rounded-full h-2 overflow-hidden"
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "100%" }}
          transition={{ duration: 1, delay: 1 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(loadingProgress, 100)}%` }}
            transition={{ duration: 0.3 }}
            style={{
              boxShadow: '0 0 10px hsl(var(--p))'
            }}
          />
        </motion.div>

        {/* Status panel */}
        <motion.div 
          className="border border-primary/20 bg-base-200/50 p-3 backdrop-blur-sm rounded-lg"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="font-mono text-xs text-base-content/70 space-y-2">
            {/* Dynamic status message */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStatusIndex}
                className="text-center text-primary font-semibold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {statusMessages[currentStatusIndex]}
              </motion.div>
            </AnimatePresence>
            
            {/* System status indicators */}
            <div className="flex justify-between items-center">
              <motion.span 
                className="text-flicker"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                NETWORK: <span className="text-primary">CONNECTING</span>
              </motion.span>
              <motion.span 
                className="data-corrupt"
                animate={{ 
                  textShadow: [
                    '0 0 5px hsl(var(--p))',
                    '0 0 15px hsl(var(--p))',
                    '0 0 5px hsl(var(--p))'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                STATUS: <span className="text-primary">VALIDATING</span>
              </motion.span>
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                SECURITY: <span className="text-primary">ACTIVE</span>
              </motion.span>
            </div>
            
            {/* Progress percentage */}
            <motion.div 
              className="text-center text-primary font-bold"
              animate={{ 
                scale: [1, 1.05, 1],
                filter: [
                  'drop-shadow(0 0 5px hsl(var(--p)))',
                  'drop-shadow(0 0 15px hsl(var(--p)))',
                  'drop-shadow(0 0 5px hsl(var(--p)))'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {Math.round(loadingProgress)}%
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating particles effect */}
      {[...Array(6)].map((_, index) => (
        <motion.div
          key={index}
          className="absolute w-1 h-1 bg-primary/40 rounded-full"
          style={{
            left: `${20 + index * 12}%`,
            top: `${30 + (index % 2) * 40}%`
          }}
          animate={{
            y: [-20, -40, -20],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 3 + index * 0.5,
            repeat: Infinity,
            delay: index * 0.4
          }}
        />
      ))}
    </motion.div>
  );
};

export default LoadingScreen;
