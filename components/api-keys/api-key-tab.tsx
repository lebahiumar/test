// components/api-keys/api-key-tab.tsx
import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ApiKeyTabProps } from './types';

export const ApiKeyTab: React.FC<ApiKeyTabProps> = ({
  keyType,
  keyInfo,
  tempKey,
  onTempKeyChange,
  onSave,
  onRemove,
}) => {
  const [showKey, setShowKey] = useState(false);
  const hasKey = keyInfo.key !== null && keyInfo.key !== '';
  
  // Reset the showKey state when tab changes or key is removed
  useEffect(() => {
    setShowKey(false);
  }, [keyType, hasKey]);
  
  // For displaying masked characters when key exists
  const maskedKey = hasKey ? '•'.repeat(Math.min(24, keyInfo.key?.length || 0)) : '';
  
  return (
    <div className="space-y-4 p-1">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">{keyInfo.name}</h3>
          <div className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            keyType === 'a4f' 
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          )}>
            {keyType === 'a4f' ? 'Required' : 'Optional'}
          </div>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
          {keyInfo.description}
          {keyInfo.url && (
            <a 
              href={keyInfo.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
            >
              Get API Key <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          )}
        </p>
      </div>
      
      <div className="space-y-3">
        <div className="relative">
          <Input
            id={`${keyType}-api-key`}
            value={tempKey}
            onChange={(e) => onTempKeyChange(e.target.value)}
            type={showKey ? 'text' : 'password'}
            placeholder={hasKey && !tempKey ? maskedKey : `Enter your ${keyInfo.name}`}
            className={cn(
              "pr-10 font-mono text-sm",
              hasKey && !tempKey ? "bg-neutral-50 dark:bg-neutral-900" : "",
              !hasKey && !tempKey ? "border-amber-300 dark:border-amber-700" : ""
            )}
          />
          {hasKey && !tempKey && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
          )}
          {!hasKey && !tempKey && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="h-5 w-5 text-amber-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-10 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            {showKey ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        </div>
        {!hasKey && !tempKey && (
          <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 pl-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {keyType === 'a4f' ? 'API key required to use the chat' : 'API key required for web search'}
          </div>
        )}
        
        <div className="flex justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(keyType)}
            className="text-neutral-700 dark:text-neutral-300"
            disabled={!hasKey}
          >
            Remove Key
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={() => onSave(keyType)}
            disabled={!tempKey}
            className={cn(
              "transition-all",
              !tempKey ? "opacity-50" : ""
            )}
          >
            {hasKey ? 'Update Key' : 'Save Key'}
          </Button>
        </div>
      </div>
    </div>
  );
};
