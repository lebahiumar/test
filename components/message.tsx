
// components/message.tsx
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MarkdownRenderer } from '@/components/markdown';
import { TextFadeAnimation } from '@/components/text-fade-animation';
import { User, Bot, EyeIcon, Pencil } from 'lucide-react';
import { cn, SimpleMessage, ModelUIData } from '@/lib/utils';
import { useUserAvatar } from '@/hooks/use-user-avatar';
import { InteractionButtons } from '@/components/interaction-buttons';
import { ErrorMessage } from '@/components/error-message';
import { ThinkingCardDisplay } from '@/components/thinking-card';
import { Button } from '@/components/ui/button';

interface MessageProps {
    message: SimpleMessage;
    index: number;
    models?: ModelUIData[];
    userAvatarUrl?: string | null;
    onRetry?: (assistantMessageIdToRetry: string) => void;
    isTextToSpeechFeatureEnabled: boolean;
    browserTtsSpeed: number;
    selectedBrowserTtsVoiceURI?: string;
    editingMessageId: string | null;
    onStartEdit: (messageId: string, currentContent: string) => void;
}


export const Message: React.FC<MessageProps> = ({
    message,
    index,
    models = [],
    userAvatarUrl = null,
    onRetry,
    isTextToSpeechFeatureEnabled,
    browserTtsSpeed,
    selectedBrowserTtsVoiceURI,
    editingMessageId,
    onStartEdit,
}) => {
    const isUser = message.role === 'user';
    const isStreaming = message.role === 'assistant' && message.isStreaming;
    const isErrorMessage = !isUser && message.isError === true;
    const actualErrorType = message.errorType || 'generic';

    const renderAiLogo = (modelId?: string) => {
        const model = modelId ? models.find((m) => m.value === modelId) : undefined;

        if (model?.logoUrl) {
            return (
                <div className="relative w-5 h-5 flex items-center justify-center">
                    <Image
                        src={model.logoUrl}
                        alt={model.label || 'AI'}
                        width={20}
                        height={20}
                        className={cn(model.logoUrl.endsWith('.svg') && "themeable-svg-logo")}
                        unoptimized
                    />
                </div>
            );
        } else if (model?.icon) {
            const IconComponent = model.icon;
            return <IconComponent className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />;
        }
        return <Bot className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />;
    };

    return (
        <motion.div
            key={`${message.role}-${message.id}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: isUser ? 0 : 0.1 }}
            className={cn(
                "px-0 mb-4 sm:mb-5", // Removed group/message from here
                isUser ? "flex justify-end" : "flex justify-start"
            )}
        >
            <div className={cn(
                "flex items-start gap-2 sm:gap-3 w-full",
                isUser ? "justify-end" : "justify-start"
            )}>

                {!isUser && (
                    <div className={cn(
                        "flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center self-start border border-neutral-200 dark:border-neutral-800",
                        (message.thinkingContent || message.isThinkingInProgress) ? "mt-4" :
                        isErrorMessage ? "mt-3" : "mt-1"
                    )}>
                        {renderAiLogo(message.modelId)}
                    </div>
                )}


                <div className={cn(
                    "flex flex-col group/message", // Added group/message here
                    "max-w-[85%] sm:max-w-[75%] md:max-w-[70%]"

                )}>

                    {isUser ? (
                        <>
                            <div className="text-base font-medium break-words whitespace-pre-wrap text-neutral-900 dark:text-neutral-100">
                                <MarkdownRenderer content={message.content} />
                            </div>
                            {editingMessageId !== message.id && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    className="mt-1 self-end opacity-0 group-hover/message:opacity-100 transition-opacity duration-200"
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 p-1 rounded-full bg-background/70 backdrop-blur-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                        onClick={() => onStartEdit(message.id, message.content)}
                                        title="Edit prompt"
                                    >
                                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                    </Button>
                                </motion.div>
                            )}
                        </>
                    ) : isErrorMessage ? (
                        <ErrorMessage
                            type={actualErrorType}
                            message={message.content}
                            details={message.errorDetails}
                        />

                    ) : isStreaming && !message.content && !message.thinkingContent ? (

                        <div className="py-2">
                            <div className="flex items-center space-x-2">
                                <motion.div
                                    className="thinking-animation flex items-center space-x-1"
                                    initial={{ opacity: 0.7 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                                >
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={`dot-${i}`}
                                            className="h-2 w-2 bg-neutral-800 dark:bg-neutral-200 rounded-full"
                                            initial={{ y: 0 }}
                                            animate={{
                                                y: [0, -10, 0],
                                                scale: [1, 1.2, 1]
                                            }}
                                            transition={{
                                                duration: 1.2,
                                                repeat: Infinity,
                                                delay: i * 0.2,
                                                ease: "easeInOut"
                                            }}
                                        />
                                    ))}
                                </motion.div>
                                <motion.div
                                    className="thinking-animation-text text-sm text-neutral-600 dark:text-neutral-400 ml-1"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <motion.span
                                        initial={{ opacity: 0.5 }}
                                        animate={{
                                            opacity: [0.5, 1, 0.5],
                                            scale: [1, 1.02, 1]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        Thinking
                                    </motion.span>
                                </motion.div>
                            </div>

                            <motion.div
                                className="thinking-bar mt-2 h-[2px] bg-gradient-to-r from-transparent via-neutral-800 to-transparent dark:via-neutral-200 rounded-full"
                                initial={{ width: "0%", opacity: 0.7 }}
                                animate={{
                                    width: ["0%", "30%", "70%", "100%", "70%", "30%", "0%"],
                                    opacity: [0.5, 0.8, 1, 0.8, 0.5]
                                }}
                                transition={{
                                    duration: 3.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        </div>
                    ) : (

                        <>

                            {(message.thinkingContent || message.isThinkingInProgress) && (
                                <ThinkingCardDisplay
                                    thinkContent={message.thinkingContent || ''}
                                    isThinkingInProgress={!!message.isThinkingInProgress}
                                />
                            )}


                            {isStreaming ? (
                                <TextFadeAnimation
                                    content={message.content}
                                    isStreaming={isStreaming}
                                />
                            ) : (
                                <MarkdownRenderer content={message.content} />
                            )}
                        </>
                    )}

                    {!isUser && !isStreaming && (
                        <InteractionButtons
                            message={message}
                            onRetry={onRetry}
                            isTextToSpeechFeatureEnabled={isTextToSpeechFeatureEnabled}
                            browserTtsSpeed={browserTtsSpeed}
                            selectedBrowserTtsVoiceURI={selectedBrowserTtsVoiceURI}
                        />
                    )}
                </div>


                {isUser && (
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center self-start mt-4 border border-neutral-300 dark:border-neutral-700 overflow-hidden">
                        {userAvatarUrl ? (
                            <Image
                                src={userAvatarUrl}
                                alt="User"
                                width={32}
                                height={32}
                                className="h-full w-full object-cover"
                                unoptimized
                            />
                        ) : (
                            <User className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};
