import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { lobbyService } from '../../services/lobby.service';
import type { GameMatch, LobbyState } from '../../services/lobby.service';
import { FaLock, FaPlay, FaCircleNotch, FaExclamationTriangle as FaExclamationCircle } from 'react-icons/fa';
import { useAuthStore } from '../../store/auth.store';
import { FaSync, FaPlus, FaExclamationTriangle, FaServer, FaUserSecret, FaNetworkWired } from 'react-icons/fa';
import { useThemeStore } from '../../store/theme.store';
import { useAudioManager } from '../../hooks/useAudioManager';

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
  const { triggerClick } = useAudioManager();

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

      // ✅ Check if the current user is already in this lobby
      const isAlreadyInLobby = result.match.players.some(
        player => player.data?.realUserId === user.id
      );
      
      if (isAlreadyInLobby) {
        setError('You cannot join your own lobby');
        setIsJoiningPrivate(false);
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
      
      // ✅ Check if the current user is already in this lobby
      const isAlreadyInLobby = match.players.some(
        player => player.data?.realUserId === user.id
      );
      
      if (isAlreadyInLobby) {
        setError('You cannot join your own lobby');
        setIsJoining(null);
        return;
      }
      
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
    
    // ✅ Can't join if the current user is already in this lobby
    if (user) {
      const isAlreadyInLobby = match.players.some(
        player => player.data?.realUserId === user.id
      );
      if (isAlreadyInLobby) return false;
    }
    
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
      {/* Compact Header */}
      <header className="mb-3 pb-2 border-b border-primary/20">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold font-mono text-primary text-flicker">
              ACTIVE_NODES
            </h1>
            {loading && (
              <div className="flex items-center gap-1 text-primary/70 text-xs font-mono">
                <FaSync className="animate-spin text-xs" />
                <span className="animate-pulse">Scanning...</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => {
                triggerClick();
                fetchMatches();
              }} 
              className="flex items-center gap-1 bg-base-200/50 hover:bg-primary/20 text-primary border border-primary/30 py-1 px-2 text-xs transition-all duration-200"
              disabled={loading}
            >
              <FaSync className={`${loading ? 'animate-spin' : ''} text-xs`} /> 
              <span className="font-mono hidden sm:inline">SCAN</span>
            </button>
            
            <Link 
              to="/lobbies/create"
              onClick={triggerClick}
              className="flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/50 py-1 px-2 text-xs transition-all duration-200"
            >
              <FaPlus className="text-xs" />
              <span className="font-mono hidden sm:inline">CREATE</span>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Error message */}
      {error && (
        <div className="mb-2 p-2 border border-secondary/50 bg-secondary/10 text-secondary flex items-center gap-2 text-xs">
          <FaExclamationTriangle className="animate-pulse" />
          <p className="font-mono">{error}</p>
        </div>
      )}
      
      {/* Compact Private Lobby Join Section */}
      <div className="mb-3 border border-primary/30 bg-base-200/30 p-3">
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <label className="font-mono text-xs text-primary whitespace-nowrap">PRIVATE ID:</label>
          <input
            type="text"
            value={privateLobbysId}
            onChange={(e) => setPrivateLobbyId(e.target.value)}
            placeholder="Enter ID..."
            className={`flex-1 px-2 py-1 border font-mono text-xs placeholder:text-primary/50 focus:border-primary focus:outline-none transition-colors duration-200 ${theme === 'cyberpunk-dark' ? 'bg-base-900/80 border-primary/30 text-primary' : 'bg-base-100/80 border-primary/40 text-primary'}`}
            disabled={isJoiningPrivate}
          />
          <button
            onClick={() => {
              triggerClick();
              handleJoinPrivateLobby();
            }}
            disabled={isJoiningPrivate || !privateLobbysId.trim()}
            className={`px-3 py-1 font-mono text-xs border transition-all duration-200 whitespace-nowrap ${
              isJoiningPrivate || !privateLobbysId.trim()
                ? 'bg-primary/10 border-primary/30 text-primary/50 cursor-not-allowed'
                : 'bg-primary/20 border-primary text-primary hover:bg-primary/30'
            }`}
          >
            {isJoiningPrivate ? 'CONNECTING...' : 'JOIN'}
          </button>
        </div>
      </div>
      
      {/* Scrollable container for lobby list */}
      <div className="border border-primary/20 bg-base-200/5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {/* No matches found - only show when not loading initially */}
        {matches.length === 0 && !loading && (
          <div className="text-center py-8 border border-dashed border-primary/20 m-2">
            <FaServer className="mx-auto text-2xl text-primary/30 mb-2" />
            <h3 className="font-mono text-base-content/70 text-sm mb-1">NO_ACTIVE_NODES</h3>
            <p className="text-base-content/50 text-xs">
              Create a node to begin
            </p>
          </div>
        )}
        
        {/* Initial loading state - only show on first load */}
        {matches.length === 0 && loading && (
          <div className="flex justify-center items-center py-8">
            <div className="text-center">
              <div className="inline-block">
                <div className="w-8 h-8 border-2 border-t-primary border-r-primary/50 border-b-primary/30 border-l-primary/10 rounded-full animate-spin"></div>
              </div>
              <p className="mt-2 font-mono text-base-content/70 text-xs tracking-wider animate-pulse">SCANNING...</p>
            </div>
          </div>
        )}
        
        {/* Match list - Single column, compact cards - show even while loading if we have matches */}
        <div className="space-y-2 p-2">
          {matches.map(match => {
            const playerCount = getActivePlayerCount(match);
            const isFull = playerCount >= 2;
            const isSpecialGame = match.setupData?.gameMode !== 'standard';
            
            return (
              <div key={match.matchID} className={`border ${isFull ? 'border-secondary/30' : 'border-primary/30'} bg-base-200/10 backdrop-blur-sm`}>
                <div className="p-3 flex gap-3 items-center">
                  {/* Status indicator */}
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 border ${isFull ? 'border-secondary/50' : 'border-primary/50'} flex items-center justify-center rounded-full relative`}>
                      <FaServer className={isFull ? 'text-secondary/70' : 'text-primary/70'} size={14} />
                      <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${isFull ? 'bg-secondary' : 'bg-primary'} animate-pulse`}></div>
                    </div>
                  </div>
                  
                  {/* Lobby info - more horizontal layout */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-sm font-mono font-bold text-base-content truncate">
                        {match.setupData?.lobbyName || 'Unnamed Lobby'}
                      </h3>
                      {match.setupData.state && (
                        <div className={`px-1.5 py-0.5 text-xs font-mono flex items-center gap-1 ${getLobbyStateStyles(match.setupData.state)}`}>
                          {getLobbyStateIcon(match.setupData.state)}
                          <span className="hidden sm:inline text-xs">{getLobbyStateLabel(match.setupData.state)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs font-mono text-base-content/70">
                      <div className="flex items-center gap-1">
                        <FaUserSecret className="text-xs" />
                        <span className="truncate max-w-[100px]">{match.players[0]?.name || 'ANON'}</span>
                      </div>
                      <div className="hidden sm:flex items-center gap-1">
                        <FaNetworkWired className="text-xs" />
                        <span>{isSpecialGame ? 'CUSTOM' : 'STANDARD'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{playerCount}/2</span>
                      </div>
                      <div className="hidden md:block text-base-content/50 text-xs">
                        {match.matchID.substring(0, 8)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Join button */}
                  <button 
                    className={`px-4 py-2 font-mono text-xs whitespace-nowrap ${isLobbyJoinable(match) ? 'bg-secondary/20 text-secondary hover:bg-secondary/30 border-secondary/30' : 'bg-secondary/10 text-secondary/50 cursor-not-allowed border-secondary/20'} border transition-all duration-200`}
                    onClick={() => {
                      if (isLobbyJoinable(match)) {
                        triggerClick();
                        handleJoinMatch(match.matchID);
                      }
                    }}
                    disabled={!isLobbyJoinable(match) || isJoining === match.matchID}
                  >
                    {isJoining === match.matchID ? 'CONNECTING...' : renderJoinButtonLabel(match)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default LobbyBrowser;
