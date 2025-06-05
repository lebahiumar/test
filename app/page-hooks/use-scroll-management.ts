import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SimpleMessage } from '@/lib/utils';

/**
 * Custom hook to manage scroll-related functionality for a chat interface.
 * @param messages - Array of messages to determine scroll behavior.
 * @param isStreamingState - Boolean indicating if a message is currently streaming.
 * @returns An object containing `bottomRef`, `showScrollButton`, and `scrollToBottom` function.
 */
export function useScrollManagement(messages: SimpleMessage[], isStreamingState: boolean) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolledUp = (document.body.scrollHeight - window.innerHeight - window.scrollY) > 200;
      setShowScrollButton(isScrolledUp && messages.length > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [messages.length]);

  useEffect(() => {
    if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        const isUserMessage = lastMessage.role === 'user';

        if (isUserMessage) {
            const inputBoxHeight = 76;
            const newScrollY = document.body.scrollHeight - window.innerHeight - inputBoxHeight;
            if (newScrollY > 0) { window.scrollTo({ top: newScrollY, behavior: 'auto' }); }
            setShowScrollButton(false);
        } else if (isStreamingState) {
            if (scrollTimeoutRef.current) { clearTimeout(scrollTimeoutRef.current); }
            scrollTimeoutRef.current = setTimeout(() => {
                const inputBoxHeight = 76;
                const newScrollY = document.body.scrollHeight - window.innerHeight - inputBoxHeight;
                if (newScrollY > 0) { window.scrollTo({ top: newScrollY, behavior: 'smooth' }); }
                setShowScrollButton(false);
            }, 300);
        }
    }
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages, isStreamingState]);

  const scrollToBottom = useCallback(() => {
    const inputBoxHeight = 76;
    const newScrollY = document.body.scrollHeight - window.innerHeight - inputBoxHeight;
    if (newScrollY > 0) {
        window.scrollTo({ top: newScrollY, behavior: 'smooth' });
        setTimeout(() => setShowScrollButton(false), 1000);
    }
  }, []);

  return { bottomRef, showScrollButton, scrollToBottom };
}