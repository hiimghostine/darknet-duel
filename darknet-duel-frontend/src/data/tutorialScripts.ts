import type { TutorialScript } from '../types/tutorial.types';

export const basicGameplayTutorial: TutorialScript = {
  id: 'basic_gameplay',
  name: 'Basic Gameplay Tutorial',
  description: 'Learn the fundamentals of Darknet Duel gameplay',
  estimatedDuration: 10,
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to Darknet Duel',
      description: 'A cybersecurity-themed strategic card game',
      instruction: 'Click "Next" to begin learning the basics of digital warfare!',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'roles_overview',
      title: 'Player Roles',
      description: 'In Darknet Duel, one player is the Attacker (Red Team) and the other is the Defender (Blue Team)',
      instruction: 'You are the Attacker. Your goal is to compromise digital infrastructure.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'infrastructure_intro',
      title: 'Infrastructure Cards',
      description: 'These 5 infrastructure cards represent the digital systems you\'re fighting over',
      instruction: 'Look at the infrastructure grid in the center. Each card starts in a "secure" state.',
      targetElement: '.infrastructure-grid',
      position: 'top',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'action_points',
      title: 'Action Points (AP)',
      description: 'Action Points determine how many actions you can take per turn',
      instruction: 'As an Attacker, you gain 2 AP per turn (max 10). Defenders gain 3 AP per turn.',
      targetElement: '.game-info-panel',
      position: 'right',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'hand_overview',
      title: 'Your Hand',
      description: 'These are your cards. You start with 5 cards and draw 2 more each turn.',
      instruction: 'Your hand contains different types of cards: Exploits, Attacks, Counter-Attacks, and Wildcards.',
      targetElement: '.player-hand',
      position: 'top',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'exploit_card',
      title: 'Understanding Exploit Cards',
      description: 'This is an Exploit card - the foundation of any successful attack. Exploit cards create vulnerabilities in secure infrastructure by finding weaknesses in their defenses. Each exploit targets specific attack vectors like Network, Web, Social Engineering, or Malware.',
      instruction: 'Click on the highlighted Log4Shell card to select it and enter target mode. This Network exploit can make infrastructure vulnerable to Network-based attacks. Once you\'ve selected the card, click "Next" to learn about targeting.',
      targetElement: '.player-hand .card:first-child',
      position: 'right',
      validation: {
        type: 'custom',
        condition: () => {
          // Check if user is in target mode (card selected)
          const mockBoard = document.querySelector('[data-tutorial-target-mode="true"]');
          return !!mockBoard;
        }
      },
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'target_infrastructure',
      title: 'Attack Vectors & Infrastructure Targeting',
      description: 'Perfect! The Log4Shell card is now selected and glowing, indicating it\'s ready to be used. Notice how the game has entered "target mode" - only compatible infrastructure cards are highlighted. Attack vectors are crucial: your Network exploit can only target infrastructure with Network vulnerabilities.',
      instruction: 'Click on the highlighted Enterprise Firewall to exploit it. This infrastructure has Network vulnerabilities that match your Log4Shell exploit. Once you\'ve targeted it, the exploit will be executed and the infrastructure will become vulnerable.',
      targetElement: '[data-infra-id="I001"]',
      position: 'right',
      validation: {
        type: 'custom',
        condition: () => {
          // Check if Enterprise Firewall has been exploited (state changed to vulnerable)
          const enterpriseFirewall = document.querySelector('[data-infra-id="I001"]');
          if (!enterpriseFirewall) return false;
          
          return enterpriseFirewall.getAttribute('data-state') === 'vulnerable' ||
                 enterpriseFirewall.textContent?.includes('VULNERABLE') === true ||
                 enterpriseFirewall.textContent?.includes('AT RISK') === true;
        }
      },
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'infrastructure_vulnerable',
      title: 'Infrastructure Compromised!',
      description: 'Great! The infrastructure is now vulnerable (yellow border)',
      instruction: 'Vulnerable infrastructure can be attacked to fully compromise it.',
      position: 'center',
      delay: 1000,
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'attack_card',
      title: 'Understanding Attack Cards',
      description: 'Attack cards are used to compromise vulnerable infrastructure. They can only target infrastructure that has already been exploited and is in a vulnerable state. Each attack targets specific vectors and can fully compromise the target.',
      instruction: 'Click on the highlighted DDoS Attack card to select it and enter target mode. This Network attack can compromise vulnerable infrastructure with Network vulnerabilities. Once you\'ve selected the card, it will automatically advance to targeting.',
      targetElement: '.player-hand .card:first-child',
      position: 'right',
      validation: {
        type: 'custom',
        condition: () => {
          // Check if user is in target mode (card selected)
          const mockBoard = document.querySelector('[data-tutorial-target-mode="true"]');
          return !!mockBoard;
        }
      },
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'attack_vulnerable',
      title: 'Compromising Vulnerable Infrastructure',
      description: 'Perfect! The DDoS Attack card is now selected and ready to use. Notice how only the vulnerable Enterprise Firewall is highlighted - Attack cards can only target infrastructure that has been previously exploited and is in a vulnerable state.',
      instruction: 'Click on the highlighted vulnerable Enterprise Firewall to attack it. This will fully compromise the infrastructure, changing it from vulnerable to compromised state.',
      targetElement: '[data-infra-id="I001"]',
      position: 'right',
      validation: {
        type: 'custom',
        condition: () => {
          // Check if Enterprise Firewall has been compromised (state changed to compromised)
          const enterpriseFirewall = document.querySelector('[data-infra-id="I001"]');
          if (!enterpriseFirewall) {
            console.log('🎯 TUTORIAL: Enterprise Firewall element not found');
            return false;
          }
          
          const dataState = enterpriseFirewall.getAttribute('data-state');
          const textContent = enterpriseFirewall.textContent || '';
          
          console.log('🎯 TUTORIAL: Checking compromised state - data-state:', dataState, 'textContent:', textContent);
          
          return dataState === 'compromised' ||
                 textContent.toLowerCase().includes('compromised') ||
                 textContent.toLowerCase().includes('controlled') ||
                 textContent.toLowerCase().includes('breached');
        }
      },
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'infrastructure_compromised',
      title: 'Infrastructure Compromised!',
      description: 'Excellent! The infrastructure is now compromised (red border)',
      instruction: 'Compromised infrastructure counts toward your victory condition.',
      position: 'center',
      delay: 1000,
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'reaction_phase',
      title: 'Understanding Reaction Phase',
      description: 'Now you\'ll learn about the Reaction Phase - a crucial mechanic for both players. When a player makes a move, the opponent gets a chance to react with special cards. The Corporate Website has been shielded and the game has entered reaction phase.',
      instruction: 'Click on the highlighted Social Engineer card to select it and enter target mode. This Counter-Attack card can be played in reaction mode to cancel shield effects on infrastructure. Once you\'ve selected the card, it will automatically advance to targeting.',
      targetElement: '.player-hand .card:first-child',
      position: 'right',
      validation: {
        type: 'custom',
        condition: () => {
          // Check if Social Engineer card is selected (multiple ways to detect selection)
          const socialEngineerCard = document.querySelector('.player-hand .card[data-card-id="A205"]');
          
          if (socialEngineerCard) {
            // Check for various selection states
            const hasBorderSuccess = socialEngineerCard.classList.contains('border-success');
            const hasSelectedClass = socialEngineerCard.classList.contains('selected');
            const hasActiveClass = socialEngineerCard.classList.contains('active');
            
            console.log('🎯 TUTORIAL: Social Engineer card found, checking selection state:', {
              hasBorderSuccess,
              hasSelectedClass,
              hasActiveClass,
              classList: Array.from(socialEngineerCard.classList)
            });
            
            if (hasBorderSuccess || hasSelectedClass || hasActiveClass) {
              console.log('🎯 TUTORIAL: Social Engineer card selected, validation passed');
              return true;
            }
          }
          
          // Also check if we're in target mode (alternative detection)
          const mockBoard = document.querySelector('[data-tutorial-target-mode="true"]');
          if (mockBoard) {
            console.log('🎯 TUTORIAL: Target mode detected, validation passed');
            return true;
          }
          
          return false;
        }
      },
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'target_shielded',
      title: 'Breaking Through Shields',
      description: 'Perfect! The Social Engineer card is now selected and ready to use. Notice how only the shielded Corporate Website is highlighted - Counter-Attack cards can be played in reaction mode to cancel shield effects.',
      instruction: 'Click on the highlighted shielded Corporate Website to cancel its shield effect. This will neutralize the defensive measure and return the infrastructure to a secure state.',
      targetElement: '[data-infra-id="I003"]',
      position: 'right',
      validation: {
        type: 'custom',
        condition: () => {
          // Check if Corporate Website has been neutralized (state changed back to secure)
          const corporateWebsite = document.querySelector('[data-infra-id="I003"]');
          if (!corporateWebsite) {
            console.log('🎯 TUTORIAL: Corporate Website element not found');
            return false;
          }
          
          const dataState = corporateWebsite.getAttribute('data-state');
          const textContent = corporateWebsite.textContent || '';
          
          console.log('🎯 TUTORIAL: Checking secure state - data-state:', dataState, 'textContent:', textContent);
          
          return dataState === 'secure' ||
                 textContent.toLowerCase().includes('secure') ||
                 textContent.toLowerCase().includes('protected');
        }
      },
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'win_conditions',
      title: 'Win Conditions',
      description: 'There are two ways to win in Darknet Duel',
      instruction: 'Immediate Win: Control ALL 5 infrastructure cards. Turn Limit Win: Control majority (3+) after 15 rounds.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'end_turn',
      title: 'Ending Your Turn',
      description: 'When you\'re done with your actions, end your turn',
      instruction: 'Click the "End Turn" button to pass control to your opponent.',
      targetElement: '.end-turn-button',
      position: 'left',
      action: {
        type: 'click',
        target: '.end-turn-button'
      },
      validation: {
        type: 'game_state',
        condition: (gameState) => gameState?.currentTurn !== 'attacker'
      },
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'tutorial_complete',
      title: 'Tutorial Complete!',
      description: 'You\'ve learned the basics of Darknet Duel',
      instruction: 'You\'re ready to play! Remember: Exploit → Attack → Compromise. Good luck!',
      position: 'center',
      autoAdvance: false,
      skipable: false
    }
  ]
};

