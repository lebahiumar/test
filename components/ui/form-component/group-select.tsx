
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { cn, SearchGroupId, SearchGroup } from '../../../lib/utils'; // Updated path
import useWindowSize from '../../../hooks/use-window-size';
import { toast } from 'sonner';

interface GroupSelectorProps {
    selectedGroup: SearchGroupId;
    onGroupSelect: (group: SearchGroup) => void; // Changed to pass full SearchGroup object
    status: 'ready' | 'processing' | 'error';
    onExpandChange?: React.Dispatch<React.SetStateAction<boolean>>;
    availableGroups: SearchGroup[]; // New prop for filtered groups
}

interface ToolbarButtonProps {
    group: SearchGroup;
    isSelected: boolean;
    onClick: () => void;
}

interface SelectionContentProps {
    selectedGroup: SearchGroupId;
    onGroupSelect: (group: SearchGroup) => void; // Changed to pass full SearchGroup object
    status: 'ready' | 'processing' | 'error';
    onExpandChange?: React.Dispatch<React.SetStateAction<boolean>>;
    availableGroups: SearchGroup[]; // New prop
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ group, isSelected, onClick }) => {
    const Icon = group.icon;
    const controls = useAnimation();
    
    const commonClassNames = cn(
        "relative flex items-center justify-center",
        "size-8", // Ensures button size is consistent
        "rounded-full",
        "transition-colors duration-300",
        isSelected ? "bg-neutral-500 dark:bg-neutral-600 text-white dark:text-neutral-300" : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80"
    );
    
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
    };
    
    return (
        <motion.button
            animate={controls}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClick}
            className={commonClassNames}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label={group.name}
            data-group-id={group.id}
        >
            <Icon className="size-4" />
        </motion.button>
    );
};

const SelectionContent: React.FC<SelectionContentProps> = ({ selectedGroup, onGroupSelect, status, onExpandChange, availableGroups }) => {
    const [localIsExpandedForMobile, setLocalIsExpandedForMobile] = useState(false);
    const [localIsHoveredDesktop, setLocalIsHoveredDesktop] = useState(false);
    const isProcessing = status === 'processing';
    const { width } = useWindowSize();
    const isMobile = width ? width < 768 : false;

    const isEffectivelyExpanded = useMemo(() => {
        return isMobile ? localIsExpandedForMobile : localIsHoveredDesktop;
    }, [isMobile, localIsExpandedForMobile, localIsHoveredDesktop]);

    useEffect(() => {
        if (onExpandChange) {
            onExpandChange(isEffectivelyExpanded);
        }
    }, [isEffectivelyExpanded, onExpandChange]);

    const handleMobileToggleExpand = () => {
        if (isMobile && !isProcessing) setLocalIsExpandedForMobile(prev => !prev);
    };

    const handleDesktopMouseEnter = () => {
        if (!isMobile && !isProcessing) setLocalIsHoveredDesktop(true);
    };
    const handleDesktopMouseLeave = () => {
        if (!isMobile && !isProcessing) setLocalIsHoveredDesktop(false);
    };

    const handleSelectGroup = useCallback((group: SearchGroup) => {
        onGroupSelect(group);
        if (isMobile) {
            setLocalIsExpandedForMobile(false);
        } else {
            setLocalIsHoveredDesktop(false); // Collapse on desktop after selection
        }
    }, [onGroupSelect, isMobile]);


    const visibleGroups = useMemo(() => {
        if (isEffectivelyExpanded) {
            return availableGroups; // Show all enabled groups when expanded
        } else { // Collapsed state
            const currentSelectedGroupObject = availableGroups.find(g => g.id === selectedGroup);
            // If current selected is not available (e.g. was disabled), default to the first available, or empty
            return currentSelectedGroupObject ? [currentSelectedGroupObject] : 
                   (availableGroups.length > 0 ? [availableGroups[0]] : []);
        }
    }, [availableGroups, isEffectivelyExpanded, selectedGroup]);


    if (availableGroups.length === 0 && !selectedGroup) { // Adjusted condition
        return (
            <div className="inline-flex items-center justify-center size-9 p-0.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs text-xs text-muted-foreground">
                N/A
            </div>
        );
    }

    return (
        <motion.div
            layout="position" 
            initial={false}
            animate={{
                width: 'auto', // Let content define width
                gap: !isEffectivelyExpanded ? 0 : (isProcessing ? '0.25rem' :'0.5rem'),
                paddingRight: !isEffectivelyExpanded ? 0 : (isProcessing ? '0.2rem' : '0.4rem'),
            }}
            transition={{
                duration: 0.2,
                ease: 'easeInOut',
            }}
            className={cn(
                'inline-flex items-center min-w-[38px] p-0.5',
                'rounded-full border border-neutral-200 dark:border-neutral-800',
                'bg-white dark:bg-neutral-900 shadow-xs overflow-visible',
                'relative z-10',
                isProcessing && 'opacity-50 pointer-events-none',
                isMobile && localIsExpandedForMobile && 'overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700',
                (isMobile && !localIsExpandedForMobile) && 'overflow-hidden' 
            )}
            onMouseEnter={handleDesktopMouseEnter}
            onMouseLeave={handleDesktopMouseLeave}
        >
            <AnimatePresence initial={false} mode="popLayout">
                {visibleGroups.map((group) => {
                    return (
                        <motion.div
                            key={group.id}
                            layout // Enable layout animation for individual buttons
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.7 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className={cn('m-0!')} 
                        >
                            <ToolbarButton
                                group={group}
                                isSelected={selectedGroup === group.id}
                                onClick={() => {
                                    if (isMobile) {
                                        if (!localIsExpandedForMobile && group.id === selectedGroup) {
                                            handleMobileToggleExpand(); // Expand if mobile, collapsed, and clicked selected
                                        } else {
                                            handleSelectGroup(group); // Select and collapse if mobile & expanded
                                        }
                                    } else { // Desktop
                                        handleSelectGroup(group); // Always select and collapse on desktop click
                                    }
                                }}
                            />
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </motion.div>
    );
};

export const GroupSelector: React.FC<GroupSelectorProps> = ({ selectedGroup, onGroupSelect, status, onExpandChange, availableGroups }) => {
    return (
        <SelectionContent
            selectedGroup={selectedGroup}
            onGroupSelect={onGroupSelect}
            status={status}
            onExpandChange={onExpandChange}
            availableGroups={availableGroups}
        />
    );
};

