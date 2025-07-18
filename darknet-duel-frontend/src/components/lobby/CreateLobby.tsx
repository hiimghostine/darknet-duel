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
  const [selectedMode, setSelectedMode] = useState<'standard' | 'blitz' | 'custom'>('standard');
  const [isPrivate, setIsPrivate] = useState(false);
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
        isPrivate: boolean;
      }
      
      const settings: GameSettings = {
        gameMode: 'standard',
        isPrivate: isPrivate
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
            onClick={() => setSelectedMode('standard')}
            className={`p-4 border font-mono rounded group relative overflow-hidden transition-all duration-300 ${
              selectedMode === 'standard' 
                ? 'border-primary bg-primary/20 text-primary shadow-lg shadow-primary/25 ring-2 ring-primary/50' 
                : 'border-primary bg-base-900/80 hover:bg-primary/20 text-primary'
            }`}
          >
            <div className={`absolute inset-0 transition-opacity duration-300 ${
              selectedMode === 'standard' ? 'bg-primary/20 opacity-100' : 'bg-primary/10 opacity-0 group-hover:opacity-100'
            }`}></div>
            <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l transition-colors duration-300 ${
              selectedMode === 'standard' ? 'border-primary/80' : 'border-primary'
            }`}></div>
            <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r transition-colors duration-300 ${
              selectedMode === 'standard' ? 'border-primary/80' : 'border-primary'
            }`}></div>
            <span className="text-base font-bold block relative z-10">STANDARD</span>
            <span className={`text-xs relative z-10 ${
              selectedMode === 'standard' ? 'text-primary/90' : 'text-primary/70'
            }`}>[ {selectedMode === 'standard' ? 'SELECTED' : 'AVAILABLE'} ]</span>
          </button>
          
          <button 
            type="button"
            onClick={() => setSelectedMode('blitz')}
            className={`p-4 border font-mono rounded relative transition-all duration-300 ${
              selectedMode === 'blitz'
                ? 'border-base-content/50 bg-base-content/10 text-base-content shadow-lg shadow-base-content/25 ring-2 ring-base-content/30'
                : 'border-base-content/30 bg-base-900/60 text-base-content/60 opacity-60 cursor-not-allowed'
            }`}
            disabled
          >
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-base-content/50"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-base-content/50"></div>
            <span className="text-base font-bold block relative z-10">BLITZ</span>
            <span className="text-xs relative z-10">[ COMING SOON ]</span>
          </button>
          
          <button 
            type="button"
            onClick={() => setSelectedMode('custom')}
            className={`p-4 border font-mono rounded relative transition-all duration-300 ${
              selectedMode === 'custom'
                ? 'border-base-content/50 bg-base-content/10 text-base-content shadow-lg shadow-base-content/25 ring-2 ring-base-content/30'
                : 'border-base-content/30 bg-base-900/60 text-base-content/60 opacity-60 cursor-not-allowed'
            }`}
            disabled
          >
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-base-content/50"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-base-content/50"></div>
            <span className="text-base font-bold block relative z-10">CUSTOM</span>
            <span className="text-xs relative z-10">[ COMING SOON ]</span>
          </button>
        </div>
      </div>
      
      {/* Privacy Settings */}
      <div className="mb-8">
        <div className="flex items-center mb-3">
          <FaShieldAlt className="text-primary mr-2" />
          <h3 className="text-xl font-mono text-primary">LOBBY PRIVACY</h3>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-4"></div>
        
        <div className="grid md:grid-cols-2 gap-3 mt-4">
          <button 
            type="button"
            onClick={() => setIsPrivate(false)}
            className={`p-4 border font-mono rounded group relative overflow-hidden transition-all duration-300 ${
              !isPrivate 
                ? 'border-primary bg-primary/20 text-primary shadow-lg shadow-primary/25 ring-2 ring-primary/50' 
                : 'border-primary bg-base-900/80 hover:bg-primary/20 text-primary'
            }`}
          >
            <div className={`absolute inset-0 transition-opacity duration-300 ${
              !isPrivate ? 'bg-primary/20 opacity-100' : 'bg-primary/10 opacity-0 group-hover:opacity-100'
            }`}></div>
            <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l transition-colors duration-300 ${
              !isPrivate ? 'border-primary/80' : 'border-primary'
            }`}></div>
            <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r transition-colors duration-300 ${
              !isPrivate ? 'border-primary/80' : 'border-primary'
            }`}></div>
            <span className="text-base font-bold block relative z-10">PUBLIC</span>
            <span className={`text-xs relative z-10 ${
              !isPrivate ? 'text-primary/90' : 'text-primary/70'
            }`}>[ {!isPrivate ? 'SELECTED' : 'AVAILABLE'} ]</span>
            <div className="text-xs mt-2 text-primary/60 relative z-10">Visible in lobby browser</div>
          </button>
          
          <button 
            type="button"
            onClick={() => setIsPrivate(true)}
            className={`p-4 border font-mono rounded group relative overflow-hidden transition-all duration-300 ${
              isPrivate 
                ? 'border-primary bg-primary/20 text-primary shadow-lg shadow-primary/25 ring-2 ring-primary/50' 
                : 'border-primary bg-base-900/80 hover:bg-primary/20 text-primary'
            }`}
          >
            <div className={`absolute inset-0 transition-opacity duration-300 ${
              isPrivate ? 'bg-primary/20 opacity-100' : 'bg-primary/10 opacity-0 group-hover:opacity-100'
            }`}></div>
            <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l transition-colors duration-300 ${
              isPrivate ? 'border-primary/80' : 'border-primary'
            }`}></div>
            <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r transition-colors duration-300 ${
              isPrivate ? 'border-primary/80' : 'border-primary'
            }`}></div>
            <span className="text-base font-bold block relative z-10">PRIVATE</span>
            <span className={`text-xs relative z-10 ${
              isPrivate ? 'text-primary/90' : 'text-primary/70'
            }`}>[ {isPrivate ? 'SELECTED' : 'AVAILABLE'} ]</span>
            <div className="text-xs mt-2 text-primary/60 relative z-10">Join by ID only</div>
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
          className="px-6 py-2 bg-base-200/10 border border-base-content/30 text-base-content hover:text-error hover:border-error hover:bg-error/10 transition-colors duration-200 rounded font-mono text-sm flex items-center" 
          onClick={handleCancel}
        >
          <span className="mr-2">✕</span>
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
