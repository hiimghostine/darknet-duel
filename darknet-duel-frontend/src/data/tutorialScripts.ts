import type { TutorialScript } from '../types/tutorial.types';

export const attackerBasicsTutorial: TutorialScript = {
  id: 'attacker_basics',
  name: 'Attacker Basics Tutorial',
  description: 'Master the art of digital infiltration and system compromise',
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
      position: 'bottom',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'action_points',
      title: 'Action Points (AP)',
      description: 'Action Points determine how many actions you can take per turn',
      instruction: 'As an Attacker, you gain 2 AP per turn (max 10). Defenders gain 3 AP per turn.',
      targetElement: '[data-testid="action-points"]',
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
      skipable: true,
      preventTargetModeExit: true
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
      skipable: true,
      preventTargetModeExit: true
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
      skipable: true,
      preventTargetModeExit: true
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
      skipable: true,
      preventTargetModeExit: true
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
      skipable: true,
      preventTargetModeExit: true
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
      skipable: true,
      preventTargetModeExit: true
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
      position: 'bottom',
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
      skipable: false,
      customButtonText: 'Finish Tutorial',
      customButtonAction: 'exit_tutorial'
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
      title: 'Understanding Shield Cards',
      description: 'This is a Shield card - the foundation of any successful defense. Shield cards protect infrastructure from specific attack vectors by creating a defensive barrier. Each shield targets specific attack vectors like Network, Web, Social Engineering, or Malware.',
      instruction: 'Click on the highlighted Firewall card to select it and enter target mode. This Network shield can protect infrastructure from Network-based attacks. Once you\'ve selected the card, click "Next" to learn about targeting.',
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
      skipable: true,
      preventTargetModeExit: true
    },
    {
      id: 'shield_infrastructure',
      title: 'Defense Vectors & Infrastructure Targeting',
      description: 'Perfect! The Firewall card is now selected and glowing, indicating it\'s ready to be used. Notice how the game has entered "target mode" - only compatible infrastructure cards are highlighted. Defense vectors are crucial: your Network shield can only protect infrastructure with Network vulnerabilities.',
      instruction: 'Click on the highlighted Enterprise Firewall to shield it. This infrastructure has Network vulnerabilities that match your Firewall shield. Once you\'ve targeted it, the shield will be applied and the infrastructure will become protected.',
      targetElement: '[data-infra-id="I001"]',
      position: 'right',
      validation: {
        type: 'custom',
        condition: () => {
          // Primary check: Has target mode been exited? (indicates successful card play)
          const targetModeActive = document.querySelector('[data-tutorial-target-mode="true"]');
          const targetModeExited = !targetModeActive;
          
          console.log('🎯 TUTORIAL: Shield validation check:', {
            targetModeActive: !!targetModeActive,
            targetModeExited
          });
          
          if (targetModeExited) {
            console.log('🎯 TUTORIAL: Target mode exited - shield applied successfully!');
            return true;
          }
          
          // Secondary check: Look for DOM changes in the infrastructure
          const enterpriseFirewall = document.querySelector('[data-infra-id="I001"]');
          if (!enterpriseFirewall) {
            console.log('🎯 TUTORIAL: Enterprise Firewall element not found');
            return false;
          }
          
          // Check for various ways the shielded state might be indicated
          const hasShieldedClass = enterpriseFirewall.classList.contains('shielded');
          const hasShieldedState = enterpriseFirewall.getAttribute('data-state') === 'shielded';
          const hasShieldedIndicator = enterpriseFirewall.querySelector('.shield-indicator');
          const hasShieldIcon = enterpriseFirewall.querySelector('[class*="shield"]');
          const hasProtectedState = enterpriseFirewall.getAttribute('data-state') === 'protected';
          
          console.log('🎯 TUTORIAL: DOM shield state check:', {
            hasShieldedClass,
            hasShieldedState,
            hasProtectedState,
            hasShieldedIndicator: !!hasShieldedIndicator,
            hasShieldIcon: !!hasShieldIcon,
            allClasses: enterpriseFirewall.className,
            dataState: enterpriseFirewall.getAttribute('data-state')
          });
          
          return hasShieldedClass || hasShieldedState || hasProtectedState || !!hasShieldedIndicator || !!hasShieldIcon;
        }
      },
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'fortify_card',
      title: 'Understanding Fortify Cards',
      description: 'Fortify cards are the second layer of defense that strengthen already shielded infrastructure. They can only be applied to infrastructure that has been shielded first, creating a "fortified" state that provides enhanced protection against attacks. Think of shields as armor, and fortify as reinforcing that armor.',
      instruction: 'Click on the highlighted DMZ Implementation card to select it and enter target mode. This Network fortify card can strengthen infrastructure that already has Network shields. Once you\'ve selected the card, click "Next" to learn about fortify targeting.',
      targetElement: '.player-hand .card:first-child',
      position: 'right',
      validation: {
        type: 'custom',
        condition: () => {
          // Check if user is in target mode (fortify card selected)
          const mockBoard = document.querySelector('[data-tutorial-target-mode="true"]');
          return !!mockBoard;
        }
      },
      autoAdvance: false,
      skipable: true,
      preventTargetModeExit: true
    },
    {
      id: 'fortify_infrastructure',
      title: 'Fortify Targeting & Shielded Infrastructure',
      description: 'Excellent! The DMZ Implementation card is now selected and ready to use. Notice that fortify cards can only target infrastructure that has already been shielded. The game automatically filters valid targets - only shielded infrastructure with matching defense vectors will be highlighted.',
      instruction: 'Click on the shielded Enterprise Firewall to fortify it. Since this infrastructure is already shielded against Network attacks and your DMZ card provides Network fortification, they are compatible. Fortifying will upgrade the infrastructure from "shielded" to "fortified" state.',
      targetElement: '[data-infra-id="I001"]',
      position: 'right',
      validation: {
        type: 'custom',
        condition: () => {
          // Check if target mode has been exited (fortify applied)
          const targetModeActive = document.querySelector('[data-tutorial-target-mode="true"]');
          const targetModeExited = !targetModeActive;
          
          if (targetModeExited) {
            console.log('🎯 TUTORIAL: Target mode exited - fortify applied successfully!');
            return true;
          }
          
          // Secondary check: Look for fortified state
          const enterpriseFirewall = document.querySelector('[data-infra-id="I001"]');
          if (enterpriseFirewall) {
            const hasFortifiedClass = enterpriseFirewall.classList.contains('fortified');
            const hasFortifiedState = enterpriseFirewall.getAttribute('data-state') === 'fortified';
            console.log('🎯 TUTORIAL: Fortify state check:', { hasFortifiedClass, hasFortifiedState });
            return hasFortifiedClass || hasFortifiedState;
          }
          
          return false;
        }
      },
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'response_card',
      title: 'Understanding Response Cards',
      description: 'Response cards are the defender\'s recovery mechanism - they can restore compromised infrastructure back to a secure state. Unlike shields and fortify cards that prevent attacks, response cards are used reactively to undo damage that has already been done. They are essential for recovering from successful attacker moves.',
      instruction: 'Click on the highlighted Incident Response Team card to select it and enter target mode. This Network response card can restore compromised infrastructure with Network vulnerabilities back to secure state. Once you\'ve selected the card, click "Next" to learn about response targeting.',
      targetElement: '.player-hand .card:first-child',
      position: 'right',
      validation: {
        type: 'custom',
        condition: () => {
          // Check if user is in target mode (response card selected)
          const mockBoard = document.querySelector('[data-tutorial-target-mode="true"]');
          return !!mockBoard;
        }
      },
      autoAdvance: false,
      skipable: true,
      preventTargetModeExit: true
    },
    {
      id: 'response_infrastructure',
      title: 'Response Targeting & Compromised Infrastructure',
      description: 'Excellent! The Incident Response Team card is now selected and ready to use. Notice that response cards can only target infrastructure that has been compromised by attackers. The game automatically filters valid targets - only compromised infrastructure with matching vulnerability vectors will be highlighted.',
      instruction: 'Click on the compromised Main Database Cluster to restore it. Since this infrastructure is compromised and has Network vulnerabilities matching your Incident Response Team card, they are compatible. Using the response card will restore the infrastructure from "compromised" back to "secure" state.',
      targetElement: '[data-infra-id="I005"]',
      position: 'right',
      validation: {
        type: 'custom',
        condition: () => {
          // Check if target mode has been exited (response applied)
          const targetModeActive = document.querySelector('[data-tutorial-target-mode="true"]');
          const targetModeExited = !targetModeActive;
          
          if (targetModeExited) {
            console.log('🎯 TUTORIAL: Target mode exited - response applied successfully!');
            return true;
          }
          
          // Secondary check: Look for secure state restoration
          const mainDatabase = document.querySelector('[data-infra-id="I005"]');
          if (mainDatabase) {
            const hasSecureClass = mainDatabase.classList.contains('secure');
            const hasSecureState = mainDatabase.getAttribute('data-state') === 'secure';
            console.log('🎯 TUTORIAL: Response state check:', { hasSecureClass, hasSecureState });
            return hasSecureClass || hasSecureState;
          }
          
          return false;
        }
      },
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'reaction_card',
      title: 'Understanding Reaction Cards',
      description: 'Reaction cards are special defensive cards that can be played during the opponent\'s turn! When an attacker tries to exploit or attack your infrastructure, reaction cards let you respond instantly to protect it. Think of them as your "instant response" defense mechanism.',
      instruction: 'Click on the highlighted Phishing Defense card to select it and enter target mode. This Social reaction card can protect infrastructure from Social-based exploits during the attacker\'s turn. Once you\'ve selected the card, click "Next" to learn about reaction targeting.',
      targetElement: '.player-hand .card:first-child',
      position: 'right',
      validation: {
        type: 'custom',
        condition: () => {
          // Check if user is in target mode (reaction card selected)
          const mockBoard = document.querySelector('[data-tutorial-target-mode="true"]');
          return !!mockBoard;
        }
      },
      autoAdvance: false,
      skipable: true,
      preventTargetModeExit: true
    },
    {
      id: 'reaction_infrastructure',
      title: 'Reaction Targeting & Vulnerable Infrastructure',
      description: 'Perfect! The Phishing Defense card is now selected and ready to use. Reaction cards can protect vulnerable infrastructure - infrastructure that has been exploited but not yet fully compromised. They act as an emergency shield during the attacker\'s turn.',
      instruction: 'Click on the vulnerable Corporate Website to protect it with your reaction card. This will shield the infrastructure and prevent it from being compromised, turning it back to secure state instantly.',
      targetElement: '[data-infra-id="I003"]',
      position: 'right',
      validation: {
        type: 'custom',
        condition: () => {
          // Check if target mode has been exited (reaction applied)
          const targetModeActive = document.querySelector('[data-tutorial-target-mode="true"]');
          const targetModeExited = !targetModeActive;
          
          if (targetModeExited) {
            console.log('🎯 TUTORIAL: Target mode exited - reaction applied successfully!');
            return true;
          }
          
          // Secondary check: Look for secure state
          const corporateWebsite = document.querySelector('[data-infra-id="I003"]');
          if (corporateWebsite) {
            const hasSecureClass = corporateWebsite.classList.contains('secure');
            const hasSecureState = corporateWebsite.getAttribute('data-state') === 'secure';
            console.log('🎯 TUTORIAL: Reaction state check:', { hasSecureClass, hasSecureState });
            return hasSecureClass || hasSecureState;
          }
          
          return false;
        }
      },
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'defender_complete',
      title: 'Defender Tutorial Complete!',
      description: 'You\'re ready to defend the digital realm',
      instruction: 'Remember: Shield → Fortify → Reaction → Response. Protect your infrastructure!',
      position: 'center',
      autoAdvance: false,
      skipable: false,
      customButtonText: 'Finish Tutorial',
      customButtonAction: 'exit_tutorial'
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
  prerequisites: ['attacker_basics'],
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
  attackerBasicsTutorial,
  defenderTutorial,
  cardEncyclopediaTutorial,
  advancedMechanicsTutorial
];
