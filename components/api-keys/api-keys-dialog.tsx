// components/api-keys/api-keys-dialog.tsx
import React, { useState, useEffect } from 'react';
import { KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiKeyType } from '@/hooks/use-api-keys';
import { searchGroups } from '@/lib/utils';
import { ApiKeysDialogProps } from './types';
import { ApiKeyTab } from './api-key-tab';

export const ApiKeysDialog: React.FC<ApiKeysDialogProps> = ({
  apiKeys,
  setApiKey,
  isKeysLoaded,
  isOpen,
  onOpenChange,
}) => {
  // Completely separate state for each API key type
  const [a4fTempKey, setA4fTempKey] = useState('');
  const [tavilyTempKey, setTavilyTempKey] = useState('');
  
  // State for active tab
  const [activeTab, setActiveTab] = useState<ApiKeyType>('a4f');

  // Reset temp keys when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setA4fTempKey('');
      setTavilyTempKey('');
    }
  }, [isOpen]);

  // Handle saving the A4F API key
  const handleSaveA4f = () => {
    if (a4fTempKey.trim()) {
      const newKey = a4fTempKey.trim();
      setApiKey('a4f', newKey);
      
      // Clear the temp key after saving
      setA4fTempKey('');
      
      // Dismiss all existing toasts
      toast.dismiss();
      
      toast.success(`A4F API Key saved`, {
        description: "Fetching your account information..."
      });
    }
  };

  // Handle saving the Tavily API key
  const handleSaveTavily = () => {
    if (tavilyTempKey.trim()) {
      const newKey = tavilyTempKey.trim();
      setApiKey('tavily', newKey);
      
      // Clear the temp key after saving
      setTavilyTempKey('');
      
      // Dismiss all existing toasts
      toast.dismiss();
      
      toast.success(`Tavily API Key saved`, {
        description: "Web search is now available"
      });
    }
  };

  // Handle removing the A4F API key
  const handleRemoveA4f = () => {
    // Completely remove the API key
    setApiKey('a4f', null);
    
    // Reset the temporary key state
    setA4fTempKey('');
    
    // Dismiss all existing toasts
    toast.dismiss();
    
    // Show a confirmation toast
    toast.info(`A4F API Key removed`, {
      description: "You'll need to provide an API key to continue using the chat"
    });
  };

  // Handle removing the Tavily API key
  const handleRemoveTavily = () => {
    // Completely remove the API key
    setApiKey('tavily', null);
    
    // Reset the temporary key state
    setTavilyTempKey('');
    
    // Dismiss all existing toasts
    toast.dismiss();
    
    // Show a confirmation toast
    toast.info(`Tavily API Key removed`, {
      description: "Web search functionality is now disabled"
    });
    
    // Close the dialog
    onOpenChange(false);
    
    // Force switch to chat toggle
    setTimeout(() => {
      // Use the DOM to find and click the chat button
      const chatButtons = document.querySelectorAll('button[data-group-id="chat"]');
      if (chatButtons.length > 0) {
        // Simulate a click on the first chat button found
        (chatButtons[0] as HTMLButtonElement).click();
      }
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            API Keys
          </DialogTitle>
          <DialogDescription>
            Manage your API keys for different services
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="a4f" value={activeTab} onValueChange={(value) => setActiveTab(value as ApiKeyType)} className="w-full">
          <div className="relative mb-6">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="a4f" className="relative">
                A4F
                <span className="absolute -top-1 -right-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  Required
                </span>
              </TabsTrigger>
              <TabsTrigger value="tavily" className="relative">
                Tavily
                <span className="absolute -top-1 -right-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  Optional
                </span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="a4f" className="mt-0">
            <div className="space-y-4 p-1">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">{apiKeys.a4f.name}</h3>
                  <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    Required
                  </div>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                  {apiKeys.a4f.description}
                  {apiKeys.a4f.url && (
                    <a 
                      href={apiKeys.a4f.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Get API Key
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>
                  )}
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="relative">
                  <input
                    id="a4f-api-key"
                    value={a4fTempKey}
                    onChange={(e) => setA4fTempKey(e.target.value)}
                    type="password"
                    placeholder={`Enter your ${apiKeys.a4f.name}`}
                    className={`w-full px-3 py-2 border rounded-md font-mono text-sm pr-10 ${!apiKeys.a4f.key ? "border-amber-300 dark:border-amber-700" : ""} ${apiKeys.a4f.key && !a4fTempKey ? "bg-neutral-50 dark:bg-neutral-900" : ""}`}
                  />
                  
                  {apiKeys.a4f.key && !a4fTempKey && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    </div>
                  )}
                  
                  {!apiKeys.a4f.key && !a4fTempKey && (
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
                </div>
                
                {!apiKeys.a4f.key && !a4fTempKey && (
                  <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 pl-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    API key required to use the chat
                  </div>
                )}
                
                <div className="flex justify-between gap-2">
                  <button
                    className={`px-3 py-1.5 rounded-md text-sm ${!apiKeys.a4f.key ? "opacity-50 cursor-not-allowed bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400" : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"}`}
                    onClick={handleRemoveA4f}
                    disabled={!apiKeys.a4f.key}
                  >
                    Remove Key
                  </button>
                  
                  <button
                    className={`px-3 py-1.5 rounded-md text-sm ${!a4fTempKey ? "opacity-50 cursor-not-allowed bg-blue-500 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
                    onClick={handleSaveA4f}
                    disabled={!a4fTempKey}
                  >
                    {apiKeys.a4f.key ? 'Update Key' : 'Save Key'}
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tavily" className="mt-0">
            <div className="space-y-4 p-1">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">{apiKeys.tavily.name}</h3>
                  <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    Optional
                  </div>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                  {apiKeys.tavily.description}
                  {apiKeys.tavily.url && (
                    <a 
                      href={apiKeys.tavily.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Get API Key
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>
                  )}
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="relative">
                  <input
                    id="tavily-api-key"
                    value={tavilyTempKey}
                    onChange={(e) => setTavilyTempKey(e.target.value)}
                    type="password"
                    placeholder={`Enter your ${apiKeys.tavily.name}`}
                    className={`w-full px-3 py-2 border rounded-md font-mono text-sm pr-10 ${!apiKeys.tavily.key ? "border-amber-300 dark:border-amber-700" : ""} ${apiKeys.tavily.key && !tavilyTempKey ? "bg-neutral-50 dark:bg-neutral-900" : ""}`}
                  />
                  
                  {apiKeys.tavily.key && !tavilyTempKey && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    </div>
                  )}
                  
                  {!apiKeys.tavily.key && !tavilyTempKey && (
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
                </div>
                
                {!apiKeys.tavily.key && !tavilyTempKey && (
                  <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 pl-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    API key required for web search
                  </div>
                )}
                
                <div className="flex justify-between gap-2">
                  <button
                    className={`px-3 py-1.5 rounded-md text-sm ${!apiKeys.tavily.key ? "opacity-50 cursor-not-allowed bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400" : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"}`}
                    onClick={handleRemoveTavily}
                    disabled={!apiKeys.tavily.key}
                  >
                    Remove Key
                  </button>
                  
                  <button
                    className={`px-3 py-1.5 rounded-md text-sm ${!tavilyTempKey ? "opacity-50 cursor-not-allowed bg-blue-500 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
                    onClick={handleSaveTavily}
                    disabled={!tavilyTempKey}
                  >
                    {apiKeys.tavily.key ? 'Update Key' : 'Save Key'}
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
