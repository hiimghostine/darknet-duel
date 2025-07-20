import { useEffect, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { playBGM, playSFX, fadeBGMForLoading, restoreBGMVolume, getCurrentBGM, stopBGM, retryCurrentBGM } from '../utils/audioHandler';
import type { BGMType, SFXType } from '../utils/audioHandler';

// Note: All pages except /, /auth, /admin/*, and /game should have "The System Has Failed" BGM

export const useAudioManager = () => {
  const location = useLocation();
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  // Determine which BGM should play for current page
  const getBGMForPage = useCallback((pathname: string): BGMType | null => {
    console.log('🎵 getBGMForPage called with pathname:', pathname);
    
    // Check for exact matches first, then startsWith for admin routes
    if (
      pathname === '/' ||
      pathname === '/auth' ||
      pathname === '/game' ||
      pathname.startsWith('/game')
    ) {
      console.log('🎵 Page should not have BGM (game or excluded route):', pathname);
      return null;
    }
    
    // Check admin routes
    if (pathname.startsWith('/admin')) {
      console.log('🎵 Page should not have BGM (admin route):', pathname);
      return null;
    }
    
    // All other pages should have BGM
    console.log('🎵 Page should have BGM:', pathname);
    return 'the-system-has-failed';
  }, []);

  // Handle BGM transitions
  useEffect(() => {
    const targetBGM = getBGMForPage(location.pathname);
    const currentBGM = getCurrentBGM();

    console.log('🎵 AudioManager: Page changed to:', location.pathname);
    console.log('🎵 AudioManager: Target BGM:', targetBGM);
    console.log('🎵 AudioManager: Current BGM:', currentBGM);

    // If we're navigating to a page with different BGM
    if (targetBGM !== currentBGM) {
      if (targetBGM) {
        console.log('🎵 AudioManager: Playing BGM for page:', targetBGM);
        playBGM(targetBGM);
      } else {
        console.log('🎵 AudioManager: Stopping BGM for page without BGM');
        if (!(window as any).__suppressGlobalBGM) {
          stopBGM();
        } else {
          console.log('🎵 AudioManager: Suppressing global BGM stop due to WinnerLobby');
        }
      }
    } else {
      console.log('🎵 AudioManager: Same BGM, no change needed');
    }
  }, [location.pathname, getBGMForPage]);

  // Handle audio permission events
  useEffect(() => {
    const handleAudioPermissionNeeded = () => {
      console.log('🎵 AudioManager: Permission prompt needed');
      setShowPermissionPrompt(true);
    };

    const handleAudioPermissionGranted = () => {
      console.log('🎵 AudioManager: Permission granted, retrying BGM');
      setShowPermissionPrompt(false);
      // Retry playing current BGM after permission is granted
      retryCurrentBGM();
    };

    window.addEventListener('audio-permission-needed', handleAudioPermissionNeeded);
    window.addEventListener('audio-permission-granted', handleAudioPermissionGranted);

    return () => {
      window.removeEventListener('audio-permission-needed', handleAudioPermissionNeeded);
      window.removeEventListener('audio-permission-granted', handleAudioPermissionGranted);
    };
  }, [location.pathname, getBGMForPage]);

  // Handle loading states
  const handlePageLoadStart = useCallback(() => {
    fadeBGMForLoading();
  }, []);

  const handlePageLoadComplete = useCallback(() => {
    restoreBGMVolume();
  }, []);

  // SFX trigger functions
  const triggerClick = useCallback(() => {
    playSFX('click');
  }, []);

  const triggerError = useCallback(() => {
    playSFX('error');
  }, []);

  const triggerNotification = useCallback(() => {
    playSFX('notification');
  }, []);

  const triggerPositiveClick = useCallback(() => {
    playSFX('positive-click');
  }, []);

  const triggerNegativeClick = useCallback(() => {
    playSFX('negative-click');
  }, []);

  const triggerPurchaseSuccessful = useCallback(() => {
    playSFX('purchase-successful');
  }, []);

  const triggerSendMsg = useCallback(() => {
    playSFX('send-msg');
  }, []);

  const triggerRecvMsg = useCallback(() => {
    playSFX('recv-msg');
  }, []);

  return {
    triggerClick,
    triggerError,
    triggerNotification,
    triggerPositiveClick,
    triggerNegativeClick,
    triggerPurchaseSuccessful,
    triggerSendMsg,
    triggerRecvMsg,
    handlePageLoadStart,
    handlePageLoadComplete,
    showPermissionPrompt,
    setShowPermissionPrompt,
  };
}; 