export const defenderTutorial: TutorialScript = {
  id: 'defender_basics',
  name: 'Defender Basics Tutorial',
  description: 'Learn how to protect infrastructure as the Defender',
  estimatedDuration: 8,
  steps: [
    {
      id: 'defender_welcome',
      title: 'Welcome, Defender',
      description: 'As the Defender (Blue Team), you protect infrastructure from attacks',
      instruction: 'Your goal is to shield and fortify infrastructure to prevent compromise.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'defender_advantage',
      title: 'Defender Advantages',
      description: 'Defenders have several advantages in the game',
      instruction: 'You gain 3 AP per turn (vs Attacker\'s 2), have more cards (76 vs 70), and win ties.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'shield_card',
      title: 'Shield Cards',
      description: 'Shield cards protect infrastructure from specific attack vectors',
      instruction: 'Find a Shield card in your hand and select it.',
      targetElement: '.player-hand .card[data-type="shield"]',
      position: 'top',
      action: {
        type: 'click',
        target: '.player-hand .card[data-type="shield"]'
      },
      validation: {
        type: 'element_clicked',
        condition: '.player-hand .card[data-type="shield"]'
      },
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'shield_infrastructure',
      title: 'Shield Infrastructure',
      description: 'Apply the shield to protect infrastructure',
      instruction: 'Click on a secure infrastructure card to shield it.',
      targetElement: '.infrastructure-card[data-state="secure"]',
      position: 'bottom',
      action: {
        type: 'click',
        target: '.infrastructure-card[data-state="secure"]'
      },
      validation: {
        type: 'game_state',
        condition: (gameState) => gameState?.infrastructure?.some((infra: any) => infra.state === 'shielded')
      },
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'fortify_card',
      title: 'Fortify Cards',
      description: 'Fortify cards strengthen shielded infrastructure',
      instruction: 'Find a Fortify card and select it to strengthen your shield.',
      targetElement: '.player-hand .card[data-type="fortify"]',
      position: 'top',
      action: {
        type: 'click',
        target: '.player-hand .card[data-type="fortify"]'
      },
      validation: {
        type: 'element_clicked',
        condition: '.player-hand .card[data-type="fortify"]'
      },
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'response_cards',
      title: 'Response Cards',
      description: 'Response cards can recover compromised infrastructure',
      instruction: 'Response cards change compromised infrastructure back to secure state.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'reaction_cards',
      title: 'Reaction Cards',
      description: 'Reaction cards can be played during the opponent\'s turn',
      instruction: 'Use reaction cards to counter attacker moves in real-time.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'defender_complete',
      title: 'Defender Tutorial Complete!',
      description: 'You\'re ready to defend the digital realm',
      instruction: 'Remember: Shield → Fortify → Victory. Protect your infrastructure!',
      position: 'center',
      autoAdvance: false,
      skipable: false
    }
  ]
};

