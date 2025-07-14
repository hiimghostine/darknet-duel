import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import logo from '../assets/logo.png';
import coverPhoto from '../assets/Cover Photo.png';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [theme, setTheme] = useState<'cyberpunk' | 'cyberpunk-dark'>('cyberpunk');
  
  useEffect(() => {
    // Get theme from localStorage on component mount
    const savedTheme = localStorage.getItem('theme') as 'cyberpunk' | 'cyberpunk-dark' || 'cyberpunk';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'cyberpunk' ? 'cyberpunk-dark' : 'cyberpunk';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className="min-h-screen bg-base-100 relative overflow-hidden">
      {/* Cyberpunk-style decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-1 bg-gradient-to-r from-primary to-transparent"></div>
        <div className="absolute top-0 right-0 w-1/4 h-1 bg-gradient-to-l from-primary to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1 bg-gradient-to-r from-primary to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-2/3 h-1 bg-gradient-to-l from-primary to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-1 h-16 bg-gradient-to-b from-primary to-transparent"></div>
        <div className="absolute top-0 right-1/3 w-1 h-24 bg-gradient-to-b from-primary to-transparent"></div>
        <div className="absolute top-20 left-10 opacity-10 text-9xl font-mono">01</div>
        <div className="absolute bottom-20 right-10 opacity-10 text-9xl font-mono">02</div>
      </div>

      {/* Header */}
      <header className="relative z-10">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <img src={logo} alt="Darknet Duel Logo" className="h-10 mr-3" />
            <div className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-content/80">
              DARKNET<span className="opacity-80">_DUEL</span>
            </div>
          </div>
          <button 
            onClick={toggleTheme} 
            className="btn btn-sm btn-outline border-primary text-primary hover:bg-primary hover:text-primary-content transition-all duration-300 ease-in-out group relative overflow-hidden"
            aria-label="Toggle theme"
          >
            {theme === 'cyberpunk' ? (
              <>
                <span className="relative z-10 flex items-center">
                  <span className="mr-2 inline-block w-3 h-3 rounded-full bg-blue-400 pulse-glow"></span>
                  GHOST_CORP
                </span>
              </>
            ) : (
              <>
                <span className="relative z-10 flex items-center">
                  <span className="mr-2 inline-block w-3 h-3 rounded-full bg-red-500 pulse-glow"></span>
                  PHOENIX_NET
                </span>
              </>
            )}
            <span className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-4 pt-8 pb-16">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Left column - content */}
          <div className="flex-1 text-left max-w-xl">
            <div className="inline-block px-3 py-1 mb-6 border border-primary text-xs font-mono text-primary">
              VERSION 0.0.1
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Enter the Digital<br />Combat Arena
              </span>
            </h1>
            <p className="text-base-content/80 text-lg mb-8 font-light max-w-md leading-relaxed">
              Connect to the network, customize your digital fighter, and compete in the ultimate cyberpunk hacking tournament where only the elite survive.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {!isAuthenticated ? (
                <>
                  <Link 
                    to="/auth" 
                    className="btn btn-primary px-8 relative overflow-hidden group"
                  >
                    <span className="relative z-10">ACCESS_NETWORK</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </Link>
                  <Link 
                    to="/auth?register=true" 
                    className="btn btn-outline border-primary text-primary hover:bg-primary hover:text-primary-content px-8"
                  >
                    CREATE_IDENTITY
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/dashboard" 
                    className="btn btn-primary px-8 relative overflow-hidden group"
                  >
                    <span className="relative z-10">DASHBOARD</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </Link>
                  <Link 
                    to="/lobby" 
                    className="btn btn-outline border-primary text-primary hover:bg-primary hover:text-primary-content px-8"
                  >
                    FIND_MATCH
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* Right column - image */}
          <div className="flex-1 relative">
            <div className="relative max-w-md mx-auto">
              <div className="absolute inset-0 border border-primary/30 rounded-md transform rotate-3"></div>
              <div className="absolute inset-0 border border-primary/20 rounded-md transform -rotate-2"></div>
              <img 
                src={coverPhoto} 
                alt="Cyberpunk Fighter" 
                className="relative z-10 rounded-md border border-primary shadow-lg shadow-primary/20"
              />
              <div className="absolute -bottom-4 -right-4 bg-base-200/90 backdrop-blur-sm p-3 border border-primary/50 rounded text-xs font-mono">
                <div className="text-primary mb-1">SYSTEM_STATUS</div>
                <div className="flex gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse"></span>
                  <span className="text-base-content/70">Network: Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-4 py-6 mt-auto">
        <div className="border-t border-base-content/10 pt-6 text-center text-xs text-base-content/50 font-mono">
          DARKNET_DUEL v0.0.1 • SYSTEM ACCESSED: {new Date().toLocaleDateString()}
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
