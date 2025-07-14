import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LobbyBrowser from '../components/lobby/LobbyBrowser';
import CreateLobby from '../components/lobby/CreateLobby';
import LobbyDetail from '../components/lobby/LobbyDetail';
import { useAuthStore } from '../store/auth.store';
import LoadingScreen from '../components/LoadingScreen';

const LobbyPage: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  
  // Add loading animation only for initial login transition
  useEffect(() => {
    // Check if this is first visit after login
    const isFirstVisit = sessionStorage.getItem('lobbies_visited') !== 'true';
    
    if (isFirstVisit && isAuthenticated) {
      // Set loading state to true only on first visit
      setIsLoading(true);
      // Mark that user has visited lobbies
      sessionStorage.setItem('lobbies_visited', 'true');
      // Clear loading after animation
      const timer = setTimeout(() => setIsLoading(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-base-100 relative overflow-hidden text-base-content flex flex-col">
      {/* Wrapper to hide content during loading */}
      <div className={`${isLoading ? 'hidden' : 'block'}`}>
        
        {/* Background grid and decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Grid lines */}
          <div className="absolute inset-0 grid-bg"></div>
          
          {/* Scanline effect overlay */}
          <div className="absolute inset-0 scanlines pointer-events-none"></div>
          
          {/* Decorative lines */}
          <div className="absolute top-0 left-0 w-1/3 h-1 bg-gradient-to-r from-primary to-transparent"></div>
          <div className="absolute top-0 right-0 w-1/4 h-1 bg-gradient-to-l from-primary to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1 bg-gradient-to-r from-primary to-transparent"></div>
          <div className="absolute top-0 right-1/4 w-1 h-32 bg-gradient-to-b from-primary to-transparent"></div>
          <div className="absolute bottom-0 left-1/3 w-1 h-48 bg-gradient-to-t from-primary to-transparent"></div>
          
          {/* Tech-inspired typography */}
          <div className="absolute top-40 left-10 opacity-5 text-9xl font-mono text-primary">101</div>
          <div className="absolute bottom-40 right-10 opacity-5 text-9xl font-mono text-primary">010</div>
          <div className="absolute top-1/4 right-20 opacity-5 text-7xl font-mono text-primary rotate-12">DUEL</div>
        </div>

        {/* Main content */}
        <main className="relative z-10 flex flex-col flex-grow">
          {/* Header with glow effect */}
          <header className="py-6 px-8 border-b border-primary/30 relative">
            <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-focus text-flicker mb-1">DARKNET LOBBIES</h1>
                <div className="h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent mb-2"></div>
                <div className="text-base-content/70 font-mono text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 pulse-glow"></div>
                  <span>SECURE CONNECTION ESTABLISHED // {user?.username?.toUpperCase() || 'USER'} AUTHENTICATED</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 self-end">
                <div className="text-xs text-base-content/50 font-mono text-right">
                  <div>STATUS: ONLINE</div>
                  <div>PING: 23ms</div>
                </div>
              </div>
            </div>
          </header>
          
          {/* Content section - full width */}
          <div className="p-8 flex-grow">
            <div className="max-w-[1920px] mx-auto">
              <Routes>
                <Route path="/" element={<LobbyBrowser />} />
                <Route path="/create" element={<CreateLobby />} />
                <Route path="/:matchID" element={<LobbyDetail />} />
              </Routes>
            </div>
          </div>
          
          {/* Footer */}
          <footer className="p-4 border-t border-primary/20 text-center mt-auto">
            <div className="text-base-content/60 text-xs font-mono">
              DARKNET_DUEL LOBBY v0.0.1 • {new Date().toISOString().split('T')[0]} • 
              <span className="text-primary ml-1 text-flicker">NETWORK: SECURE</span>
            </div>
          </footer>
        </main>
      </div>
      
      {/* Show loading animation */}
      {isLoading && <LoadingScreen text="CONNECTING TO DARKNET SERVERS" />}
    </div>
  );
};

export default LobbyPage;
