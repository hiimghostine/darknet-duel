import React from 'react';
import { useAuthStore } from '../store/auth.store';
import { Navigate } from 'react-router-dom';
import GameClient from '../components/game/GameClient';

const GamePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="game-page">
      <GameClient />
    </div>
  );
};

export default GamePage;
