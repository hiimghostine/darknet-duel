import React from 'react';
import { Zap, Circle, Database, Shield, Swords } from 'lucide-react';
import type { GameState } from '../../../types/game.types';
import PlayerBoard from './PlayerBoard';
import PowerBar from './PowerBar';
import { useTheme } from '../../../store/theme.store';
import LobbyChat from '../../lobby/LobbyChat';

interface GameInfoPanelsProps {
  G: GameState;
  ctx: any;
  playerID: string | null;
  isActive: boolean;
  moves: any;
  isAttacker: boolean;
  currentPlayerObj: any;
  opponent?: any;
  currentPhase: string;
  optimizedInfrastructureData: {
    cards: any[];
    length: number;
    states: any[];
  };
  sendChatMessage?: (content: string) => void;
  matchID?: string;
}

const GameInfoPanels: React.FC<GameInfoPanelsProps> = ({
  G,
  ctx,
  playerID,
  isActive,
  moves,
  isAttacker,
  currentPlayerObj,
  currentPhase,
  optimizedInfrastructureData,
  matchID
}) => {
  // Get theme for conditional styling
  const theme = useTheme();
  
  // Common props to pass to child components
  const commonProps = {
    G,
    ctx,
    playerID,
    isActive,
    moves,
    isAttacker
  };

  return (
    <>
      {/* Left info panel - Single Unified Panel */}
      <div className="flex flex-col gap-2 lg:w-64 w-full flex-shrink-0 lg:order-1 order-2">
        <div className={`
          rounded-lg p-3 relative backdrop-blur-md border-2 shadow-lg
          ${theme === 'cyberpunk'
            ? isAttacker
              ? 'bg-gradient-to-br from-red-50/90 to-red-100/80 border-red-600/60'
              : 'bg-gradient-to-br from-blue-50/90 to-blue-100/80 border-blue-600/60'
            : isAttacker
              ? 'bg-gradient-to-br from-red-950/40 to-red-900/30 border-red-500/30'
              : 'bg-gradient-to-br from-blue-950/40 to-blue-900/30 border-blue-500/30'
          }
        `}>
          {/* Header */}
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-base-content/10">
            <Circle className={`w-4 h-4 ${
              theme === 'cyberpunk'
                ? isAttacker ? 'text-red-700' : 'text-blue-700'
                : isAttacker ? 'text-red-400' : 'text-blue-400'
            }`} />
            <h3 className={`font-bold text-sm font-mono uppercase tracking-wide ${
              theme === 'cyberpunk'
                ? isAttacker ? 'text-red-700' : 'text-blue-700'
                : isAttacker ? 'text-red-400' : 'text-blue-400'
            }`}>
              GAME INFO
            </h3>
          </div>
          
          {/* Game State Section */}
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center justify-between p-1.5 rounded bg-base-300/50">
              <span className="text-xs text-base-content/70 font-mono">ROUND</span>
              <span className={`text-sm font-bold font-mono ${
                theme === 'cyberpunk'
                  ? isAttacker ? 'text-red-700' : 'text-blue-700'
                  : isAttacker ? 'text-red-400' : 'text-blue-400'
              }`}>{G.currentRound || 1}</span>
            </div>
            
            <div className="flex items-center justify-between p-1.5 rounded bg-base-300/50" data-testid="action-points">
              <div className="flex items-center gap-1">
                <Zap className={`w-3 h-3 ${
                  theme === 'cyberpunk'
                    ? isAttacker ? 'text-red-600' : 'text-blue-600'
                    : 'text-accent'
                }`} />
                <span className="text-xs text-base-content/70 font-mono">AP</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-base font-bold font-mono ${
                  theme === 'cyberpunk'
                    ? isAttacker ? 'text-red-700' : 'text-blue-700'
                    : 'text-accent'
                }`}>
                  {currentPlayerObj?.actionPoints || 0}
                </span>
                <span className="text-xs text-base-content/50">/</span>
                <span className="text-xs text-base-content/50">{G?.gameConfig?.maxActionPoints || 10}</span>
              </div>
            </div>
          </div>
          
          {/* Divider */}
          <div className="border-t border-base-content/10 my-3"></div>
          
          {/* Network Dominance Section */}
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Swords className={`w-3.5 h-3.5 ${
                theme === 'cyberpunk'
                  ? isAttacker ? 'text-red-700' : 'text-blue-700'
                  : isAttacker ? 'text-red-400' : 'text-blue-400'
              }`} />
              <span className={`text-xs font-bold font-mono uppercase ${
                theme === 'cyberpunk'
                  ? isAttacker ? 'text-red-700' : 'text-blue-700'
                  : isAttacker ? 'text-red-400' : 'text-blue-400'
              }`}>DOMINANCE</span>
            </div>
            <PowerBar
              attackerScore={G?.attackerScore || 0}
              defenderScore={G?.defenderScore || 0}
              totalInfrastructure={optimizedInfrastructureData.length}
            />
          </div>
          
          {/* Divider */}
          <div className="border-t border-base-content/10 my-3"></div>
          
          {/* Infrastructure Section */}
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Shield className={`w-3.5 h-3.5 ${
                theme === 'cyberpunk'
                  ? isAttacker ? 'text-red-700' : 'text-blue-700'
                  : isAttacker ? 'text-red-400' : 'text-blue-400'
              }`} />
              <span className={`text-xs font-bold font-mono uppercase ${
                theme === 'cyberpunk'
                  ? isAttacker ? 'text-red-700' : 'text-blue-700'
                  : isAttacker ? 'text-red-400' : 'text-blue-400'
              }`}>INFRASTRUCTURE</span>
            </div>
            
            <div className="grid grid-cols-2 gap-1.5">
              <div className="flex items-center justify-between p-1.5 rounded bg-base-300/50">
                <span className="text-xs text-base-content/70 font-mono">TOTAL</span>
                <span className={`text-sm font-bold font-mono ${
                  theme === 'cyberpunk'
                    ? isAttacker ? 'text-red-700' : 'text-blue-700'
                    : isAttacker ? 'text-red-400' : 'text-blue-400'
                }`}>
                  {optimizedInfrastructureData.length}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-1.5 rounded bg-error/5">
                <span className="text-xs text-error/70 font-mono">COMP</span>
                <span className="text-sm font-bold font-mono text-error">
                  {optimizedInfrastructureData.cards.filter(i => i.state === 'compromised').length}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-1.5 rounded bg-success/5">
                <span className="text-xs text-success/70 font-mono">FORT</span>
                <span className="text-sm font-bold font-mono text-success">
                  {optimizedInfrastructureData.cards.filter(i => i.state === 'fortified').length}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-1.5 rounded bg-warning/5">
                <span className="text-xs text-warning/70 font-mono">VULN</span>
                <span className="text-sm font-bold font-mono text-warning">
                  {optimizedInfrastructureData.cards.filter(i => i.state === 'vulnerable').length}
                </span>
              </div>
            </div>
          </div>
          
          {/* Played Cards - Only show if there are cards */}
          {currentPlayerObj?.playedCards && currentPlayerObj.playedCards.length > 0 && (
            <>
              <div className="border-t border-base-content/10 my-3"></div>
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Database className={`w-3.5 h-3.5 ${
                    theme === 'cyberpunk'
                      ? isAttacker ? 'text-red-700' : 'text-blue-700'
                      : isAttacker ? 'text-red-400' : 'text-blue-400'
                  }`} />
                  <span className={`text-xs font-bold font-mono uppercase ${
                    theme === 'cyberpunk'
                      ? isAttacker ? 'text-red-700' : 'text-blue-700'
                      : isAttacker ? 'text-red-400' : 'text-blue-400'
                  }`}>PLAYED CARDS</span>
                </div>
                <div className="max-h-24 overflow-y-auto custom-scrollbar">
                  <PlayerBoard
                    {...commonProps}
                    player={currentPlayerObj}
                    isCurrentPlayer={true}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right info panel - Full height chat */}
      <div className="flex flex-col lg:w-96 w-full flex-shrink-0 lg:order-3 order-3">
        {/* Lobby-specific Chat */}
        {matchID ? (
          <LobbyChat 
            chatId={`lobby_${matchID}`}
            lobbyId={matchID} 
            showChannelSwitcher={false}
            className="h-full"
          />
        ) : (
          <div className={`
            rounded-lg p-4 backdrop-blur-md border-2 shadow-lg flex-1 flex items-center justify-center
            ${theme === 'cyberpunk'
              ? isAttacker
                ? 'bg-gradient-to-br from-red-50/90 to-red-100/80 border-red-600/60'
                : 'bg-gradient-to-br from-blue-50/90 to-blue-100/80 border-blue-600/60'
              : isAttacker
                ? 'bg-gradient-to-br from-red-950/40 to-red-900/30 border-red-500/30'
                : 'bg-gradient-to-br from-blue-950/40 to-blue-900/30 border-blue-500/30'
            }
          `}>
            <div className="text-center text-base-content/50">
              <p className="text-xs font-mono">Loading chat...</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default React.memo(GameInfoPanels);