// components/system-prompt-input.tsx
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { countTokens, countTokensAsync } from '@/lib/token-utils';
import '@/styles/custom-scrollbar.css';
import AutoSaveIndicator from '@/components/auto-save-indicator';

interface SystemPromptInputProps {
  systemPrompt: string;
  onSystemPromptChange: (prompt: string) => void;
  isVisible: boolean;
  isProcessing: boolean;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
}

const SystemPromptInput: React.FC<SystemPromptInputProps> = ({
  systemPrompt,
  onSystemPromptChange,
  isVisible,
  isProcessing,
  inputRef,
}) => {
  const [tokenCount, setTokenCount] = useState(0);
  const [isUsingTiktoken, setIsUsingTiktoken] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initial token count using synchronous method
  useEffect(() => {
    setTokenCount(countTokens(systemPrompt));
  }, [systemPrompt]);
  
  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
  
  // Load and use tiktoken for more accurate counting when available
  useEffect(() => {
    let isMounted = true;
    
    const loadTiktokenCounter = async () => {
      try {
        // Use the fallback counter initially
        if (isMounted) {
          setTokenCount(countTokens(systemPrompt));
        }
        
        // Then try to load the more accurate tiktoken counter
        const tiktokenCount = await countTokensAsync(systemPrompt);
        
        if (isMounted) {
          setTokenCount(tiktokenCount);
          setIsUsingTiktoken(true);
        }
      } catch (error) {
        console.error('Error using tiktoken:', error);
      }
    };
    
    loadTiktokenCounter();
    
    return () => {
      isMounted = false;
    };
  }, [systemPrompt]);
  return (
    <Collapsible open={isVisible} className="w-full">
      <AnimatePresence initial={false}>
        {isVisible && (
          <CollapsibleContent forceMount asChild>
            <motion.div
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: 'auto', opacity: 1, marginTop: '0.5rem' }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="overflow-hidden"
            >
              <div className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                <Label 
                  htmlFor="system-prompt" 
                  className="text-xs text-neutral-500 dark:text-neutral-400 mb-1 block"
                >
                  System Prompt (Optional)
                </Label>
                <Textarea
                  id="system-prompt"
                  ref={inputRef}
                  value={systemPrompt}
                  onChange={(e) => {
                    onSystemPromptChange(e.target.value);
                    
                    // Show saving animation when typing
                    setIsSaving(true);
                    setIsSaved(false);
                    
                    // Clear any existing timeout
                    if (typingTimeoutRef.current) {
                      clearTimeout(typingTimeoutRef.current);
                    }
                    
                    // Set timeout to show saved state after 150ms
                    typingTimeoutRef.current = setTimeout(() => {
                      setIsSaving(false);
                      setIsSaved(true);
                      
                      // Reset saved state after 2 seconds
                      setTimeout(() => {
                        setIsSaved(false);
                      }, 2000);
                    }, 150);
                  }}
                  placeholder="e.g., You are a helpful assistant that speaks in haikus."
                  className={cn(
                    "w-full resize-none whatsize",
                    "text-sm leading-relaxed",
                    "bg-neutral-50 dark:bg-neutral-800/50",
                    "border border-neutral-200 dark:border-neutral-700",
                    "focus:border-neutral-300 dark:focus:border-neutral-600",
                    "text-neutral-900 dark:text-neutral-100",
                    "focus:ring-0",
                    "px-3 py-2",
                    "scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600",
                    "scrollbar-track-transparent"
                  )}
                  rows={2}
                  disabled={isProcessing}
                />
                <div className="flex justify-between items-center mt-1">
                  <AutoSaveIndicator isSaving={isSaving} isSaved={isSaved} />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 text-right">
                    {tokenCount} tokens {isUsingTiktoken ? '' : '(estimating...)'}  
                  </p>
                </div>
              </div>
            </motion.div>
          </CollapsibleContent>
        )}
      </AnimatePresence>
    </Collapsible>
  );
};

export default SystemPromptInput;
