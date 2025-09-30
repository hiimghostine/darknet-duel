import type { GameState } from '../types/game.types';

// Mock card data based on actual game cards
export const mockInfrastructureCards = [
  {
    id: "I001",
    name: "Enterprise Firewall",
    type: "network" as const,
    description: "Primary perimeter defense system",
    flavor: "The first line of defense against external threats",
    vulnerableVectors: ["network", "malware"],
    vulnerabilities: ["network", "malware"],
    img: "firewall",
    state: "secure" as const
  },
  {
    id: "I003",
    name: "Corporate Website", 
    type: "web" as const,
    description: "Public-facing web presence",
    flavor: "Your company's digital storefront",
    vulnerableVectors: ["web", "social"],
    vulnerabilities: ["web", "social"],
    img: "website",
    state: "secure" as const
  },
  {
    id: "I005",
    name: "Main Database Cluster",
    type: "data" as const, 
    description: "Primary data storage for all operations",
    flavor: "The crown jewels of corporate information",
    vulnerableVectors: ["network", "web"],
    vulnerabilities: ["network", "web"],
    img: "database",
    state: "secure" as const
  },
  {
    id: "I007",
    name: "Employee Workstations",
    type: "user" as const,
    description: "End-user computing devices", 
    flavor: "As secure as the humans using them",
    vulnerableVectors: ["social", "malware"],
    vulnerabilities: ["social", "malware"],
    img: "workstation",
    state: "secure" as const
  },
  {
    id: "I009",
    name: "Financial System",
    type: "critical" as const,
    description: "Core accounting and payment platform",
    flavor: "Where the money moves - a prime target", 
    vulnerableVectors: ["network", "web", "malware"],
    vulnerabilities: ["network", "web", "malware"],
    img: "financial",
    state: "secure" as const
  }
];

export const mockAttackerCards = [
  {
    id: "A003",
    name: "Log4Shell",
    type: "exploit", 
    category: "network",
    cost: 1,
    description: "Remote code execution in Java logging",
    flavor: "One line of code that shook the internet",
    effect: "Target 1 infrastructure card. It becomes vulnerable to Network attacks.",
    img: "log4shell",
    isReactive: false,
    target: "infrastructure",
    vulnerability: "network",
    playable: true,
    metadata: {
      category: "network",
      flavor: "One line of code that shook the internet"
    },
    effects: [
      {
        type: "Exploit",
        value: 1,
        description: "Makes infrastructure vulnerable to Network attacks"
      }
    ]
  },
  {
    id: "A101",
    name: "DDoS Attack",
    type: "attack",
    category: "network",
    cost: 1,
    description: "Floods target with traffic to disrupt service",
    flavor: "Like trying to enter a stadium where all seats are taken by ghosts",
    effect: "Target 1 infrastructure with a Network exploit. It becomes compromised.",
    img: "ddos",
    isReactive: false,
    target: "vulnerable",
    attackValue: 1,
    requires: "A001",
    playable: true,
    metadata: {
      category: "network",
      flavor: "Like trying to enter a stadium where all seats are taken by ghosts"
    },
    effects: [
      {
        type: "Attack",
        value: 1,
        description: "Compromises vulnerable infrastructure"
      }
    ]
  },
  {
    id: "A205",
    name: "Social Engineer",
    type: "counter-attack",
    category: "social",
    cost: 1,
    description: "Manipulates security personnel",
    flavor: "The most sophisticated firewalls can be bypassed with a simple phone call",
    effect: "Cancel a Shield card being played on infrastructure.",
    img: "social_engineer",
    isReactive: true,
    target: "shield",
    counterType: "cancel",
    playable: true,
    metadata: {
      category: "social",
      flavor: "The most sophisticated firewalls can be bypassed with a simple phone call"
    },
    effects: [
      {
        type: "Counter-Attack",
        value: 1,
        description: "Cancels Shield cards being played"
      }
    ]
  },
  {
    id: "A301",
    name: "Advanced Persistent Threat",
    type: "wildcard",
    category: "any",
    cost: 2,
    description: "Long-term stealthy network infiltration",
    flavor: "We've been in your network longer than most of your employees",
    effect: "Can be played as any Exploit or Attack card. Target infrastructure can't be protected by reactive cards for 1 turn.",
    img: "apt",
    isReactive: false,
    target: "any",
    wildcardType: "exploit-attack",
    specialEffect: "prevent_reactions",
    playable: true,
    metadata: {
      category: "any",
      flavor: "We've been in your network longer than most of your employees"
    },
    effects: [
      {
        type: "Wildcard",
        value: 1,
        description: "Can be played as any Exploit or Attack card with special effect"
      }
    ]
  },
  {
    id: "A306",
    name: "AI-Powered Attack",
    type: "wildcard",
    category: "any",
    cost: 2,
    description: "Uses machine learning to optimize attacks",
    flavor: "The attack that learns as it goes",
    effect: "Can be played as any Exploit or Attack card. Look at the top 3 cards of your deck and place one in your hand.",
    img: "ai_attack",
    isReactive: false,
    target: "any",
    wildcardType: "exploit-attack",
    draw: 1,
    lookAt: 3,
    playable: true,
    metadata: {
      category: "any",
      flavor: "The attack that learns as it goes"
    },
    effects: [
      {
        type: "Wildcard",
        value: 1,
        description: "Can be played as any Exploit or Attack card with card draw benefit"
      }
    ]
  },
  {
    id: "CA001",
    name: "Shield Breaker",
    type: "counter-attack",
    category: "network",
    cost: 1,
    description: "Neutralize defensive shields through advanced techniques",
    flavor: "Every shield has a weakness, you just need to find it",
    effect: "Remove shield from shielded infrastructure",
    img: "shield_breaker",
    isReactive: true,
    target: "infrastructure",
    playable: true,
    metadata: {
      category: "counter",
      flavor: "Breaking through defenses"
    },
    effects: [
      {
        type: "Counter-Attack",
        value: 1,
        description: "Remove shield from shielded infrastructure"
      }
    ]
  }
];

