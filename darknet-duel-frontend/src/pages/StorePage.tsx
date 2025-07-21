import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useToastStore } from '../store/toast.store';
import { useThemeStore } from '../store/theme.store';
import { useAudioManager } from '../hooks/useAudioManager';
import AppBar from '../components/AppBar';
import LoadingScreen from '../components/LoadingScreen';
import LogoutScreen from '../components/LogoutScreen';
import storeService, { type StoreCategory, type StoreItem, type UserPurchase } from '../services/store.service';
import currencyService from '../services/currency.service';

const StorePage: React.FC = () => {
  const { user, isAuthenticated, logout, loadUser } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  const { triggerClick, triggerPurchaseSuccessful, triggerPositiveClick } = useAudioManager();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  
  const [storeData, setStoreData] = useState<StoreCategory[]>([]);
  const [userPurchases, setUserPurchases] = useState<UserPurchase[]>([]);
  const [userBalance, setUserBalance] = useState<{ creds: number; crypts: number }>({ creds: 0, crypts: 0 });
  const [loadingPurchase, setLoadingPurchase] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Get theme from localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      logout();
      navigate('/auth', { replace: true });
    }, 1000);
  };

  // Load store data and user purchases
  useEffect(() => {
    const loadStoreData = async () => {
      try {
        setIsLoading(true);
        const start = Date.now();
        const [storeCategories, purchases, balance] = await Promise.all([
          storeService.getStoreData(),
          storeService.getUserPurchases(),
          currencyService.getBalance()
        ]);
        const elapsed = Date.now() - start;
        const minDuration = 2000;
        if (elapsed < minDuration) {
          await new Promise(res => setTimeout(res, minDuration - elapsed));
        }
        setStoreData(storeCategories);
        setUserPurchases(purchases);
        setUserBalance(balance);
        setError(null);
      } catch (error: any) {
        console.error('Failed to load store data:', error);
        setError(error.message || 'Failed to load store data');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadStoreData();
    }
  }, [isAuthenticated]);

  // Check if user owns an item
  const userOwnsItem = (itemId: string): boolean => {
    return userPurchases.some(purchase => purchase.itemId === itemId);
  };

  // Handle purchase
  const handlePurchase = async (item: StoreItem) => {
    if (loadingPurchase) return;

    triggerClick();
    setLoadingPurchase(item.f);
    
    try {
      const result = await storeService.purchaseItem(item.f);
      
             if (result.success) {
         triggerPurchaseSuccessful();
         addToast({
           type: 'success',
           title: 'Purchase Successful',
           message: result.message
         });
         
         // Update user balance
         if (result.newBalance) {
           setUserBalance(result.newBalance);
         }
         
         // Refresh purchases
         const updatedPurchases = await storeService.getUserPurchases();
         setUserPurchases(updatedPurchases);
       } else {
         addToast({
           type: 'error',
           title: 'Purchase Failed',
           message: result.message
         });
       }
     } catch (error: any) {
       addToast({
         type: 'error',
         title: 'Purchase Error',
         message: error.message || 'Failed to purchase item'
       });
    } finally {
      setLoadingPurchase(null);
    }
  };

  // Handle apply decoration
  const handleApplyDecoration = async (decorationId: string) => {
    triggerClick();
    try {
      const result = await storeService.applyDecoration(decorationId);
      
      if (result.success) {
        triggerPositiveClick();
        addToast({
          type: 'success',
          title: 'Decoration Applied',
          message: result.message
        });
        
        // Reload user data to update decoration state
        await loadUser();
      } else {
        addToast({
          type: 'error',
          title: 'Apply Failed',
          message: result.message
        });
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Apply Error',
        message: error.message || 'Failed to apply decoration'
      });
    }
  };

  if (isLoading) {
    return <LoadingScreen text="LOADING DARKNET STORE" />;
  }

  if (isLoggingOut) {
    return <LogoutScreen />;
  }

  return (
    <div className={`min-h-screen bg-base-100 ${theme}`} data-theme={theme}>
      <div className="cyberpunk-grid">
        <AppBar 
          currentPage="store"
          theme={theme}
          onThemeToggle={toggleTheme}
          onLogout={handleLogout}
        />
        
        <main className="w-full px-6 py-8 max-w-7xl mx-auto">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 text-flicker">
                DARKNET_STORE
              </h1>
              <p className="text-base-content/70 max-w-2xl mx-auto">
                Customize your avatar with exclusive decorations. Purchase items using your hard-earned crypts and creds.
              </p>
              
              {/* User Balance */}
              <div className="flex justify-center gap-6 mt-6">
                <div className="bg-base-200/50 px-4 py-2 rounded-lg border border-primary/20">
                  <span className="text-yellow-400 font-mono font-bold">💰 {userBalance.creds.toLocaleString()} CREDS</span>
                </div>
                <div className="bg-base-200/50 px-4 py-2 rounded-lg border border-primary/20">
                  <span className="text-purple-400 font-mono font-bold">💎 {userBalance.crypts.toLocaleString()} CRYPTS</span>
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
                <button 
                  className="btn btn-sm btn-ghost"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Store Categories */}
            <div className="space-y-12">
              {storeData.map((category) => (
                <div key={category.n} className="space-y-6">
                  {/* Category Header with Banner */}
                  <div className="relative overflow-hidden rounded-lg border border-primary/30">
                    <div 
                      className="relative bg-base-200/50 p-8"
                      style={{ 
                        backgroundImage: `url(${storeService.getBannerUrl(category.b.i)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        minHeight: `${category.b.h}px`
                      }}
                    >
                      <div className="absolute inset-0 bg-black/50"></div>
                      <div className="relative z-10">
                        <img 
                          src={storeService.getBannerTextUrl(category.b.t)}
                          alt={category.n}
                          className="h-12 mb-2"
                        />
                        <h2 className="text-2xl font-bold text-white font-mono">
                          {category.n}
                        </h2>
                        {category.d && (
                          <p className="text-white/80 mt-2" style={{ marginTop: category.descTopM || '8px' }}>
                            {category.d}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Category Items */}
                  <div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 w-full auto-rows-fr"
                    style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}
                  >
                    {category.i.map((item) => {
                      const owned = userOwnsItem(item.f);
                      const purchasing = loadingPurchase === item.f;
                      const canAfford = item.unit && item.cost !== undefined ? userBalance[item.unit] >= item.cost : false;
                      
                      return (
                        <div key={item.f} className="card bg-base-200/50 border border-primary/20 hover:border-primary/50 transition-all duration-200 min-h-[500px] w-full">
                          <div className="card-body p-6 flex flex-col justify-between h-full">
                            {/* Top Section: Preview and Info */}
                            <div className="flex-1 flex flex-col items-center">
                              {/* Decoration Preview */}
                              <div className="relative mx-auto mb-6 w-32 h-32 bg-base-300 rounded-full flex items-center justify-center">
                                <img 
                                  src={storeService.getDecorationUrl(item.f)}
                                  alt={item.n}
                                  className="w-28 h-28 object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                                {owned && (
                                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                  </div>
                                )}
                              </div>
                              
                              <h3 className="text-xl font-semibold text-center mb-3 text-base-content">{item.n}</h3>
                              <p className="text-base text-base-content/70 text-center mb-6">{item.d}</p>
                            </div>
                            
                            {/* Bottom Section: Price and Actions */}
                            <div>
                              {/* Price */}
                              <div className="text-center mb-6">
                                {item.cost !== undefined && item.unit ? (
                                  <span className={`font-mono font-bold text-lg ${item.unit === 'crypts' ? 'text-purple-400' : 'text-yellow-400'}`}>
                                    {item.unit === 'crypts' ? '💎' : '💰'} {item.cost.toLocaleString()} {item.unit.toUpperCase()}
                                  </span>
                                ) : (
                                  <span className="font-mono font-bold text-lg text-base-content/50">
                                    Price not available
                                  </span>
                                )}
                              </div>
                              
                              {/* Actions */}
                              <div className="flex flex-col gap-2">
                              {owned ? (
                                <>
                                  {user?.decoration === item.f ? (
                                    <button
                                      disabled
                                      className="btn btn-md bg-blue-600 border-blue-500 text-white w-full cursor-not-allowed"
                                    >
                                      Currently Applied
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleApplyDecoration(item.f)}
                                      className="btn btn-md bg-green-600 hover:bg-green-700 border-green-500 text-white w-full"
                                    >
                                      Apply Decoration
                                    </button>
                                  )}
                                </>
                              ) : item.cost !== undefined && item.unit ? (
                                <button
                                  onClick={() => handlePurchase(item)}
                                  disabled={!canAfford || purchasing}
                                  className={`btn btn-md w-full ${canAfford ? 'btn-primary' : 'btn-disabled'}`}
                                >
                                  {purchasing ? (
                                    <span className="loading loading-spinner loading-md"></span>
                                  ) : canAfford ? (
                                    'Purchase'
                                  ) : (
                                    'Insufficient Funds'
                                  )}
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="btn btn-md btn-disabled w-full"
                                >
                                  Not Available
                                </button>
                              )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StorePage; 