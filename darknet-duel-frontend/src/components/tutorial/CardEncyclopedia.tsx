import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Search, 
  Shield, 
  Sword, 
  Zap, 
  BookOpen, 
  Clock, 
  Target, 
  HelpCircle,
  Database,
  Filter,
  Eye
} from 'lucide-react';
import tutorialManager from '../../services/tutorialManager';

// Import card data
import attackerCards from '../cards/attacker.json';
import defenderCards from '../cards/defender.json';
import infrastructureCards from '../cards/infrastructure.json';

interface CardEncyclopediaProps {
  onClose: () => void;
}

const CardEncyclopedia: React.FC<CardEncyclopediaProps> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [showAnnotations, setShowAnnotations] = useState(false);

  // Mark Card Encyclopedia as complete when user opens it
  useEffect(() => {
    tutorialManager.markTutorialComplete('card_encyclopedia');
  }, []);

  // Combine all cards with their source
  const allCards = [
    ...attackerCards.cards.map(card => ({ ...card, source: 'attacker' })),
    ...defenderCards.cards.map(card => ({ ...card, source: 'defender' })),
    ...infrastructureCards.cards.map(card => ({ ...card, source: 'infrastructure' }))
  ];

  // Filter cards based on selected category and search
  const filteredCards = allCards.filter(card => {
    const matchesCategory = selectedCategory === 'all' || card.source === selectedCategory;
    const matchesSubcategory = selectedSubcategory === 'all' || 
      card.type === selectedSubcategory || 
      (card as any).category === selectedSubcategory;
    const matchesSearch = searchTerm === '' || 
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSubcategory && matchesSearch;
  });

  // Get unique subcategories for current category
  const getSubcategories = () => {
    let cards = selectedCategory === 'all' ? allCards : allCards.filter(card => card.source === selectedCategory);
    const subcategories = [...new Set(cards.map(card => card.type || (card as any).category).filter(Boolean))];
    return subcategories.sort();
  };

  const getCategoryIcon = (source: string) => {
    switch (source) {
      case 'attacker': return <Sword className="w-4 h-4" />;
      case 'defender': return <Shield className="w-4 h-4" />;
      case 'infrastructure': return <Database className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (source: string) => {
    switch (source) {
      case 'attacker': return 'text-red-400 border-red-400/30 bg-red-400/10';
      case 'defender': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
      case 'infrastructure': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      default: return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exploit': return <Eye className="w-3 h-3" />;
      case 'attack': return <Zap className="w-3 h-3" />;
      case 'shield': return <Shield className="w-3 h-3" />;
      case 'reaction': return <Target className="w-3 h-3" />;
      default: return <BookOpen className="w-3 h-3" />;
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: -20
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-base-200 border border-primary/30 shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-primary/10 border-b border-primary/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="text-primary" size={28} />
              <div>
                <h2 className="text-2xl font-bold font-mono text-primary">CARD_ENCYCLOPEDIA</h2>
                <p className="text-base-content/70 font-mono text-sm">
                  Complete database of all {allCards.length} cards in Darknet Duel
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm font-mono"
            >
              <X size={20} />
              CLOSE
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar - Filters */}
          <div className="w-80 border-r border-primary/30 bg-base-300/50 p-4 overflow-y-auto">
            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-mono text-base-content/70 mb-2">SEARCH_CARDS</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-bordered w-full pl-10 font-mono text-sm"
                  placeholder="Search by name or description..."
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <label className="block text-sm font-mono text-base-content/70 mb-2">CATEGORY</label>
              <div className="space-y-2">
                {[
                  { key: 'all', label: 'ALL_CARDS', count: allCards.length },
                  { key: 'attacker', label: 'ATTACKER_CARDS', count: attackerCards.cards.length },
                  { key: 'defender', label: 'DEFENDER_CARDS', count: defenderCards.cards.length },
                  { key: 'infrastructure', label: 'INFRASTRUCTURE', count: infrastructureCards.cards.length }
                ].map(category => (
                  <button
                    key={category.key}
                    onClick={() => {
                      setSelectedCategory(category.key as any);
                      setSelectedSubcategory('all');
                    }}
                    className={`w-full text-left p-3 border font-mono text-sm transition-all ${
                      selectedCategory === category.key
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-base-content/20 hover:border-primary/50 text-base-content'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(category.key)}
                        {category.label}
                      </div>
                      <span className="text-xs opacity-70">({category.count})</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Subcategory Filter */}
            {selectedCategory !== 'all' && (
              <div className="mb-6">
                <label className="block text-sm font-mono text-base-content/70 mb-2">TYPE</label>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedSubcategory('all')}
                    className={`w-full text-left p-2 border font-mono text-xs transition-all ${
                      selectedSubcategory === 'all'
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-base-content/20 hover:border-primary/50 text-base-content'
                    }`}
                  >
                    ALL_TYPES
                  </button>
                  {getSubcategories().map(subcategory => (
                    <button
                      key={subcategory}
                      onClick={() => setSelectedSubcategory(subcategory)}
                      className={`w-full text-left p-2 border font-mono text-xs transition-all ${
                        selectedSubcategory === subcategory
                          ? 'border-primary bg-primary/20 text-primary'
                          : 'border-base-content/20 hover:border-primary/50 text-base-content'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {getTypeIcon(subcategory)}
                        {subcategory.toUpperCase()}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="border border-primary/30 bg-primary/10 p-3">
              <h4 className="font-mono text-sm text-primary mb-2">FILTER_RESULTS</h4>
              <p className="font-mono text-xs text-base-content/70">
                Showing {filteredCards.length} of {allCards.length} cards
              </p>
            </div>
          </div>

          {/* Main Content - Card Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              <AnimatePresence mode="wait">
                {filteredCards.map((card, index) => (
                  <motion.div
                    key={`${selectedCategory}-${selectedSubcategory}-${card.id}`}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ 
                      type: "spring",
                      stiffness: 400,
                      damping: 40,
                      delay: index * 0.03
                    }}
                    className="cursor-pointer group"
                    onClick={() => setSelectedCard(card)}
                  >
                    {/* Playing card container with 5:7 aspect ratio */}
                    <div className="relative w-full" style={{ paddingBottom: '140%' }}>
                      <div className={`absolute inset-0 border-2 rounded-lg p-3 transition-all hover:shadow-2xl hover:scale-105 hover:-translate-y-2 flex flex-col ${getCategoryColor(card.source)}`}>
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-1">
                            {getCategoryIcon(card.source)}
                            <span className="font-mono text-[0.6rem] opacity-70">{card.id}</span>
                          </div>
                          {(card as any).cost && (
                            <div className="flex items-center gap-1 text-[0.6rem] font-bold">
                              <Clock size={10} />
                              {(card as any).cost}
                            </div>
                          )}
                        </div>
                        
                        {/* Card Name */}
                        <h3 className="font-bold font-mono text-xs mb-2 line-clamp-2 leading-tight">{card.name}</h3>
                        
                        {/* Card Type */}
                        <div className="flex flex-col gap-1 mb-2">
                          <div className="flex items-center gap-1">
                            {getTypeIcon(card.type)}
                            <span className="text-[0.6rem] font-mono opacity-70">{card.type?.toUpperCase()}</span>
                          </div>
                          {(card as any).category && (
                            <div className="flex items-center gap-1">
                              <Filter size={8} />
                              <span className="text-[0.6rem] font-mono opacity-70">{(card as any).category?.toUpperCase()}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Card Description - grows to fill space */}
                        <div className="flex-1 overflow-hidden">
                          <p className="text-[0.65rem] font-mono text-base-content/70 line-clamp-4 leading-tight">
                            {card.description}
                          </p>
                        </div>

                        {/* Reactive Badge at bottom */}
                        {(card as any).isReactive && (
                          <div className="mt-auto pt-2">
                            <div className="inline-block px-1.5 py-0.5 bg-warning/20 text-warning text-[0.6rem] font-mono border border-warning/30 rounded">
                              ⚡ REACTIVE
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredCards.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="mx-auto text-base-content/30 mb-4" size={48} />
                <p className="font-mono text-base-content/70">No cards match your current filters</p>
                <p className="font-mono text-sm text-base-content/50 mt-2">Try adjusting your search or category selection</p>
              </div>
            )}
          </div>
        </div>

        {/* Card Detail Modal */}
        <AnimatePresence>
          {selectedCard && (
            <motion.div
              className="absolute inset-0 bg-black/90 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCard(null)}
            >
              {/* Floating Annotation Tooltips */}
              <AnimatePresence>
                {showAnnotations && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute right-6 top-4 bottom-4 w-80 flex flex-col gap-3 z-30"
                  >
                    {/* Type Annotation */}
                    <div className="bg-base-100 border-2 border-primary p-4 rounded-lg text-sm shadow-xl">
                      <div className="font-bold text-primary mb-2 flex items-center gap-2">
                        {getTypeIcon(selectedCard.type)}
                        CARD TYPE
                      </div>
                      <div className="text-base-content/80 text-xs leading-relaxed">
                        {selectedCard.type === 'exploit' && 'Makes infrastructure vulnerable to attacks'}
                        {selectedCard.type === 'attack' && 'Compromises vulnerable infrastructure'}
                        {selectedCard.type === 'shield' && 'Protects infrastructure from exploits'}
                        {selectedCard.type === 'fortify' && 'Strengthens shielded infrastructure'}
                        {selectedCard.type === 'response' && 'Repairs compromised infrastructure'}
                        {selectedCard.type === 'reaction' && 'Counters attacker moves instantly'}
                        {selectedCard.type === 'counter-attack' && 'Disrupts defender strategies'}
                        {selectedCard.type === 'wildcard' && 'Flexible card with multiple uses'}
                      </div>
                    </div>

                    {/* Category Annotation */}
                    {(selectedCard as any).category && (
                      <div className="bg-base-100 border-2 border-secondary p-4 rounded-lg text-sm shadow-xl">
                        <div className="font-bold text-secondary mb-2 flex items-center gap-2">
                          <Filter size={16} />
                          ATTACK VECTOR
                        </div>
                        <div className="text-base-content/80 text-xs leading-relaxed">
                          The specific vulnerability type this card exploits or defends against
                        </div>
                      </div>
                    )}

                    {/* Cost Annotation */}
                    {(selectedCard as any).cost && (
                      <div className="bg-base-100 border-2 border-accent p-4 rounded-lg text-sm shadow-xl">
                        <div className="font-bold text-accent mb-2 flex items-center gap-2">
                          <Clock size={16} />
                          ACTION POINTS
                        </div>
                        <div className="text-base-content/80 text-xs leading-relaxed">
                          Cost to play this card. You gain 2-3 AP per turn depending on your role.
                        </div>
                      </div>
                    )}

                    {/* Reactive Annotation */}
                    {(selectedCard as any).isReactive && (
                      <div className="bg-base-100 border-2 border-warning p-4 rounded-lg text-sm shadow-xl">
                        <div className="font-bold text-warning mb-2 flex items-center gap-2">
                          ⚡
                          REACTIVE CARD
                        </div>
                        <div className="text-base-content/80 text-xs leading-relaxed">
                          Can be played instantly during opponent's turn as a reaction to their moves.
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Playing card detail view with 5:7 aspect ratio */}
              <div className="relative w-full max-w-md px-4" onClick={(e) => e.stopPropagation()}>
                <div className="relative w-full" style={{ paddingBottom: '140%' }}>
                  <motion.div
                    className={`absolute inset-0 border-4 rounded-xl p-6 flex flex-col shadow-2xl ${getCategoryColor(selectedCard.source)}`}
                    initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    exit={{ scale: 0.5, opacity: 0, rotateY: 180 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(selectedCard.source)}
                        <span className="font-mono text-sm opacity-70">{selectedCard.id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowAnnotations(!showAnnotations)}
                          className={`btn btn-ghost btn-xs ${showAnnotations ? 'text-primary' : ''}`}
                          title="Toggle annotations"
                        >
                          <HelpCircle size={16} />
                        </button>
                        <button
                          onClick={() => setSelectedCard(null)}
                          className="btn btn-ghost btn-xs"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Card Name */}
                    <h3 className="text-2xl font-bold font-mono mb-3 leading-tight">{selectedCard.name}</h3>
                    
                    {/* Card Type & Category */}
                    <div className="flex flex-wrap items-center gap-2 mb-4 text-sm font-mono">
                      <div className={`flex items-center gap-1 px-2 py-1 border rounded transition-all duration-300 ${showAnnotations ? 'bg-primary/20 border-primary/50 animate-pulse' : 'border-current/30'}`}>
                        {getTypeIcon(selectedCard.type)}
                        {selectedCard.type?.toUpperCase()}
                      </div>
                      {(selectedCard as any).category && (
                        <div className={`flex items-center gap-1 px-2 py-1 border rounded transition-all duration-300 ${showAnnotations ? 'bg-secondary/20 border-secondary/50 animate-pulse' : 'border-current/30'}`}>
                          <Filter size={12} />
                          {(selectedCard as any).category?.toUpperCase()}
                        </div>
                      )}
                      {(selectedCard as any).cost && (
                        <div className={`flex items-center gap-1 px-2 py-1 border rounded font-bold transition-all duration-300 ${showAnnotations ? 'bg-accent/20 border-accent/50 animate-pulse' : 'border-current/30'}`}>
                          <Clock size={12} />
                          {(selectedCard as any).cost} AP
                        </div>
                      )}
                    </div>

                    {/* Scrollable content area */}
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                      {/* Description */}
                      <div>
                        <h4 className="font-mono text-xs font-bold mb-1 opacity-70">DESCRIPTION</h4>
                        <p className="font-mono text-sm leading-relaxed">{selectedCard.description}</p>
                      </div>

                      {/* Flavor Text */}
                      {selectedCard.flavor && (
                        <div className="border-l-2 border-primary/30 pl-3 py-1">
                          <p className="italic text-sm text-base-content/80 leading-relaxed">
                            "{selectedCard.flavor}"
                          </p>
                        </div>
                      )}

                      {/* Effect */}
                      {selectedCard.effect && (
                        <div>
                          <h4 className="font-mono text-xs font-bold mb-1 opacity-70">EFFECT</h4>
                          <p className="font-mono text-sm leading-relaxed">{selectedCard.effect}</p>
                        </div>
                      )}

                      {/* Vulnerabilities */}
                      {selectedCard.vulnerabilities && (
                        <div>
                          <h4 className="font-mono text-xs font-bold mb-2 opacity-70">VULNERABILITIES</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedCard.vulnerabilities.map((vuln: string) => (
                              <span key={vuln} className="px-2 py-1 bg-error/20 text-error text-xs font-mono border border-error/30 rounded">
                                {vuln.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Reactive Badge at bottom */}
                    {(selectedCard as any).isReactive && (
                      <div className="mt-3 pt-3 border-t border-current/20">
                        <div className={`inline-block px-3 py-1.5 text-sm font-mono border rounded transition-all duration-300 ${showAnnotations ? 'bg-warning/40 border-warning animate-pulse shadow-lg' : 'bg-warning/20 text-warning border-warning/30'}`}>
                          ⚡ REACTIVE CARD
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default CardEncyclopedia;