export const mockDefenderCards = [
  {
    id: "D001",
    name: "Firewall",
    type: "shield",
    category: "network",
    cost: 1,
    description: "Blocks unauthorized network access",
    flavor: "The digital equivalent of a castle moat",
    effect: "Shield infrastructure against Network attacks.",
    img: "firewall",
    isReactive: false,
    target: "infrastructure",
    playable: true,
    metadata: {
      category: "network",
      flavor: "The digital equivalent of a castle moat"
    },
    effects: [
      {
        type: "Shield",
        value: 1,
        description: "Protects infrastructure against Network attacks"
      }
    ]
  },
  {
    id: "D101",
    name: "DMZ Implementation",
    type: "fortify",
    category: "network",
    cost: 1,
    description: "Creates secure network boundary",
    flavor: "A buffer zone between trust and chaos",
    effect: "Fortify shielded infrastructure against Network attacks.",
    img: "dmz",
    isReactive: false,
    target: "infrastructure",
    playable: true,
    metadata: {
      category: "network",
      flavor: "A buffer zone between trust and chaos"
    },
    effects: [
      {
        type: "Fortify",
        value: 1,
        description: "Strengthens shielded infrastructure against Network attacks"
      }
    ]
  },
  {
    id: "D007",
    name: "Phishing Defense",
    type: "reaction",
    category: "social",
    cost: 1,
    description: "Email filtering and user education",
    flavor: "Teaching humans to spot digital deception",
    effect: "Reactive: Shield infrastructure against Social attacks during attacker's turn.",
    img: "phishing_defense",
    isReactive: true,
    target: "infrastructure",
    playable: true,
    metadata: {
      category: "social",
      flavor: "Teaching humans to spot digital deception"
    },
    effects: [
      {
        type: "Reactive Shield",
        value: 1,
        description: "Automatically protects against Social attacks during opponent's turn"
      }
    ]
  },
  {
    id: "D201",
    name: "Incident Response Team",
    type: "response",
    category: "network",
    cost: 1,
    description: "Specialized security breach handlers",
    flavor: "When things go wrong, we make them right",
    effect: "Restore compromised infrastructure to secure state.",
    img: "incident_response",
    isReactive: false,
    target: "infrastructure",
    playable: true,
    metadata: {
      category: "network",
      flavor: "When things go wrong, we make them right"
    },
    effects: [
      {
        type: "Response",
        value: 1,
        description: "Restores compromised infrastructure to secure state"
      }
    ]
  },
  {
    id: "D301",
    name: "Advanced Threat Defense",
    type: "wildcard",
    category: "any",
    cost: 2,
    description: "Multi-layered security system with reactive blocking",
    flavor: "Adaptability is the ultimate defense",
    effect: "Choose any card type when played.",
    img: "advanced_threat_defense",
    isReactive: false,
    target: "any",
    playable: true,
    metadata: {
      category: "any",
      flavor: "Adaptability is the ultimate defense"
    },
    effects: [
      {
        type: "Wildcard",
        value: 1,
        description: "Can be played as any card type"
      }
    ]
  }
];

