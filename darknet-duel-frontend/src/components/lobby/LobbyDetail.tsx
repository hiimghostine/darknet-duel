import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lobbyService } from '../../services/lobby.service';
import type { GameMatch } from '../../services/lobby.service';
import { useAuthStore } from '../../store/auth.store';
import { FaUserSecret, FaShieldAlt, FaExclamationTriangle, FaExclamationCircle, FaCog, FaClock, FaDoorOpen, FaPlay, FaCheck, FaTimes, FaUserAlt, FaLock } from 'react-icons/fa';
import LobbyChat from './LobbyChat';
import UserTypeTag from '../UserTypeTag';
import accountService from '../../services/account.service';
import storeService from '../../services/store.service';
import logo from '../../assets/logo.png';
import { useAudioManager } from '../../hooks/useAudioManager';

const LobbyDetail: React.FC = () => {
  const { matchID = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { triggerClick, triggerNegativeClick, triggerPositiveClick } = useAudioManager();
  const [match, setMatch] = useState<GameMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [currentPlayerID, setCurrentPlayerID] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [opponentData, setOpponentData] = useState<any>(null);
  const [bothPlayersReady, setBothPlayersReady] = useState(false);

  // Track previous player slots for detecting host transfers using ref to avoid dependency issues
  const prevPlayerIDsRef = useRef<{[key: string]: number}>({});
  const [hostTransferOccurred, setHostTransferOccurred] = useState<boolean>(false);
  
  // Fetch match details using useCallback to avoid recreation on each render
  const fetchMatchDetails = useCallback(async (isBackgroundFetch = false) => {
    if (!matchID) return;
    
    // Don't start new fetch if one is already in progress (prevents queuing)
    if (isPolling && isBackgroundFetch) return;
    
    if (isBackgroundFetch) setIsPolling(true);
    
    try {
      const matchDetails = await lobbyService.getMatch(matchID);
      
      if (matchDetails) {
        // Create a map of player names to their current IDs to track moves
        const currentPlayerMap: {[name: string]: number} = {};
        matchDetails.players.forEach(p => {
          if (p.name) {
            currentPlayerMap[p.name] = p.id;
          }
        });
        
        // Check if any player has moved positions (host transfer)
        Object.keys(currentPlayerMap).forEach(name => {
          // If we have seen this player before but their ID changed
          if (prevPlayerIDsRef.current[name] !== undefined &&
              prevPlayerIDsRef.current[name] !== currentPlayerMap[name]) {
            // Player moved - host transfer occurred
            if (currentPlayerMap[name] === 0) {
              // This player is now the host
              setHostTransferOccurred(true);
              setTimeout(() => setHostTransferOccurred(false), 10000); // Hide after 10 seconds
            }
          }
        });
        
        // Update previous player positions for next comparison
        prevPlayerIDsRef.current = currentPlayerMap;
        
        // Update match details
        setMatch(matchDetails);
        
        // Check if user is in this match
        const storedPlayerID = localStorage.getItem(`match_${matchID}_playerID`);
        
        if (storedPlayerID) {
          // Convert stored ID to number for consistent comparison
          const storedPlayerIdNum = parseInt(storedPlayerID || '0', 10);
          setCurrentPlayerID(storedPlayerIdNum.toString());
          
          // Always check if the player is currently in the host position
          // This ensures correct host status even after transfers
          setIsHost(false); // Reset first
          
          // Find current player by ID and name for host check
          const currentPlayer = matchDetails.players.find(p => p.id === storedPlayerIdNum);
          if (currentPlayer) {
            // Look for isReady inside player.data object
            setIsReady(!!currentPlayer.data?.isReady);
            
            // If player is in slot 0, they are the host
            if (storedPlayerIdNum === 0) {
              setIsHost(true);
            }
          }
          
          // Check if any player (particularly the host) has signaled game start
          const hostPlayer = matchDetails.players.find(p => p.id === 0);
          if (hostPlayer?.data?.gameStarted) {
            // Game has been started by the host, navigate to game page
            navigate(`/game/${matchID}`);
            return;
          }
        } else {
          // User is not part of this match
          navigate('/lobbies');
        }
              } else {
          // Match not found - likely deleted due to inactivity
          if (isBackgroundFetch) {
            // Only show notification and redirect on background fetches (polling)
            // This prevents showing the notification on initial load
            console.log('Lobby not found - likely deleted due to inactivity');
            
            // Clean up local storage
            localStorage.removeItem(`match_${matchID}_playerID`);
            localStorage.removeItem(`match_${matchID}_credentials`);
            
            // Play negative sound effect for lobby timeout
            triggerNegativeClick();
            
            // Show notification and redirect
            setError('This lobby has been deleted due to inactivity. Redirecting to lobby browser...');
            
            // Redirect after a short delay to show the notification
            setTimeout(() => {
              navigate('/lobbies');
            }, 2000);
          }
        }
    } catch (err) {
      console.error('Error fetching match details:', err);
      if (!isBackgroundFetch) {
        setError('Failed to load lobby details');
      }
    } finally {
      setLoading(false);
      if (isBackgroundFetch) setIsPolling(false);
    }
  }, [matchID, navigate]);

  // Initial fetch when component mounts
  useEffect(() => {
    fetchMatchDetails();
  }, [matchID, fetchMatchDetails]);

  // Poll for match updates every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Use background fetch flag to prevent UI blocking
      fetchMatchDetails(true);
    }, 2000);
    
    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, [matchID, fetchMatchDetails]); // Re-setup polling if matchID changes
  
  // Check if a player has left the match
  useEffect(() => {
    if (!match) return;
    
    // Check if we have enough players
    const requiredPlayers = 2;
    const connectedPlayers = match.players.filter(p => p.name).length;
    
    // If host left or not enough players after initial connection, show warning
    const hostLeft = !match.players[0]?.name;
    const playersMissing = connectedPlayers < requiredPlayers;
    
    if (hostLeft) {
      setError('Host has left the game - this match is now abandoned');
    } else if (playersMissing && match.players.some(p => p.id.toString() === currentPlayerID)) {
      setWarning('Waiting for all players to connect...');
    } else {
      setWarning(null); // Clear warning when no longer applicable
    }
  }, [match, currentPlayerID]);

  // Check if both players are ready and play sound effect
  useEffect(() => {
    if (match) {
      const areReady = areBothPlayersReady();
      if (areReady && !bothPlayersReady) {
        // Both players just became ready
        triggerPositiveClick();
        setBothPlayersReady(true);
      } else if (!areReady && bothPlayersReady) {
        // Players are no longer both ready
        setBothPlayersReady(false);
      }
    }
  }, [match, bothPlayersReady, triggerPositiveClick]);

  // Handle ready status change
  const handleReadyToggle = async () => {
    if (!matchID) return;
    
    try {
      const success = await lobbyService.updateReadyStatus(matchID, !isReady);
      if (success) {
        setIsReady(!isReady);
      } else {
        triggerNegativeClick(); // Play negative click sound on failure
      }
    } catch (err) {
      console.error('Error updating ready status:', err);
      setError('Failed to update ready status');
      triggerNegativeClick(); // Play negative click sound on error
    }
  };
  
  // Handle game start (host only)
  const handleStartGame = async () => {
    if (!matchID) return;
    
    // First, update the match with started flag
    const success = await lobbyService.startMatch(matchID);
    
    if (success) {
      // Then navigate to the game
      navigate(`/game/${matchID}`);
    } else {
      setError('Failed to start the game');
    }
  };

  const handleLeaveMatch = async () => {
    if (!matchID) return;
    
    try {
      await lobbyService.leaveMatch(matchID);
      navigate('/lobbies');
    } catch (err) {
      console.error('Error leaving match:', err);
      setError('Failed to leave the lobby');
    }
  };

  const getOpponentInfo = () => {
    if (!match) return { name: 'Waiting for opponent...', isReady: false };
    
    const players = match.players.filter(p => p.name);
    if (players.length < 2) return { name: 'Waiting for opponent...', isReady: false };
    
    // Use numeric comparison for player IDs
    const currentPlayerIdNum = parseInt(currentPlayerID || '0', 10);
    
    // Find opponent by comparing numeric IDs
    const opponent = players.find(p => p.id !== currentPlayerIdNum);
    if (!opponent) return { name: 'Unknown', isReady: false };
    
    return {
      name: opponent.name || 'Unknown',
      isReady: !!(opponent.data?.isReady)
    };
  };

  // Fetch opponent data when opponent changes
  useEffect(() => {
    const fetchOpponentData = async () => {
      const opponentInfo = getOpponentInfo();
      if (opponentInfo.name !== 'Waiting for opponent...' && opponentInfo.name !== 'Unknown') {
        try {
          // Use the account service to search for opponent data by username
          const opponentData = await accountService.searchAccountByUsername(opponentInfo.name);
          if (opponentData) {
            setOpponentData(opponentData);
          }
        } catch (error) {
          console.error('Failed to fetch opponent data:', error);
        }
      } else {
        setOpponentData(null);
      }
    };

    fetchOpponentData();
  }, [match, currentPlayerID]);
  
  // Check if both players are ready
  const areBothPlayersReady = () => {
    if (!match) return false;
    
    // Need two players
    const players = match.players.filter(p => p.name);
    if (players.length < 2) return false;
    
    // Both must be ready - check inside player.data (strict equality to ensure true value)
    return players.every(p => p.data?.isReady === true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 font-mono text-primary">
        <div className="animate-pulse flex items-center">
          <FaCog className="animate-spin mr-2" />
          <span>ESTABLISHING CONNECTION...</span>
        </div>
      </div>
    );
  }
  
  if (!match) {
    return (
      <div className="border border-error/50 bg-error/20 text-error px-6 py-5 rounded-md flex items-center justify-center">
        <FaExclamationTriangle className="mr-2" />
        <span className="font-mono">CONNECTION FAILED: LOBBY NOT FOUND</span>
      </div>
    );
  }

  const opponentInfo = getOpponentInfo();
  const gameMode = match.setupData?.gameMode || 'standard';
  
  // Determine who the host is (player in slot 0)
  const hostPlayer = match.players.find(p => p.id === 0);
  const isCurrentPlayerHost = currentPlayerID === '0';
  const isOpponentHost = !isCurrentPlayerHost && hostPlayer?.name;

  return (
    <>
      <div className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm">
        <div className="bg-base-200 border border-primary/20 p-4 relative">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
      
      {/* Error and warning messages - compact */}
      {error && (
        <div className="mb-3 border border-error/50 bg-error/20 text-error px-3 py-2 flex items-center text-xs">
          <FaExclamationCircle className="mr-2 animate-pulse" />
          <p className="font-mono">{error}</p>
        </div>
      )}
      
      {warning && (
        <div className="mb-3 border border-yellow-600/50 bg-yellow-600/10 text-yellow-500 px-3 py-2 flex items-center text-xs">
          <FaExclamationTriangle className="mr-2" />
          <p className="font-mono">{warning}</p>
        </div>
      )}
      
      {/* Header - compact */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-col">
          <div className="flex items-center">
            <h2 className="text-lg font-mono text-primary font-bold">
              {match.setupData?.lobbyName || 'Unnamed Lobby'}
            </h2>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs font-mono text-primary/70">LOBBY #{matchID}</span>
            {match?.setupData.isPrivate && (
              <>
                <span className="text-primary/50">•</span>
                <div className="flex items-center gap-1">
                  <FaLock className="text-primary/70 text-xs" />
                  <span className="text-xs font-mono text-primary/70">PRIVATE</span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="px-2 py-1 bg-primary/20 border border-primary/40 text-primary font-mono text-xs uppercase">
          <div className="flex items-center">
            <FaCog className="mr-1 text-xs" />
            <span>{gameMode}</span>
          </div>
        </div>
      </div>
      
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-3"></div>
      
      {/* Players section - compact */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
        {/* Current player */}
        <div className="md:col-span-2 border border-primary/50 bg-base-900/80 p-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 -mt-6 -mr-6 bg-primary/10 rounded-full blur-xl"></div>
          
          <div className="flex items-center mb-2">
            {/* Avatar */}
            <div className="relative w-10 h-10 border-2 border-primary/50 bg-base-300/50 rounded-full overflow-hidden mr-2">
              <img
                src={user?.id ? accountService.getAvatarUrl(user.id) : logo}
                alt={`${user?.username}'s avatar`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = logo;
                }}
              />
              {/* Decoration overlay */}
              {user?.decoration && (
                <img
                  src={storeService.getDecorationUrl(user.decoration)}
                  alt="Decoration"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              )}
            </div>
            
            <div className="flex items-center gap-1 flex-wrap">
              <div className="text-sm font-mono text-primary font-bold">{user?.username || 'YOU'}</div>
              {user?.type && <UserTypeTag userType={user.type} />}
              {isHost && (
                <div className="px-1.5 py-0.5 bg-primary/20 border border-primary/40 text-primary text-xs font-mono">
                  HOST
                </div>
              )}
            </div>
          </div>
          
          <div className={`flex items-center mb-2 text-xs ${isReady ? 'text-green-500' : 'text-gray-400'}`}>
            {isReady ? <FaCheck className="mr-1 text-xs" /> : <FaTimes className="mr-1 text-xs" />}
            <span className="font-mono">
              {isReady ? 'READY' : 'NOT READY'}
            </span>
          </div>
          
          <button 
            onClick={() => {
              triggerClick(); // Play click sound on button press
              handleReadyToggle();
            }}
            className={`w-full py-1.5 px-3 font-mono text-xs flex items-center justify-center transition-colors duration-300 ${isReady 
              ? 'bg-red-900/30 border border-red-700/50 text-red-500 hover:bg-red-900/50' 
              : 'bg-green-900/30 border border-green-500/50 text-green-500 hover:bg-green-900/50'}`}
          >
            {isReady ? (
              <>
                <FaTimes className="mr-1 text-xs" />
                <span>CANCEL</span>
              </>
            ) : (
              <>
                <FaCheck className="mr-1 text-xs" />
                <span>READY</span>
              </>
            )}
          </button>
        </div>
        
        {/* VS divider */}
        <div className="flex items-center justify-center">
          <div className="text-primary-300 font-mono text-xl font-bold">VS</div>
        </div>
        
        {/* Opponent player */}
        <div className="md:col-span-2 border border-secondary/30 bg-base-900/80 p-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 -mt-6 -mr-6 bg-secondary/10 rounded-full blur-xl"></div>
          
          <div className="flex items-center mb-2">
            {/* Avatar */}
            <div className="relative w-10 h-10 border-2 border-secondary/50 bg-base-300/50 rounded-full overflow-hidden mr-2">
              {opponentData ? (
                <img
                  src={accountService.getAvatarUrl(opponentData.id)}
                  alt={`${opponentInfo.name}'s avatar`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = logo;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-base-300 flex items-center justify-center">
                  <FaUserAlt className="text-secondary/50" />
                </div>
              )}
              {/* Decoration overlay */}
              {opponentData?.decoration && (
                <img
                  src={storeService.getDecorationUrl(opponentData.decoration)}
                  alt="Decoration"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              )}
            </div>
            
            <div className="flex items-center gap-1 flex-wrap">
              <div className="text-sm font-mono text-secondary font-bold">
                {opponentInfo.name}
              </div>
              {opponentData?.type && <UserTypeTag userType={opponentData.type} />}
              {isOpponentHost && (
                <div className="px-1.5 py-0.5 bg-secondary/20 border border-secondary/40 text-secondary text-xs font-mono">
                  HOST
                </div>
              )}
            </div>
          </div>
          
          {opponentInfo.name !== 'Waiting for opponent...' && (
            <div className={`flex items-center mb-2 text-xs ${opponentInfo.isReady ? 'text-green-500' : 'text-gray-400'}`}>
              {opponentInfo.isReady ? <FaCheck className="mr-1 text-xs" /> : <FaTimes className="mr-1 text-xs" />}
              <span className="font-mono">
                {opponentInfo.isReady ? 'READY' : 'NOT READY'}
              </span>
            </div>
          )}
          
          {opponentInfo.name === 'Waiting for opponent...' && (
            <div className="text-secondary/50 font-mono text-xs italic flex items-center">
              <div className="animate-pulse mr-1">•</div>
              <span>AWAITING</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Role assignment info - compact */}
      <div className="mb-4 border border-primary/20 bg-base-900/80 p-3">
        <div className="flex items-center mb-2">
          <FaCog className="text-primary mr-2 text-sm" />
          <h3 className="text-sm font-mono text-primary font-bold">ROLE ASSIGNMENT</h3>
        </div>
        
        <p className="text-base-content/80 font-mono text-xs mb-2">
          Host → Attacker, Second player → Defender
        </p>
        
        {/* Host transfer notification - compact */}
        {hostTransferOccurred && isHost && (
          <div className="bg-green-900/30 border border-green-500 text-green-400 p-2 mb-2 shadow-lg animate-pulse">
            <div className="flex items-center text-xs">
              <FaUserAlt className="mr-1 text-green-400 text-xs" />
              <span className="font-bold">You are now HOST</span>
            </div>
            <p className="mt-1 text-xs">Previous host disconnected. You can start the game.</p>
          </div>
        )}
        
        {hostTransferOccurred && !isHost && (
          <div className="bg-blue-900/30 border border-blue-500 text-blue-400 p-2 mb-2 shadow-lg">
            <div className="flex items-center text-xs">
              <FaUserAlt className="mr-1 text-blue-400 text-xs" />
              <span className="font-bold">Host changed</span>
            </div>
            <p className="mt-1 text-xs">Previous host disconnected.</p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center">
            <FaUserSecret className="text-accent mr-1 text-sm" />
            <span className="font-mono text-accent text-xs">ATTACKER</span>
          </div>
          <div className="flex items-center">
            <FaShieldAlt className="text-secondary mr-1 text-sm" />
            <span className="font-mono text-secondary text-xs">DEFENDER</span>
          </div>
        </div>
      </div>
      
      {/* Game settings - compact */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <FaCog className="text-primary mr-2 text-sm" />
          <h3 className="text-sm font-mono text-primary font-bold">OPERATION PARAMETERS</h3>
        </div>
        
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-2"></div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="border border-primary/20 bg-base-900/60 p-2">
            <div className="text-xs text-primary-300 font-mono mb-0.5">MODE</div>
            <div className="text-primary font-mono text-xs">{gameMode.toUpperCase()}</div>
          </div>
          <div className="border border-primary/20 bg-base-900/60 p-2">
            <div className="text-xs text-primary-300 font-mono mb-0.5">RESOURCES</div>
            <div className="text-primary font-mono text-xs">{match.setupData?.initialResources || 5}</div>
          </div>
          <div className="border border-primary/20 bg-base-900/60 p-2">
            <div className="text-xs text-primary-300 font-mono mb-0.5">MAX TURNS</div>
            <div className="text-primary font-mono text-xs">{match.setupData?.maxTurns || 30}</div>
          </div>
          {match.setupData?.timeLimit && (
            <div className="border border-primary/20 bg-base-900/60 p-2">
              <div className="text-xs text-primary-300 font-mono mb-0.5">TIME LIMIT</div>
              <div className="text-primary font-mono text-xs flex items-center">
                <FaClock className="mr-1 text-xs" />
                <span>{match.setupData.timeLimit}s</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Status and actions - compact */}
      <div className="border-t border-primary/20 pt-3 flex flex-col md:flex-row items-center justify-between mb-4">
        <div className="status-message text-primary-300 font-mono text-xs mb-2 md:mb-0">
          {match?.players.filter(p => p.name).length === 2 
            ? areBothPlayersReady() 
              ? <span className="text-green-500 flex items-center"><FaCheck className="mr-1 text-xs" /> Both ready</span>
              : <span className="animate-pulse">Awaiting ready...</span>
            : <span className="animate-pulse">Awaiting player...</span>}
        </div>
        
        <div className="flex space-x-2">
          {isHost && (
            <button 
              onClick={handleStartGame}
              disabled={!areBothPlayersReady()}
              className={`px-3 py-1.5 font-mono text-xs flex items-center ${!areBothPlayersReady() 
                ? 'bg-green-900/20 border border-green-500/20 text-green-500/40 cursor-not-allowed' 
                : 'bg-green-900/30 border border-green-500/50 text-green-500 hover:bg-green-900/50 transition-colors duration-300'}`}
            >
              <FaPlay className="mr-1 text-xs" />
              <span>LAUNCH</span>
            </button>
          )}
          
          <button 
            onClick={handleLeaveMatch}
            className="px-3 py-1.5 bg-red-900/20 border border-red-500/30 text-red-400 hover:bg-red-900/30 transition-colors duration-300 font-mono text-xs flex items-center"
          >
            <FaDoorOpen className="mr-1 text-xs" />
            <span>LEAVE</span>
          </button>
        </div>
      </div>

      {/* Chat section with channel switching */}
      <div className="mt-4">
        <LobbyChat 
          lobbyId={matchID} 
          showChannelSwitcher={true}
          className="" 
        />
      </div>
        </div>
      </div>
    </>
  );
};

export default LobbyDetail;
