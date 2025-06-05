// hooks/use-user-avatar.ts
import { useState, useEffect } from 'react';
import { useLocalStorage } from './use-local-storage';

type UserAvatarInfo = {
  url: string | null;
  lastUpdated: number;
};

export const useUserAvatar = (accountInfo: any) => {
  // Store avatar in localStorage for caching
  const [cachedAvatar, setCachedAvatar] = useLocalStorage<UserAvatarInfo>(
    'a4f-user-avatar',
    { url: null, lastUpdated: 0 }
  );

  // State for the current avatar URL
  const [avatarUrl, setAvatarUrl] = useState<string | null>(cachedAvatar.url);

  // Update avatar URL when account info changes
  useEffect(() => {
    if (accountInfo?.account_information?.github_info?.avatar_url) {
      const newAvatarUrl = accountInfo.account_information.github_info.avatar_url;
      
      // Only update if the URL has changed
      if (newAvatarUrl !== cachedAvatar.url) {
        setAvatarUrl(newAvatarUrl);
        setCachedAvatar({
          url: newAvatarUrl,
          lastUpdated: Date.now()
        });
      }
    } else if (avatarUrl !== cachedAvatar.url) {
      // Ensure we're using cached version if no new data
      setAvatarUrl(cachedAvatar.url);
    }
  // Add avatarUrl to dependencies to correctly reflect changes from cache if accountInfo becomes null
  }, [accountInfo, cachedAvatar, setCachedAvatar, avatarUrl]); 

  return avatarUrl;
};