export class MockGameStateProvider {
  private infrastructureStates = new Map<string, string>();
  private attackerActionPoints = 2;
  private defenderActionPoints = 3;
  private currentTurn: 'attacker' | 'defender' = 'attacker';
  private currentStage: 'action' | 'reaction' | 'end' | null = null;
  constructor() {
    this.infrastructureStates = new Map();
    mockInfrastructureCards.forEach(card => {
      this.infrastructureStates.set(card.id, 'secure');
    });
    this.attackerActionPoints = 2;
    this.currentTurn = 'attacker';
  }

  // Generate mock game state for tutorial
  generateMockGameState(isAttacker: boolean = true): GameState {
    const infrastructure = mockInfrastructureCards.map(card => ({
      ...card,
      state: this.infrastructureStates.get(card.id) || 'secure'
    }));

    const attackerHand = isAttacker ? mockAttackerCards.slice(0, 5) : mockAttackerCards.slice(0, 3);
    const defenderHand = !isAttacker ? mockDefenderCards.slice(0, 5) : mockDefenderCards.slice(0, 3);
    
    // Debug: Check if defender cards have playable property set correctly
    if (!isAttacker) {
      console.log('🎯 TUTORIAL: Defender hand cards playable status:', 
        defenderHand.map(card => ({ name: card.name, playable: card.playable }))
      );
    }

    return {
      gamePhase: 'playing',
      message: '',
      attackerScore: this.calculateScore('attacker', infrastructure),
      defenderScore: this.calculateScore('defender', infrastructure),
      infrastructure,
      attacker: {
        id: 'attacker',
        name: 'Red Team',
        role: 'attacker',
        resources: 0,
        actionPoints: this.attackerActionPoints,
        freeCardCyclesUsed: 0,
        deck: [],
        hand: attackerHand,
        field: [],
        discard: []
      },
      defender: {
        id: 'defender', 
        name: 'Blue Team',
        role: 'defender',
        resources: 0,
        actionPoints: this.defenderActionPoints,
        freeCardCyclesUsed: 0,
        deck: [],
        hand: defenderHand,
        field: [],
        discard: []
      },
      currentTurn: this.currentTurn,
      turnNumber: 1,
      currentRound: 1,
      actions: [],
      playerConnections: {
        'attacker': 'connected',
        'defender': 'connected'
      },
      chat: {
        messages: [],
        lastReadTimestamp: {}
      },
      rematchRequested: [],
      temporaryEffects: [],
      persistentEffects: [],
      gameConfig: {
        initialResources: 0,
        maxTurns: 15,
        startingHandSize: 5,
        infrastructureCount: 5,
        initialActionPoints: 2,
        attackerActionPointsPerTurn: 2,
        defenderActionPointsPerTurn: 3,
        maxActionPoints: 10,
        freeCardCyclesPerTurn: 1,
        maxHandSize: 7,
        cardsDrawnPerTurn: 2
      }
    } as GameState;
  }

