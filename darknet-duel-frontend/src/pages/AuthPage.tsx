import React, { useState, useEffect } from 'react';
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useAudioManager } from '../hooks/useAudioManager';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import LoadingScreen from '../components/LoadingScreen';
import logo from '../assets/logo.png';

const AuthPage: React.FC = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { triggerClick } = useAudioManager();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Check if the register parameter is present in URL to show register form
  useEffect(() => {
    const register = searchParams.get('register');
    if (register === 'true') {
      setShowRegister(true);
    }
  }, [searchParams]);

  // Check authentication status and trigger transition when authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading && !showTransition) {
      setShowTransition(true);
      // Delay navigation to allow loading animation to complete fully
    }
  }, [isAuthenticated, isLoading, showTransition]);
  
  // Handle delayed navigation after transition is shown
  useEffect(() => {
    let navigationTimer: NodeJS.Timeout;
    if (showTransition && user) {
      navigationTimer = setTimeout(() => {
        // Redirect admins to admin panel, others to dashboard
        const redirectTo = user.type === 'admin' ? '/admin' : '/dashboard';
        navigate(redirectTo, { replace: true });
      }, 3000); // 3 seconds delay to match the dashboard loading time
    }
    return () => clearTimeout(navigationTimer);
  }, [showTransition, navigate, user]);

  // Toggle between login and register forms
  const toggleForm = () => {
    triggerClick();
    setShowRegister(prev => !prev);
  };

  // If user is already authenticated but we're not showing the transition,
  // we'll immediately redirect (this handles refreshes and direct navigation)
  if (isAuthenticated && !isLoading && !showTransition && user) {
    const redirectTo = user.type === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  // Apply transition classes when showing/hiding content
  const contentClasses = showTransition ? "opacity-0 pointer-events-none" : "opacity-100";

  return (
    <div className="min-h-screen bg-base-100 relative overflow-hidden flex items-center justify-center py-6">
      {/* Page transition effect with our custom LoadingScreen */}
      {showTransition && <LoadingScreen text="ACCESSING NETWORK" />}

      {/* Cyberpunk-style decorative elements */}
      <div className={`absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-300 ${contentClasses}`}>
        {/* Grid lines */}
        <div className="absolute inset-0 grid-bg"></div>
        
        {/* Decorative borders */}
        <div className="absolute top-0 left-0 w-1/2 h-1 bg-gradient-to-r from-primary to-transparent"></div>
        <div className="absolute top-0 right-0 w-1/4 h-1 bg-gradient-to-l from-primary to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1 bg-gradient-to-r from-primary to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-2/3 h-1 bg-gradient-to-l from-primary to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-1 h-16 bg-gradient-to-b from-primary to-transparent"></div>
        <div className="absolute top-0 right-1/3 w-1 h-24 bg-gradient-to-b from-primary to-transparent"></div>
        
        {/* Tech-inspired typography */}
        <div className="absolute top-20 left-10 opacity-5 text-9xl font-mono">{showRegister ? 'NEW' : '001'}</div>
        <div className="absolute bottom-20 right-10 opacity-5 text-9xl font-mono">{showRegister ? 'USR' : '010'}</div>
        {showRegister ? (
          <div className="absolute top-40 right-20 opacity-5 text-7xl font-mono rotate-90">REG</div>
        ) : (
          <div className="absolute bottom-10 left-1/3 opacity-5 text-7xl font-mono rotate-90">SEC</div>
        )}
      </div>

      {/* Auth form container */}
      <div className={`relative z-10 w-full max-w-md p-1 mx-4 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm transition-opacity duration-300 ${contentClasses}`}>
        <div className="relative bg-base-200 border border-primary/20 p-4 sm:p-6">
          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-primary"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-primary"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary"></div>
          
          {/* Header */}
          <div className="flex justify-center mb-8">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <img src={logo} alt="Darknet Duel Logo" className="h-12" />
              </div>
              <h2 className="font-mono text-xl mb-1 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                {showRegister ? 'CREATE_NEW_IDENTITY' : 'NETWORK_ACCESS'}
              </h2>
              <div className="text-xs text-base-content/60 font-mono">
                {showRegister ? 'ADMIN CLEARANCE REQUIRED' : 'SECURITY LEVEL: HIGH'}
              </div>
            </div>
          </div>
          
          {/* Terminal-style status message */}
          <div className="mb-6 font-mono text-xs text-base-content/70 border border-primary/20 bg-base-300/50 p-2">
            <div className="flex">
              <span className="text-primary mr-2">&gt;</span>
              <span className="typing-animation">
                {showRegister ? 'Initializing identity creation protocol...' : 'Establishing secure connection...'}
              </span>
            </div>
            <div className="flex">
              <span className="text-primary mr-2">&gt;</span>
              <span>
                {showRegister ? 'Complete form to provision new network access.' : 'Please authenticate to continue.'}
              </span>
            </div>
          </div>

          {/* Form components */}
          <div className="auth-form-wrapper">
            {showRegister ? (
              <RegisterForm onToggleForm={toggleForm} />
            ) : (
              <LoginForm onToggleForm={toggleForm} />
            )}
          </div>
        </div>
      </div>

      {/* Version info */}
      <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center transition-opacity duration-300 ${contentClasses}`}>
        <div className="text-base-content/40 text-xs font-mono">
          DARKNET_DUEL v0.0.1 • {new Date().toISOString().split('T')[0]}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
