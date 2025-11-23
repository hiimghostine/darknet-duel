import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Shield, 
  Swords, 
  Zap, 
  Target, 
  Trophy, 
  Users, 
  Clock, 
  Sparkles,
  Network,
  Lock,
  Terminal,
  Cpu,
  Globe,
  Bug
} from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { useThemeStore } from '../store/theme.store';
import { useAudioManager } from '../hooks/useAudioManager';
import logo from '../assets/logo.png';
import AppFooter from '../components/AppFooter';
import coverPhoto from '../assets/Cover Photo.png';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const { triggerClick } = useAudioManager();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -30]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);
  
  const handleLogoClick = () => {
    if (isAuthenticated) {
      triggerClick();
      navigate('/dashboard');
    }
  };

  const features = [
    {
      icon: <Swords className="w-6 h-6" />,
      title: "Strategic Combat",
      description: "Deploy exploits, shields, and countermeasures in tactical card-based warfare"
    },
    {
      icon: <Network className="w-6 h-6" />,
      title: "Infrastructure Control",
      description: "Battle for control of 5 critical digital systems - firewalls, databases, and more"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Action Point System",
      description: "Master asymmetric gameplay with unique AP systems for attackers and defenders"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Role-Based Decks",
      description: "Play as Red Team attacker (70 cards) or Blue Team defender (76 cards)"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Attack Vectors",
      description: "Exploit Network, Web, Social Engineering, and Malware vulnerabilities"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Reactive Gameplay",
      description: "Counter opponent moves with reaction cards and defensive strategies"
    }
  ];

  const stats = [
    { icon: <Trophy className="w-8 h-8" />, value: "15", label: "Max Rounds" },
    { icon: <Users className="w-8 h-8" />, value: "2", label: "Players" },
    { icon: <Clock className="w-8 h-8" />, value: "20-30", label: "Minutes" },
    { icon: <Cpu className="w-8 h-8" />, value: "146", label: "Total Cards" }
  ];

  const gameFlow = [
    {
      icon: <Terminal className="w-6 h-6" />,
      title: "Deploy Your Arsenal",
      description: "Play exploit cards to create vulnerabilities in enemy infrastructure"
    },
    {
      icon: <Bug className="w-6 h-6" />,
      title: "Execute Attacks",
      description: "Convert vulnerabilities into full compromises with attack cards"
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Defend & Counter",
      description: "Use shields, fortifications, and reactions to protect your systems"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Dominate the Network",
      description: "Control all 5 infrastructure or hold majority by round 15 to win"
    }
  ];

  return (
    <div className="min-h-screen bg-base-100 relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="fixed inset-0 grid-bg opacity-40 pointer-events-none"></div>
      
      {/* Animated Cyberpunk Elements */}
      <motion.div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ opacity }}
      >
        {/* Glowing lines */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
        <div className="absolute top-0 right-0 w-1 h-32 bg-gradient-to-b from-primary to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-1 h-24 bg-gradient-to-b from-primary/50 to-transparent"></div>
        <div className="absolute top-0 right-1/3 w-1 h-40 bg-gradient-to-b from-primary/30 to-transparent"></div>
        
        {/* Floating hex codes */}
        <motion.div 
          className="absolute top-32 left-16 opacity-5 text-7xl font-mono text-primary"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          0x4E
        </motion.div>
        <motion.div 
          className="absolute top-48 right-24 opacity-5 text-6xl font-mono text-primary"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          0xFF
        </motion.div>
        <motion.div 
          className="absolute bottom-32 left-32 opacity-5 text-8xl font-mono text-primary"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          0x2A
        </motion.div>
      </motion.div>

      {/* Header */}
      <motion.header 
        className="relative z-20 bg-base-100/80 backdrop-blur-md border-b border-primary/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div 
            className={`flex items-center gap-3 ${isAuthenticated ? 'cursor-pointer' : ''}`} 
            onClick={handleLogoClick}
            whileHover={isAuthenticated ? { scale: 1.05 } : {}}
            whileTap={isAuthenticated ? { scale: 0.95 } : {}}
          >
            <img src={logo} alt="Darknet Duel Logo" className="h-11 drop-shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.6)]" />
            <div className="text-xl font-bold font-mono">
              <span className="text-primary">DARKNET</span>
              <span className="text-base-content/70">_DUEL</span>
            </div>
          </motion.div>
          
          <motion.button 
            onClick={() => {
              triggerClick();
              toggleTheme();
            }} 
            className="btn btn-sm btn-outline border-primary text-primary hover:bg-primary hover:text-primary-content font-mono group relative overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${theme === 'cyberpunk' ? 'bg-blue-400' : 'bg-red-500'} pulse-glow`}></span>
              {theme === 'cyberpunk' ? 'GHOST_CORP' : 'PHOENIX_NET'}
            </span>
          </motion.button>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-16 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="inline-block px-4 py-1.5 mb-4 border border-primary/50 bg-primary/5 backdrop-blur-sm text-xs font-mono text-primary rounded">
                <span className="inline-block w-2 h-2 bg-success rounded-full animate-pulse mr-2"></span>
                ALPHA v0.0.1 • SYSTEMS ONLINE
              </div>
            </motion.div>

            <motion.h1 
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient">
                Enter the Digital
                <br />
                Combat Arena
              </span>
            </motion.h1>

            <motion.p 
              className="text-base-content/70 text-lg leading-relaxed max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Master the art of cybersecurity warfare. Deploy exploits, fortify defenses, and dominate the digital battlefield in this strategic card game where Red Team faces Blue Team.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {!isAuthenticated ? (
                <>
                  <Link 
                    to="/auth" 
                    onClick={triggerClick}
                    className="btn btn-primary btn-lg px-8 font-mono relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Terminal className="w-5 h-5" />
                      ACCESS_NETWORK
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                  </Link>
                  <Link 
                    to="/auth?register=true" 
                    onClick={triggerClick}
                    className="btn btn-outline btn-lg border-primary text-primary hover:bg-primary hover:text-primary-content px-8 font-mono"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      CREATE_IDENTITY
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/dashboard" 
                    onClick={triggerClick}
                    className="btn btn-primary btn-lg px-8 font-mono relative overflow-hidden group"
                  >
                    <span className="relative z-10">DASHBOARD</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                  </Link>
                  <Link 
                    to="/lobby" 
                    onClick={triggerClick}
                    className="btn btn-outline btn-lg border-primary text-primary hover:bg-primary hover:text-primary-content px-8 font-mono"
                  >
                    FIND_MATCH
                  </Link>
                </>
              )}
            </motion.div>

            {/* Quick Stats */}
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  className="text-center p-3 border border-primary/20 bg-base-200/50 backdrop-blur-sm rounded"
                  whileHover={{ scale: 1.05, borderColor: 'rgb(var(--color-primary-rgb))' }}
                >
                  <div className="text-primary mb-1 flex justify-center">{stat.icon}</div>
                  <div className="text-2xl font-bold text-primary font-mono">{stat.value}</div>
                  <div className="text-xs text-base-content/60 font-mono">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ y: y2 }}
          >
            <div className="relative max-w-lg mx-auto">
              {/* Glowing borders */}
              <motion.div 
                className="absolute inset-0 border-2 border-primary/40 rounded-lg blur-sm"
                animate={{ 
                  scale: [1, 1.02, 1],
                  opacity: [0.4, 0.6, 0.4]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              ></motion.div>
              <motion.div 
                className="absolute inset-0 border border-primary/30 rounded-lg transform rotate-2"
                whileHover={{ rotate: 3 }}
              ></motion.div>
              <motion.div 
                className="absolute inset-0 border border-primary/20 rounded-lg transform -rotate-2"
                whileHover={{ rotate: -3 }}
              ></motion.div>
              
              <motion.img 
                src={coverPhoto} 
                alt="Darknet Duel Combat" 
                className="relative z-10 rounded-lg border-2 border-primary shadow-2xl shadow-primary/30"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              
              {/* Status Badge */}
              <motion.div 
                className="absolute -bottom-40 -right-4 z-20 bg-base-100/95 backdrop-blur-md p-4 border-2 border-primary/60 rounded-lg shadow-lg"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
              >
                <div className="text-primary text-xs font-mono font-bold mb-2">SYSTEM_STATUS</div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse"></span>
                  <span className="text-base-content/80">Network: Online</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono mt-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse"></span>
                  <span className="text-base-content/80">Players: Active</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 bg-base-200/50 border-y border-primary/10">
        <motion.div 
          className="container mx-auto px-4"
          style={{ y: y1 }}
        >
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-4 py-1 mb-4 border border-primary/50 bg-primary/5 text-xs font-mono text-primary rounded">
              CORE_FEATURES
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Master Cybersecurity Warfare
              </span>
            </h2>
            <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
              Every card, every move, every decision shapes the battlefield. Will you break through defenses or fortify your infrastructure?
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                className="p-6 border border-primary/20 bg-base-100/50 backdrop-blur-sm rounded-lg hover:border-primary/50 transition-all duration-300 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(var(--color-primary-rgb), 0.2)' }}
              >
                <div className="text-primary mb-4 p-3 bg-primary/10 rounded-lg inline-block group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 font-mono text-base-content">
                  {feature.title}
                </h3>
                <p className="text-base-content/70 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-4 py-1 mb-4 border border-primary/50 bg-primary/5 text-xs font-mono text-primary rounded">
              GAMEPLAY_FLOW
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                How to Dominate
              </span>
            </h2>
            <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
              From initial deployment to total network control. Master the flow of digital combat.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {gameFlow.map((step, idx) => (
              <motion.div
                key={idx}
                className="relative"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
              >
                {/* Connector Line */}
                {idx < gameFlow.length - 1 && (
                  <div className="hidden lg:block absolute top-[50px] left-[calc(50%+52px)] w-[calc(100%+2rem-104px)] h-0.5 bg-gradient-to-r from-primary/50 to-transparent -z-10"></div>
                )}
                
                <motion.div 
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="mb-4 mx-auto w-24 h-24 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-content transition-all duration-300">
                    <div className="relative">
                      {step.icon}
                      <div className="absolute -top-3 -right-3 w-6 h-6 bg-primary text-primary-content rounded-full flex items-center justify-center text-xs font-bold font-mono">
                        {idx + 1}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2 font-mono text-base-content">
                    {step.title}
                  </h3>
                  <p className="text-base-content/70 text-sm">
                    {step.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="relative z-10 py-20 bg-gradient-to-b from-base-100 to-base-200 border-t border-primary/10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Ready to Hack the System?
              </span>
            </h2>
            <p className="text-base-content/70 text-lg mb-8 max-w-2xl mx-auto">
              Join the elite network of cybersecurity strategists. Your first mission awaits.
            </p>
            
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/auth?register=true" 
                  onClick={triggerClick}
                  className="btn btn-primary btn-lg px-10 font-mono relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    START_NOW
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                </Link>
                <Link 
                  to="/auth" 
                  onClick={triggerClick}
                  className="btn btn-outline btn-lg border-primary text-primary hover:bg-primary hover:text-primary-content px-10 font-mono"
                >
                  SIGN_IN
                </Link>
              </div>
            ) : (
              <Link 
                to="/lobby" 
                onClick={triggerClick}
                className="btn btn-primary btn-lg px-10 font-mono relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Swords className="w-5 h-5" />
                  ENTER_BATTLEFIELD
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              </Link>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <AppFooter />
    </div>
  );
};

export default HomePage;