  // Generate mock context for BoardGame.io
  generateMockContext(isAttacker: boolean = true) {
    const playerID = isAttacker ? '0' : '1';
    return {
      phase: 'playing',
      currentPlayer: playerID,
      gameover: false,
      // This is crucial - activePlayers determines if cards are playable
      activePlayers: {
        [playerID]: this.currentStage || 'action' // Use current stage or default to 'action'
      },
      turn: 1,
      playOrder: ['0', '1'],
      playOrderPos: isAttacker ? 0 : 1,
      numPlayers: 2
    };
  }

  // Tutorial-specific state mutations
  setInfrastructureState(infraId: string, state: 'secure' | 'vulnerable' | 'compromised' | 'shielded' | 'fortified') {
    this.infrastructureStates.set(infraId, state);
  }

  setActionPoints(role: 'attacker' | 'defender', points: number) {
    if (role === 'attacker') {
      this.attackerActionPoints = Math.max(0, Math.min(10, points));
    } else {
      this.defenderActionPoints = Math.max(0, Math.min(10, points));
    }
  }

  setCurrentTurn(turn: 'attacker' | 'defender') {
    this.currentTurn = turn;
  }

  // Simulate tutorial actions
  simulateExploit(infraId: string) {
    this.setInfrastructureState(infraId, 'vulnerable');
    this.setActionPoints('attacker', this.attackerActionPoints - 1);
  }

  simulateAttack(infraId: string) {
    const currentState = this.infrastructureStates.get(infraId);
    if (currentState === 'vulnerable') {
      this.setInfrastructureState(infraId, 'compromised');
      this.setActionPoints('attacker', this.attackerActionPoints - 1);
    }
  }

  simulateShield(infraId: string) {
    const currentState = this.infrastructureStates.get(infraId);
    if (currentState === 'secure') {
      this.setInfrastructureState(infraId, 'shielded');
      this.setActionPoints('defender', this.defenderActionPoints - 1);
    }
  }

  simulateFortify(infraId: string) {
    const currentState = this.infrastructureStates.get(infraId);
    if (currentState === 'shielded') {
      this.setInfrastructureState(infraId, 'fortified');
      this.setActionPoints('defender', this.defenderActionPoints - 1);
    }
  }

  simulateResponse(infraId: string) {
    const currentState = this.infrastructureStates.get(infraId);
    if (currentState === 'shielded' || currentState === 'fortified') {
      this.setInfrastructureState(infraId, 'secure');
      this.setActionPoints('defender', this.defenderActionPoints - 1);
    }
  }

  // Tutorial-specific setup for reaction phase
  setupReactionPhase() {
    // Shield the Corporate Website for the reaction phase tutorial
    this.setInfrastructureState('I003', 'shielded');
    // Keep attacker as current turn since they need to play counter-attack cards in reaction mode
    this.currentTurn = 'attacker';
    // Set stage to reaction mode
    this.currentStage = 'reaction';
  }

  // Return to action mode after reaction phase
  exitReactionPhase() {
    // Return to action mode
    this.currentStage = 'action';
    console.log('🎯 TUTORIAL: Exited reaction phase, returned to action mode');
  }

  // Reset to initial state
  reset() {
    this.infrastructureStates.clear();
    mockInfrastructureCards.forEach(card => {
      this.infrastructureStates.set(card.id, 'secure');
    });
    this.attackerActionPoints = 2;
    this.defenderActionPoints = 3;
    this.currentTurn = 'attacker';
  }

  private calculateScore(role: 'attacker' | 'defender', infrastructure: any[]) {
    if (role === 'attacker') {
      return infrastructure.filter(infra => infra.state === 'compromised').length;
    } else {
      return infrastructure.filter(infra => 
        infra.state === 'secure' || infra.state === 'shielded' || infra.state === 'fortified'
      ).length;
    }
  }
}

// Singleton instance
export const mockGameStateProvider = new MockGameStateProvider();
