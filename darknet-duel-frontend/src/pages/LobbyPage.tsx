import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LobbyBrowser from '../components/lobby/LobbyBrowser';
import CreateLobby from '../components/lobby/CreateLobby';
import LobbyDetail from '../components/lobby/LobbyDetail';
import LobbyChat from '../components/lobby/LobbyChat';
import AppBar from '../components/AppBar';
import { useAuthStore } from '../store/auth.store';
import LoadingScreen from '../components/LoadingScreen';
import LogoutScreen from '../components/LogoutScreen';
import { useThemeStore } from '../store/theme.store';
import axios from 'axios';

const GAME_SERVER_URL = import.meta.env.VITE_GAME_SERVER_URL || 'http://localhost:8001';

const LobbyPage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  const [serverOnline, setServerOnline] = useState<boolean | null>(null); // null = checking, true = online, false = offline
  
  // Check game server health
  const checkServerHealth = async () => {
    try {
      const response = await axios.get(`${GAME_SERVER_URL}/health`, { timeout: 3000 });
      setServerOnline(response.status === 200);
    } catch (error) {
      console.error('Game server health check failed:', error);
      setServerOnline(false);
    }
  };

  // Loading logic - show loading on every page visit
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Check server health on mount and periodically
  useEffect(() => {
    if (isAuthenticated) {
      // Check immediately
      checkServerHealth();
      
      // Then check every 10 seconds
      const interval = setInterval(checkServerHealth, 10000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      logout();
      navigate('/auth', { replace: true });
    }, 1500);
  };
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-base-100 relative overflow-hidden text-base-content">
      {/* Show loading screen when isLoading is true */}
      {isLoading && <LoadingScreen text="CONNECTING TO DARKNET SERVERS" />}
      
      {/* Wrapper to hide content during logout */}
      <div className={`${isLoggingOut ? 'hidden' : 'block'}`}>
        
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
        <div className={`relative z-10 transition-opacity duration-500 ${isLoading || isLoggingOut ? 'opacity-0' : 'opacity-100'} scanline`}>
          <AppBar 
            currentPage="lobbies"
            theme={theme}
            onThemeToggle={toggleTheme}
            onLogout={handleLogout}
          />

          <main className="container mx-auto p-4">
            {/* Compact banner with corner accents */}
            <div className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm mb-4">
              <div className="bg-base-200 border border-primary/20 px-4 py-2 relative">
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
                
                <div className="font-mono flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Real server status indicator */}
                    {serverOnline === null ? (
                      <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" title="Checking server status..."></div>
                    ) : serverOnline ? (
                      <div className="w-2 h-2 rounded-full bg-green-500 pulse-glow" title="Game server online"></div>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Game server offline"></div>
                    )}
                    <span className="text-sm text-primary font-bold">DARKNET_LOBBIES</span>
                    <span className="text-xs text-base-content/60">
                      • {user?.username?.toUpperCase() || 'USER'} AUTHENTICATED
                      {serverOnline !== null && (
                        <span className={serverOnline ? 'text-green-500' : 'text-red-500'}>
                          {' '}• SERVER {serverOnline ? 'ONLINE' : 'OFFLINE'}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="text-xs text-primary/60 font-mono">⚠️ ENCRYPTED</div>
                </div>
              </div>
            </div>
          
            {/* Content section - Use grid layout for side-by-side */}
            <Routes>
              <Route path="/" element={
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Main lobby browser - takes 2 columns */}
                  <div className="lg:col-span-2">
                    <LobbyBrowser />
                  </div>
                  
                  {/* Chat sidebar - takes 1 column, sticky on desktop */}
                  <div className="lg:col-span-1">
                    <div className="lg:sticky lg:top-4">
                      <LobbyChat chatId="global-lobby" className="" />
                    </div>
                  </div>
                </div>
              } />
              <Route path="/create" element={<CreateLobby />} />
              <Route path="/:matchID" element={<LobbyDetail />} />
            </Routes>
        </main>
        </div>
      </div>
      
      {/* Show logout screen */}
      {isLoggingOut && <LogoutScreen />}
    </div>
  );
};

export default LobbyPage;