export const attackerBasicsTutorial: TutorialScript = {
  id: 'attacker_basics',
  name: 'Attacker Basics Tutorial',
  description: 'Master the art of digital infiltration and system compromise',
  estimatedDuration: 10,
  prerequisites: ['basic_gameplay'],
  steps: [
    {
      id: 'attacker_mindset',
      title: 'The Attacker Mindset',
      description: 'As an Attacker, you are the Red Team - the digital infiltrator',
      instruction: 'Your mission: Find vulnerabilities, exploit weaknesses, and compromise infrastructure.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'attack_vectors',
      title: 'Attack Vectors',
      description: 'Attackers use four primary attack vectors to compromise systems',
      instruction: 'Network, Web, Social Engineering, and Malware - each targets different vulnerabilities.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'exploit_strategy',
      title: 'Exploit Strategy',
      description: 'Exploit cards are your primary tool for creating vulnerabilities',
      instruction: 'Always exploit before attacking. Match attack vectors to infrastructure weaknesses.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'attack_timing',
      title: 'Attack Timing',
      description: 'Timing your attacks is crucial for success',
      instruction: 'Strike when defenders are low on AP or lack appropriate reaction cards.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'counter_attacks',
      title: 'Counter-Attack Cards',
      description: 'Counter-attacks disrupt defender strategies',
      instruction: 'Use counter-attacks to remove shields or prevent fortifications.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'resource_management',
      title: 'AP Management',
      description: 'With only 2 AP per turn, every action counts',
      instruction: 'Plan your moves carefully. Save AP for critical moments.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'attacker_complete',
      title: 'Attacker Training Complete!',
      description: 'You are now ready to lead digital infiltration missions',
      instruction: 'Remember: Exploit vulnerabilities, time your attacks, manage resources wisely.',
      position: 'center',
      autoAdvance: false,
      skipable: false
    }
  ]
};

