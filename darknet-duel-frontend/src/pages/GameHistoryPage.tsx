import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import gameService from '../services/game.service';
import accountService from '../services/account.service';
import LoadingScreen from '../components/LoadingScreen';
import logo from '../assets/logo.png';
import type { GameHistoryItem, GameDetails } from '../types/game.types';

const GameHistoryPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  // Component state
  const [isLoading, setIsLoading] = useState(true);
  const [games, setGames] = useState<GameHistoryItem[]>([]);
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);
  const [gameDetails, setGameDetails] = useState<Record<string, GameDetails>>({});
  const [playerProfiles, setPlayerProfiles] = useState<Record<string, any>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [theme, setTheme] = useState<'cyberpunk' | 'cyberpunk-dark'>('cyberpunk');

  // Get theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'cyberpunk' | 'cyberpunk-dark' || 'cyberpunk';
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'cyberpunk' ? 'cyberpunk-dark' : 'cyberpunk';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Load initial game history
  useEffect(() => {
    const loadGameHistory = async () => {
      try {
        setIsLoading(true);
        const response = await gameService.getGameHistory(20, 0);
        setGames(response.games);
        setHasMore(response.hasMore);
        setError(null);
      } catch (err) {
        console.error('Failed to load game history:', err);
        setError('Failed to load game history. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadGameHistory();
  }, []);

  // Load more games (pagination)
  const loadMoreGames = async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const response = await gameService.getGameHistory(20, games.length);
      setGames(prev => [...prev, ...response.games]);
      setHasMore(response.hasMore);
    } catch (err) {
      console.error('Failed to load more games:', err);
      setError('Failed to load more games.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Toggle game details expansion
  const toggleGameDetails = async (gameId: string) => {
    if (expandedGameId === gameId) {
      setExpandedGameId(null);
      return;
    }

    setExpandedGameId(gameId);

    // Load game details if not already loaded
    if (!gameDetails[gameId] && !loadingDetails[gameId]) {
      try {
        setLoadingDetails(prev => ({ ...prev, [gameId]: true }));
        const details = await gameService.getGameDetails(gameId);
        setGameDetails(prev => ({ ...prev, [gameId]: details }));

        // Load player profiles for this game
        for (const player of details.players) {
          if (!playerProfiles[player.accountId]) {
            try {
              const profile = await accountService.getAccountByUuid(player.accountId);
              setPlayerProfiles(prev => ({ ...prev, [player.accountId]: profile }));
            } catch (profileErr) {
              console.warn(`Failed to load profile for player ${player.accountId}:`, profileErr);
              // Set a fallback profile so we don't keep trying to load it
              setPlayerProfiles(prev => ({ 
                ...prev, 
                [player.accountId]: { 
                  username: player.username, 
                  bio: null,
                  rating: player.ratingAfter || player.ratingBefore || 'N/A'
                }
              }));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load game details:', err);
        setError('Failed to load game details.');
      } finally {
        setLoadingDetails(prev => ({ ...prev, [gameId]: false }));
      }
    }
  };



  // Format rating change display
  const formatRatingChange = (change: number | null) => {
    if (!change) return '';
    if (change > 0) return `+${change}`;
    return change.toString();
  };

  return (
    <div className="min-h-screen bg-base-100 relative overflow-hidden text-base-content">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
      
      <div className={`relative z-10 transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'} scanline`}>
        <header className="p-4 border-b border-primary/20 backdrop-blur-sm bg-base-100/80">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity duration-200" onClick={() => navigate('/dashboard')}>
              <img src={logo} alt="Darknet Duel Logo" className="h-8" />
              <h1 className="text-xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 text-flicker">
                DARKNET_DUEL
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/dashboard')} 
                className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
              >
                <span className="mr-1">🏠</span> 
                <span className="hidden sm:inline">DASHBOARD</span>
              </button>
              
              <button 
                onClick={() => navigate('/lobbies')} 
                className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
              >
                <span className="mr-1">🎮</span> 
                <span className="hidden sm:inline">LOBBY</span>
              </button>
              
              <button 
                onClick={() => navigate(`/profile/${user?.id}`)} 
                className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
                aria-label="Profile"
              >
                <span className="mr-1">👤</span>
                <span className="hidden sm:inline">PROFILE</span>
              </button>
              
              <button 
                onClick={() => navigate('/topup')} 
                className="btn btn-sm bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-400 hover:border-yellow-300 text-black font-bold btn-cyberpunk pulse-glow relative overflow-hidden group"
                aria-label="Top Up"
              >
                <span className="mr-1">💎</span>
                <span className="hidden sm:inline text-flicker">TOP-UP</span>
                <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </button>
              
              <button
                onClick={toggleTheme}
                className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
                aria-label="Toggle Theme"
              >
                {theme === 'cyberpunk' ? '🌙' : '☀️'}
              </button>
            </div>
          </div>
        </header>

        <main className="container mx-auto p-4">
          {/* Page header */}
          <div className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm mb-8">
            <div className="bg-base-200 border border-primary/20 p-4 relative">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
              
              <div className="font-mono">
                <div className="flex items-baseline justify-between mb-1">
                  <h2 className="text-2xl font-bold mb-2 font-mono">
                    COMBAT_HISTORY_LOG
                  </h2>
                  <div className="text-xs text-base-content/70">
                    OPERATOR: <span className="text-primary data-corrupt" data-text={user?.username}>{user?.username}</span>
                  </div>
                </div>
                <div className="text-base-content text-sm">
                  SECURE_ACCESS: GRANTED | ENCRYPTION: ACTIVE
                </div>
                <div className="text-xs text-primary mt-3">
                  ⚠️ CLASSIFIED MISSION RECORDS • AUTHORIZED PERSONNEL ONLY
                </div>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="alert alert-error mb-6">
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="btn btn-sm btn-ghost ml-auto"
              >
                ✕
              </button>
            </div>
          )}

          {/* Game history list */}
          <div className="space-y-4">
            {games.map((game) => {
              const isExpanded = expandedGameId === game.gameId;
              const roleInfo = gameService.getRoleInfo(game.playerRole);
              const gameModeInfo = gameService.getGameModeInfo(game.gameMode);
              const details = gameDetails[game.gameId];
              const isLoadingThisGame = loadingDetails[game.gameId];

              return (
                <div key={game.gameId} className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm">
                  <div className="bg-base-200 border border-primary/20 relative">
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
                    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
                    
                    {/* Main game row */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-base-300/30 transition-colors"
                      onClick={() => toggleGameDetails(game.gameId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Result indicator */}
                          <div className={`w-3 h-3 rounded-full ${game.isWinner ? 'bg-success' : 'bg-error'} pulse-glow`}></div>
                          
                          {/* Game info */}
                          <div className="font-mono">
                            <div className="flex items-center gap-3 mb-1">
                              <span className={`text-lg font-bold ${game.isWinner ? 'text-success' : 'text-error'}`}>
                                {game.isWinner ? 'VICTORY' : 'DEFEAT'}
                              </span>
                              <span className="text-xs text-base-content/70">
                                vs {game.opponent?.username || 'Unknown Operator'}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-base-content/70">
                              <span className={roleInfo.color}>
                                {roleInfo.icon} {roleInfo.name}
                              </span>
                              <span className={gameModeInfo.color}>
                                {gameModeInfo.name}
                              </span>
                              <span>
                                {gameService.formatRelativeTime(game.endTime)}
                              </span>
                              <span>
                                {gameService.formatGameDuration(game.startTime, game.endTime)}
                              </span>
                              <span>
                                {game.turnCount} turns
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Rating change */}
                          {game.ratingChange && (
                            <div className={`text-sm font-mono ${game.ratingChange > 0 ? 'text-success' : 'text-error'}`}>
                              {formatRatingChange(game.ratingChange)} ELO
                            </div>
                          )}
                          
                          {/* Expand indicator */}
                          <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            <span className="text-primary">▼</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="border-t border-primary/20 p-4 bg-base-300/20">
                        {isLoadingThisGame ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="loading loading-spinner text-primary"></div>
                            <span className="ml-3 font-mono text-primary">LOADING_MISSION_DATA...</span>
                          </div>
                        ) : details ? (
                          <div className="space-y-4">
                            {/* Game overview */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="p-3 bg-base-300/50 border border-primary/20">
                                <div className="text-xs text-primary font-mono mb-1">MISSION_DETAILS</div>
                                <div className="text-sm">
                                  <div>Game ID: {details.gameId.substring(0, 8)}...</div>
                                  <div>Mode: {gameModeInfo.name}</div>
                                  <div>Duration: {gameService.formatGameDuration(details.startTime, details.endTime)}</div>
                                  <div>Turns: {details.turnCount}</div>
                                </div>
                              </div>
                              
                              <div className="p-3 bg-base-300/50 border border-primary/20">
                                <div className="text-xs text-primary font-mono mb-1">OUTCOME</div>
                                <div className="text-sm">
                                  {details.winnerId ? (
                                    <>
                                      <div>Winner: {details.winnerRole}</div>
                                      <div className={game.isWinner ? 'text-success' : 'text-error'}>
                                        {game.isWinner ? 'Mission Successful' : 'Mission Failed'}
                                      </div>
                                    </>
                                  ) : (
                                    <div className="text-warning">
                                      Mission Abandoned
                                      {details.abandonReason && (
                                        <div className="text-xs text-base-content/70">
                                          Reason: {details.abandonReason}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="p-3 bg-base-300/50 border border-primary/20">
                                <div className="text-xs text-primary font-mono mb-1">TIMESTAMP</div>
                                <div className="text-sm">
                                  <div>Started: {new Date(details.startTime).toLocaleString()}</div>
                                  <div>Ended: {new Date(details.endTime).toLocaleString()}</div>
                                </div>
                              </div>
                            </div>

                            {/* Player details */}
                            <div>
                              <div className="text-xs text-primary font-mono mb-3">OPERATORS</div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {details.players.map((player) => {
                                  const playerRoleInfo = gameService.getRoleInfo(player.playerRole);
                                  const isCurrentUser = player.accountId === user?.id;
                                  
                                  return (
                                    <div 
                                      key={player.accountId}
                                      className={`p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm ${isCurrentUser ? 'from-primary/30 via-primary/15' : ''}`}
                                    >
                                      <div className={`bg-base-200 border ${isCurrentUser ? 'border-primary/40' : 'border-primary/20'} p-4 relative`}>
                                        {/* Corner accents */}
                                        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
                                        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
                                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
                                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
                                        
                                        <div className="flex justify-between items-center mb-4">
                                          <h4 className="font-mono text-primary text-sm">
                                            {playerRoleInfo.icon} {playerRoleInfo.name.toUpperCase()}
                                            {isCurrentUser && <span className="text-yellow-400 ml-1">(YOU)</span>}
                                          </h4>
                                          <div className={`text-xs font-mono ${player.isWinner ? 'text-success' : 'text-error'}`}>
                                            {player.isWinner ? 'WINNER' : 'DEFEATED'}
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center space-x-4">
                                          {/* Profile Avatar */}
                                          <div className="flex-shrink-0">
                                            <div className="w-12 h-12 border-2 border-primary/50 bg-base-300/50 rounded-full overflow-hidden relative">
                                              <img
                                                src={accountService.getAvatarUrl(player.accountId)}
                                                alt={`${player.username}'s avatar`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                  // Fallback to logo if avatar fails to load
                                                  const target = e.target as HTMLImageElement;
                                                  target.src = logo;
                                                }}
                                              />
                                              {/* Status indicator */}
                                              <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-base-200 rounded-full ${player.isWinner ? 'bg-success' : 'bg-error'}`}></div>
                                            </div>
                                          </div>
                                          
                                          {/* Profile Info */}
                                          <div className="flex-1 min-w-0">
                                            <div className="font-mono">
                                              <div className="text-sm font-bold text-primary truncate">
                                                {player.username}
                                              </div>
                                              <div className="text-xs text-base-content/70 mb-2">
                                                RATING: {player.ratingBefore || 'N/A'} → {player.ratingAfter || 'N/A'}
                                                {player.ratingChange && (
                                                  <span className={`ml-2 ${player.ratingChange > 0 ? 'text-success' : 'text-error'}`}>
                                                    ({formatRatingChange(player.ratingChange)})
                                                  </span>
                                                )}
                                              </div>
                                              <div className="text-xs text-base-content/90 mb-2">
                                                {playerProfiles[player.accountId]?.bio ? (
                                                  <div className="italic border-l-2 border-primary/30 pl-2">
                                                    "{playerProfiles[player.accountId].bio}"
                                                  </div>
                                                ) : (
                                                  <div className="text-base-content/50 italic">
                                                    Mission {player.isWinner ? 'completed successfully' : 'failed'}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-base-content/70">
                            <span className="font-mono">Failed to load mission details</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load more button */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMoreGames}
                disabled={isLoadingMore}
                className="btn btn-outline btn-primary font-mono btn-cyberpunk"
              >
                {isLoadingMore ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    LOADING_MORE...
                  </>
                ) : (
                  'LOAD_MORE_RECORDS'
                )}
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && games.length === 0 && (
            <div className="text-center py-16">
              <div className="p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm max-w-md mx-auto">
                <div className="bg-base-200 border border-primary/20 p-8 relative">
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>
                  
                  <div className="font-mono text-center">
                    <div className="text-6xl mb-4">🎮</div>
                    <h3 className="text-xl text-primary mb-2">NO_RECORDS_FOUND</h3>
                    <p className="text-base-content/70 mb-4">
                      No combat missions have been logged yet.
                    </p>
                    <button
                      onClick={() => navigate('/lobbies')}
                      className="btn btn-primary font-mono btn-cyberpunk"
                    >
                      START_FIRST_MISSION
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Show loading animation */}
      {isLoading && <LoadingScreen text="ACCESSING COMBAT ARCHIVES" />}
    </div>
  );
};

export default GameHistoryPage; 