import React, { useState, useEffect } from 'react';
import { X, Globe, ChevronRight, ChevronLeft, BookOpen, Shield, Target, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import tutorialManager from '../../services/tutorialManager';

interface Section {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  icon: React.ReactNode;
  realWorldExample?: string;
  keyTakeaway?: string;
  sources?: Array<{
    title: string;
    url: string;
  }>;
}

interface RealWorldCybersecurityProps {
  onClose: () => void;
}

const RealWorldCybersecurity: React.FC<RealWorldCybersecurityProps> = ({ onClose }) => {
  const [currentSection, setCurrentSection] = useState(0);

  const sections: Section[] = [
    {
      id: 'intro',
      title: 'Welcome to Real-World Cybersecurity',
      subtitle: 'More Than Just a Game',
      content: 'Darknet Duel is more than just a game - it\'s an educational tool that teaches real cybersecurity concepts. Every card, mechanic, and strategy in this game is based on actual cybersecurity practices used by professionals worldwide. Let\'s explore these connections!',
      icon: <Globe className="w-12 h-12" />,
      keyTakeaway: 'This game teaches you the fundamentals of cybersecurity through interactive gameplay.'
    },
    {
      id: 'infrastructure',
      title: 'Infrastructure: Digital Assets in Reality',
      subtitle: 'The Targets of Cyber Warfare',
      content: 'The 5 infrastructure cards represent real organizational assets that need protection:\n\n• Enterprise Firewall = Network perimeter security\n• Corporate Website = Public-facing web applications\n• Main Database = Critical data storage systems\n• Employee Workstations = Endpoint devices\n• Financial System = Payment and transaction systems\n\nThese are the exact targets attackers pursue in real breaches.',
      icon: <BookOpen className="w-12 h-12" />,
      realWorldExample: 'In 2017, Equifax\'s web application vulnerability led to a breach affecting 147 million people. In 2021, Colonial Pipeline\'s compromised workstation caused nationwide fuel shortages.',
      keyTakeaway: 'Organizations must protect multiple asset types simultaneously - just like in the game.',
      sources: [
        { title: 'Equifax Data Breach - U.S. Government Accountability Office', url: 'https://www.gao.gov/products/gao-18-559' },
        { title: 'Colonial Pipeline Ransomware Attack - CISA', url: 'https://www.cisa.gov/news-events/news/colonial-pipeline-ransomware-attack' }
      ]
    },
    {
      id: 'exploits',
      title: 'Exploits: Finding Real Vulnerabilities',
      subtitle: 'The First Step in Every Attack',
      content: 'Exploit cards represent actual vulnerability discovery techniques used by penetration testers and hackers:\n\n• Log4Shell - Real CVE that affected millions of systems\n• SQL Injection - One of the most common web vulnerabilities\n• Buffer Overflow - Classic memory corruption technique\n• Port Scanner - Reconnaissance tool used in every attack\n• Packet Sniffer - Network traffic analysis tool\n\nExploits don\'t directly compromise systems; they create vulnerabilities that can be exploited later.',
      icon: <Target className="w-12 h-12" />,
      realWorldExample: 'Log4Shell (CVE-2021-44228) was discovered in December 2021 and affected billions of devices worldwide. It had a CVSS score of 10.0 (maximum severity).',
      keyTakeaway: 'Real attackers must first discover vulnerabilities before they can compromise systems - exactly like the game\'s two-step process.',
      sources: [
        { title: 'Log4Shell Vulnerability (CVE-2021-44228) - NIST NVD', url: 'https://nvd.nist.gov/vuln/detail/CVE-2021-44228' },
        { title: 'OWASP Top 10 Web Application Security Risks', url: 'https://owasp.org/www-project-top-ten/' },
        { title: 'Common Vulnerabilities and Exposures (CVE) Database', url: 'https://cve.mitre.org/' }
      ]
    },
    {
      id: 'attack_vectors',
      title: 'Attack Vectors: Real Threat Categories',
      subtitle: 'How Security Professionals Categorize Threats',
      content: 'The four attack vectors in the game mirror how security professionals categorize threats:\n\n• Network - Firewalls, routers, network infrastructure\n• Web - Applications, APIs, web services\n• Social Engineering - Phishing, pretexting, manipulation\n• Malware - Viruses, ransomware, trojans\n\nOrganizations must defend against all vectors simultaneously, just like in the game.',
      icon: <Shield className="w-12 h-12" />,
      realWorldExample: 'The 2020 SolarWinds attack used multiple vectors: supply chain compromise (network), malicious updates (malware), and targeted social engineering.',
      keyTakeaway: 'Attackers only need to succeed on one vector, but defenders must protect all of them.',
      sources: [
        { title: 'SolarWinds Cyber Attack - CISA Alert', url: 'https://www.cisa.gov/news-events/cybersecurity-advisories/aa20-352a' },
        { title: 'MITRE ATT&CK Framework - Attack Tactics and Techniques', url: 'https://attack.mitre.org/' }
      ]
    },
    {
      id: 'attack_cards',
      title: 'Attack Cards: Real Compromise Methods',
      subtitle: 'Techniques Used to Compromise Vulnerable Systems',
      content: 'Attack cards represent the actual techniques used to compromise vulnerable systems:\n\n• DDoS - Overwhelm systems with traffic\n• Ransomware - Encrypt data for ransom\n• XSS & CSRF - Exploit web vulnerabilities\n• Trojans - Disguised malicious software\n• Rootkits - Deep system-level compromises\n\nIn reality, attackers must first find vulnerabilities (exploits) before they can execute attacks.',
      icon: <Target className="w-12 h-12" />,
      realWorldExample: 'WannaCry ransomware (2017) exploited the EternalBlue vulnerability to compromise 200,000+ computers across 150 countries, causing $4 billion in damages.',
      keyTakeaway: 'The game\'s two-step process (Exploit → Attack → Compromise) mirrors real-world attack chains.',
      sources: [
        { title: 'WannaCry Ransomware Attack - Europol Report', url: 'https://www.europol.europa.eu/wannacry-ransomware' },
        { title: 'Ransomware Guide - CISA', url: 'https://www.cisa.gov/stopransomware' }
      ]
    },
    {
      id: 'shield_cards',
      title: 'Shield Cards: Preventive Security Controls',
      subtitle: 'Proactive Defense Measures',
      content: 'Shield cards represent proactive security measures organizations implement:\n\n• Firewalls - Network traffic filtering\n• Antivirus - Malware detection and prevention\n• IDS/IPS - Intrusion detection and prevention\n• Encryption - Data protection\n• Access Control - Authentication and authorization\n• Security Training - Human firewall\n\nThese are real security controls from frameworks like NIST, ISO 27001, and CIS Controls.',
      icon: <Shield className="w-12 h-12" />,
      realWorldExample: 'Organizations implementing CIS Controls see 85% reduction in cyber risk. The NIST Cybersecurity Framework is used by 50% of U.S. organizations.',
      keyTakeaway: 'Organizations layer these defenses to create "defense in depth" - just like shielding infrastructure in the game.',
      sources: [
        { title: 'NIST Cybersecurity Framework', url: 'https://www.nist.gov/cyberframework' },
        { title: 'CIS Controls - Center for Internet Security', url: 'https://www.cisecurity.org/controls' },
        { title: 'ISO/IEC 27001 Information Security Standard', url: 'https://www.iso.org/isoiec-27001-information-security.html' }
      ]
    },
    {
      id: 'fortify_cards',
      title: 'Fortify Cards: Hardening and Resilience',
      subtitle: 'Strengthening Already-Protected Systems',
      content: 'Fortify cards represent security hardening - strengthening already-protected systems:\n\n• Network Segmentation - Isolating critical systems\n• Multi-Factor Authentication - Additional verification layers\n• Backup Systems - Disaster recovery capability\n• Security Audits - Regular vulnerability assessments\n• Patch Management - Keeping systems updated\n\nThese advanced practices make systems resilient against sophisticated attacks.',
      icon: <Shield className="w-12 h-12" />,
      realWorldExample: 'Microsoft reports that MFA blocks 99.9% of account compromise attacks. Organizations with proper backups can recover from ransomware in days instead of months.',
      keyTakeaway: 'The game\'s fortify mechanic teaches that layered security (shield + fortify) is exponentially stronger than single defenses.',
      sources: [
        { title: 'Multi-Factor Authentication Effectiveness - Microsoft Security', url: 'https://www.microsoft.com/en-us/security/blog/2019/08/20/one-simple-action-you-can-take-to-prevent-99-9-percent-of-account-attacks/' },
        { title: 'Network Segmentation Best Practices - NIST', url: 'https://csrc.nist.gov/publications/detail/sp/800-125b/final' }
      ]
    },
    {
      id: 'response_cards',
      title: 'Response Cards: Incident Response',
      subtitle: 'Recovery from Breaches',
      content: 'Response cards mirror real incident response and recovery procedures:\n\n• Incident Response Teams - Coordinated breach response\n• Forensic Analysis - Understanding what happened\n• System Restore - Recovering from backups\n• Emergency Protocols - Crisis management procedures\n\nThe game teaches that recovery is possible but costly (uses AP and cards).',
      icon: <BookOpen className="w-12 h-12" />,
      realWorldExample: 'The average cost of a data breach is $4.45 million (IBM 2023). Recovery can take 6-9 months. Organizations with incident response plans save $1.49 million on average.',
      keyTakeaway: 'Prevention is cheaper than recovery - but recovery capabilities are essential.',
      sources: [
        { title: 'Cost of a Data Breach Report 2023 - IBM Security', url: 'https://www.ibm.com/reports/data-breach' },
        { title: 'Incident Response Guide - NIST SP 800-61', url: 'https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final' }
      ]
    },
    {
      id: 'reaction_cards',
      title: 'Reaction Cards: Real-Time Threat Detection',
      subtitle: 'Automated Security Systems',
      content: 'Reaction cards represent automated security systems that respond instantly to threats:\n\n• EDR - Endpoint Detection & Response\n• SIEM - Security Information & Event Management\n• IPS - Intrusion Prevention Systems\n• SOC - Security Operations Center (24/7 monitoring)\n• Threat Intelligence - Real-time threat data\n\nWhen threats are detected, they can block attacks in real-time - just like reaction cards during opponent turns.',
      icon: <Shield className="w-12 h-12" />,
      realWorldExample: 'Organizations with 24/7 SOC monitoring detect breaches in 28 days vs. 207 days without. EDR solutions can automatically isolate compromised endpoints in seconds.',
      keyTakeaway: 'Real-time detection and response is why organizations invest heavily in security monitoring.'
    },
    {
      id: 'counter_attacks',
      title: 'Counter-Attack Cards: Advanced Persistent Threats',
      subtitle: 'Sophisticated Attacker Techniques',
      content: 'Counter-attack cards represent sophisticated attacker techniques to bypass defenses:\n\n• Shield Breaker - Zero-day exploits that bypass security\n• Fortification Bypass - Advanced evasion techniques\n• Reaction Jammer - Disabling security monitoring\n• Social Engineer - Manipulating people to bypass technical controls\n\nAPT (Advanced Persistent Threat) groups use these exact tactics to breach even well-defended organizations.',
      icon: <Target className="w-12 h-12" />,
      realWorldExample: 'APT29 (Cozy Bear) used zero-day exploits and advanced evasion to breach the U.S. government. APT groups spend an average of 200+ days inside networks before detection.',
      keyTakeaway: 'Even the best defenses can be bypassed by sophisticated attackers - defense requires constant vigilance.',
      sources: [
        { title: 'APT Groups and Operations - MITRE ATT&CK', url: 'https://attack.mitre.org/groups/' },
        { title: 'Zero-Day Vulnerabilities - CISA', url: 'https://www.cisa.gov/known-exploited-vulnerabilities' }
      ]
    },
    {
      id: 'action_points',
      title: 'Action Points: Resource Management',
      subtitle: 'Limited Security Resources',
      content: 'AP represents the real-world concept of limited security resources:\n\n• Organizations have limited budgets, personnel, and time\n• Defenders get 3 AP (more resources) because defense is harder and more expensive\n• Attackers get 2 AP because they only need to find one weakness\n\nThis mirrors the real asymmetry: "Defenders must be right every time; attackers only need to be right once."',
      icon: <BookOpen className="w-12 h-12" />,
      realWorldExample: 'Average cybersecurity budget is 10-15% of IT budget. Organizations face a shortage of 3.4 million cybersecurity professionals globally (ISC² 2023).',
      keyTakeaway: 'Security is about prioritizing limited resources effectively - just like managing AP in the game.',
      sources: [
        { title: 'Cybersecurity Workforce Study - (ISC)²', url: 'https://www.isc2.org/Research/Workforce-Study' },
        { title: 'IT Security Budget Allocation - Gartner', url: 'https://www.gartner.com/en/information-technology' }
      ]
    },
    {
      id: 'turn_structure',
      title: 'Turn Structure: The Cyber Kill Chain',
      subtitle: 'Real-World Attack Lifecycle',
      content: 'The game\'s turn structure mirrors the real-world cyber attack lifecycle:\n\nReal attacks follow stages:\n1. Reconnaissance\n2. Weaponization\n3. Delivery\n4. Exploitation\n5. Installation\n6. Command & Control\n7. Actions on Objectives\n\nThe game simplifies this to: Exploit (find vulnerability) → Attack (compromise) → Control (maintain access).',
      icon: <Target className="w-12 h-12" />,
      realWorldExample: 'The Target breach (2013) followed this chain: reconnaissance of HVAC vendor → phishing email → network access → lateral movement → 40 million credit cards stolen.',
      keyTakeaway: 'This is how real breaches unfold over weeks or months - defenders must break the chain at any point.',
      sources: [
        { title: 'Cyber Kill Chain - Lockheed Martin', url: 'https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html' },
        { title: 'Target Data Breach Case Study - U.S. Senate Report', url: 'https://www.commerce.senate.gov/services/files/24d3c229-4f2f-405d-b8db-a3a67f183883' }
      ]
    },
    {
      id: 'win_conditions',
      title: 'Win Conditions: Real-World Objectives',
      subtitle: 'Attacker and Defender Goals',
      content: 'The game\'s victory conditions reflect actual attacker and defender goals:\n\n• Attackers win by controlling majority infrastructure = Real attackers aim to compromise critical systems for data theft, ransomware, or disruption\n• Defenders win by preventing this = Real defenders aim to maintain confidentiality, integrity, and availability (CIA triad)\n• The 15-turn limit represents that attacks can\'t continue indefinitely before detection',
      icon: <Shield className="w-12 h-12" />,
      realWorldExample: 'Ransomware groups aim to compromise critical systems quickly. Defenders focus on the CIA triad: keeping data Confidential, maintaining Integrity, and ensuring Availability.',
      keyTakeaway: 'Both sides have clear objectives - attackers want control, defenders want protection.'
    },
    {
      id: 'red_vs_blue',
      title: 'Red Team vs Blue Team: Industry Standard',
      subtitle: 'Real Cybersecurity Team Structures',
      content: 'The attacker/defender roles mirror real cybersecurity team structures:\n\n• Red Team - Offensive security professionals who simulate attacks to find weaknesses\n• Blue Team - Defensive security professionals who protect systems and respond to threats\n• Purple Team - Combines both perspectives for maximum effectiveness\n\nOrganizations run "Red Team vs Blue Team" exercises exactly like this game to improve security.',
      icon: <BookOpen className="w-12 h-12" />,
      realWorldExample: 'Major companies like Google, Microsoft, and banks run continuous red team exercises. The U.S. military has dedicated red teams for cybersecurity testing.',
      keyTakeaway: 'Playing both sides in Darknet Duel teaches you both offensive and defensive mindsets - just like real security professionals.'
    },
    {
      id: 'card_costs',
      title: 'Card Costs: Real Implementation Complexity',
      subtitle: 'Different Resources Required',
      content: 'Different AP costs reflect the real complexity and resources required for security measures:\n\n• Basic shields (1 AP) - Standard security tools\n• Wildcards (2 AP) - Flexible but expensive solutions\n• Complex operations - More time and resources\n\nIn reality, implementing MFA might take days, but deploying EDR across an enterprise takes months and millions of dollars.',
      icon: <Shield className="w-12 h-12" />,
      realWorldExample: 'Implementing basic firewall rules: $5,000-$10,000. Deploying enterprise SIEM: $500,000-$2,000,000. Building a SOC: $5-10 million annually.',
      keyTakeaway: 'The game teaches resource prioritization - not all security measures are equal in cost or effectiveness.'
    },
    {
      id: 'infrastructure_states',
      title: 'Infrastructure States: Security Posture',
      subtitle: 'Different Levels of Security',
      content: 'The different infrastructure states represent real security postures:\n\n• Secure - Properly configured with no known vulnerabilities\n• Vulnerable - Exploitable weakness discovered\n• Compromised - Attacker has control\n• Shielded - Protected by security controls\n• Fortified - Hardened with multiple layers\n\nIn reality, organizations constantly move between these states as new vulnerabilities are discovered and patched.',
      icon: <BookOpen className="w-12 h-12" />,
      realWorldExample: 'On average, 27 new vulnerabilities are discovered daily. Organizations take 38 days to patch critical vulnerabilities. Zero-day exploits can leave systems vulnerable instantly.',
      keyTakeaway: 'Security is not a state, it\'s a continuous process - just like the dynamic game board.'
    },
    {
      id: 'wildcards',
      title: 'Wildcard Cards: Adaptive Security',
      subtitle: 'Flexible Security Tools',
      content: 'Wildcards represent flexible security tools and adaptive strategies:\n\n• SIEM can detect various attack types\n• Skilled penetration testers can exploit multiple vectors\n• Threat intelligence platforms provide flexible defense\n• Security professionals must adapt to evolving threats\n\nWildcards teach that flexibility is valuable but expensive - just like real adaptive security solutions.',
      icon: <Target className="w-12 h-12" />,
      realWorldExample: 'Modern XDR (Extended Detection & Response) platforms cost 2-3x more than traditional tools but provide flexible detection across endpoints, networks, and cloud.',
      keyTakeaway: 'Adaptability is crucial in cybersecurity - threats evolve constantly.'
    },
    {
      id: 'game_balance',
      title: 'Game Balance: Real-World Asymmetry',
      subtitle: 'Why Defense is Harder',
      content: 'The game\'s balance reflects actual cybersecurity challenges:\n\n• Defenders have more cards (76 vs 70) and more AP (3 vs 2) because defense is inherently harder\n• They must protect everything; attackers only need one entry point\n• But attackers can focus their efforts on the weakest link\n\nThis asymmetry is why cybersecurity is so challenging - and why the industry is worth $200+ billion globally.',
      icon: <Shield className="w-12 h-12" />,
      realWorldExample: 'The global cybersecurity market is projected to reach $345 billion by 2026. Organizations spend 10-15% of IT budgets on security, yet breaches continue to increase.',
      keyTakeaway: 'The attacker\'s advantage is real - defenders must be perfect, attackers only need one mistake.',
      sources: [
        { title: 'Cybersecurity Market Size and Growth - Cybersecurity Ventures', url: 'https://cybersecurityventures.com/cybersecurity-market-report/' },
        { title: 'Global Cybersecurity Outlook - World Economic Forum', url: 'https://www.weforum.org/reports/global-cybersecurity-outlook-2023' }
      ]
    },
    {
      id: 'learning_outcomes',
      title: 'What You\'ve Learned',
      subtitle: 'Fundamental Cybersecurity Concepts',
      content: 'By playing Darknet Duel, you\'ve learned fundamental cybersecurity concepts:\n\n• Attack vectors and defense strategies\n• The cyber kill chain\n• Defense in depth\n• Incident response\n• Resource management\n• The attacker/defender mindset\n\nThese concepts form the foundation of cybersecurity careers in penetration testing, security operations, incident response, and security architecture.',
      icon: <Globe className="w-12 h-12" />,
      realWorldExample: 'Entry-level cybersecurity positions pay $70,000-$90,000. Senior roles can exceed $200,000. The field has 0% unemployment and growing demand.',
      keyTakeaway: 'You now have foundational knowledge used by cybersecurity professionals worldwide.',
      sources: [
        { title: 'Cybersecurity Career Pathways - NIST NICE Framework', url: 'https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center' },
        { title: 'Cybersecurity Salary Guide - U.S. Bureau of Labor Statistics', url: 'https://www.bls.gov/ooh/computer-and-information-technology/information-security-analysts.htm' },
        { title: 'Free Cybersecurity Training - CISA', url: 'https://www.cisa.gov/cyber-career-pathways-tool' }
      ]
    },
    {
      id: 'conclusion',
      title: 'Real-World Connections Complete!',
      subtitle: 'You Now See How Darknet Duel Teaches Real Cybersecurity',
      content: 'Every game you play reinforces these concepts. Whether you pursue a cybersecurity career or simply want to understand digital security, you\'re now equipped with foundational knowledge used by professionals worldwide.\n\nRemember:\n• Every card represents a real technique or tool\n• Every mechanic mirrors actual security practices\n• Every strategy teaches you how cyber warfare really works\n\nStay curious, stay secure!',
      icon: <Globe className="w-12 h-12" />,
      keyTakeaway: 'Darknet Duel is your gateway to understanding the world of cybersecurity.'
    }
  ];

  // Mark tutorial as complete when user reaches the last section
  useEffect(() => {
    if (currentSection === sections.length - 1) {
      tutorialManager.markTutorialComplete('real_world_cybersecurity');
    }
  }, [currentSection, sections.length]);

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleClose = () => {
    // Mark as complete when user closes
    tutorialManager.markTutorialComplete('real_world_cybersecurity');
    onClose();
  };

  const currentSectionData = sections[currentSection];
  const progress = ((currentSection + 1) / sections.length) * 100;

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleClose}
    >
      <motion.div
        className="bg-base-200 border border-primary/30 shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden rounded-lg"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-primary/20 bg-base-300/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Globe className="text-primary" size={24} />
              <h1 className="text-xl font-bold font-mono text-primary">
                REAL_WORLD_CYBERSECURITY
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-mono text-base-content/60">
                {currentSection + 1} / {sections.length}
              </div>
              <button
                onClick={handleClose}
                className="btn btn-ghost btn-sm font-mono"
              >
                <X size={20} />
                CLOSE
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-base-300 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Section Icon & Title */}
            <div className="flex items-start gap-6 mb-6">
              <div className="flex-shrink-0 text-primary">
                {currentSectionData.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold font-mono text-primary mb-2">
                  {currentSectionData.title}
                </h2>
                <p className="text-lg text-base-content/70 font-mono">
                  {currentSectionData.subtitle}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none mb-6">
              <p className="text-base-content whitespace-pre-line leading-relaxed">
                {currentSectionData.content}
              </p>
            </div>

            {/* Real World Example */}
            {currentSectionData.realWorldExample && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-bold font-mono text-primary mb-2 flex items-center gap-2">
                  <Globe size={16} />
                  REAL_WORLD_EXAMPLE
                </h3>
                <p className="text-sm text-base-content/80">
                  {currentSectionData.realWorldExample}
                </p>
              </div>
            )}

            {/* Key Takeaway */}
            {currentSectionData.keyTakeaway && (
              <div className="bg-success/10 border border-success/30 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-bold font-mono text-success mb-2">
                  💡 KEY_TAKEAWAY
                </h3>
                <p className="text-sm text-base-content/80">
                  {currentSectionData.keyTakeaway}
                </p>
              </div>
            )}

            {/* Sources */}
            {currentSectionData.sources && currentSectionData.sources.length > 0 && (
              <div className="bg-base-300/50 border border-base-content/10 rounded-lg p-4">
                <h3 className="text-sm font-bold font-mono text-base-content/70 mb-3 flex items-center gap-2">
                  <ExternalLink size={16} />
                  SOURCES & FURTHER_READING
                </h3>
                <ul className="space-y-2">
                  {currentSectionData.sources.map((source, index) => (
                    <li key={index}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:text-primary/80 hover:underline flex items-start gap-2 group"
                      >
                        <ExternalLink size={14} className="flex-shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                        <span>{source.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-primary/20 bg-base-300/50 p-4">
          <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentSection === 0}
            className="btn btn-primary btn-outline gap-2 font-mono"
          >
            <ChevronLeft size={20} />
            PREVIOUS
          </button>

          <div className="flex gap-2">
            {sections.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSection(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSection
                    ? 'bg-primary w-8'
                    : index < currentSection
                    ? 'bg-primary/50'
                    : 'bg-base-content/20'
                }`}
              />
            ))}
          </div>

          {currentSection === sections.length - 1 ? (
            <button
              onClick={handleClose}
              className="btn btn-primary gap-2 font-mono"
            >
              FINISH
              <Globe size={20} />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="btn btn-primary gap-2 font-mono"
            >
              NEXT
              <ChevronRight size={20} />
            </button>
          )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RealWorldCybersecurity;
