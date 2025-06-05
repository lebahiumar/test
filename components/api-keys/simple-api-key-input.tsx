// components/api-keys/simple-api-key-input.tsx
import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SimpleApiKeyInputProps } from './types';

export const SimpleApiKeyInput: React.FC<SimpleApiKeyInputProps> = ({ 
  apiKey, 
  setApiKey, 
  isKeyLoaded, 
  isOpen, 
  onOpenChange 
}) => {
  const [tempKey, setTempKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  // Effect to initialize tempKey or clear it when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTempKey('');
      setShowKey(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (tempKey.trim()) {
      const newKey = tempKey.trim();
      setApiKey(newKey);
      onOpenChange(false); // Close dialog
      toast.success("API key saved successfully!", {
        description: "Fetching your account information..."
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
            </svg>
            API Key Required
          </DialogTitle>
          <DialogDescription>
            Please enter your A4F API key to continue using the chat
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="api-key" className="text-sm font-medium">
                A4F API Key
              </label>
              <a 
                href="https://api4free.com/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Get API Key <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
            
            <div className="relative">
              <Input
                id="api-key"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                type={showKey ? 'text' : 'password'}
                placeholder="Enter your A4F API key"
                className="pr-10 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                {showKey ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={!tempKey.trim()}
              className="transition-all"
            >
              Save API Key
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
