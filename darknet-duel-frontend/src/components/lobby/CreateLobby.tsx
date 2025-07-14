import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lobbyService } from '../../services/lobby.service';
import { useAuthStore } from '../../store/auth.store';
import { FaNetworkWired, FaShieldAlt, FaUserSecret, FaExclamationTriangle } from 'react-icons/fa';

const CreateLobby: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Remove role selection as roles will be auto-assigned in the lobby
  // Only standard mode is currently available
  // No need for game settings state variables as we're only using standard mode
  const handleCreateLobby = async () => {
    if (!user) {
      setError('You must be logged in to create a lobby');
      return;
    }
    
    setIsCreating(true);
    setError(null);
    
    try {
      // Using standard mode settings only
      interface GameSettings {
        gameMode: string;
      }
      
      const settings: GameSettings = {
        gameMode: 'standard'
      };
      
      const matchID = await lobbyService.createMatch(2, settings);
      
      if (!matchID) {
        throw new Error('Failed to create lobby');
      }
      
      // Join the created match - auto-assign role with real user data
      console.log('🔍 TRACING: CreateLobby joining with user data:');
      console.log('   - user.id:', user.id);
      console.log('   - user.username:', user.username);
      
      const result = await lobbyService.joinMatch(
        matchID,
        user.username,
        '0', // Host is always player 0
        {
          data: {
            realUserId: user.id,        // ✅ Pass UUID directly
            realUsername: user.username // ✅ Pass username directly
          }
        }
      );
      
      if (result) {
        navigate(`/lobbies/${matchID}`);
      } else {
        throw new Error('Failed to join created lobby');
      }
    } catch (err) {
      console.error('Error creating lobby:', err);
      setError('Failed to create lobby. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleCancel = () => {
    // Already correct path, just ensuring consistency
    navigate('/lobbies');
  };

  return (
    <>
      {/* Decorative elements for this specific page */}
      <div className="relative z-0 pointer-events-none">
        <div className="absolute top-10 left-0 w-1/3 h-1 bg-gradient-to-r from-primary to-transparent"></div>
        <div className="absolute bottom-10 right-0 w-1/4 h-1 bg-gradient-to-l from-primary to-transparent"></div>
        <div className="absolute top-40 right-10 opacity-5 text-7xl font-mono text-primary">01</div>
        <div className="absolute bottom-20 left-20 opacity-5 text-8xl font-mono text-primary">10</div>
      </div>
      
      <div className="border border-primary/30 rounded bg-base-800/50 backdrop-filter backdrop-blur-sm shadow-lg shadow-primary/10 p-6 relative">
      {/* Decorative elements */}
      <div className="absolute -top-2 -left-2 w-20 h-20 border-t-2 border-l-2 border-primary opacity-60"></div>
      <div className="absolute -bottom-2 -right-2 w-20 h-20 border-b-2 border-r-2 border-primary opacity-60"></div>
      
      <h2 className="text-3xl font-mono text-primary mb-6 glitch-text">CREATE NEW LOBBY</h2>
      
      {error && (
        <div className="mb-6 border border-error/50 bg-error/20 text-error px-4 py-3 rounded-md flex items-center">
          <FaExclamationTriangle className="mr-2 animate-pulse" />
          <p className="font-mono text-sm">{error}</p>
        </div>
      )}
      
      <div className="mb-8">
        <div className="flex items-center mb-3">
          <FaNetworkWired className="text-primary mr-2" />
          <h3 className="text-xl font-mono text-primary">OPERATION MODE</h3>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-4"></div>
        
        <div className="grid md:grid-cols-3 gap-3 mt-4">
          <button 
            type="button"
            className="p-4 border border-primary bg-base-900/80 hover:bg-primary/20 transition-all duration-300 text-primary font-mono rounded group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary"></div>
            <span className="text-base font-bold block">STANDARD</span>
            <span className="text-xs text-primary-300">[ ACTIVE ]</span>
          </button>
          
          <button 
            type="button"
            className="p-4 border border-gray-500/30 bg-base-900/60 text-gray-500 font-mono rounded opacity-60 cursor-not-allowed relative"
            disabled
          >
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gray-500/50"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gray-500/50"></div>
            <span className="text-base font-bold block">BLITZ</span>
            <span className="text-xs">[ COMING SOON ]</span>
          </button>
          
          <button 
            type="button"
            className="p-4 border border-gray-500/30 bg-base-900/60 text-gray-500 font-mono rounded opacity-60 cursor-not-allowed relative"
            disabled
          >
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gray-500/50"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gray-500/50"></div>
            <span className="text-base font-bold block">CUSTOM</span>
            <span className="text-xs">[ COMING SOON ]</span>
          </button>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center mb-3">
          <FaUserSecret className="text-primary mr-2" />
          <h3 className="text-xl font-mono text-primary">OPERATIVE ROLES</h3>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-4"></div>
        
        <p className="text-base-content/80 font-mono text-sm mb-4">In Darknet Duel, players are randomly assigned one of two roles:</p>
        
        <div className="grid md:grid-cols-2 gap-6 mb-4">
          <div className="border border-accent/50 bg-base-900/80 p-4 rounded-lg relative overflow-hidden group hover:shadow-accent/20 hover:shadow-md transition-all duration-300">
            <div className="absolute inset-0 bg-accent/5"></div>
            <div className="absolute top-0 right-0 w-16 h-16 -mt-8 -mr-8 bg-accent/10 rounded-full blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-3">
                <FaUserSecret className="text-accent text-xl mr-2" />
                <div className="text-xl font-mono text-accent">ATTACKER</div>
              </div>
              <div className="text-sm text-base-content/80 font-mono">Exploit vulnerabilities and breach network defenses to extract classified data</div>
            </div>
          </div>
          
          <div className="border border-secondary/50 bg-base-900/80 p-4 rounded-lg relative overflow-hidden group hover:shadow-secondary/20 hover:shadow-md transition-all duration-300">
            <div className="absolute inset-0 bg-secondary/5"></div>
            <div className="absolute top-0 right-0 w-16 h-16 -mt-8 -mr-8 bg-secondary/10 rounded-full blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-3">
                <FaShieldAlt className="text-secondary text-xl mr-2" />
                <div className="text-xl font-mono text-secondary">DEFENDER</div>
              </div>
              <div className="text-sm text-base-content/80 font-mono">Fortify systems with firewalls and deploy countermeasures to protect valuable assets</div>
            </div>
          </div>
        </div>
        
        <p className="text-base-content/70 font-mono text-xs italic">Your operative role will be assigned when the secure connection is established.</p>
      </div>
      
      <div className="flex justify-between items-center pt-4 border-t border-primary/20">
        <button 
          type="button" 
          className="px-6 py-2 bg-base-800 border border-base-300/30 text-base-300 hover:text-primary hover:border-primary transition-colors duration-200 rounded font-mono text-sm flex items-center" 
          onClick={handleCancel}
        >
          ABORT OPERATION
        </button>
        
        <button 
          type="button" 
          className={`px-6 py-2 border rounded font-mono text-sm flex items-center ${isCreating || !user ? 'bg-base-700/50 border-primary/30 text-primary/50 cursor-not-allowed' : 'bg-primary/20 border-primary text-primary hover:bg-primary/30 transition-colors duration-200'}`}
          onClick={handleCreateLobby}
          disabled={isCreating || !user}
        >
          {isCreating ? (
            <>
              <span className="animate-pulse mr-2">⚙</span>
              <span>INITIALIZING...</span>
            </>
          ) : (
            <>
              <span className="mr-2">⚡</span>
              <span>DEPLOY LOBBY</span>
            </>
          )}
        </button>
      </div>
    </div>
    </>
  );
};

export default CreateLobby;
