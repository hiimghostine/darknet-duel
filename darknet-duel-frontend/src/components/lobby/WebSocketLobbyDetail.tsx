/**
 * WebSocket Lobby Detail Component
 * 
 * Real-time lobby view for WebSocket-based private lobbies
 * Replaces polling with WebSocket events
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { websocketLobbyService } from '../../services/websocketLobby.service';
import type { Lobby } from '../../services/websocketLobby.service';
import { useAuthStore } from '../../store/auth.store';
import { FaUserSecret, FaShieldAlt, FaExclamationTriangle, FaDoorOpen, FaPlay, FaCheck, FaTimes, FaLock, FaCopy, FaUserTimes, FaSync, FaCog, FaClock } from 'react-icons/fa';
import { useAudioManager } from '../../hooks/useAudioManager';
import LobbyChat from './LobbyChat';

const WebSocketLobbyDetail: React.FC = () => {
  const { lobbyId = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { triggerClick, triggerPositiveClick } = useAudioManager();
  
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inactivityWarning, setInactivityWarning] = useState<{ timeRemaining: number; reason: string } | null>(null);
  const [swapRequested, setSwapRequested] = useState(false);
  const [swapRequestFrom, setSwapRequestFrom] = useState<{ userId: string; username: string } | null>(null);

  // Check if current user is host
  const isHost = lobby?.createdBy === user?.id;

  // Check if all non-host players are ready (host doesn't need to be ready)
  const allPlayersReady = (() => {
    if (!lobby || (lobby.players.length || 0) < 2) return false;
    const nonHostPlayers = lobby.players.filter(p => p.userId !== lobby.createdBy);
    return nonHostPlayers.every(p => p.isReady);
  })();

  useEffect(() => {
    if (!user) {
      setError('You must be logged in');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authenticated');
      return;
    }

    // Connect to WebSocket
    const initializeWebSocket = async () => {
      try {
        if (!websocketLobbyService.isConnected()) {
          await websocketLobbyService.connect(token);
        }

        // Set up event listeners
        websocketLobbyService.on('lobby:updated', handleLobbyUpdated);
        websocketLobbyService.on('lobby:player:joined', handlePlayerJoined);
        websocketLobbyService.on('lobby:player:left', handlePlayerLeft);
        websocketLobbyService.on('lobby:game:starting', handleGameStarting);
        websocketLobbyService.on('lobby:closed', handleLobbyClosed);
        websocketLobbyService.on('lobby:error', handleError);
        websocketLobbyService.on('lobby:inactivity:warning', handleInactivityWarning);
        websocketLobbyService.on('lobby:kicked', handleKicked);
        websocketLobbyService.on('lobby:swap:requested', handleSwapRequested);
        websocketLobbyService.on('lobby:swap:sent', handleSwapSent);
        websocketLobbyService.on('lobby:swap:declined', handleSwapDeclined);

        // Fetch initial lobby state
        websocketLobbyService.getLobby(lobbyId);
        
        // Set loading to false after a short delay to allow initial state to arrive
        setTimeout(() => setLoading(false), 500);
      } catch (err) {
        console.error('Failed to initialize WebSocket:', err);
        setError('Failed to connect to lobby');
        setLoading(false);
      }
    };

    initializeWebSocket();

    return () => {
      // Clean up listeners
      websocketLobbyService.off('lobby:updated', handleLobbyUpdated);
      websocketLobbyService.off('lobby:player:joined', handlePlayerJoined);
      websocketLobbyService.off('lobby:player:left', handlePlayerLeft);
      websocketLobbyService.off('lobby:game:starting', handleGameStarting);
      websocketLobbyService.off('lobby:closed', handleLobbyClosed);
      websocketLobbyService.off('lobby:error', handleError);
      websocketLobbyService.off('lobby:inactivity:warning', handleInactivityWarning);
      websocketLobbyService.off('lobby:kicked', handleKicked);
    };
  }, [user, lobbyId]);

  // Prevent accidental tab/window close while in lobby
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only show warning if user is in a lobby
      if (lobby) {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set
        return ''; // Some browsers show this message
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [lobby]);

  const handleLobbyUpdated = (data: { lobby: Lobby }) => {
    console.log('📡 Lobby updated:', data.lobby);
    setLobby(data.lobby);
    
    // Update local ready state
    const me = data.lobby.players.find(p => p.userId === user?.id);
    if (me) {
      setIsReady(me.isReady);
    }
    
    // Clear swap request states when lobby updates (swap completed)
    setSwapRequested(false);
    setSwapRequestFrom(null);
  };

  const handlePlayerJoined = (data: { userId: string; username: string }) => {
    console.log('👤 Player joined:', data.username);
    triggerPositiveClick();
  };

  const handlePlayerLeft = (data: { userId: string; username: string }) => {
    console.log('🚪 Player left:', data.username);
  };

  const handleGameStarting = async (data: { lobbyId: string; matchID: string; lobby: Lobby }) => {
    console.log('🎮 Game starting! Match ID:', data.matchID);
    
    if (!user) {
      setError('Not authenticated');
      return;
    }

    try {
      // Find our position in the lobby (0 or 1)
      const playerIndex = data.lobby.players.findIndex(p => p.userId === user.id);
      
      if (playerIndex === -1) {
        setError('You are not in this lobby');
        return;
      }

      const playerID = playerIndex.toString();
      
      console.log(`🔗 Joining match ${data.matchID} as player ${playerID}...`);

      // Import lobby service dynamically
      const { default: lobbyService } = await import('../../services/lobby.service');

      // Join the boardgame.io match to get credentials
      const result = await lobbyService.joinMatch(
        data.matchID,
        user.username,
        playerID,
        {
          data: {
            realUserId: user.id,
            realUsername: user.username
          }
        }
      );

      if (result) {
        console.log('✅ Successfully joined match, navigating to game...');
        
        // Update localStorage to mark as in-game
        const { updateMatchToGame } = await import('../../utils/lobbyStorage');
        updateMatchToGame();
        
        // Navigate to the game with the matchID
        navigate(`/game/${data.matchID}`);
      } else {
        setError('Failed to join game match');
      }
    } catch (error) {
      console.error('❌ Error joining game:', error);
      setError('Failed to join game');
    }
  };

  const handleLobbyClosed = (data: { lobbyId: string; reason: string }) => {
    console.log('🗑️ Lobby closed:', data.reason);
    setError(`Lobby closed: ${data.reason}`);
    setTimeout(() => navigate('/lobbies'), 3000);
  };

  const handleError = (data: { error: string }) => {
    console.error('❌ Lobby error:', data.error);
    setError(data.error);
  };

  const handleInactivityWarning = (data: { lobbyId: string; timeRemaining: number; reason: string; message: string }) => {
    console.warn('⚠️ Inactivity warning:', data.message);
    setInactivityWarning({ timeRemaining: data.timeRemaining, reason: data.reason });
  };

  const handleKicked = (data: { lobbyId: string; reason: string }) => {
    console.log('👢 Kicked from lobby:', data.reason);
    setError(data.reason);
    setTimeout(() => navigate('/lobbies'), 2000);
  };

  const handleSwapRequested = (data: { lobbyId: string; requesterId: string; requesterName: string }) => {
    console.log('🔄 Swap requested by:', data.requesterName);
    setSwapRequestFrom({ userId: data.requesterId, username: data.requesterName });
  };

  const handleSwapSent = (data: { lobbyId: string }) => {
    console.log('🔄 Swap request sent');
    setSwapRequested(true);
  };

  const handleSwapDeclined = (data: { lobbyId: string }) => {
    console.log('❌ Swap request declined');
    setSwapRequested(false);
    setError('Position swap request was declined');
    setTimeout(() => setError(null), 3000);
  };

  const handleToggleReady = () => {
    if (!lobby) return;
    
    const newReadyState = !isReady;
    setIsReady(newReadyState);
    websocketLobbyService.setReady(lobby.lobbyId, newReadyState);
    triggerClick();
  };

  const handleStartGame = () => {
    if (!lobby || !isHost) return;
    
    websocketLobbyService.startGame(lobby.lobbyId);
    triggerClick();
  };

  const handleLeaveLobby = () => {
    if (!lobby) return;
    
    websocketLobbyService.leaveLobby(lobby.lobbyId);
    triggerClick();
    navigate('/lobbies');
  };

  const handleKickPlayer = (userId: string) => {
    if (!lobby || !isHost) return;
    
    websocketLobbyService.kickPlayer(lobby.lobbyId, userId);
    triggerClick();
  };

  const handleRequestSwap = () => {
    if (!lobby) return;
    
    websocketLobbyService.requestSwap(lobby.lobbyId);
    triggerClick();
  };

  const handleAcceptSwap = () => {
    if (!lobby) return;
    
    websocketLobbyService.acceptSwap(lobby.lobbyId);
    setSwapRequestFrom(null);
    triggerPositiveClick();
  };

  const handleDeclineSwap = () => {
    if (!lobby) return;
    
    websocketLobbyService.declineSwap(lobby.lobbyId);
    setSwapRequestFrom(null);
    triggerClick();
  };

  const handleCopyLobbyCode = () => {
    if (!lobby) return;
    
    navigator.clipboard.writeText(lobby.lobbyCode);
    setCopied(true);
    triggerPositiveClick();
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-primary font-mono">Loading lobby...</div>
      </div>
    );
  }

  if (error && !lobby) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-error font-mono">{error}</div>
      </div>
    );
  }

  if (!lobby) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-primary font-mono">Lobby not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT: Lobby Details (2/3 width on large screens) */}
        <div className="lg:col-span-2">
          <div className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm">
            <div className="bg-base-200 border border-primary/20 p-6 relative">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-mono text-primary font-bold flex items-center">
                <FaLock className="mr-2" />
                {lobby.name}
              </h2>
              <div className="text-sm font-mono text-primary/70">
                {lobby.state.toUpperCase()}
              </div>
            </div>
            
            {/* Lobby Code */}
            <div className="flex items-center gap-2 mb-4">
              <div className="text-sm font-mono text-primary/70">LOBBY CODE:</div>
              <div className="text-lg font-mono text-primary font-bold">{lobby.lobbyCode}</div>
              <button
                onClick={handleCopyLobbyCode}
                className="px-2 py-1 border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-mono transition-colors"
              >
                <FaCopy className="inline mr-1" />
                {copied ? 'COPIED!' : 'COPY'}
              </button>
            </div>

            {error && (
              <div className="mb-3 border border-error/50 bg-error/20 text-error px-3 py-2 flex items-center text-xs">
                <FaExclamationTriangle className="mr-2 animate-pulse" />
                <p className="font-mono">{error}</p>
              </div>
            )}

            {inactivityWarning && (
              <div className="mb-3 border border-warning/50 bg-warning/20 text-warning px-3 py-2 flex items-center text-xs animate-pulse">
                <FaExclamationTriangle className="mr-2" />
                <p className="font-mono">
                  ⚠️ WARNING: This lobby will be closed in {inactivityWarning.timeRemaining} seconds due to {inactivityWarning.reason}
                </p>
              </div>
            )}
          </div>

          {/* Players */}
          <div className="mb-6">
            <h3 className="text-sm font-mono text-primary font-bold mb-3">
              OPERATIVES ({lobby.players.length}/{lobby.maxPlayers})
            </h3>
            
            <div className="grid md:grid-cols-2 gap-3">
              {lobby.players.map((player, index) => (
                <div
                  key={player.userId}
                  className={`border p-3 ${
                    player.isHost
                      ? 'border-accent/50 bg-accent/10'
                      : 'border-primary/30 bg-base-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {index === 0 ? (
                        <FaUserSecret className="text-accent mr-2" />
                      ) : (
                        <FaShieldAlt className="text-secondary mr-2" />
                      )}
                      <span className="font-mono text-sm font-bold">
                        {player.username}
                      </span>
                      {player.isHost && (
                        <span className="ml-2 text-xs text-accent font-mono">[HOST]</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {player.isHost ? (
                        <div className="flex items-center gap-1">
                          <FaCheck className="text-success" />
                          <span className="text-xs text-success/70 font-mono">(AUTO)</span>
                        </div>
                      ) : player.isReady ? (
                        <FaCheck className="text-success" />
                      ) : (
                        <FaTimes className="text-error/50" />
                      )}
                      
                      {isHost && !player.isHost && (
                        <button
                          onClick={() => handleKickPlayer(player.userId)}
                          className="px-2 py-1 border border-error/50 bg-error/10 hover:bg-error/20 text-error text-xs font-mono transition-colors"
                          title="Kick player"
                        >
                          <FaUserTimes />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs font-mono text-primary/60">
                    {index === 0 ? 'ATTACKER' : 'DEFENDER'}
                  </div>
                </div>
              ))}
              
              {/* Empty slots */}
              {Array.from({ length: lobby.maxPlayers - lobby.players.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="border border-primary/20 bg-base-900/40 p-3 opacity-50"
                >
                  <div className="font-mono text-sm text-primary/50">
                    Waiting for player...
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* YOUR ROLE Section */}
          <div className="mb-6 border border-primary/20 bg-base-900/80 p-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-mono text-primary font-bold flex items-center">
                  <FaSync className="mr-2 text-sm" />
                  YOUR ROLE: {lobby.players.findIndex(p => p.userId === user?.id) === 0 ? 'ATTACKER' : 'DEFENDER'}
                </h3>
                <p className="text-xs text-base-content/60 font-mono mt-1">
                  {lobby.players.findIndex(p => p.userId === user?.id) === 0
                    ? '🔴 Red Team - Player 0 - Exploit & Attack'
                    : '🔵 Blue Team - Player 1 - Defend & Fortify'}
                </p>
              </div>

              {/* Position swap controls */}
              {lobby.players.length === 2 && (
                <div>
                  {!swapRequested && !swapRequestFrom && (
                    <button
                      onClick={handleRequestSwap}
                      className="px-3 py-1.5 font-mono text-xs flex items-center bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 transition-colors duration-300"
                    >
                      <FaSync className="mr-1 text-xs" />
                      <span>SWAP ROLES</span>
                    </button>
                  )}

                  {swapRequested && !swapRequestFrom && (
                    <button
                      onClick={() => setSwapRequested(false)}
                      className="px-3 py-1.5 bg-yellow-900/20 border border-yellow-500/40 text-yellow-500 hover:bg-yellow-900/30 transition-colors duration-300 font-mono text-xs flex items-center animate-pulse"
                    >
                      <FaClock className="mr-1 text-xs" />
                      <span>CANCEL REQUEST</span>
                    </button>
                  )}

                  {swapRequestFrom && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleAcceptSwap}
                        className="px-3 py-1.5 bg-green-900/30 border border-green-500/50 text-green-500 hover:bg-green-900/50 transition-colors duration-300 font-mono text-xs flex items-center animate-pulse"
                      >
                        <FaCheck className="mr-1 text-xs" />
                        <span>ACCEPT</span>
                      </button>
                      <button
                        onClick={handleDeclineSwap}
                        className="px-3 py-1.5 bg-red-900/20 border border-red-500/30 text-red-400 hover:bg-red-900/30 transition-colors duration-300 font-mono text-xs flex items-center"
                      >
                        <FaTimes className="mr-1 text-xs" />
                        <span>DECLINE</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Swap status messages */}
            {swapRequestFrom && (
              <div className="bg-green-900/20 border border-green-500/40 text-green-400 p-2 animate-pulse">
                <p className="text-xs font-mono">
                  ⚠️ {swapRequestFrom.username} wants to swap roles! You will become {lobby.players.findIndex(p => p.userId === user?.id) === 0 ? 'DEFENDER (Player 1)' : 'ATTACKER (Player 0)'}.
                </p>
              </div>
            )}

            {swapRequested && !swapRequestFrom && (
              <div className="bg-yellow-900/20 border border-yellow-500/40 text-yellow-500 p-2">
                <p className="text-xs font-mono">
                  ⏳ Waiting for opponent to accept position swap...
                </p>
              </div>
            )}
          </div>

          {/* Game Settings */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <FaCog className="text-primary mr-2 text-sm" />
              <h3 className="text-sm font-mono text-primary font-bold">OPERATION PARAMETERS</h3>
            </div>
            
            <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-2"></div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div className="border border-primary/20 bg-base-900/60 p-2">
                <div className="text-xs text-primary-300 font-mono mb-0.5">MODE</div>
                <div className="text-primary font-mono text-xs">{lobby.gameSettings?.gameMode?.toUpperCase() || 'STANDARD'}</div>
              </div>
              <div className="border border-primary/20 bg-base-900/60 p-2">
                <div className="text-xs text-primary-300 font-mono mb-0.5">RESOURCES</div>
                <div className="text-primary font-mono text-xs">{lobby.gameSettings?.initialResources || 5}</div>
              </div>
              <div className="border border-primary/20 bg-base-900/60 p-2">
                <div className="text-xs text-primary-300 font-mono mb-0.5">MAX TURNS</div>
                <div className="text-primary font-mono text-xs">{lobby.gameSettings?.maxTurns || 30}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-primary/20">
            <button
              onClick={handleLeaveLobby}
              className="px-4 py-2 border border-error/50 bg-error/10 hover:bg-error/20 text-error font-mono text-sm transition-colors"
            >
              <FaDoorOpen className="inline mr-2" />
              LEAVE LOBBY
            </button>

            <div className="flex gap-2">
              {!isHost && (
                <button
                  onClick={handleToggleReady}
                  className={`px-4 py-2 border font-mono text-sm transition-colors ${
                    isReady
                      ? 'border-success/50 bg-success/20 text-success hover:bg-success/30'
                      : 'border-primary/50 bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  {isReady ? (
                    <>
                      <FaCheck className="inline mr-2" />
                      READY
                    </>
                  ) : (
                    <>
                      <FaTimes className="inline mr-2" />
                      NOT READY
                    </>
                  )}
                </button>
              )}

              {isHost && (
                <button
                  onClick={handleStartGame}
                  disabled={!allPlayersReady}
                  className={`px-4 py-2 border font-mono text-sm transition-colors ${
                    allPlayersReady
                      ? 'border-success/50 bg-success/20 text-success hover:bg-success/30'
                      : 'border-primary/30 bg-primary/10 text-primary/50 cursor-not-allowed'
                  }`}
                >
                  <FaPlay className="inline mr-2" />
                  START GAME
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* RIGHT: Chat (1/3 width on large screens) */}
    <div className="lg:col-span-1">
      <LobbyChat lobbyId={lobbyId} showChannelSwitcher={true} />
    </div>
  </div>
</div>
  );
};

export default WebSocketLobbyDetail;
