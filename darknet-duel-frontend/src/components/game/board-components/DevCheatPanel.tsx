import React, { useState, useMemo, useEffect } from 'react';
import type { GameState } from '../../../types/game.types';
import type { Card } from '../../../types/card.types';

// API response types
interface CardApiResponse {
  success: boolean;
  cards: Card[];
  count: number;
  error?: string;
}

interface DevCheatPanelProps {
  G: GameState;
  playerID: string;
  isAttacker: boolean;
  onAddCard: (card: Card) => void;
}

const DevCheatPanel: React.FC<DevCheatPanelProps> = ({
  G,
  playerID,
  isAttacker,
  onAddCard
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'attacker' | 'defender'>('attacker');
  const [searchFilter, setSearchFilter] = useState('');
  const [attackerCards, setAttackerCards] = useState<Card[]>([]);
  const [defenderCards, setDefenderCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real card data from the game server
  useEffect(() => {
    const fetchCardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the game server URL - try to detect it from the current connection
        const gameServerUrl = import.meta.env.VITE_GAME_SERVER_URL || 'http://localhost:8001';
        
        const [attackerResponse, defenderResponse] = await Promise.all([
          fetch(`${gameServerUrl}/api/cards/attacker`),
          fetch(`${gameServerUrl}/api/cards/defender`)
        ]);

        if (!attackerResponse.ok || !defenderResponse.ok) {
          throw new Error('Failed to fetch card data from server');
        }

        const attackerData: CardApiResponse = await attackerResponse.json();
        const defenderData: CardApiResponse = await defenderResponse.json();

        if (!attackerData.success || !defenderData.success) {
          throw new Error('Server returned error response');
        }

        setAttackerCards(attackerData.cards);
        setDefenderCards(defenderData.cards);
        
        console.log(`🔧 CHEAT: Loaded ${attackerData.count} attacker cards and ${defenderData.count} defender cards`);
      } catch (err) {
        console.error('🔧 CHEAT: Failed to load card data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        // Use empty arrays as fallback
        setAttackerCards([]);
        setDefenderCards([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch when the panel is opened for the first time
    if (isOpen && attackerCards.length === 0 && defenderCards.length === 0 && !loading) {
      fetchCardData();
    } else if (isOpen && attackerCards.length === 0 && defenderCards.length === 0 && loading) {
      fetchCardData();
    }
  }, [isOpen, attackerCards.length, defenderCards.length, loading]);

  // Get available cards based on current tab
  const availableCards = useMemo(() => {
    const cards = selectedTab === 'attacker' ? attackerCards : defenderCards;
    if (!searchFilter) return cards;
    
    return cards.filter((card: Card) => 
      card.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      card.type.toLowerCase().includes(searchFilter.toLowerCase()) ||
      card.description.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [selectedTab, searchFilter, attackerCards, defenderCards]);

  // Group cards by type for better organization
  const groupedCards = useMemo(() => {
    const groups: Record<string, Card[]> = {};
    availableCards.forEach((card: Card) => {
      if (!groups[card.type]) {
        groups[card.type] = [];
      }
      groups[card.type].push(card);
    });
    return groups;
  }, [availableCards]);

  const handleAddCard = (card: Card) => {
    // Create a unique card instance with timestamp to avoid ID conflicts
    const uniqueCard = {
      ...card,
      id: `${card.id}_cheat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    onAddCard(uniqueCard);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-error text-error-content px-4 py-2 rounded-lg font-mono text-sm z-50 hover:bg-error/80 transition-colors"
        title="Developer Cheat Panel"
      >
        🔧 DEV_CHEAT
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-200 border border-primary/20 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden relative">
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary"></div>

        {/* Header */}
        <div className="p-4 border-b border-primary/20 flex items-center justify-between">
          <h2 className="text-primary font-bold font-mono text-lg">🔧 DEVELOPER_CHEAT_PANEL</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-error hover:text-error/80 font-mono text-xl"
          >
            ✕
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-primary/20 space-y-4">
          {/* Tab Selection */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTab('attacker')}
              className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
                selectedTab === 'attacker'
                  ? 'bg-error text-error-content'
                  : 'bg-base-300 text-base-content hover:bg-base-100'
              }`}
            >
              🎯 ATTACKER_CARDS
            </button>
            <button
              onClick={() => setSelectedTab('defender')}
              className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
                selectedTab === 'defender'
                  ? 'bg-primary text-primary-content'
                  : 'bg-base-300 text-base-content hover:bg-base-100'
              }`}
            >
              🛡️ DEFENDER_CARDS
            </button>
          </div>

          {/* Search Filter */}
          <div className="flex items-center gap-2">
            <label className="text-primary font-mono text-sm">SEARCH:</label>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter cards..."
              className="flex-1 bg-base-300 border border-primary/20 rounded px-3 py-1 font-mono text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {/* Current Player Info */}
          <div className="text-sm font-mono text-base-content/70">
            Adding cards to: <span className="text-primary">{isAttacker ? '🎯 ATTACKER' : '🛡️ DEFENDER'}</span> 
            {' '}({playerID})
          </div>
        </div>

        {/* Card List */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="loading loading-spinner loading-lg text-primary"></div>
              <span className="ml-3 font-mono text-primary">LOADING_CARDS...</span>
            </div>
          )}
          
          {error && (
            <div className="text-center py-8">
              <div className="text-error font-mono text-sm mb-2">❌ CARD_LOAD_ERROR</div>
              <div className="text-base-content/60 text-xs">{error}</div>
              <button
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  // Trigger re-fetch by resetting cards
                  setAttackerCards([]);
                  setDefenderCards([]);
                }}
                className="mt-3 bg-primary text-primary-content px-3 py-1 rounded text-xs font-mono hover:bg-primary/80"
              >
                RETRY
              </button>
            </div>
          )}
          
          {!loading && !error && Object.entries(groupedCards).length === 0 && (
            <div className="text-center py-8">
              <div className="text-base-content/60 font-mono text-sm">NO_CARDS_FOUND</div>
              <div className="text-base-content/40 text-xs mt-1">Try adjusting your search filter</div>
            </div>
          )}
          
          {!loading && !error && Object.entries(groupedCards).map(([cardType, cards]) => (
            <div key={cardType} className="mb-6">
              <h3 className="text-primary font-mono text-sm uppercase mb-3 border-b border-primary/20 pb-1">
                {cardType.replace('-', '_')} ({cards.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-base-300 border border-primary/20 rounded-lg p-3 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-primary font-bold text-sm">{card.name}</div>
                        <div className="text-base-content/60 text-xs uppercase">
                          {card.type} • {card.cost} AP
                          {card.isReactive && ' • REACTIVE'}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddCard(card)}
                        className="bg-success text-success-content px-2 py-1 rounded text-xs font-mono hover:bg-success/80 transition-colors ml-2"
                      >
                        ADD
                      </button>
                    </div>
                    <div className="text-base-content/80 text-xs leading-tight">
                      {card.description}
                    </div>
                    {card.metadata?.category && (
                      <div className="mt-2">
                        <span className="bg-primary/20 text-primary rounded px-1 text-xs font-mono uppercase">
                          {card.metadata.category}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-primary/20 text-center text-xs font-mono text-base-content/50">
          DEVELOPER_MODE • {!loading && `${attackerCards.length} ATK + ${defenderCards.length} DEF cards loaded • `}Cards added will have unique IDs to prevent conflicts
        </div>
      </div>
    </div>
  );
};

export default DevCheatPanel; 