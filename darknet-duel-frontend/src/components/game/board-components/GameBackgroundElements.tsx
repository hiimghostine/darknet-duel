import React from 'react';
import { useThemeStore } from '../../../store/theme.store';

interface GameBackgroundElementsProps {
  isAttacker: boolean;
}

const GameBackgroundElements: React.FC<GameBackgroundElementsProps> = ({ isAttacker }) => {
  const { theme } = useThemeStore();
  return (
    <>
      {/* Team-colored cyberpunk background grid */}
      <div 
        className={`absolute inset-0 pointer-events-none ${
          theme === 'cyberpunk' ? 'opacity-15' : 'opacity-5'
        } ${isAttacker ? 'bg-red-grid' : 'bg-blue-grid'}`}
        style={{
          backgroundImage: `
            linear-gradient(to right, ${isAttacker ? '#ef4444' : '#3b82f6'} 1px, transparent 1px),
            linear-gradient(to bottom, ${isAttacker ? '#ef4444' : '#3b82f6'} 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Team-colored decorative corner elements */}
      <div className={`absolute top-0 left-0 w-32 pointer-events-none ${
        theme === 'cyberpunk' ? 'h-1.5 opacity-50' : 'h-1 opacity-100'
      } ${
        isAttacker 
          ? 'bg-gradient-to-r from-red-500 to-transparent' 
          : 'bg-gradient-to-r from-blue-500 to-transparent'
      }`}></div>
      <div className={`absolute top-0 right-0 w-24 pointer-events-none ${
        theme === 'cyberpunk' ? 'h-1.5 opacity-50' : 'h-1 opacity-100'
      } ${
        isAttacker 
          ? 'bg-gradient-to-l from-red-500 to-transparent' 
          : 'bg-gradient-to-l from-blue-500 to-transparent'
      }`}></div>
      <div className={`absolute bottom-0 left-0 w-48 pointer-events-none ${
        theme === 'cyberpunk' ? 'h-1.5 opacity-50' : 'h-1 opacity-100'
      } ${
        isAttacker 
          ? 'bg-gradient-to-r from-red-500 to-transparent' 
          : 'bg-gradient-to-r from-blue-500 to-transparent'
      }`}></div>
      <div className={`absolute top-0 right-24 h-32 pointer-events-none ${
        theme === 'cyberpunk' ? 'w-1.5 opacity-50' : 'w-1 opacity-100'
      } ${
        isAttacker 
          ? 'bg-gradient-to-b from-red-500 to-transparent' 
          : 'bg-gradient-to-b from-blue-500 to-transparent'
      }`}></div>
      <div className={`absolute bottom-0 left-32 h-48 pointer-events-none ${
        theme === 'cyberpunk' ? 'w-1.5 opacity-50' : 'w-1 opacity-100'
      } ${
        isAttacker 
          ? 'bg-gradient-to-t from-red-500 to-transparent' 
          : 'bg-gradient-to-t from-blue-500 to-transparent'
      }`}></div>
    </>
  );
};

export default React.memo(GameBackgroundElements);