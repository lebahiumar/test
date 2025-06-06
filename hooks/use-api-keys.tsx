// hooks/use-api-keys.tsx
import { useLocalStorage } from './use-local-storage';
import { useState, useEffect } from 'react';

// Storage keys for different API keys
export const A4F_API_KEY_STORAGE_KEY = 'a4f-api-key';
export const TAVILY_API_KEY_STORAGE_KEY = 'tavily-api-key';
export const ELEVENLABS_API_KEY_STORAGE_KEY = 'elevenlabs-api-key'; // New key

// API key types
export type ApiKeyType = 'a4f' | 'tavily' | 'elevenlabs'; // Added elevenlabs

// API key interface
export interface ApiKeyInfo {
  key: string | null;
  isRequired: boolean;
  name: string;
  description: string;
  url: string;
}

// Hook to manage multiple API keys
export function useApiKeys(): {
  apiKeys: Record<ApiKeyType, ApiKeyInfo>;
  setApiKey: (type: ApiKeyType, key: string | null) => void;
  isKeysLoaded: boolean;
} {
  // Initialize API keys with default values
  const [a4fKey, setA4fKey] = useLocalStorage<string | null>(A4F_API_KEY_STORAGE_KEY, null);
  const [tavilyKey, setTavilyKey] = useLocalStorage<string | null>(TAVILY_API_KEY_STORAGE_KEY, null);
  const [elevenlabsKey, setElevenlabsKey] = useLocalStorage<string | null>(ELEVENLABS_API_KEY_STORAGE_KEY, null); // New state
  const [isKeysLoaded, setIsKeysLoaded] = useState(false);

  // API key information
  const [apiKeys, setApiKeys] = useState<Record<ApiKeyType, ApiKeyInfo>>({
    a4f: {
      key: null,
      isRequired: true,
      name: 'A4F API Key',
      description: 'Required to chat on the playground',
      url: 'https://a4f.co/api-keys'
    },
    tavily: {
      key: null,
      isRequired: false,
      name: 'Tavily API Key',
      description: 'Required for web search functionality',
      url: 'https://tavily.com'
    },
    elevenlabs: { // New entry
      key: null,
      isRequired: false,
      name: 'ElevenLabs API Key',
      description: 'For premium Text-to-Speech voices',
      url: 'https://elevenlabs.io'
    }
  });

  // Update API keys after hydration
  useEffect(() => {
    if (isKeysLoaded) return;
    
    setApiKeys(prev => ({
      ...prev,
      a4f: { ...prev.a4f, key: a4fKey },
      tavily: { ...prev.tavily, key: tavilyKey },
      elevenlabs: { ...prev.elevenlabs, key: elevenlabsKey } // Load ElevenLabs key
    }));
    
    setIsKeysLoaded(true);
  }, [a4fKey, tavilyKey, elevenlabsKey, isKeysLoaded]);

  // Function to set an API key
  const setApiKey = (type: ApiKeyType, key: string | null) => {
    const wasKeyNullOrEmpty = apiKeys[type].key === null || apiKeys[type].key === '';
    const trimmedKey = key ? key.trim() : null;
    const valueToStore = trimmedKey === '' ? null : trimmedKey;
    
    if (type === 'a4f') {
      if (valueToStore === null) localStorage.removeItem(A4F_API_KEY_STORAGE_KEY);
      setA4fKey(valueToStore);
    } else if (type === 'tavily') {
      if (valueToStore === null) localStorage.removeItem(TAVILY_API_KEY_STORAGE_KEY);
      setTavilyKey(valueToStore);
    } else if (type === 'elevenlabs') { // Handle ElevenLabs key
      if (valueToStore === null) localStorage.removeItem(ELEVENLABS_API_KEY_STORAGE_KEY);
      setElevenlabsKey(valueToStore);
    }
    
    setApiKeys(prev => ({
      ...prev,
      [type]: { ...prev[type], key: valueToStore }
    }));
  };

  return { apiKeys, setApiKey, isKeysLoaded };
}

// Backward compatibility hook for existing code
export function useApiKey(): [string | null, (key: string | null) => void, boolean] {
  const [storedKey, setStoredKey] = useLocalStorage<string | null>(A4F_API_KEY_STORAGE_KEY, null);
  const [isKeyLoaded, setIsKeyLoaded] = useState(false);
  const { apiKeys: allApiKeys, setApiKey: setMultiApiKey } = useApiKeys(); // Get current keys to check for old key

  useEffect(() => {
    setIsKeyLoaded(true);
  }, []);

  const setSingleA4fApiKey = (key: string | null) => {
    const trimmedKey = key ? key.trim() : null;
    setStoredKey(trimmedKey); // This is for the simple input

    // Also update the main a4f key in the multi-key system
    // Use the setApiKey from useApiKeys to ensure consistency
    setMultiApiKey('a4f', trimmedKey);
  };

  return [isKeyLoaded ? storedKey : null, setSingleA4fApiKey, isKeyLoaded];
}
