import type { TutorialScript } from '../types/tutorial.types';
import { tutorialLog } from '../utils/tutorialLogger';

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
      targetElement: '[data-card-id="A003"]',
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
      targetElement: '[data-card-id="A101"]',
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
            tutorialLog('🎯 TUTORIAL: Enterprise Firewall element not found');
            return false;
          }
          
          const dataState = enterpriseFirewall.getAttribute('data-state');
          const textContent = enterpriseFirewall.textContent || '';
          
          tutorialLog('🎯 TUTORIAL: Checking compromised state - data-state:', dataState, 'textContent:', textContent);
          
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
      targetElement: '[data-card-id="A205"]',
      position: 'right',
      validation: {
        type: 'custom',
        condition: () => {
          // Check ONLY if target mode is active - this means the user clicked the card
          // Do NOT check CSS classes as they are applied for highlighting, not selection
          const targetModeActive = document.querySelector('[data-tutorial-target-mode="true"]');
          
          if (!targetModeActive) {
            return false;
          }
          
          // Target mode is active, but verify it's because Social Engineer was clicked
          // by checking if the card exists and we're in target mode
          const socialEngineerCard = document.querySelector('[data-card-id="A205"]');
          
          if (!socialEngineerCard) {
            tutorialLog('🎯 TUTORIAL: Social Engineer card not found');
            return false;
          }
          
          // If target mode is active AND the card exists, user clicked it
          tutorialLog('🎯 TUTORIAL: Target mode active and Social Engineer card exists - validation passed');
          return true;
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
            tutorialLog('🎯 TUTORIAL: Corporate Website element not found');
            return false;
          }
          
          const dataState = corporateWebsite.getAttribute('data-state');
          const textContent = corporateWebsite.textContent || '';
          
          tutorialLog('🎯 TUTORIAL: Checking secure state - data-state:', dataState, 'textContent:', textContent);
          
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
      id: 'fortified_infrastructure_intro',
      title: 'Understanding Fortified Infrastructure',
      description: 'Fortified infrastructure is the defender\'s strongest protection - it combines both shield and fortify effects, making it extremely resistant to attacks. However, as an attacker, you can still break through this defense!',
      instruction: 'The Main Database Cluster has been fortified by the defender. Notice the double-layer protection indicated by its fortified state. To strip away fortified defenses, you need a special technique.',
      targetElement: '[data-infra-id="I005"]',
      position: 'right',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'fortified_strategy',
      title: 'Breaking Fortified Defenses',
      description: 'To break through fortified infrastructure, you must use TWO exploit cards instead of one. The first exploit weakens the fortifications (fortified → fortified_weaken), and the second exploit makes it vulnerable (fortified_weaken → vulnerable).',
      instruction: 'This is a critical advanced technique: fortified infrastructure requires 2 exploit cards of matching attack vectors to make it vulnerable. After the second exploit, it becomes vulnerable and can be attacked normally. Let\'s practice this now.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'first_fortified_exploit',
      title: 'First Exploit Card',
      description: 'You\'ll now play the first of two exploit cards against fortified infrastructure. This first exploit begins to weaken the defensive layers, changing the state from "fortified" to "fortified_weaken".',
      instruction: 'Click on the highlighted Packet Sniffer card to select it. This Network exploit will start breaking down the fortified Main Database Cluster\'s defenses.',
      targetElement: '[data-card-id="A002"]',
      position: 'right',
      validation: {
        type: 'custom',
        condition: () => {
          const mockBoard = document.querySelector('[data-tutorial-target-mode="true"]');
          return !!mockBoard;
        }
      },
      autoAdvance: false,
      skipable: true,
      preventTargetModeExit: true
    },
    {
      id: 'target_fortified_first',
      title: 'Target Fortified Infrastructure (1st Exploit)',
      description: 'The first exploit card is selected. Now target the fortified Main Database Cluster to begin weakening its defenses.',
      instruction: 'Click on the fortified Main Database Cluster. After this first exploit, the infrastructure will change from "fortified" to "fortified_weaken" state - partially weakened but still protected.',
      targetElement: '[data-infra-id="I005"]',
      position: 'right',
      validation: {
        type: 'custom',
        condition: () => {
          const mainDatabase = document.querySelector('[data-infra-id="I005"]');
          if (!mainDatabase) {
            tutorialLog('🎯 TUTORIAL: Main Database element not found');
            return false;
          }
          
          const dataState = mainDatabase.getAttribute('data-state');
          const textContent = mainDatabase.textContent || '';
          
          tutorialLog('🎯 TUTORIAL: Checking fortified_weaken state - data-state:', dataState, 'textContent:', textContent);
          
          return dataState === 'fortified_weaken' ||
                 textContent.toLowerCase().includes('weakened') ||
                 textContent.toLowerCase().includes('weaken');
        }
      },
      autoAdvance: false,
      skipable: true,
      preventTargetModeExit: true
    },
    {
      id: 'fortified_to_weakened',
      title: 'Fortifications Weakened',
      description: 'Good! The first exploit successfully weakened the fortifications. The Main Database is now in a "fortified_weaken" state - partially compromised but still defended.',
      instruction: 'One more exploit card will completely break through the defenses, making it vulnerable. Then you can attack it normally to compromise it. This demonstrates why fortified infrastructure is so powerful - it requires twice the effort to break through!',
      position: 'center',
      delay: 1000,
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'second_fortified_exploit',
      title: 'Second Exploit Card',
      description: 'Now you\'ll play the second exploit card to finish breaking through the defenses. This exploit will completely break through the fortifications, making the infrastructure vulnerable.',
      instruction: 'Click on the highlighted Port Scanner card to select it. This will complete the process of breaking through the fortified defenses, making it vulnerable for attack.',
      targetElement: '[data-card-id="A001"]',
      position: 'right',
      validation: {
        type: 'custom',
        condition: () => {
          const mockBoard = document.querySelector('[data-tutorial-target-mode="true"]');
          return !!mockBoard;
        }
      },
      autoAdvance: false,
      skipable: true,
      preventTargetModeExit: true
    },
    {
      id: 'target_fortified_second',
      title: 'Target Weakened Infrastructure (2nd Exploit)',
      description: 'The second exploit card is selected. Now target the weakened Main Database Cluster to completely break through its defenses.',
      instruction: 'Click on the weakened Main Database Cluster. After this second exploit, the infrastructure will become vulnerable - ready for your attack!',
      targetElement: '[data-infra-id="I005"]',
      position: 'right',
      validation: {
        type: 'custom',
        condition: () => {
          // Check if Main Database has become vulnerable (fortified defenses broken)
          const mainDatabase = document.querySelector('[data-infra-id="I005"]');
          if (!mainDatabase) {
            tutorialLog('🎯 TUTORIAL: Main Database element not found');
            return false;
          }
          
          const dataState = mainDatabase.getAttribute('data-state');
          const textContent = mainDatabase.textContent || '';
          
          tutorialLog('🎯 TUTORIAL: Checking vulnerable state after 2nd exploit - data-state:', dataState, 'textContent:', textContent);
          
          // Must be in vulnerable state (not fortified_weaken anymore)
          const isVulnerable = dataState === 'vulnerable' ||
                              textContent.toLowerCase().includes('vulnerable') ||
                              textContent.toLowerCase().includes('at risk');
          
          if (isVulnerable) {
            tutorialLog('🎯 TUTORIAL: Fortified defenses completely broken - infrastructure is now vulnerable!');
          }
          
          return isVulnerable;
        }
      },
      autoAdvance: false,
      skipable: true,
      preventTargetModeExit: true
    },
    {
      id: 'fortified_defenses_removed',
      title: 'Fortified Defenses Completely Broken!',
      description: 'Excellent work! You\'ve successfully broken through fortified defenses using two exploit cards. The Main Database is now vulnerable and ready to be attacked.',
      instruction: 'Remember the progression: Fortified → (1st Exploit) → Fortified_Weaken → (2nd Exploit) → Vulnerable. After breaking through fortifications with 2 exploits, you can then attack it normally to compromise it. This two-exploit technique is essential for overcoming the defender\'s strongest defenses!',
      position: 'center',
      delay: 1000,
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
      targetElement: '[data-card-id="D001"]',
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
          
          tutorialLog('🎯 TUTORIAL: Shield validation check:', {
            targetModeActive: !!targetModeActive,
            targetModeExited
          });
          
          if (targetModeExited) {
            tutorialLog('🎯 TUTORIAL: Target mode exited - shield applied successfully!');
            return true;
          }
          
          // Secondary check: Look for DOM changes in the infrastructure
          const enterpriseFirewall = document.querySelector('[data-infra-id="I001"]');
          if (!enterpriseFirewall) {
            tutorialLog('🎯 TUTORIAL: Enterprise Firewall element not found');
            return false;
          }
          
          // Check for various ways the shielded state might be indicated
          const hasShieldedClass = enterpriseFirewall.classList.contains('shielded');
          const hasShieldedState = enterpriseFirewall.getAttribute('data-state') === 'shielded';
          const hasShieldedIndicator = enterpriseFirewall.querySelector('.shield-indicator');
          const hasShieldIcon = enterpriseFirewall.querySelector('[class*="shield"]');
          const hasProtectedState = enterpriseFirewall.getAttribute('data-state') === 'protected';
          
          tutorialLog('🎯 TUTORIAL: DOM shield state check:', {
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
      targetElement: '[data-card-id="D101"]',
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
            tutorialLog('🎯 TUTORIAL: Target mode exited - fortify applied successfully!');
            return true;
          }
          
          // Secondary check: Look for fortified state
          const enterpriseFirewall = document.querySelector('[data-infra-id="I001"]');
          if (enterpriseFirewall) {
            const hasFortifiedClass = enterpriseFirewall.classList.contains('fortified');
            const hasFortifiedState = enterpriseFirewall.getAttribute('data-state') === 'fortified';
            tutorialLog('🎯 TUTORIAL: Fortify state check:', { hasFortifiedClass, hasFortifiedState });
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
      targetElement: '[data-card-id="D201"]',
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
            tutorialLog('🎯 TUTORIAL: Target mode exited - response applied successfully!');
            return true;
          }
          
          // Secondary check: Look for secure state restoration
          const mainDatabase = document.querySelector('[data-infra-id="I005"]');
          if (mainDatabase) {
            const hasSecureClass = mainDatabase.classList.contains('secure');
            const hasSecureState = mainDatabase.getAttribute('data-state') === 'secure';
            tutorialLog('🎯 TUTORIAL: Response state check:', { hasSecureClass, hasSecureState });
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
      targetElement: '[data-card-id="D007"]',
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
            tutorialLog('🎯 TUTORIAL: Target mode exited - reaction applied successfully!');
            return true;
          }
          
          // Secondary check: Look for secure state
          const corporateWebsite = document.querySelector('[data-infra-id="I003"]');
          if (corporateWebsite) {
            const hasSecureClass = corporateWebsite.classList.contains('secure');
            const hasSecureState = corporateWebsite.getAttribute('data-state') === 'secure';
            tutorialLog('🎯 TUTORIAL: Reaction state check:', { hasSecureClass, hasSecureState });
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

export const realWorldCybersecurityTutorial: TutorialScript = {
  id: 'real_world_cybersecurity',
  name: 'Real-World Cybersecurity Connections',
  description: 'Discover how Darknet Duel mirrors actual cybersecurity concepts and practices',
  estimatedDuration: 15,
  prerequisites: ['attacker_basics', 'defender_basics'],
  steps: [
    {
      id: 'intro_real_world',
      title: 'Welcome to Real-World Cybersecurity',
      description: 'Darknet Duel is more than just a game - it\'s an educational tool that teaches real cybersecurity concepts',
      instruction: 'Every card, mechanic, and strategy in this game is based on actual cybersecurity practices used by professionals worldwide. Let\'s explore these connections!',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'infrastructure_reality',
      title: 'Infrastructure: Digital Assets in Reality',
      description: 'The 5 infrastructure cards represent real organizational assets that need protection',
      instruction: 'Enterprise Firewall = Network perimeter security. Corporate Website = Public-facing web applications. Main Database = Critical data storage. Employee Workstations = Endpoint devices. Financial System = Payment and transaction systems. These are the exact targets attackers pursue in real breaches.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'exploit_reality',
      title: 'Exploits: Finding Real Vulnerabilities',
      description: 'Exploit cards represent actual vulnerability discovery techniques used by penetration testers and hackers',
      instruction: 'Log4Shell, SQL Injection, Buffer Overflow - these are real CVEs (Common Vulnerabilities and Exposures) that have caused billions in damages. Port Scanner and Packet Sniffer are reconnaissance tools used in every real-world attack. Exploits don\'t directly compromise systems; they create vulnerabilities that can be exploited later.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'attack_vectors_reality',
      title: 'Attack Vectors: Real Threat Categories',
      description: 'The four attack vectors in the game mirror how security professionals categorize threats',
      instruction: 'Network (firewalls, routers), Web (applications, APIs), Social Engineering (phishing, pretexting), and Malware (viruses, ransomware) are the four primary attack surfaces in real cybersecurity. Organizations must defend against all vectors simultaneously, just like in the game.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'attack_cards_reality',
      title: 'Attack Cards: Real Compromise Methods',
      description: 'Attack cards represent the actual techniques used to compromise vulnerable systems',
      instruction: 'DDoS attacks overwhelm systems with traffic. Ransomware encrypts data for ransom. XSS and CSRF exploit web vulnerabilities. In reality, attackers must first find vulnerabilities (exploits) before they can execute attacks - exactly like the game\'s two-step process: Exploit → Attack → Compromise.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'shield_reality',
      title: 'Shield Cards: Preventive Security Controls',
      description: 'Shield cards represent proactive security measures organizations implement',
      instruction: 'Firewalls, Antivirus, IDS/IPS, Encryption, Access Control, Security Training - these are real security controls from frameworks like NIST, ISO 27001, and CIS Controls. Organizations layer these defenses to create "defense in depth," just like shielding infrastructure in the game.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'fortify_reality',
      title: 'Fortify Cards: Hardening and Resilience',
      description: 'Fortify cards represent security hardening - strengthening already-protected systems',
      instruction: 'Network Segmentation, Multi-Factor Authentication, Backup Systems, Security Audits - these are advanced security practices that make systems resilient. In reality, MFA reduces account compromise by 99.9%. Backups are the last line of defense against ransomware. The game\'s fortify mechanic teaches that layered security (shield + fortify) is exponentially stronger.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'response_reality',
      title: 'Response Cards: Incident Response',
      description: 'Response cards mirror real incident response and recovery procedures',
      instruction: 'When a breach occurs, organizations activate Incident Response Teams, perform Forensic Analysis, execute System Restores, and follow Emergency Protocols. The game teaches that recovery is possible but costly (uses AP and cards). In reality, the average cost of a data breach is $4.45 million, and recovery can take months.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'reaction_reality',
      title: 'Reaction Cards: Real-Time Threat Detection',
      description: 'Reaction cards represent automated security systems that respond instantly to threats',
      instruction: 'EDR (Endpoint Detection & Response), SIEM (Security Information & Event Management), IPS (Intrusion Prevention Systems), and SOC (Security Operations Center) analysts monitor systems 24/7. When threats are detected, they can block attacks in real-time - just like reaction cards during opponent turns. This is why organizations invest heavily in threat detection.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'counter_attack_reality',
      title: 'Counter-Attack Cards: Advanced Persistent Threats',
      description: 'Counter-attack cards represent sophisticated attacker techniques to bypass defenses',
      instruction: 'Shield Breaker = Zero-day exploits that bypass security. Fortification Bypass = Advanced evasion techniques. Reaction Jammer = Disabling security monitoring. Social Engineer = Manipulating people to bypass technical controls. In reality, APT (Advanced Persistent Threat) groups use these exact tactics to breach even well-defended organizations.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'action_points_reality',
      title: 'Action Points: Resource Management',
      description: 'AP represents the real-world concept of limited security resources',
      instruction: 'Organizations have limited budgets, personnel, and time. Defenders get 3 AP (more resources) because defense is harder and more expensive than attack. Attackers get 2 AP because they only need to find one weakness. This mirrors the real asymmetry: "Defenders must be right every time; attackers only need to be right once."',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'turn_structure_reality',
      title: 'Turn Structure: The Cyber Kill Chain',
      description: 'The game\'s turn structure mirrors the real-world cyber attack lifecycle',
      instruction: 'Real attacks follow stages: Reconnaissance → Weaponization → Delivery → Exploitation → Installation → Command & Control → Actions on Objectives. The game simplifies this to: Exploit (find vulnerability) → Attack (compromise) → Control (maintain access). This is how real breaches unfold over weeks or months.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'win_conditions_reality',
      title: 'Win Conditions: Real-World Objectives',
      description: 'The game\'s victory conditions reflect actual attacker and defender goals',
      instruction: 'Attackers win by controlling majority infrastructure = Real attackers aim to compromise critical systems for data theft, ransomware, or disruption. Defenders win by preventing this = Real defenders aim to maintain confidentiality, integrity, and availability (CIA triad). The 15-turn limit represents that attacks can\'t continue indefinitely before detection.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'red_vs_blue_reality',
      title: 'Red Team vs Blue Team: Industry Standard',
      description: 'The attacker/defender roles mirror real cybersecurity team structures',
      instruction: 'Red Team = Offensive security professionals who simulate attacks to find weaknesses. Blue Team = Defensive security professionals who protect systems and respond to threats. Organizations run "Red Team vs Blue Team" exercises exactly like this game to improve security. Some companies even have Purple Teams that combine both perspectives.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'card_costs_reality',
      title: 'Card Costs: Real Implementation Complexity',
      description: 'Different AP costs reflect the real complexity and resources required for security measures',
      instruction: 'Basic shields (1 AP) = Standard security tools. Wildcards (2 AP) = Flexible but expensive solutions like custom security tools. In reality, implementing MFA might take days, but deploying EDR across an enterprise takes months and millions of dollars. The game teaches resource prioritization.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'state_transitions_reality',
      title: 'Infrastructure States: Security Posture',
      description: 'The different infrastructure states represent real security postures',
      instruction: 'Secure = Properly configured with no known vulnerabilities. Vulnerable = Exploitable weakness discovered. Compromised = Attacker has control. Shielded = Protected by security controls. Fortified = Hardened with multiple layers. In reality, organizations constantly move between these states as new vulnerabilities are discovered and patched.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'wildcards_reality',
      title: 'Wildcard Cards: Adaptive Security',
      description: 'Wildcards represent flexible security tools and adaptive strategies',
      instruction: 'In reality, security professionals must adapt to evolving threats. A SIEM can detect various attack types. A skilled penetration tester can exploit multiple vectors. Threat intelligence platforms provide flexible defense. Wildcards teach that flexibility is valuable but expensive - just like real adaptive security solutions.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'game_balance_reality',
      title: 'Game Balance: Real-World Asymmetry',
      description: 'The game\'s balance reflects actual cybersecurity challenges',
      instruction: 'Defenders have more cards (76 vs 70) and more AP (3 vs 2) because defense is inherently harder. They must protect everything; attackers only need one entry point. But attackers can focus their efforts. This asymmetry is why cybersecurity is so challenging - and why the industry is worth $200+ billion globally.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'learning_outcomes',
      title: 'What You\'ve Learned',
      description: 'By playing Darknet Duel, you\'ve learned fundamental cybersecurity concepts',
      instruction: 'You now understand: Attack vectors and defense strategies. The cyber kill chain. Defense in depth. Incident response. Resource management. The attacker/defender mindset. These concepts form the foundation of cybersecurity careers in penetration testing, security operations, incident response, and security architecture.',
      position: 'center',
      autoAdvance: false,
      skipable: true
    },
    {
      id: 'real_world_complete',
      title: 'Real-World Connections Complete!',
      description: 'You now see how Darknet Duel teaches real cybersecurity',
      instruction: 'Every game you play reinforces these concepts. Whether you pursue a cybersecurity career or simply want to understand digital security, you\'re now equipped with foundational knowledge used by professionals worldwide. Stay curious, stay secure!',
      position: 'center',
      autoAdvance: false,
      skipable: false,
      customButtonText: 'Finish Tutorial',
      customButtonAction: 'exit_tutorial'
    }
  ]
};

export const tutorialScripts: TutorialScript[] = [
  attackerBasicsTutorial,
  defenderTutorial,
  cardEncyclopediaTutorial,
  realWorldCybersecurityTutorial
];
