import { useState, useEffect } from 'react';
import accountService from '../services/account.service';

/**
 * Custom hook for avatar URLs with cache busting
 * Automatically refreshes the avatar URL when the user ID changes
 */
export const useAvatarUrl = (userId: string | undefined) => {
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [cacheBuster, setCacheBuster] = useState<string>('');

  useEffect(() => {
    if (userId) {
      // Generate a new cache buster when user ID changes
      const newCacheBuster = Date.now().toString();
      setCacheBuster(newCacheBuster);
      setAvatarUrl(accountService.getAvatarUrl(userId, newCacheBuster));
    } else {
      setAvatarUrl('');
    }
  }, [userId]);

  // Function to force refresh the avatar
  const refreshAvatar = () => {
    if (userId) {
      const newCacheBuster = Date.now().toString();
      setCacheBuster(newCacheBuster);
      setAvatarUrl(accountService.getAvatarUrl(userId, newCacheBuster));
    }
  };

  return { avatarUrl, refreshAvatar, cacheBuster };
}; 