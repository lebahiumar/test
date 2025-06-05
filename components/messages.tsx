
// components/messages.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Message } from '@/components/message';
import { SimpleMessage, ModelUIData } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MessagesProps {
    messages: SimpleMessage[];
    models?: ModelUIData[];
    userAvatarUrl?: string | null;
    onRetry?: (assistantMessageIdToRetry: string) => void;
    isTextToSpeechFeatureEnabled: boolean;
    browserTtsSpeed: number; 
    selectedBrowserTtsVoiceURI?: string;
    editingMessageId: string | null; // New prop
    onStartEdit: (messageId: string, currentContent: string) => void; // New prop
}

const Messages: React.FC<MessagesProps> = ({ 
    messages, 
    models = [], 
    userAvatarUrl = null, 
    onRetry, 
    isTextToSpeechFeatureEnabled,
    browserTtsSpeed,
    selectedBrowserTtsVoiceURI,
    editingMessageId, // Destructure new prop
    onStartEdit,      // Destructure new prop
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [userScrolled, setUserScrolled] = useState(false);
    const [scrollableParent, setScrollableParent] = useState<Element | null>(null);

    const isStreaming = messages.some(message => message.isStreaming);

    useEffect(() => {
        const getScrollParent = (node: HTMLElement | null): Element | null => {
            if (!node) return document.documentElement;
            let parent = node.parentElement;
            while (parent) {
                const { overflow, overflowY } = window.getComputedStyle(parent);
                if (
                    (overflow === 'auto' || overflow === 'scroll' ||
                     overflowY === 'auto' || overflowY === 'scroll') &&
                    parent.scrollHeight > parent.clientHeight
                ) {
                    return parent;
                }
                parent = parent.parentElement;
            }
            return document.documentElement;
        };

        if (containerRef.current) {
            const scrollParent = getScrollParent(containerRef.current);
            setScrollableParent(scrollParent);

            if (scrollParent) {
                const { scrollTop, scrollHeight, clientHeight } = scrollParent;
                setShowScrollButton(scrollHeight - scrollTop - clientHeight > 30);
            }
        }
    }, []);

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        if (!scrollableParent) return;

        if (behavior === 'smooth') {
            const start = scrollableParent.scrollTop;
            const end = scrollableParent.scrollHeight - scrollableParent.clientHeight;
            const change = end - start;
            const duration = 300;
            let startTime: number;

            const animateScroll = (timestamp: number) => {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / duration, 1);

                const easeInOutCubic = (t: number) => {
                    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                };

                const easedProgress = easeInOutCubic(progress);
                const newPosition = start + change * easedProgress;

                scrollableParent.scrollTop = newPosition;

                if (elapsed < duration) {
                    requestAnimationFrame(animateScroll);
                } else {
                    if (behavior === 'smooth') { 
                        setUserScrolled(false);
                    }
                }
            };
            requestAnimationFrame(animateScroll);
        } else {
            scrollableParent.scrollTop = scrollableParent.scrollHeight;
        }
    }, [scrollableParent]); 

    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (messages.length > 0 && lastMessage && lastMessage.role === 'user') {
            const isNewUserMessage = !lastMessage.isStreaming && !lastMessage.content.includes('[...]'); 
            if (isNewUserMessage) {
                setUserScrolled(false);
                if (scrollableParent) {
                    scrollableParent.scrollTop = scrollableParent.scrollHeight;
                }
            }
        }
    }, [messages, messages.length, scrollableParent]);

    useEffect(() => {
        if (isStreaming && !userScrolled) {
            scrollToBottom('auto');
        }
    }, [messages, isStreaming, userScrolled, scrollToBottom]); 

    useEffect(() => {
        if (!scrollableParent) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = scrollableParent as Element;
            const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
            const isScrolledUp = distanceFromBottom > 30;

            setShowScrollButton(isScrolledUp);

            if (isScrolledUp && !userScrolled) {
                setUserScrolled(true);
            }
        };

        scrollableParent.addEventListener('scroll', handleScroll);
        return () => {
            scrollableParent.removeEventListener('scroll', handleScroll);
        };
    }, [scrollableParent, userScrolled]);

    if (messages.length === 0) {
        return null;
    }

    return (
        <div ref={containerRef} className="space-y-4 sm:space-y-6 mb-4 relative">
            {messages.map((message, index) => (
                <Message
                    key={message.id} 
                    message={message}
                    index={index}
                    models={models}
                    userAvatarUrl={userAvatarUrl}
                    onRetry={message.role === 'assistant' ? onRetry : undefined}
                    isTextToSpeechFeatureEnabled={isTextToSpeechFeatureEnabled}
                    browserTtsSpeed={browserTtsSpeed}
                    selectedBrowserTtsVoiceURI={selectedBrowserTtsVoiceURI}
                    editingMessageId={editingMessageId} // Pass down
                    onStartEdit={onStartEdit}         // Pass down
                />
            ))}
            <div ref={messagesEndRef} />
            <AnimatePresence>
                {showScrollButton && (
                    <motion.button
                        className="fixed bottom-28 right-8 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 p-3 rounded-full shadow-lg hover:shadow-xl z-50 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center"
                        onClick={() => scrollToBottom('smooth')}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.2 }}
                        aria-label="Scroll to bottom"
                    >
                        <ChevronDown className="w-5 h-5" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Messages;

    