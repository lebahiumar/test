// components/thinking-text-animation.tsx
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface ThinkingTextAnimationProps {
  content: string;
  isThinkingInProgress: boolean;
}

/**
 * ThinkingTextAnimation provides a smooth fade-in animation for streaming thinking content
 * that dynamically adapts to the actual streaming pattern in real-time.
 */
export const ThinkingTextAnimation: React.FC<ThinkingTextAnimationProps> = ({ 
  content, 
  isThinkingInProgress
}) => {
  // Content for visible rendering
  const [visibleContent, setVisibleContent] = useState('');
  const contentBufferRef = useRef('');
  const lastVisibleLengthRef = useRef(0);
  const lastUpdateTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number | null>(null);
  const isFirstRenderRef = useRef(true);
  
  // Chunk tracking (to detect stream bursts vs. stable stream)
  const lastChunkSizeRef = useRef(0);
  const chunkTimestampsRef = useRef<number[]>([]);
  const chunkSizesRef = useRef<number[]>([]);
  
  // Adaptive animation speed based on streaming patterns
  const getRevealSpeed = () => {
    // Calculate characters remaining to reveal
    const remainingChars = contentBufferRef.current.length - lastVisibleLengthRef.current;
    
    // Get current time and analyze recent history
    const now = performance.now();
    const recentTimestamps = chunkTimestampsRef.current.slice(-5);
    const lastChunkTime = recentTimestamps.length > 0 ? recentTimestamps[recentTimestamps.length - 1] : now;
    const timeSinceLastChunk = now - lastChunkTime;
    
    // Default reveal rate (characters per second) - slightly faster for thinking content
    let charsPerSecond = 50;
    
    // Store recent chunk sizes to analyze size patterns
    const recentChunkSizes = chunkSizesRef.current.slice(-5);
    const avgChunkSize = recentChunkSizes.length > 0 
      ? recentChunkSizes.reduce((sum, size) => sum + size, 0) / recentChunkSizes.length 
      : lastChunkSizeRef.current || 10;
    
    // If we have enough data to analyze the actual stream pattern
    if (recentTimestamps.length >= 2) {
      // Calculate times between chunks
      const timeDiffs = [];
      for (let i = 1; i < recentTimestamps.length; i++) {
        timeDiffs.push(recentTimestamps[i] - recentTimestamps[i-1]);
      }
      
      // Calculate average time between chunks
      const avgTimeBetweenChunks = timeDiffs.reduce((sum, time) => sum + time, 0) / timeDiffs.length;
      const minTimeBetweenChunks = Math.min(...timeDiffs);
      
      // Analyze the stream pattern
      const isVeryFastStream = avgTimeBetweenChunks < 150 || minTimeBetweenChunks < 80;
      const isModerateStream = avgTimeBetweenChunks < 400;
      
      // Predict approximately when the next chunk will arrive
      const predictedNextChunkTime = lastChunkTime + avgTimeBetweenChunks;
      const timeToNextChunk = Math.max(10, predictedNextChunkTime - now);
      
      // Calculate ideal chars per second
      const idealCharsPerSecond = Math.max(10, remainingChars / (timeToNextChunk / 1000));
      
      // Apply dynamic adjustment based on stream speed pattern
      if (isVeryFastStream) {
        charsPerSecond = Math.min(idealCharsPerSecond, Math.max(70, avgChunkSize / (avgTimeBetweenChunks / 1000) * 0.8));
      } else if (isModerateStream) {
        charsPerSecond = Math.min(idealCharsPerSecond, Math.max(50, avgChunkSize / (avgTimeBetweenChunks / 1000) * 0.7));
      } else {
        charsPerSecond = Math.min(idealCharsPerSecond, Math.max(40, avgChunkSize / (avgTimeBetweenChunks / 1000) * 0.6));
      }
      
      // Speed up to finish displaying remaining content when stream appears to be ending
      if (timeSinceLastChunk > 500 && remainingChars > 0) {
        const finishTime = Math.min(800, Math.max(200, remainingChars * 12));
        charsPerSecond = Math.max(charsPerSecond, remainingChars / (finishTime / 1000));
      }
    } else {
      // Not enough history data - use adaptive heuristics based on buffer size
      if (remainingChars > 200) {
        charsPerSecond = 90;
      } else if (remainingChars > 100) {
        charsPerSecond = 70;
      } else if (remainingChars > 50) {
        charsPerSecond = 55;
      } else {
        charsPerSecond = 45;
      }
    }
    
    return charsPerSecond;
  };
  
  // Track if we're receiving new chunks or if streaming has likely ended
  const streamingPauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPausingRef = useRef(false);
  const streamEndTimeEstimateRef = useRef<number | null>(null);

  // Handle new content and buffer it
  useEffect(() => {
    if (!isThinkingInProgress) {
      setVisibleContent(content);
      contentBufferRef.current = content;
      lastVisibleLengthRef.current = content.length;
      
      // Clear any pending timeouts
      if (streamingPauseTimeoutRef.current) {
        clearTimeout(streamingPauseTimeoutRef.current);
        streamingPauseTimeoutRef.current = null;
      }
      return;
    }
    
    if (content === contentBufferRef.current) {
      // No new content to process
      return;
    }
    
    // Detect chunk size for adaptive speed
    const newContent = content.substring(contentBufferRef.current.length);
    if (newContent.length > 0) {
      // Reset pause detection when we get new content
      isPausingRef.current = false;
      streamEndTimeEstimateRef.current = null;
      
      // Clear any previous timeout
      if (streamingPauseTimeoutRef.current) {
        clearTimeout(streamingPauseTimeoutRef.current);
      }
      
      // Set up detection for when streaming might be ending
      streamingPauseTimeoutRef.current = setTimeout(() => {
        isPausingRef.current = true;
        
        // Calculate estimated time when animation should complete
        const remainingChars = contentBufferRef.current.length - lastVisibleLengthRef.current;
        const estTimeToReveal = Math.min(1500, remainingChars * 15);
        streamEndTimeEstimateRef.current = performance.now() + estTimeToReveal;
      }, 400);
      
      // Track chunk metrics for dynamic animation pacing
      const chunkSize = newContent.length;
      lastChunkSizeRef.current = chunkSize;
      chunkSizesRef.current.push(chunkSize);
      chunkTimestampsRef.current.push(performance.now());
      
      // Keep only the most recent data points
      if (chunkSizesRef.current.length > 10) {
        chunkSizesRef.current = chunkSizesRef.current.slice(-10);
      }
      if (chunkTimestampsRef.current.length > 10) {
        chunkTimestampsRef.current = chunkTimestampsRef.current.slice(-10);
      }
    }
    
    // Handle content replacements or edits (when content gets shorter)
    if (content.length < contentBufferRef.current.length) {
      setVisibleContent(content);
      contentBufferRef.current = content;
      lastVisibleLengthRef.current = content.length;
      return;
    }
    
    // Update the buffer with new content
    contentBufferRef.current = content;
  }, [content, isThinkingInProgress, visibleContent]);
  
  // Animation loop to gradually reveal text
  useEffect(() => {
    if (!isThinkingInProgress) {
      return;
    }
    
    const animateReveal = (timestamp: number) => {
      // Get current buffer and visible lengths
      const bufferLength = contentBufferRef.current.length;
      const remainingChars = bufferLength - lastVisibleLengthRef.current;
      
      // No more content to reveal
      if (remainingChars <= 0) {
        animationFrameRef.current = requestAnimationFrame(animateReveal);
        return;
      }
      
      // Calculate how many characters to reveal in this frame
      let charsToReveal = 0;
      const timeDelta = timestamp - lastUpdateTimeRef.current;
      
      if (isPausingRef.current && streamEndTimeEstimateRef.current !== null) {
        // We're in the stream-ending phase
        const timeRemaining = Math.max(10, streamEndTimeEstimateRef.current - timestamp);
        const revealRate = remainingChars / (timeRemaining / 1000);
        charsToReveal = Math.max(1, Math.ceil((timeDelta / 1000) * revealRate));
        
        // Ensure we reveal at least 1 character, but don't go too fast
        charsToReveal = Math.min(charsToReveal, Math.ceil(remainingChars / 3));
      } else {
        // Normal streaming phase
        const charRevealSpeed = getRevealSpeed();
        charsToReveal = Math.ceil((timeDelta / 1000) * charRevealSpeed);
      }
      
      // Reveal the calculated number of characters
      if (charsToReveal > 0) {
        // Calculate new visible length (with limits)
        const newVisibleLength = Math.min(
          lastVisibleLengthRef.current + charsToReveal,
          bufferLength
        );
        
        // Only update if actually changing
        if (newVisibleLength > lastVisibleLengthRef.current) {
          setVisibleContent(contentBufferRef.current.substring(0, newVisibleLength));
          lastVisibleLengthRef.current = newVisibleLength;
          lastUpdateTimeRef.current = timestamp;
        }
      }
      
      // Continue animation
      animationFrameRef.current = requestAnimationFrame(animateReveal);
    };
    
    // First-time initialization for immediate start
    if (isFirstRenderRef.current && visibleContent === '') {
      // If content already exists, show it all immediately instead of restarting animation
      if (content.length > 0) {
        // Check if we should show all content or just start animation
        if (contentBufferRef.current === content) {
          // Content hasn't changed, so this is likely a re-render due to card expand/collapse
          // Show all existing content immediately
          setVisibleContent(content);
          lastVisibleLengthRef.current = content.length;
        } else {
          // New content or first render, start animation from beginning
          setVisibleContent(content.charAt(0));
          lastVisibleLengthRef.current = 1;
        }
      } else {
        setVisibleContent('');
        lastVisibleLengthRef.current = 0;
      }
      isFirstRenderRef.current = false;
    }
    
    // Start animation
    animationFrameRef.current = requestAnimationFrame(animateReveal);
    
    // Cleanup
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (streamingPauseTimeoutRef.current !== null) {
        clearTimeout(streamingPauseTimeoutRef.current);
      }
    };
  }, [isThinkingInProgress, content, visibleContent]);
  
  // Cleanup and reset when component unmounts or streaming stops
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {visibleContent || (isThinkingInProgress ? (
        <div className="flex items-center text-neutral-500 dark:text-neutral-400">
          <span className="animate-pulse">Thinking...</span>
        </div>
      ) : "")}
    </motion.div>
  );
};
