import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useSettingsStore } from '../store/settings.store';
import { useAudioManager } from '../hooks/useAudioManager';
import TutorialButton from './tutorial/TutorialButton';
import logo from '../assets/logo.png';
import { Home, Gamepad2, ShoppingBag, User, Shield, Volume2, Sun, Moon, LogOut } from 'lucide-react';

interface AppBarProps {
  currentPage?: 'dashboard' | 'lobbies' | 'profile' | 'topup' | 'history' | 'store';
  theme: 'cyberpunk' | 'cyberpunk-dark';
  onThemeToggle: () => void;
  onLogout?: () => void;
}

const AppBar: React.FC<AppBarProps> = ({ 
  currentPage, 
  theme, 
  onThemeToggle, 
  onLogout 
}) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { openSettings } = useSettingsStore();
  const { triggerClick } = useAudioManager();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleThemeToggle = () => {
    if (onThemeToggle) {
      onThemeToggle();
    }
  };

  return (
    <header className="p-4 border-b border-primary/20 backdrop-blur-sm bg-base-100/80">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity duration-200" onClick={() => {
          triggerClick();
          navigate('/dashboard');
        }}>
          <img src={logo} alt="Darknet Duel Logo" className="h-8" />
          <h1 className="text-xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 text-flicker">
            DARKNET_DUEL
          </h1>
        </div>
    
        <div className="flex items-center gap-2">
          {currentPage !== 'dashboard' && (
            <button 
              onClick={() => {
                triggerClick();
                navigate('/dashboard');
              }} 
              className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
            >
<Home className="w-4 h-4 mr-1" /> 
              <span className="hidden sm:inline">DASHBOARD</span>
            </button>
          )}
          
          {currentPage !== 'lobbies' && (
            <button 
              onClick={() => {
                triggerClick();
                navigate('/lobbies');
              }} 
              className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
            >
<Gamepad2 className="w-4 h-4 mr-1" /> 
              <span className="hidden sm:inline">LOBBY</span>
            </button>
          )}
          
          <button 
            onClick={() => {
              triggerClick();
              navigate('/store');
            }} 
            className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
          >
<ShoppingBag className="w-4 h-4 mr-1" /> 
            <span className="hidden sm:inline">STORE</span>
          </button>
          
          <TutorialButton 
            variant="minimal" 
            size="sm" 
            showProgress={false}
          />
          
          <button 
            onClick={() => {
              triggerClick();
              navigate(`/profile/${user?.id}`);
            }} 
            className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
            aria-label="Profile"
          >
<User className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">PROFILE</span>
          </button>
          
          <button 
            onClick={() => {
              triggerClick();
              navigate('/topup');
            }} 
            className="btn btn-sm bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-400 hover:border-yellow-300 text-black font-bold btn-cyberpunk pulse-glow relative overflow-hidden group"
            aria-label="Top Up"
          >
<span className="mr-1 z-10 relative">💎</span>
            <span className="hidden sm:inline text-flicker z-10 relative">TOP-UP</span>
            <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"></span>
          </button>
          
          {/* Control Panel Button - Only show for mods and admins */}
          {user?.type && ['mod', 'admin'].includes(user.type) && (
            <button 
              onClick={() => {
                triggerClick();
                navigate('/admin');
              }} 
              className="btn btn-sm bg-error/20 border-error/50 hover:bg-error/30 text-error btn-cyberpunk"
              aria-label="Control Panel"
            >
<Shield className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">CONTROL</span>
            </button>
          )}
          
          <button
            onClick={() => {
              triggerClick();
              openSettings();
            }}
            className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
            aria-label="Audio Settings"
          >
<Volume2 className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">SETTINGS</span>
          </button>
          
          <button
            onClick={() => {
              triggerClick();
              handleThemeToggle();
            }}
            className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
            aria-label="Toggle Theme"
          >
{theme === 'cyberpunk' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => {
              triggerClick();
              handleLogout();
            }}
            className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
            aria-label="Logout"
          >
<LogOut className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">EXIT</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppBar; 