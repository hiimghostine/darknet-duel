import React from 'react';

interface GameBackgroundElementsProps {
  isAttacker: boolean;
}

const GameBackgroundElements: React.FC<GameBackgroundElementsProps> = ({ isAttacker }) => {
  return (
    <>
      {/* Team-colored cyberpunk background grid */}
      <div 
        className={`absolute inset-0 pointer-events-none opacity-5 ${
          isAttacker ? 'bg-red-grid' : 'bg-blue-grid'
        }`}
        style={{
          backgroundImage: `
            linear-gradient(to right, ${isAttacker ? '#ef4444' : '#3b82f6'} 1px, transparent 1px),
            linear-gradient(to bottom, ${isAttacker ? '#ef4444' : '#3b82f6'} 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Team-colored decorative corner elements */}
      <div className={`absolute top-0 left-0 w-32 h-1 pointer-events-none ${
        isAttacker 
          ? 'bg-gradient-to-r from-red-500 to-transparent' 
          : 'bg-gradient-to-r from-blue-500 to-transparent'
      }`}></div>
      <div className={`absolute top-0 right-0 w-24 h-1 pointer-events-none ${
        isAttacker 
          ? 'bg-gradient-to-l from-red-500 to-transparent' 
          : 'bg-gradient-to-l from-blue-500 to-transparent'
      }`}></div>
      <div className={`absolute bottom-0 left-0 w-48 h-1 pointer-events-none ${
        isAttacker 
          ? 'bg-gradient-to-r from-red-500 to-transparent' 
          : 'bg-gradient-to-r from-blue-500 to-transparent'
      }`}></div>
      <div className={`absolute top-0 right-24 w-1 h-32 pointer-events-none ${
        isAttacker 
          ? 'bg-gradient-to-b from-red-500 to-transparent' 
          : 'bg-gradient-to-b from-blue-500 to-transparent'
      }`}></div>
      <div className={`absolute bottom-0 left-32 w-1 h-48 pointer-events-none ${
        isAttacker 
          ? 'bg-gradient-to-t from-red-500 to-transparent' 
          : 'bg-gradient-to-t from-blue-500 to-transparent'
      }`}></div>
    </>
  );
};

export default React.memo(GameBackgroundElements);