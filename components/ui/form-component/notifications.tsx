import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { Button } from '../button';
import { KeyRound, AlertCircle } from 'lucide-react';

interface SwitchNotificationProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    isVisible: boolean;
    modelColor?: string;
    notificationType?: 'model' | 'group';
}

// API Key notification for web search
interface ApiKeyNotificationProps {
    isVisible: boolean;
    onAddKey: () => void;
    onDismiss: () => void;
}

export const ApiKeyNotification: React.FC<ApiKeyNotificationProps> = ({ isVisible, onAddKey, onDismiss }) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="fixed bottom-24 left-0 right-0 z-50 mx-auto w-full max-w-md px-4"
                >
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-lg dark:border-amber-800 dark:bg-amber-950/30">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                            <div className="flex-1">
                                <h3 className="mb-1 font-medium text-amber-800 dark:text-amber-300">
                                    Tavily API Key Required
                                </h3>
                                <p className="mb-3 text-sm text-amber-700 dark:text-amber-400">
                                    To use web search, you need to add a Tavily API key in settings.
                                </p>
                                <div className="flex gap-2">
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="border-amber-300 bg-amber-100 hover:bg-amber-200 dark:border-amber-700 dark:bg-amber-900/50 dark:hover:bg-amber-900"
                                        onClick={onAddKey}
                                    >
                                        <KeyRound className="mr-1.5 h-3.5 w-3.5" />
                                        Add API Key
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="text-amber-700 hover:bg-amber-100 hover:text-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/50 dark:hover:text-amber-300"
                                        onClick={onDismiss}
                                    >
                                        Dismiss
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export const SwitchNotification: React.FC<SwitchNotificationProps> = ({ icon, title, description, isVisible, modelColor = 'default', notificationType = 'model' }) => {
    const getIconColorClass = () => "text-white";
    const getModelBgClass = (color: string) => {
        if (color && color !== 'default' && color !== 'gray') {
            if (color === 'purple') return 'bg-indigo-500 border-indigo-500 text-white';
            return 'bg-green-500 border-green-500 text-white';
        }
        return 'bg-neutral-100 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700';
    };
    const useModelColor = notificationType === 'model' && modelColor !== 'default' && modelColor !== 'gray';
    const bgColorClass = useModelColor ? getModelBgClass(modelColor) : "bg-neutral-100 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700";
    const textColorClass = useModelColor ? "text-white" : "text-neutral-900 dark:text-neutral-100";
    const descColorClass = useModelColor ? "text-white/80" : "text-neutral-600 dark:text-neutral-400";

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ opacity: { duration: 0.2 }, height: { duration: 0.2 } }}
                    className={cn("w-[98%] max-w-2xl overflow-hidden mx-auto", "text-sm -mb-1.5")}
                >
                    <div className={cn("flex items-center gap-2 py-2 px-3 sm:py-2.5 sm:px-3.5 rounded-t-lg border shadow-xs backdrop-blur-xs", bgColorClass)}>
                        {icon && (
                            <span className={cn("shrink-0 size-3.5 sm:size-4", useModelColor ? getIconColorClass() : "text-primary")}>
                                {icon}
                            </span>
                        )}
                        <div className="flex flex-col items-start sm:flex-row sm:items-center sm:flex-wrap gap-x-1.5 gap-y-0.5">
                            <span className={cn("font-semibold text-xs sm:text-sm", textColorClass)}>
                                {title}
                            </span>
                            <span className={cn("text-[10px] sm:text-xs leading-tight", descColorClass)}>
                                {description}
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};