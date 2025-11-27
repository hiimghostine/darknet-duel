import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { lobbyService } from '../../services/lobby.service';
import { websocketLobbyService } from '../../services/websocketLobby.service';
import { useAuthStore } from '../../store/auth.store';
import { FaNetworkWired, FaShieldAlt, FaUserSecret, FaExclamationTriangle, FaTag } from 'react-icons/fa';
import { useAudioManager } from '../../hooks/useAudioManager';
import { useThemeStore } from '../../store/theme.store';

const CreateLobby: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { triggerClick } = useAudioManager();
  const { theme } = useThemeStore();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<'standard' | 'blitz' | 'custom'>('standard');
  const [isPrivate, setIsPrivate] = useState(false);
  const [lobbyName, setLobbyName] = useState('');

  // Predefined cyberpunk lobby names
  const cyberpunkLobbyNames = [
    'NEON_UNDERGROUND',
    'DIGITAL_SHADOWS',
    'CYBER_MAELSTROM',
    'MATRIX_BREACH',
    'SYSTEM_CORRUPTION',
    'NEURAL_INTRUSION',
    'QUANTUM_HACK'
  ];

  const getRandomLobbyName = () => {
    return cyberpunkLobbyNames[Math.floor(Math.random() * cyberpunkLobbyNames.length)];
  };

  // Connect to WebSocket on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && user) {
      websocketLobbyService.connect(token).catch(err => {
        console.error('Failed to connect to lobby WebSocket:', err);
      });
    }

    return () => {
      // Don't disconnect on unmount - keep connection alive
    };
  }, [user]);

  const handleCreateLobby = async () => {
    if (!user) {
      setError('You must be logged in to create a lobby');
      return;
    }
    
    // Validate lobby name: blank allowed, else 3-50 chars
    const trimmed = lobbyName.trim();
    if (trimmed && (trimmed.length < 3 || trimmed.length > 50)) {
      setError('Lobby name must be 3-50 characters or left blank');
      return;
    }
    
    // Use random name if lobby name is blank
    const finalLobbyName = trimmed || getRandomLobbyName();
    
    setIsCreating(true);
    setError(null);
    
    try {
      // Use WebSocket for ALL lobbies (both public and private)
      console.log(`🔌 Creating ${isPrivate ? 'private' : 'public'} lobby via WebSocket...`);
      
      // Ensure WebSocket is connected
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      if (!websocketLobbyService.isConnected()) {
        await websocketLobbyService.connect(token);
      }

      const lobby = await websocketLobbyService.createLobby({
        name: finalLobbyName,
        visibility: isPrivate ? 'private' : 'public',
        maxPlayers: 2,
        gameSettings: {
          gameMode: 'standard',
          initialResources: 100,
          maxTurns: 50
        }
      });

      console.log(`✅ ${isPrivate ? 'Private' : 'Public'} lobby created:`, lobby);
      
      // Navigate to lobby detail page
      navigate(`/lobbies/${lobby.lobbyId}`);
    } catch (err) {
      console.error('Error creating lobby:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create lobby';
      setError(errorMessage);
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
      <div className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm">
        <div className="bg-base-200 border border-primary/20 p-4 relative">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
      
      <h2 className="text-xl font-mono text-primary mb-4 font-bold">CREATE NEW LOBBY</h2>
      
      {error && (
        <div className="mb-3 border border-error/50 bg-error/20 text-error px-3 py-2 flex items-center text-xs">
          <FaExclamationTriangle className="mr-2 animate-pulse" />
          <p className="font-mono">{error}</p>
        </div>
      )}
      
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <FaNetworkWired className="text-primary mr-2 text-sm" />
          <h3 className="text-sm font-mono text-primary font-bold">OPERATION MODE</h3>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-2"></div>
        
        <div className="grid md:grid-cols-2 gap-2">
          <button 
            type="button"
            onClick={() => {
              triggerClick();
              setSelectedMode('standard');
            }}
            className={`p-2 border font-mono group relative overflow-hidden transition-all duration-300 ${
              selectedMode === 'standard' 
                ? 'border-primary bg-primary/20 text-primary shadow-lg shadow-primary/25 ring-1 ring-primary/50' 
                : 'border-primary bg-base-900/80 hover:bg-primary/20 text-primary'
            }`}
          >
            <div className={`absolute inset-0 transition-opacity duration-300 ${
              selectedMode === 'standard' ? 'bg-primary/20 opacity-100' : 'bg-primary/10 opacity-0 group-hover:opacity-100'
            }`}></div>
            <span className="text-sm font-bold block relative z-10">STANDARD</span>
            <span className={`text-xs relative z-10 ${
              selectedMode === 'standard' ? 'text-primary/90' : 'text-primary/70'
            }`}>[ {selectedMode === 'standard' ? 'SELECTED' : 'AVAILABLE'} ]</span>
          </button>
          
          <button 
            type="button"
            onClick={() => setSelectedMode('blitz')}
            className={`p-2 border font-mono relative transition-all duration-300 ${
              selectedMode === 'blitz'
                ? 'border-base-content/50 bg-base-content/10 text-base-content shadow-lg shadow-base-content/25 ring-1 ring-base-content/30'
                : 'border-base-content/30 bg-base-900/60 text-base-content/60 opacity-60 cursor-not-allowed'
            }`}
            disabled
          >
            <span className="text-sm font-bold block relative z-10">BLITZ</span>
            <span className="text-xs relative z-10">[ COMING SOON ]</span>
          </button>
        </div>
      </div>
      
      {/* Privacy Settings */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <FaShieldAlt className="text-primary mr-2 text-sm" />
          <h3 className="text-sm font-mono text-primary font-bold">LOBBY PRIVACY</h3>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-2"></div>
        
        <div className="grid md:grid-cols-2 gap-2">
          <button 
            type="button"
            onClick={() => {
              triggerClick();
              setIsPrivate(false);
            }}
            className={`p-2 border font-mono group relative overflow-hidden transition-all duration-300 ${
              !isPrivate 
                ? 'border-primary bg-primary/20 text-primary shadow-lg shadow-primary/25 ring-1 ring-primary/50' 
                : 'border-primary bg-base-900/80 hover:bg-primary/20 text-primary'
            }`}
          >
            <div className={`absolute inset-0 transition-opacity duration-300 ${
              !isPrivate ? 'bg-primary/20 opacity-100' : 'bg-primary/10 opacity-0 group-hover:opacity-100'
            }`}></div>
            <span className="text-sm font-bold block relative z-10">PUBLIC</span>
            <span className={`text-xs relative z-10 ${
              !isPrivate ? 'text-primary/90' : 'text-primary/70'
            }`}>[ {!isPrivate ? 'SELECTED' : 'AVAILABLE'} ]</span>
            <div className="text-xs mt-1 text-primary/60 relative z-10">Visible in browser</div>
          </button>
          
          <button 
            type="button"
            onClick={() => {
              triggerClick();
              setIsPrivate(true);
            }}
            className={`p-2 border font-mono group relative overflow-hidden transition-all duration-300 ${
              isPrivate 
                ? 'border-primary bg-primary/20 text-primary shadow-lg shadow-primary/25 ring-1 ring-primary/50' 
                : 'border-primary bg-base-900/80 hover:bg-primary/20 text-primary'
            }`}
          >
            <div className={`absolute inset-0 transition-opacity duration-300 ${
              isPrivate ? 'bg-primary/20 opacity-100' : 'bg-primary/10 opacity-0 group-hover:opacity-100'
            }`}></div>
            <span className="text-sm font-bold block relative z-10">PRIVATE</span>
            <span className={`text-xs relative z-10 ${
              isPrivate ? 'text-primary/90' : 'text-primary/70'
            }`}>[ {isPrivate ? 'SELECTED' : 'AVAILABLE'} ]</span>
            <div className="text-xs mt-1 text-primary/60 relative z-10">Join by ID only</div>
          </button>
        </div>
      </div>
      
      {/* Lobby Name */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <FaTag className="text-primary mr-2 text-sm" />
          <h3 className="text-sm font-mono text-primary font-bold">LOBBY IDENTIFICATION</h3>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-2"></div>
        
        <div>
          <input
            type="text"
            value={lobbyName}
            onChange={(e) => setLobbyName(e.target.value)}
            placeholder="Enter lobby name..."
            maxLength={50}
            className={`w-full px-3 py-2 border font-mono text-sm placeholder:text-primary/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors duration-200 ${
              theme === 'cyberpunk-dark' 
                ? 'bg-base-900/80 border-primary/30 text-primary' 
                : 'bg-base-100/80 border-primary/40 text-primary'
            }`}
          />
          <div className="mt-2 text-xs text-primary/60 font-mono">
            3-50 characters, or leave blank for a random cyberpunk name.
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <FaUserSecret className="text-primary mr-2 text-sm" />
          <h3 className="text-sm font-mono text-primary font-bold">OPERATIVE ROLES</h3>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-2"></div>
        
        <p className="text-base-content/80 font-mono text-xs mb-2">Host gets Attacker, second player gets Defender:</p>
        
        <div className="grid md:grid-cols-2 gap-2 mb-2">
          <div className="border border-accent/50 bg-base-900/80 p-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-accent/5"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-1">
                <FaUserSecret className="text-accent text-sm mr-1" />
                <div className="text-sm font-mono text-accent font-bold">ATTACKER</div>
              </div>
              <div className="text-xs text-base-content/80 font-mono">Exploit vulnerabilities to extract data</div>
            </div>
          </div>
          
          <div className="border border-secondary/50 bg-base-900/80 p-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-secondary/5"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-1">
                <FaShieldAlt className="text-secondary text-sm mr-1" />
                <div className="text-sm font-mono text-secondary font-bold">DEFENDER</div>
              </div>
              <div className="text-xs text-base-content/80 font-mono">Fortify systems and protect assets</div>
            </div>
          </div>
        </div>
        
        <p className="text-base-content/70 font-mono text-xs italic">Role assigned upon connection.</p>
      </div>
      
      <div className="flex justify-between items-center pt-3 border-t border-primary/20">
        <button 
          type="button" 
          className="px-4 py-1.5 bg-base-200/10 border border-base-content/30 text-base-content hover:text-error hover:border-error hover:bg-error/10 transition-colors duration-200 font-mono text-xs flex items-center" 
          onClick={() => {
            triggerClick();
            handleCancel();
          }}
        >
          <span className="mr-1">✕</span>
          ABORT
        </button>
        
        <button 
          type="button" 
          className={`px-4 py-1.5 border font-mono text-xs flex items-center ${isCreating || !user ? 'bg-base-700/50 border-primary/30 text-primary/50 cursor-not-allowed' : 'bg-primary/20 border-primary text-primary hover:bg-primary/30 transition-colors duration-200'}`}
          onClick={() => {
            triggerClick();
            handleCreateLobby();
          }}
          disabled={isCreating || !user}
        >
          {isCreating ? (
            <>
              <span className="animate-pulse mr-1">⚙</span>
              <span>INITIALIZING...</span>
            </>
          ) : (
            <>
              <span className="mr-1">⚡</span>
              <span>DEPLOY LOBBY</span>
            </>
          )}
        </button>
      </div>
        </div>
      </div>
    </>
  );
};

export default CreateLobby;
