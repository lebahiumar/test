// hooks/use-api-key.ts
import { useLocalStorage } from './use-local-storage';
import { useState, useEffect } from 'react';

const API_KEY_STORAGE_KEY = 'a4f-api-key';

export function useApiKey(): [string | null, (key: string | null) => void, boolean] {
  const [storedKey, setStoredKey] = useLocalStorage<string | null>(API_KEY_STORAGE_KEY, null);
  const [isKeyLoaded, setIsKeyLoaded] = useState(false);

  useEffect(() => {
    // This effect runs after hydration and signals that the key has been read from localStorage
    setIsKeyLoaded(true);
  }, []);

  const setApiKey = (key: string | null) => {
    setStoredKey(key ? key.trim() : null);
  };

  // Return the key, the setter, and the loading status
  // Return null for the key until it's loaded to prevent hydration mismatch
  return [isKeyLoaded ? storedKey : null, setApiKey, isKeyLoaded];
}