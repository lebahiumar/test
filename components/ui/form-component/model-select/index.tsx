
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { cn, ModelUIData, Attachment } from '@/lib/utils'; // Removed SimpleMessage as messages prop is removed
import { DropdownMenu, DropdownMenuTrigger } from '../../dropdown-menu';
import { Bot, EyeIcon, BrainCircuit } from 'lucide-react';

import { ModelSelectTriggerContent } from './components/ModelSelectTrigger';
import { ModelSelectDropdownContentInternal } from './components/ModelSelectDropdownContent';
import { getColorClasses, getTagClass } from './utils'; // Corrected path

interface ModelSwitcherProps {
    selectedModel: string;
    setSelectedModel: (value: string) => void;
    models: ModelUIData[];
    isProcessing: boolean;
    className?: string;
    attachments?: Attachment[];
    // messages?: SimpleMessage[]; // Prop removed
    onModelSelect?: (model: ModelUIData) => void;
    currentPlan: 'free' | 'pro';
    onPlanChange: (plan: 'free' | 'pro') => void;
    isMobile: boolean;
}

export const ModelSwitcher: React.FC<ModelSwitcherProps> = ({
    selectedModel,
    setSelectedModel,
    models: availableModelsFromParent,
    isProcessing,
    className,
    attachments = [],
    // messages, // Prop removed from destructuring
    onModelSelect,
    currentPlan,
    onPlanChange,
    isMobile
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchUIVisible, setIsSearchUIVisible] = useState(false);

    const hasAttachments = attachments.length > 0;

    const checkFeatureSupportForBaseModel = useCallback((baseModelName: string, feature: string, modelsList: ModelUIData[]): boolean => {
        return modelsList.some(m => m.baseModel === baseModelName && m.features?.includes(feature));
    }, []);

    const checkFeatureSupportForProviderList = useCallback((providerModelsList: ModelUIData[], feature: string): boolean => {
        return providerModelsList.some(m => m.features?.includes(feature));
    }, []);

    const applicableModels = useMemo(() => {
        return availableModelsFromParent
            .filter(model => hasAttachments ? model.features?.includes('vision') === true : true);
    }, [availableModelsFromParent, hasAttachments]);

    const filteredModelsForDisplay = useMemo(() => {
        if (!searchQuery.trim()) {
            return applicableModels;
        }
        const lowerQuery = searchQuery.toLowerCase();
        return applicableModels.filter(model =>
            model.label.toLowerCase().includes(lowerQuery) ||
            model.baseModel.toLowerCase().includes(lowerQuery) ||
            model.owner.toLowerCase().includes(lowerQuery) ||
            model.apiProvider.toLowerCase().includes(lowerQuery) ||
            (model.description && model.description.toLowerCase().includes(lowerQuery))
        );
    }, [applicableModels, searchQuery]);

    const groupedModels = useMemo(() => {
        const groups: Record<string, ModelUIData[]> = {};
        filteredModelsForDisplay.forEach(model => {
            const key = model.baseModel;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(model);
        });
        for (const key in groups) {
            groups[key].sort((a, b) => (a.apiProvider || "").localeCompare(b.apiProvider || ""));
        }
        return groups;
    }, [filteredModelsForDisplay]);

    useEffect(() => {
        const currentSelectedModelData = availableModelsFromParent.find(m => m.value === selectedModel);
        const isCurrentSelectionInvalidForAttachments =
            hasAttachments && (!currentSelectedModelData?.features || !currentSelectedModelData.features.includes('vision'));

        if (isCurrentSelectionInvalidForAttachments) {
            if (applicableModels.length > 0) {
                const previousBaseModel = currentSelectedModelData?.baseModel;
                let newModelToSelect = applicableModels.find(m => m.baseModel === previousBaseModel && m.features?.includes('vision'));
                if (!newModelToSelect) {
                    newModelToSelect = applicableModels.find(m => m.features?.includes('vision'));
                }
                if (!newModelToSelect) {
                    newModelToSelect = applicableModels[0];
                }
                setSelectedModel(newModelToSelect.value);
                if (onModelSelect) onModelSelect(newModelToSelect);
            }
        } else if (!currentSelectedModelData && applicableModels.length > 0) {
            setSelectedModel(applicableModels[0].value);
            if (onModelSelect) onModelSelect(applicableModels[0]);
        }
    }, [currentPlan, hasAttachments, selectedModel, setSelectedModel, onModelSelect, availableModelsFromParent, applicableModels]);

    const modelForTrigger = useMemo(() => {
        return availableModelsFromParent.find(m => m.value === selectedModel) ||
               applicableModels[0] ||
               availableModelsFromParent[0] ||
               ({
                    value: "no-model-available",
                    label: "No Models",
                    baseModel: "No Models",
                    apiProvider: "system",
                    owner: "System",
                    icon: Bot,
                    logoUrl: undefined,
                    description: `No models available for ${currentPlan} plan.`,
                    modelType: currentPlan,
                    color: 'gray',
                    features: [],
                    contextLength: 0,
                } as ModelUIData);
    }, [selectedModel, applicableModels, availableModelsFromParent, currentPlan]);

    const baseModelHasFuncCallForTrigger = useMemo(() => {
        if (modelForTrigger.value === "no-model-available") return false;
        return checkFeatureSupportForBaseModel(modelForTrigger.baseModel, "function_calling", availableModelsFromParent);
    }, [modelForTrigger, availableModelsFromParent, checkFeatureSupportForBaseModel]);

    const renderIcon = (model: ModelUIData | undefined, small: boolean = false) => {
        if (!model) return <Bot className={cn(small ? "size-3.5" : "size-4")} />;
        const sizeClass = small ? "size-3.5" : "size-4";
        if (model.logoUrl) {
            const isSvg = model.logoUrl.endsWith('.svg');
            return <Image
                     src={model.logoUrl}
                     alt={`${model.owner} logo`}
                     width={small ? 14 : 16} 
                     height={small ? 14 : 16}
                     className={cn(sizeClass, "rounded-sm object-contain", isSvg && "themeable-svg-logo")}
                     unoptimized={true}
                   />;
        }
        const IconComponent = model.icon || Bot;
        return <IconComponent className={cn(sizeClass, "transition-all duration-300", !small && "group-hover/item:scale-110 group-hover/item:rotate-12")} />;
    };

    const tierTagClassFn = getTagClass('tier') as (plan: 'free' | 'pro') => string;
    const isTriggerDisabled = isProcessing || !availableModelsFromParent.length;

    const handleActualModelSelection = (model: ModelUIData) => {
        setSelectedModel(model.value);
        if (onModelSelect) onModelSelect(model);
    };

    return (
        <DropdownMenu
            onOpenChange={(openState: boolean) => {
                setIsOpen(openState && !isTriggerDisabled);
                if (!openState) {
                    setIsSearchUIVisible(false);
                    setSearchQuery('');
                }
            }}
            open={isOpen && !isTriggerDisabled}
        >
            <DropdownMenuTrigger
                className={cn(
                    "flex items-center gap-2 p-2 sm:px-3 h-8",
                    "rounded-full transition-all duration-200",
                    "border border-neutral-200 dark:border-neutral-800",
                    "hover:shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700",
                    "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200",
                    isTriggerDisabled && "opacity-50 pointer-events-none",
                    "ring-0 outline-none", "group", className
                )}
                disabled={isTriggerDisabled}
                aria-label={`Selected model plan: ${currentPlan}, Model: ${modelForTrigger.label}`}
            >
                <ModelSelectTriggerContent
                    modelForTrigger={modelForTrigger}
                    currentPlan={currentPlan}
                    isOpen={isOpen}
                    baseModelHasFuncCallForTrigger={baseModelHasFuncCallForTrigger}
                    renderIconFn={renderIcon}
                />
            </DropdownMenuTrigger>
            <ModelSelectDropdownContentInternal
                selectedModelValue={selectedModel}
                groupedModels={groupedModels}
                currentPlan={currentPlan}
                onPlanChange={onPlanChange}
                onSelectModel={handleActualModelSelection}
                isMobile={isMobile}
                setIsOpenDropdown={setIsOpen}
                hasAttachments={hasAttachments}
                applicableModels={applicableModels}
                checkFeatureSupportForProviderListFn={checkFeatureSupportForProviderList}
                availableModelsFromParent={availableModelsFromParent}
                renderIconFn={renderIcon}
                getColorClassesFn={getColorClasses}
                getTagClassFn={getTagClass}
                tierTagClassFn={tierTagClassFn}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isSearchUIVisible={isSearchUIVisible}
                setIsSearchUIVisible={setIsSearchUIVisible}
            />
        </DropdownMenu>
    );
};