export const cardEncyclopediaTutorial: TutorialScript = {
  id: 'card_encyclopedia',
  name: 'Card Encyclopedia',
  description: 'Complete guide to all cards in Darknet Duel',
  estimatedDuration: 15,
  steps: [
    {
      id: 'encyclopedia_intro',
      title: 'Card Encyclopedia',
      description: 'Learn about every card type in Darknet Duel',
      instruction: 'This comprehensive guide covers all 146 cards in the game.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'infrastructure_cards',
      title: 'Infrastructure Cards (5 Total)',
      description: 'The battlefield - systems both teams fight to control',
      instruction: 'Enterprise Firewall, Corporate Website, Main Database, Employee Workstations, Financial System.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'attacker_deck_overview',
      title: 'Attacker Deck (70 Cards)',
      description: 'Red Team arsenal for digital warfare',
      instruction: '36 Exploits, 20 Attacks, 8 Counter-Attacks, 6 Wildcards - Tools of infiltration.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'exploit_cards',
      title: 'Exploit Cards (36 Cards)',
      description: 'Create vulnerabilities in secure infrastructure',
      instruction: 'Network Exploits: SQL Injection, Buffer Overflow, Port Scanning, Privilege Escalation.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'attack_cards',
      title: 'Attack Cards (20 Cards)',
      description: 'Compromise vulnerable infrastructure',
      instruction: 'Web Attacks: XSS, CSRF, Directory Traversal. Malware: Ransomware, Trojans, Rootkits.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'counter_attack_cards',
      title: 'Counter-Attack Cards (8 Cards)',
      description: 'Disrupt defender strategies',
      instruction: 'Shield Breaker, Fortification Bypass, Reaction Jammer, Information Warfare.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'defender_deck_overview',
      title: 'Defender Deck (76 Cards)',
      description: 'Blue Team arsenal for digital defense',
      instruction: '32 Shields, 20 Fortify, 8 Response, 10 Reaction, 6 Wildcards - Tools of protection.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'shield_cards',
      title: 'Shield Cards (32 Cards)',
      description: 'Protect infrastructure from specific attack vectors',
      instruction: 'Firewall, Antivirus, IDS/IPS, Access Control, Encryption, Security Training.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'fortify_cards',
      title: 'Fortify Cards (20 Cards)',
      description: 'Strengthen shielded infrastructure',
      instruction: 'Network Segmentation, Multi-Factor Auth, Backup Systems, Security Audits.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'response_cards',
      title: 'Response Cards (8 Cards)',
      description: 'Recover compromised infrastructure',
      instruction: 'Incident Response, System Restore, Forensic Analysis, Emergency Protocols.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'reaction_cards',
      title: 'Reaction Cards (10 Cards)',
      description: 'Instant responses during opponent turns',
      instruction: 'Threat Detection, Real-time Blocking, Emergency Shutdown, Alert Systems.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'wildcard_cards',
      title: 'Wildcard Cards (12 Total)',
      description: 'Flexible cards that can become any type',
      instruction: '6 Attacker Wildcards, 6 Defender Wildcards - Ultimate tactical flexibility.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'card_costs',
      title: 'Action Point Costs',
      description: 'Understanding card costs and resource management',
      instruction: 'Most cards cost 1 AP. Wildcards cost 2 AP. Some special cards have variable costs.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'special_abilities',
      title: 'Special Card Abilities',
      description: 'Advanced card mechanics and interactions',
      instruction: 'Chain Effects, Hand Disruption, Cost Reduction, Temporary Effects, Prerequisites.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'encyclopedia_complete',
      title: 'Encyclopedia Complete!',
      description: 'You now know every card in Darknet Duel',
      instruction: 'Use this knowledge to build winning strategies and counter opponent moves.',
      position: 'center',
      autoAdvance: false,
      skipable: false
    }
  ]
};

