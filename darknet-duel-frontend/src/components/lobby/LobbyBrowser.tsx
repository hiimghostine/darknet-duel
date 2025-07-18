import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { lobbyService } from '../../services/lobby.service';
import type { GameMatch, LobbyState } from '../../services/lobby.service';
import { FaLock, FaPlay, FaCircleNotch, FaExclamationTriangle as FaExclamationCircle } from 'react-icons/fa';
import { useAuthStore } from '../../store/auth.store';
import { FaSync, FaPlus, FaExclamationTriangle, FaServer, FaUserSecret, FaNetworkWired } from 'react-icons/fa';
import { useThemeStore } from '../../store/theme.store';

const LobbyBrowser: React.FC = () => {
  const [matches, setMatches] = useState<GameMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const [privateLobbysId, setPrivateLobbyId] = useState('');
  const [isJoiningPrivate, setIsJoiningPrivate] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { theme } = useThemeStore();

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const matchList = await lobbyService.getMatches();
      setMatches(matchList);
    } catch (err) {
      setError('Failed to fetch available lobbies. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPrivateLobby = async () => {
    if (!user) {
      setError('You must be logged in to join a match');
      return;
    }

    if (!privateLobbysId.trim()) {
      setError('Please enter a lobby ID');
      return;
    }

    try {
      setIsJoiningPrivate(true);
      setError(null);

      // Try to join the private lobby
      const result = await lobbyService.joinPrivateLobby(privateLobbysId.trim());

      if (!result.success) {
        setError(result.error || 'Failed to join private lobby');
        return;
      }

      if (!result.match) {
        setError('Unable to get lobby details');
        return;
      }

      // Find an empty slot
      let playerID = '0';
      for (let i = 0; i < result.match.players.length; i++) {
        if (!result.match.players[i].name) {
          playerID = i.toString();
          break;
        }
      }

      // Auto-assign a role based on availability
      let role: 'attacker' | 'defender' | undefined = undefined;
      const roles = result.match.setupData?.roles || {};

      if (!roles.attackerPlayerId) {
        role = 'attacker';
      } else if (!roles.defenderPlayerId) {
        role = 'defender';
      }

      const joinData = {
        role,
        data: {
          realUserId: user.id,
          realUsername: user.username
        }
      };

      const joinResult = await lobbyService.joinMatch(
        privateLobbysId.trim(),
        user.username,
        playerID,
        joinData
      );

      if (joinResult) {
        navigate(`/lobbies/${privateLobbysId.trim()}`);
      } else {
        setError('Failed to join the private lobby');
      }
    } catch (err) {
      setError('Failed to join the private lobby. Please check the lobby ID and try again.');
      console.error(err);
    } finally {
      setIsJoiningPrivate(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    
    // Set up polling for match updates
    const pollInterval = setInterval(fetchMatches, 5000);
    
    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  const handleJoinMatch = async (matchID: string) => {
    if (!user) {
      setError('You must be logged in to join a match');
      return;
    }
    
    try {
      setIsJoining(matchID);
      
      // Find the first available player slot
      const match = matches.find(m => m.matchID === matchID);
      if (!match) return;
      
      // Find an empty slot
      let playerID = '0';
      for (let i = 0; i < match.players.length; i++) {
        if (!match.players[i].name) {
          playerID = i.toString();
          break;
        }
      }
      
      // Auto-assign a role based on availability
      let role: 'attacker' | 'defender' | undefined = undefined;
      const roles = match.setupData?.roles || {};
      
      if (!roles.attackerPlayerId) {
        role = 'attacker';
      } else if (!roles.defenderPlayerId) {
        role = 'defender';
      }
      
      // ✅ SIMPLE FIX: Pass real user data directly from auth store
      console.log('🔍 TRACING: About to join match with user data:');
      console.log('   - user.id:', user.id);
      console.log('   - user.username:', user.username);
      console.log('   - playerID:', playerID);
      console.log('   - role:', role);
      
      const joinData = {
        role,
        data: {
          realUserId: user.id,        // ✅ Pass UUID directly
          realUsername: user.username // ✅ Pass username directly
        }
      };
      
      console.log('🔍 TRACING: Join data being sent:', joinData);
      
      const result = await lobbyService.joinMatch(
        matchID,
        user.username,
        playerID,
        joinData
      );
      
      if (result) {
        navigate(`/lobbies/${matchID}`);
      }
    } catch (err) {
      setError('Failed to join the lobby. Please try again.');
      console.error(err);
    } finally {
      setIsJoining(null);
    }
  };

  // We now use isLobbyJoinable function for join checks
  
  // Update active player count to check for both name and connection status
  const getActivePlayerCount = (match: GameMatch) => {
    // A player is truly active if they have a name AND they're connected (or connection status is unknown)
    return match.players.filter(p => p.name && (p.isConnected !== false)).length;
  };

  // Helper functions to determine lobby state styles, icons, and labels
  const getLobbyStateStyles = (state: LobbyState): string => {
    switch (state) {
      case 'waiting':
        return 'bg-primary/20 text-primary border border-primary/30';
      case 'ready':
        return 'bg-green-900/20 text-green-500 border border-green-500/30';
      case 'in_game':
        return 'bg-accent/20 text-accent border border-accent/30';
      case 'abandoned':
        return 'bg-error/20 text-error border border-error/30';
      default:
        return 'bg-primary/20 text-primary border border-primary/30';
    }
  };
  
  const getLobbyStateIcon = (state: LobbyState): React.ReactNode => {
    switch (state) {
      case 'waiting':
        return <FaCircleNotch className="animate-spin" />;
      case 'ready':
        return <FaPlay />;
      case 'in_game':
        return <FaLock />;
      case 'abandoned':
        return <FaExclamationCircle />;
      default:
        return <FaCircleNotch />;
    }
  };
  
  const getLobbyStateLabel = (state: LobbyState): string => {
    switch (state) {
      case 'waiting': return 'WAITING';
      case 'ready': return 'READY';
      case 'in_game': return 'IN PROGRESS';
      case 'abandoned': return 'ABANDONED';
      default: return 'UNKNOWN';
    }
  };
  
  // Determine if a lobby can be joined
  const isLobbyJoinable = (match: GameMatch): boolean => {
    // Can't join if we're already trying to join this match
    if (isJoining === match.matchID) return false;
    
    // Get match state
    const state = match.setupData.state || 'waiting';
    
    // Cannot join abandoned games
    if (state === 'abandoned') {
      return false;
    }
    
    // Can only join lobbies that are waiting or ready
    if (state !== 'waiting' && state !== 'ready') {
      return false;
    }
    
    // Check if there's room for another player (checking both name and connection status)
    const realPlayerCount = getActivePlayerCount(match);
    return realPlayerCount < 2;
  };

  
  // Render the appropriate label for the join button
  const renderJoinButtonLabel = (match: GameMatch): React.ReactNode => {
    if (match.setupData.state === 'in_game') {
      return <>IN PROGRESS</>;
    } else if (match.setupData.state === 'abandoned') {
      return <>ABANDONED</>;
    } else if (!isLobbyJoinable(match)) {
      return <>FULL</>;
    } else {
      return <>JOIN</>;
    }
  };

  return (
    <>
      {/* Decorative elements */}
      <div className="relative z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-1/3 h-1 bg-gradient-to-r from-primary to-transparent"></div>
        <div className="absolute top-0 right-1/3 w-1/4 h-1 bg-gradient-to-l from-primary to-transparent"></div>
        <div className="absolute top-20 left-10 opacity-5 text-8xl font-mono text-primary">101</div>
        <div className="absolute bottom-20 right-10 opacity-5 text-8xl font-mono text-primary">010</div>
      </div>

      {/* Header */}
      <header className="mb-8 border-b border-primary/20 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 text-flicker">
            ACTIVE_DARKNET_NODES
          </h1>
          
          <div className="flex gap-3">
            <button 
              onClick={fetchMatches} 
              className="flex items-center justify-center gap-2 bg-base-200/50 hover:bg-primary/20 text-primary border border-primary/30 py-2 px-4 transition-all duration-200"
              disabled={loading}
            >
              <FaSync className={`${loading ? 'animate-spin' : ''}`} /> 
              <span className="font-mono text-sm">SCAN_NETWORK</span>
            </button>
            
            <Link 
              to="/lobbies/create"
              className="flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/50 py-2 px-4 transition-all duration-200"
            >
              <FaPlus />
              <span className="font-mono text-sm">CREATE_NODE</span>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 border border-secondary/50 bg-secondary/10 text-secondary flex items-center gap-3">
          <FaExclamationTriangle size={20} className="animate-pulse" />
          <p className="font-mono">{error}</p>
        </div>
      )}
      
      {/* Private Lobby Join Section */}
      <div className="mb-8 border border-primary/30 bg-base-800/50 backdrop-filter backdrop-blur-sm shadow-lg shadow-primary/10 p-6 relative">
        <div className="absolute -top-2 -left-2 w-20 h-20 border-t-2 border-l-2 border-primary opacity-60"></div>
        <div className="absolute -bottom-2 -right-2 w-20 h-20 border-b-2 border-r-2 border-primary opacity-60"></div>
        
        <h3 className="text-xl font-mono text-primary mb-4 glitch-text">JOIN PRIVATE LOBBY</h3>
        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={privateLobbysId}
              onChange={(e) => setPrivateLobbyId(e.target.value)}
              placeholder="Enter Lobby ID..."
              className={`w-full px-4 py-3 border font-mono placeholder:text-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-200 ${theme === 'cyberpunk-dark' ? 'bg-base-900/80 border-primary/30 text-primary' : 'bg-base-100/80 border-primary/40 text-primary'}`}
              disabled={isJoiningPrivate}
            />
          </div>
          <button
            onClick={handleJoinPrivateLobby}
            disabled={isJoiningPrivate || !privateLobbysId.trim()}
            className={`px-6 py-3 font-mono text-sm border transition-all duration-200 ${
              isJoiningPrivate || !privateLobbysId.trim()
                ? 'bg-primary/10 border-primary/30 text-primary/50 cursor-not-allowed'
                : 'bg-primary/20 border-primary text-primary hover:bg-primary/30'
            }`}
          >
            {isJoiningPrivate ? (
              <>
                <span className="animate-pulse">⚙</span>
                <span className="ml-2">CONNECTING...</span>
              </>
            ) : (
              <>
                <span>🔗</span>
                <span className="ml-2">CONNECT</span>
              </>
            )}
          </button>
        </div>
        
        <div className="mt-3 text-xs text-primary/60 font-mono">
          Private lobbies require the exact lobby ID to join. Get the ID from the lobby host.
        </div>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="inline-block">
              <div className="w-16 h-16 border-4 border-t-primary border-r-primary/50 border-b-primary/30 border-l-primary/10 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 font-mono text-base-content/70 text-sm tracking-wider animate-pulse">SCANNING_NETWORK...</p>
          </div>
        </div>
      )}
      
      {/* No matches found */}
      {!loading && matches.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-primary/20">
          <FaServer className="mx-auto text-4xl text-primary/30 mb-4" />
          <h3 className="font-mono text-base-content/70 text-lg mb-2">NO_ACTIVE_NODES_FOUND</h3>
          <p className="text-base-content/50 text-sm max-w-md mx-auto">
            No darknet nodes are currently active. Create a new node to initiate a connection.
          </p>
        </div>
      )}
      
      {/* Match list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!loading && matches.map(match => {
          const playerCount = getActivePlayerCount(match);
          const isFull = playerCount >= 2;
          // Check if this is a special game mode
          const isSpecialGame = match.setupData?.gameMode !== 'standard';
          
          return (
            <div key={match.matchID} className={`border ${isFull ? 'border-secondary/30' : 'border-primary/30'} bg-base-200/10 backdrop-blur-sm`}>
              <div className="p-6 flex gap-6">
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className={`w-16 h-16 border-2 ${isFull ? 'border-secondary/50' : 'border-primary/50'} flex items-center justify-center rounded-full relative`}>
                    <FaServer className={isFull ? 'text-secondary/70' : 'text-primary/70'} size={24} />
                    <div className={`absolute top-0 right-0 w-3 h-3 rounded-full ${isFull ? 'bg-secondary' : 'bg-primary'} animate-pulse`}></div>
                  </div>
                  <div className="text-xs font-mono text-base-content/50 mt-1">
                    {isFull ? (
                      <span className="text-secondary">CONNECTION_IN_USE</span>
                    ) : (
                      <span className="text-primary">CONNECTION_ACTIVE</span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col flex-1 gap-4">
                  {/* Status badge based on lobby state */}
                  {match.setupData.state && (
                    <div className={`px-2 py-1 text-xs font-mono rounded-md flex items-center self-end ${getLobbyStateStyles(match.setupData.state)}`}>
                      {getLobbyStateIcon(match.setupData.state)}
                      <span className="ml-1">{getLobbyStateLabel(match.setupData.state)}</span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <FaUserSecret className={isFull ? 'text-secondary/70' : 'text-primary/70'} />
                      <span className="font-mono">{match.players[0]?.name || 'ANONYMOUS'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <FaNetworkWired className={isFull ? 'text-secondary/70' : 'text-primary/70'} />
                      <span className="font-mono">{isSpecialGame ? 'CUSTOM MODE' : 'STANDARD MODE'}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1"></div>
                  
                  <div className="mt-4">
                    <div className="w-full bg-base-300/50 h-1.5 mb-2">
                      <div 
                        className={`h-full ${isFull ? 'bg-secondary/70' : 'bg-primary/70'}`}
                        style={{ width: `${(playerCount / 2) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span>CAPACITY: {playerCount}/2</span>
                      <span className="text-base-content/50">ID: {match.matchID.substring(0, 8)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="p-0.5 bg-gradient-to-r from-secondary/30 via-secondary/20 to-secondary/30 w-full">
                      <button 
                        className={`w-full py-2 px-4 font-mono text-sm ${isLobbyJoinable(match) ? 'bg-secondary/20 text-secondary hover:bg-secondary/30' : 'bg-secondary/10 text-secondary/50 cursor-not-allowed'} border border-secondary/30 rounded`}
                        onClick={() => isLobbyJoinable(match) && handleJoinMatch(match.matchID)}
                        disabled={!isLobbyJoinable(match) || isJoining === match.matchID}
                      >
                        {isJoining === match.matchID ? (
                          <>CONNECTING...</>
                        ) : renderJoinButtonLabel(match)}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    
      {/* Empty state filler tiles */}
      {/* Empty state */}
      {!loading && matches.length > 0 && matches.length % 2 !== 0 && (
        <div className="border border-primary/10 bg-base-200/10 backdrop-blur-sm p-6 flex items-center justify-center">
          <div className="text-base-content/30 font-mono text-sm text-center">
            <div className="border-2 border-dashed border-primary/20 w-12 h-12 hexagon mx-auto mb-4"></div>
            <span className="text-flicker-subtle">VACANT_NODE_SLOT</span>
          </div>
        </div>
      )}
    
      {/* End of content */}
    </>
  );
};

export default LobbyBrowser;
