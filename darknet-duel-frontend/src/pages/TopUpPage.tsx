import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useThemeStore } from '../store/theme.store';
import LoadingScreen from '../components/LoadingScreen';
import LogoutScreen from '../components/LogoutScreen';
import PaymentModal from '../components/ui/PaymentModal';
import { type PaymentResult } from '../services/payment.service';
import logo from '../assets/logo.png';

interface TopUpPackage {
  id: string;
  crypts: number;
  price: number;
  originalPrice?: number;
  isPopular?: boolean;
  isBestValue?: boolean;
  bonus?: number;
}

const TopUpPage: React.FC = () => {
  const { isAuthenticated, user, logout, loadUser } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentPackage, setPaymentPackage] = useState<TopUpPackage | null>(null);

  // Top-up packages with pricing
  const packages: TopUpPackage[] = [
    { id: 'starter', crypts: 15, price: 20.50 },
    { id: 'small', crypts: 50, price: 53, isPopular: true },
    { id: 'medium', crypts: 150, price: 159 },
    { id: 'large', crypts: 250, price: 264 },
    { id: 'xl', crypts: 500, price: 530 },
    { id: 'xxl', crypts: 1000, price: 1070 },
    { id: 'mega', crypts: 1500, price: 1600, isBestValue: true },
    { id: 'ultra', crypts: 2500, price: 2650 },
    { id: 'supreme', crypts: 5000, price: 5300 }
  ];

  useEffect(() => {
    // Check if this page is loaded in a payment window and should auto-close
    const urlParams = new URLSearchParams(window.location.search);
    const isSuccess = urlParams.get('success') === 'true';
    
    if (isSuccess && window.opener) {
      // This is a payment redirect in a popup window, close it
      window.close();
      return;
    }

    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      logout();
      navigate('/auth', { replace: true });
    }, 1500);
  };

  const handlePurchase = (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;

    setSelectedPackage(packageId);
    setPaymentPackage(pkg);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (result: PaymentResult) => {
    console.log('Payment successful:', result);
    
    // Refresh user data to update balance
    await loadUser();
    
    // Reset selected package
    setSelectedPackage(null);
    
    // Optional: Show success notification or navigate
    // Could add a toast notification here
  };

  const handlePaymentClose = () => {
    setShowPaymentModal(false);
    setPaymentPackage(null);
    setSelectedPackage(null);
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-base-100 relative overflow-hidden text-base-content">
      {/* Wrapper to hide content during logout */}
      <div className={`${isLoggingOut ? 'hidden' : 'block'}`}>
        {/* Show loading screen when isLoading is true */}
        {isLoading && <LoadingScreen text="ACCESSING CRYPTO VAULT" />}
        
        {/* Background grid and decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Grid lines */}
          <div className="absolute inset-0 grid-bg"></div>
          
          {/* Decorative lines */}
          <div className="absolute top-0 left-0 w-1/3 h-1 bg-gradient-to-r from-yellow-500 to-transparent"></div>
          <div className="absolute top-0 right-0 w-1/4 h-1 bg-gradient-to-l from-purple-500 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1 bg-gradient-to-r from-yellow-500 to-transparent"></div>
          <div className="absolute top-0 right-1/4 w-1 h-32 bg-gradient-to-b from-purple-500 to-transparent"></div>
          <div className="absolute bottom-0 left-1/3 w-1 h-48 bg-gradient-to-t from-yellow-500 to-transparent"></div>
          
          {/* Tech-inspired typography */}
          <div className="absolute top-20 left-10 opacity-5 text-9xl font-mono text-yellow-500">💎</div>
          <div className="absolute bottom-20 right-10 opacity-5 text-9xl font-mono text-purple-500">₱</div>
          <div className="absolute top-1/4 right-20 opacity-5 text-7xl font-mono text-yellow-500 rotate-12">PAY</div>
        </div>

        {/* Main content */}
        <div className={`relative z-10 transition-opacity duration-500 ${isLoading || isLoggingOut ? 'opacity-0' : 'opacity-100'} scanline`}>
          <header className="p-4 border-b border-primary/20 backdrop-blur-sm bg-base-100/80">
            <div className="container mx-auto flex justify-between items-center">
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity duration-200" onClick={() => navigate('/dashboard')}>
                <img src={logo} alt="Darknet Duel Logo" className="h-8" />
                <h1 className="text-xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 text-flicker">
                  DARKNET_DUEL
                </h1>
              </div>
          
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate('/dashboard')} 
                  className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
                >
                  <span className="mr-1">🏠</span> 
                  <span className="hidden sm:inline">DASHBOARD</span>
                </button>
                
                <button 
                  onClick={() => navigate('/lobbies')} 
                  className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
                >
                  <span className="mr-1">🎮</span> 
                  <span className="hidden sm:inline">LOBBY</span>
                </button>
                
                <button 
                  onClick={() => navigate('/store')} 
                  className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
                >
                  <span className="mr-1">🛍️</span> 
                  <span className="hidden sm:inline">STORE</span>
                </button>
                
                <button 
                  onClick={() => navigate(`/profile/${user?.id}`)} 
                  className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
                  aria-label="Profile"
                >
                  <span className="mr-1">👤</span>
                  <span className="hidden sm:inline">PROFILE</span>
                </button>
                
                <button
                  onClick={toggleTheme}
                  className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
                  aria-label="Toggle Theme"
                >
                  {theme === 'cyberpunk' ? '🌙' : '☀️'}
                </button>
                
                <button
                  onClick={handleLogout}
                  className="btn btn-sm bg-base-300/80 border-primary/30 hover:border-primary text-primary btn-cyberpunk"
                  aria-label="Logout"
                >
                  <span className="mr-1">🚪</span>
                  <span className="hidden sm:inline">EXIT</span>
                </button>
              </div>
            </div>
          </header>

          <main className="container mx-auto p-4">
            {/* Top-up banner */}
            <div className="p-1 bg-gradient-to-br from-yellow-500/20 via-purple-500/10 to-transparent backdrop-blur-sm mb-8">
              <div className="bg-base-200 border border-yellow-400/20 p-6 relative">
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-yellow-400"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-yellow-400"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-yellow-400"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-yellow-400"></div>
                
                <div className="font-mono text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span className="text-4xl">💎</span>
                    <h2 className="text-3xl font-bold text-yellow-400 text-flicker">
                      CRYPTO_VAULT
                    </h2>
                    <span className="text-4xl">💎</span>
                  </div>
                  <div className="text-base-content text-lg mb-2">
                    SECURE TRANSACTION PORTAL • INSTANT DELIVERY
                  </div>
                  <div className="text-sm text-yellow-400">
                    ⚡ POWER UP YOUR GAME WITH PREMIUM CRYPTS ⚡
                  </div>
                  
                  {/* Current balance display */}
                  <div className="mt-4 p-3 bg-base-300/50 border border-purple-400/30 inline-block">
                    <div className="text-xs text-base-content/70 mb-1">CURRENT BALANCE</div>
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">💰</span>
                        <span className="text-yellow-400 font-bold">CREDS:</span>
                        <span className="text-yellow-300 font-mono text-lg">{user?.creds || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-purple-400">💎</span>
                        <span className="text-purple-400 font-bold">CRYPTS:</span>
                        <span className="text-purple-300 font-mono text-lg">{user?.crypts || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Package selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative p-1 ${
                    pkg.isBestValue
                      ? 'bg-gradient-to-br from-yellow-500/30 via-purple-500/20 to-yellow-500/30'
                      : pkg.isPopular
                      ? 'bg-gradient-to-br from-purple-500/20 via-primary/10 to-purple-500/20'
                      : 'bg-gradient-to-br from-primary/20 via-primary/10 to-transparent'
                  } backdrop-blur-sm transition-all duration-300 hover:scale-105`}
                >
                  {/* Best Value Badge */}
                  {pkg.isBestValue && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-xs font-bold px-3 py-1 rounded-full pulse-glow border-2 border-yellow-400">
                        BEST VALUE! 🔥
                      </div>
                    </div>
                  )}
                  
                  {/* Popular Badge */}
                  {pkg.isPopular && !pkg.isBestValue && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-purple-400">
                        POPULAR ⭐
                      </div>
                    </div>
                  )}

                  <div className={`bg-base-200 border ${
                    pkg.isBestValue
                      ? 'border-yellow-400/40'
                      : pkg.isPopular
                      ? 'border-purple-400/40'
                      : 'border-primary/20'
                  } p-6 relative text-center`}>
                    {/* Corner accents */}
                    <div className={`absolute top-0 left-0 w-3 h-3 border-t border-l ${
                      pkg.isBestValue ? 'border-yellow-400' : pkg.isPopular ? 'border-purple-400' : 'border-primary'
                    }`}></div>
                    <div className={`absolute top-0 right-0 w-3 h-3 border-t border-r ${
                      pkg.isBestValue ? 'border-yellow-400' : pkg.isPopular ? 'border-purple-400' : 'border-primary'
                    }`}></div>
                    <div className={`absolute bottom-0 left-0 w-3 h-3 border-b border-l ${
                      pkg.isBestValue ? 'border-yellow-400' : pkg.isPopular ? 'border-purple-400' : 'border-primary'
                    }`}></div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r ${
                      pkg.isBestValue ? 'border-yellow-400' : pkg.isPopular ? 'border-purple-400' : 'border-primary'
                    }`}></div>
                    
                    {/* Package content */}
                    <div className="mb-4">
                      <div className="text-6xl mb-2">💎</div>
                      <div className={`text-2xl font-bold font-mono ${
                        pkg.isBestValue ? 'text-yellow-400' : pkg.isPopular ? 'text-purple-400' : 'text-primary'
                      }`}>
                        {pkg.crypts.toLocaleString()} CRYPTS
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="text-3xl font-bold text-base-content">
                        ₱{pkg.price}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handlePurchase(pkg.id)}
                      className={`btn w-full font-mono relative overflow-hidden group ${
                        pkg.isBestValue
                          ? 'btn-warning bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-400 text-black font-bold pulse-glow'
                          : pkg.isPopular
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 border-purple-400 text-white'
                          : 'btn-primary'
                      }`}
                      disabled={selectedPackage === pkg.id}
                    >
                      <div className="relative z-10 flex items-center justify-center gap-2">
                        {selectedPackage === pkg.id ? (
                          <>
                            <span className="loading-dot bg-base-100 animation-delay-0"></span>
                            <span className="loading-dot bg-base-100 animation-delay-200"></span>
                            <span className="loading-dot bg-base-100 animation-delay-400"></span>
                            <span className="ml-2">PROCESSING</span>
                          </>
                        ) : (
                          <>
                            <span>💳</span>
                            <span>PURCHASE NOW</span>
                          </>
                        )}
                      </div>
                      <span className={`absolute inset-0 ${
                        pkg.isBestValue
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                          : pkg.isPopular
                          ? 'bg-gradient-to-r from-purple-400 to-purple-500'
                          : 'bg-gradient-to-r from-primary to-secondary'
                      } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer info */}
            <div className="mt-12 p-4 bg-base-300/30 border border-primary/20 text-center">
              <div className="font-mono text-sm text-base-content/80">
                <div className="mb-2">🔒 SECURE PAYMENTS • 💸 INSTANT DELIVERY • 🛡️ 100% SAFE</div>
                <div className="text-xs text-base-content/60">
                  All transactions are processed securely. Crypts are delivered instantly to your account.
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      
      {/* Show logout screen */}
      {isLoggingOut && <LogoutScreen />}

      {/* Payment Modal */}
      {showPaymentModal && paymentPackage && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentClose}
          packageId={paymentPackage.id}
          packageDetails={{
            crypts: paymentPackage.crypts,
            price: paymentPackage.price,
            isPopular: paymentPackage.isPopular,
            isBestValue: paymentPackage.isBestValue
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default TopUpPage; 