export const advancedMechanicsTutorial: TutorialScript = {
  id: 'advanced_mechanics',
  name: 'Advanced Mechanics Tutorial',
  description: 'Learn about wildcards, chain effects, and special abilities',
  estimatedDuration: 12,
  prerequisites: ['basic_gameplay', 'attacker_basics'],
  steps: [
    {
      id: 'wildcard_intro',
      title: 'Wildcard Cards',
      description: 'Wildcard cards can be played as any other card type',
      instruction: 'Wildcards cost 2 AP but offer maximum flexibility in your strategy.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'wildcard_selection',
      title: 'Wildcard Type Selection',
      description: 'When you play a wildcard, you choose what type it becomes',
      instruction: 'The game will show you available options based on the current situation.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'chain_effects',
      title: 'Chain Effects',
      description: 'Some cards create chain effects that affect multiple infrastructure',
      instruction: 'Cards like "Lateral Movement" can spread vulnerabilities across systems.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'hand_disruption',
      title: 'Hand Disruption',
      description: 'Certain cards let you see and disrupt your opponent\'s hand',
      instruction: 'Use information warfare to gain tactical advantages.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'temporary_effects',
      title: 'Temporary Effects',
      description: 'Some cards create temporary effects that last for several turns',
      instruction: 'Watch for cost reductions, reaction prevention, and other ongoing effects.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'advanced_complete',
      title: 'Advanced Tutorial Complete!',
      description: 'You\'ve mastered the advanced mechanics',
      instruction: 'You\'re now ready for competitive play. May the best hacker win!',
      position: 'center',
      autoAdvance: false,
      skipable: false
    }
  ]
};

export const tutorialScripts: TutorialScript[] = [
  basicGameplayTutorial,
  defenderTutorial,
  attackerBasicsTutorial,
  cardEncyclopediaTutorial,
  advancedMechanicsTutorial
];
