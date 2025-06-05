import { useState, useEffect, useCallback } from 'react';

// Helper function remains mostly the same
function getStoredValue<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    if (item === 'undefined') return defaultValue; // Handle explicitly stored 'undefined' string
    return JSON.parse(item);
  } catch {
    console.warn(`Error reading localStorage key “${key}”:`);
    return defaultValue;
  }
}

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // 1. Initialize state with the default value ONLY.
  const [value, setValue] = useState<T>(defaultValue);

  // 2. Use useEffect to read from localStorage AFTER the component mounts (and hydration is complete).
  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    const stored = getStoredValue(key, defaultValue);
    // Check if the stored value is different from the initial default before updating.
    // Avoid unnecessary re-renders if the stored value is the default.
    // Use a deep comparison if T could be an object/array, or JSON.stringify for simplicity if appropriate.
    if (JSON.stringify(stored) !== JSON.stringify(defaultValue)) {
         setValue(stored);
    }
    // Only run this effect when the key changes. Ignore defaultValue changes after mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // 3. The setter function now updates both React state and localStorage.
  const setStoredValue = useCallback((newValue: T | ((val: T) => T)) => {
    try {
      // Allow function updates (e.g., setValue(prev => prev + 1))
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      // Update React state
      setValue(valueToStore);
      // Update localStorage (only on client)
      if (typeof window !== 'undefined') {
         if (valueToStore === undefined) {
             localStorage.removeItem(key); // Remove item if value is undefined
         } else {
            localStorage.setItem(key, JSON.stringify(valueToStore));
         }
      }
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, value]); // Depend on `value` so functional updates have the latest state

  return [value, setStoredValue];
}

// Consider removing the original `useLocalStorage` export if this replaces it.
// export { useLocalStorage };