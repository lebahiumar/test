// components/thinking-card.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThinkingTextAnimation } from '@/components/thinking-text-animation';

interface ThinkingCardDisplayProps {
  thinkContent: string;
  isThinkingInProgress: boolean;
}

export const ThinkingCardDisplay: React.FC<ThinkingCardDisplayProps> = ({ 
  thinkContent, 
  isThinkingInProgress 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const collapsedContentRef = useRef<HTMLDivElement>(null);
  const scrollableExpandedContentRef = useRef<HTMLDivElement>(null);

  // Smooth scroll function for better user experience
  const smoothScrollToBottom = (element: HTMLElement, duration: number = 300) => {
    const start = element.scrollTop;
    const end = element.scrollHeight - element.clientHeight;
    const change = end - start;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOutCubic(progress);
      
      element.scrollTop = start + change * easedProgress;
      
      if (elapsedTime < duration) {
        requestAnimationFrame(animateScroll);
      }
    };
    
    requestAnimationFrame(animateScroll);
  };
  
  // Auto-scroll the collapsed view to show the latest content with smooth scrolling
  useEffect(() => {
    if (!isExpanded && collapsedContentRef.current && thinkContent) {
      // Always ensure the last line is visible in collapsed state
      if (isThinkingInProgress) {
        // Use browser's native smooth scrolling for better performance
        collapsedContentRef.current.scrollTo({ 
          top: collapsedContentRef.current.scrollHeight, 
          behavior: 'smooth' 
        });
      } else {
        // Immediate scroll for initial content or when thinking completes
        collapsedContentRef.current.scrollTop = collapsedContentRef.current.scrollHeight;
      }
    }
  }, [thinkContent, isExpanded, isThinkingInProgress]);

  // Auto-scroll the expanded view with smooth scrolling if thinking is in progress
  useEffect(() => {
    if (isExpanded && scrollableExpandedContentRef.current) {
      if (isThinkingInProgress) {
        // Use smooth scrolling for a better experience during active thinking
        smoothScrollToBottom(scrollableExpandedContentRef.current, 300);
      } else if (thinkContent) {
        // When thinking completes, ensure we're at the bottom
        scrollableExpandedContentRef.current.scrollTop = scrollableExpandedContentRef.current.scrollHeight;
      }
    }
  }, [thinkContent, isExpanded, isThinkingInProgress]);
  
  // If no content and not in progress, don't render anything
  if (!thinkContent && !isThinkingInProgress) {
    return null;
  }

  return (
    <div className="my-4 rounded-md border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
      {/* Header/Trigger */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-neutral-800 dark:text-neutral-200 transition-colors duration-150 group border-b border-neutral-100 dark:border-neutral-800"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
          <span className="font-normal">Thinking Steps</span>
        </div>
        <div className="text-neutral-400 dark:text-neutral-500">
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </div>
      </button>

      {/* Content Area */}
      <AnimatePresence initial={false}>
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className="overflow-hidden"
          >
            <div 
              ref={scrollableExpandedContentRef}
              className="max-h-80 overflow-y-auto px-4 py-2 whitespace-pre-wrap dialog-custom-scrollbar text-neutral-600 dark:text-neutral-300 text-sm"
              style={{ lineHeight: '1.5' }}
            >
              <ThinkingTextAnimation 
                content={thinkContent || ''} 
                isThinkingInProgress={isThinkingInProgress}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: '5.5rem', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className="overflow-hidden"
          >
            <div 
              ref={collapsedContentRef}
              className="h-full overflow-y-auto px-4 py-2 whitespace-pre-wrap text-neutral-600 dark:text-neutral-300 dialog-custom-scrollbar text-sm"
              style={{ scrollbarWidth: 'thin', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
            >
              <ThinkingTextAnimation 
                content={thinkContent || ''} 
                isThinkingInProgress={isThinkingInProgress}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
