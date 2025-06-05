// components/ui/form-component/toggle-nod-animation.tsx
import React, { useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { SearchGroupId, searchGroups } from '@/lib/utils';

interface ToggleNodAnimationProps {
  isVisible: boolean;
  fromGroupId: SearchGroupId;
  toGroupId: SearchGroupId;
  onAnimationComplete: () => void;
}

/**
 * A premium, subtle nod animation that shows when switching between toggles
 * with a graceful rejection motion when trying to access a feature that's not available
 */
export const ToggleNodAnimation: React.FC<ToggleNodAnimationProps> = ({
  isVisible,
  fromGroupId,
  toGroupId,
  onAnimationComplete
}) => {
  const controls = useAnimation();
  
  // Get the icons for the groups
  const fromGroup = searchGroups.find(g => g.id === fromGroupId);
  const toGroup = searchGroups.find(g => g.id === toGroupId);
  
  const FromIcon = fromGroup?.icon;
  const ToIcon = toGroup?.icon;
  
  useEffect(() => {
    if (isVisible) {
      // Start the animation sequence
      const animateSequence = async () => {
        // First move to the target position (web)
        await controls.start({
          x: 0,
          opacity: 1,
          scale: 1,
          transition: { duration: 0.3, ease: "easeOut" }
        });
        
        // Then do a small shake (nod) animation
        await controls.start({
          x: [0, 10, -8, 6, -4, 0],
          transition: { 
            duration: 0.6, 
            ease: "easeInOut",
            times: [0, 0.2, 0.4, 0.6, 0.8, 1]
          }
        });
        
        // Then move back to the original position (chat)
        await controls.start({
          x: -100,
          opacity: 0,
          scale: 0.8,
          transition: { 
            duration: 0.4, 
            ease: "easeIn",
            opacity: { duration: 0.2 }
          }
        });
        
        // Animation complete
        onAnimationComplete();
      };
      
      animateSequence();
    }
  }, [isVisible, controls, onAnimationComplete]);
  
  if (!FromIcon || !ToIcon) return null;
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="relative flex flex-col items-center"
            initial={{ x: -100, opacity: 0, scale: 0.8 }}
            animate={controls}
          >
            {/* The toggle animation */}
            <div className="flex items-center justify-center bg-white dark:bg-neutral-800 rounded-full p-6 shadow-lg border border-neutral-200 dark:border-neutral-700">
              <div className="relative flex items-center space-x-8">
                {/* From icon (chat) */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-700">
                  <FromIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                </div>
                
                {/* Arrow */}
                <motion.div 
                  className="text-neutral-400 dark:text-neutral-500"
                  animate={{ 
                    x: [0, 5, 0], 
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </motion.div>
                
                {/* To icon (web) */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-700 relative">
                  <ToIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                  
                  {/* Red X overlay that appears */}
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 1.5 }}
                    animate={{ 
                      opacity: [0, 1],
                      scale: [1.5, 1]
                    }}
                    transition={{ 
                      delay: 0.9,
                      duration: 0.3
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-red-500/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(220, 38, 38, 0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                      </svg>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
            
            {/* Message below the animation */}
            <motion.div 
              className="mt-4 px-4 py-2 bg-white dark:bg-neutral-800 rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700 max-w-xs text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { delay: 0.2, duration: 0.3 }
              }}
            >
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                Web search requires Tavily API key
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Switching back to chat mode
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
