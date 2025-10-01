import { useEffect, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { playBGM, playSFX, fadeBGMForLoading, restoreBGMVolume, getCurrentBGM, stopBGM, retryCurrentBGM } from '../utils/audioHandler';
import type { BGMType } from '../utils/audioHandler';

// Debug flag from environment variable
const DEBUG_AUDIO = import.meta.env.VITE_DEBUG_AUDIO === 'true';

// Note: All pages except /, /auth, /admin/*, and /game should have "The System Has Failed" BGM

export const useAudioManager = () => {
  const location = useLocation();
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  // Determine which BGM should play for current page
  const getBGMForPage = useCallback((pathname: string): BGMType | null => {
    if (DEBUG_AUDIO) console.log('🎵 getBGMForPage called with pathname:', pathname);
    
    // Exclude only root, auth, and admin routes from BGM
    if (
      pathname === '/' ||
      pathname === '/auth'
    ) {
      if (DEBUG_AUDIO) console.log('🎵 Page should not have BGM (excluded route):', pathname);
      return null;
    }
    
    if (pathname.startsWith('/admin')) {
      if (DEBUG_AUDIO) console.log('🎵 Page should not have BGM (admin route):', pathname);
      return null;
    }
    
    // Game routes get THE DROP BGM
    if (pathname === '/game' || pathname.startsWith('/game')) {
      if (DEBUG_AUDIO) console.log('🎵 Page should have THE DROP BGM:', pathname);
      return 'the-drop';
    }
    
    // All other pages should have THE SYSTEM HAS FAILED BGM
    if (DEBUG_AUDIO) console.log('🎵 Page should have BGM:', pathname);
    return 'the-system-has-failed';
  }, []);

  // Handle BGM transitions
  useEffect(() => {
    const targetBGM = getBGMForPage(location.pathname);
    const currentBGM = getCurrentBGM();

    // Prevent global BGM changes if suppressed (e.g., WinnerLobby is active)
    if ((window as any).__suppressGlobalBGM) {
      if (DEBUG_AUDIO) console.log('🎵 AudioManager: Global BGM is suppressed (e.g., WinnerLobby), skipping BGM change');
      return;
    }

    if (DEBUG_AUDIO) {
      console.log('🎵 AudioManager: Page changed to:', location.pathname);
      console.log('🎵 AudioManager: Target BGM:', targetBGM);
      console.log('🎵 AudioManager: Current BGM:', currentBGM);
    }

    // If we're navigating to a page with different BGM
    if (targetBGM !== currentBGM) {
      if (targetBGM) {
        if (DEBUG_AUDIO) console.log('🎵 AudioManager: Playing BGM for page:', targetBGM);
        playBGM(targetBGM);
      } else {
        if (DEBUG_AUDIO) console.log('🎵 AudioManager: Stopping BGM for page without BGM');
        stopBGM();
      }
    } else {
      if (DEBUG_AUDIO) console.log('🎵 AudioManager: Same BGM, no change needed');
    }
  }, [location.pathname, getBGMForPage]);

  // Handle audio permission events
  useEffect(() => {
    const handleAudioPermissionNeeded = () => {
      if (DEBUG_AUDIO) console.log('🎵 AudioManager: Permission prompt needed');
      setShowPermissionPrompt(true);
    };

    const handleAudioPermissionGranted = () => {
      if (DEBUG_AUDIO) console.log('🎵 AudioManager: Permission granted, retrying BGM');
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