import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CardAttackAnimationProps {
  isActive: boolean;
  attackingCardId: string | null;
  targetInfraId: string | null;
  attackingCardElement: HTMLElement | null;
  targetInfraElement: HTMLElement | null;
  onAnimationComplete: () => void;
  onStateChangeReady: () => void;
}

interface NetProjectileProps {
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  onComplete: () => void;
}

const NetProjectile: React.FC<NetProjectileProps> = ({ startPosition, endPosition, onComplete }) => {
  const distance = Math.sqrt(
    Math.pow(endPosition.x - startPosition.x, 2) + 
    Math.pow(endPosition.y - startPosition.y, 2)
  );
  
  // Calculate physics-based trajectory with gravity
  const midX = (startPosition.x + endPosition.x) / 2;
  const midY = Math.min(startPosition.y, endPosition.y) - distance * 0.3; // Arc height based on distance
  
  return (
    <motion.div
      className="fixed pointer-events-none z-[10000]"
      style={{
        left: startPosition.x,
        top: startPosition.y,
      }}
      initial={{ 
        x: 0, 
        y: 0,
        scale: 0.5,
        opacity: 0
      }}
      animate={{
        x: [0, midX - startPosition.x, endPosition.x - startPosition.x],
        y: [0, midY - startPosition.y, endPosition.y - startPosition.y],
        scale: [0.5, 1.2, 0.8],
        opacity: [0, 1, 1],
        rotate: [0, 180, 360]
      }}
      transition={{
        duration: 1.2,
        times: [0, 0.5, 1],
        ease: "easeInOut"
      }}
      onAnimationComplete={onComplete}
    >
      {/* Net/Web SVG Animation */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        <motion.svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          className="text-red-500"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Net pattern */}
          <defs>
            <pattern id="netPattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M0,0 L8,8 M8,0 L0,8" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
            </pattern>
          </defs>
          
          {/* Main net circle */}
          <motion.circle
            cx="32"
            cy="32"
            r="28"
            fill="url(#netPattern)"
            stroke="currentColor"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
          
          {/* Outer glow effect */}
          <motion.circle
            cx="32"
            cy="32"
            r="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.3"
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
          
          {/* Center targeting dot */}
          <motion.circle
            cx="32"
            cy="32"
            r="3"
            fill="currentColor"
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
        </motion.svg>
        
        {/* Particle effects around the net */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-red-400 rounded-full"
            style={{
              left: `${50 + 30 * Math.cos((i * Math.PI * 2) / 6)}%`,
              top: `${50 + 30 * Math.sin((i * Math.PI * 2) / 6)}%`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 0.6,
              delay: i * 0.1,
              repeat: Infinity,
              repeatDelay: 0.8
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

const CardAttackAnimation: React.FC<CardAttackAnimationProps> = ({
  isActive,
  attackingCardId,
  targetInfraId,
  attackingCardElement,
  targetInfraElement,
  onAnimationComplete,
  onStateChangeReady
}) => {
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'cardDisappear' | 'netFlight' | 'complete'>('idle');
  const [positions, setPositions] = useState<{
    start: { x: number; y: number } | null;
    end: { x: number; y: number } | null;
  }>({ start: null, end: null });

  const animationRef = useRef<HTMLDivElement>(null);

  // Calculate positions when animation becomes active
  useEffect(() => {
    if (isActive && attackingCardElement && targetInfraElement && animationPhase === 'idle') {
      const cardRect = attackingCardElement.getBoundingClientRect();
      const infraRect = targetInfraElement.getBoundingClientRect();
      
      setPositions({
        start: {
          x: cardRect.left + cardRect.width / 2,
          y: cardRect.top + cardRect.height / 2
        },
        end: {
          x: infraRect.left + infraRect.width / 2,
          y: infraRect.top + infraRect.height / 2
        }
      });
      
      // Start the animation sequence
      setAnimationPhase('cardDisappear');
    }
  }, [isActive, attackingCardElement, targetInfraElement, animationPhase]);

  // Handle animation phase transitions
  useEffect(() => {
    if (animationPhase === 'cardDisappear') {
      // Card disappears first
      const timer = setTimeout(() => {
        setAnimationPhase('netFlight');
      }, 500); // Card disappear duration
      
      return () => clearTimeout(timer);
    }
  }, [animationPhase]);

  const handleNetComplete = () => {
    // Trigger state change when net reaches target
    onStateChangeReady();
    
    // Complete animation after a brief delay
    setTimeout(() => {
      setAnimationPhase('complete');
      onAnimationComplete();
    }, 300);
  };

  // Reset animation when not active
  useEffect(() => {
    if (!isActive) {
      setAnimationPhase('idle');
      setPositions({ start: null, end: null });
    }
  }, [isActive]);

  if (!isActive || !positions.start || !positions.end) {
    return null;
  }

  return (
    <div ref={animationRef} className="fixed inset-0 pointer-events-none z-[9999]">
      <AnimatePresence>
        {/* Card Disappear Effect */}
        {animationPhase === 'cardDisappear' && attackingCardElement && (
          <motion.div
            className="fixed pointer-events-none z-[10000]"
            style={{
              left: positions.start.x - 50,
              top: positions.start.y - 70,
              width: 100,
              height: 140,
            }}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ 
              opacity: 0, 
              scale: 0.3,
              y: -20
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {/* Disappearing card visual effect */}
            <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-800 rounded-lg border-2 border-red-400 shadow-lg flex items-center justify-center">
              <motion.div
                className="text-white text-2xl"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.5, 0] }}
                transition={{ duration: 0.5 }}
              >
                💥
              </motion.div>
            </div>
            
            {/* Particle burst effect */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-red-400 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: 40 * Math.cos((i * Math.PI * 2) / 8),
                  y: 40 * Math.sin((i * Math.PI * 2) / 8),
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        )}

        {/* Net Projectile Animation */}
        {animationPhase === 'netFlight' && (
          <NetProjectile
            startPosition={positions.start}
            endPosition={positions.end}
            onComplete={handleNetComplete}
          />
        )}

        {/* Target Impact Effect */}
        {animationPhase === 'complete' && (
          <motion.div
            className="fixed pointer-events-none z-[10000]"
            style={{
              left: positions.end.x - 40,
              top: positions.end.y - 40,
              width: 80,
              height: 80,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.5, 1],
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Impact ripple effect */}
            <div className="relative w-full h-full">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 border-2 border-red-500 rounded-full"
                  initial={{ scale: 0, opacity: 0.8 }}
                  animate={{ 
                    scale: [0, 2, 3],
                    opacity: [0.8, 0.4, 0]
                  }}
                  transition={{ 
                    duration: 1,
                    delay: i * 0.2,
                    ease: "easeOut"
                  }}
                />
              ))}
              
              {/* Central impact flash */}
              <motion.div
                className="absolute inset-0 bg-red-500 rounded-full"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [0, 0.8, 0]
                }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CardAttackAnimation;
