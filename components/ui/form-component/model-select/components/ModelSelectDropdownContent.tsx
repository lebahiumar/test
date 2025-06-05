import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ModelUIData, Attachment } from '@/lib/utils'; // Removed SimpleMessage as messages prop is removed
import { Input } from '../../../input';
import { Button } from '../../../button';
import { Tabs, TabsList, TabsTrigger } from '../../../tabs';
import { DropdownMenuContent } from '../../../dropdown-menu';
import { Search as SearchIcon, KeyRound, Sparkles, DollarSign } from 'lucide-react';
import { ModelListItemDisplay } from './ModelListItem';
import { ModelGroupDisplay } from './ModelGroup';

interface ModelSelectDropdownContentProps {
  selectedModelValue: string;
  groupedModels: Record<string, ModelUIData[]>;
  currentPlan: 'free' | 'pro';
  onPlanChange: (plan: 'free' | 'pro') => void;
  onSelectModel: (model: ModelUIData) => void;
  isMobile: boolean;
  setIsOpenDropdown: (isOpen: boolean) => void;
  hasAttachments: boolean;
  applicableModels: ModelUIData[];
  checkFeatureSupportForProviderListFn: (providerModelsList: ModelUIData[], feature: string) => boolean;
  availableModelsFromParent: ModelUIData[];
  renderIconFn: (model: ModelUIData | undefined, small?: boolean) => React.ReactNode;
  getColorClassesFn: (color: string, isSelected?: boolean, isGroupHeader?: boolean) => string;
  getTagClassFn: (type: 'context' | 'tier' | 'capability' | 'owner' | 'apiProvider') => string | ((plan: 'free' | 'pro') => string);
  tierTagClassFn: (plan: 'free' | 'pro') => string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchUIVisible: boolean;
  setIsSearchUIVisible: (visible: boolean) => void;
  // messages prop removed
}

export const ModelSelectDropdownContentInternal: React.FC<ModelSelectDropdownContentProps> = ({
  selectedModelValue,
  groupedModels,
  currentPlan,
  onPlanChange,
  onSelectModel,
  isMobile,
  setIsOpenDropdown,
  hasAttachments,
  applicableModels,
  checkFeatureSupportForProviderListFn,
  availableModelsFromParent,
  renderIconFn,
  getColorClassesFn,
  getTagClassFn,
  tierTagClassFn,
  searchQuery,
  setSearchQuery,
  isSearchUIVisible,
  setIsSearchUIVisible,
  // messages prop removed from destructuring
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [expandedProviderGroup, setExpandedProviderGroup] = useState<string | null>(null);

  const handleProviderGroupToggle = (baseModelKey: string, e?: React.SyntheticEvent | Event) => {
    e?.preventDefault();
    e?.stopPropagation();
    setExpandedProviderGroup(prev => (prev === baseModelKey ? null : baseModelKey));
  };

  const handleModelSelectionInternal = (model: ModelUIData) => {
    onSelectModel(model);
    setExpandedProviderGroup(null);
    setIsOpenDropdown(false);
  };

  useEffect(() => {
    if (isSearchUIVisible && searchInputRef.current) {
        setTimeout(() => {
            searchInputRef.current?.focus();
        }, 50);
    }
  }, [isSearchUIVisible]);

  return (
    <DropdownMenuContent
      className="w-[340px] p-0 font-sans rounded-lg bg-white dark:bg-neutral-900 z-[60] shadow-xl border border-neutral-200 dark:border-neutral-800 flex flex-col"
      align="start"
      side={isMobile ? "top" : "bottom"}
      sideOffset={isMobile ? 10 : 6}
      avoidCollisions={true}
      collisionPadding={10}
    >
      <div className="flex items-center justify-between p-1.5 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
        <AnimatePresence mode="wait">
          {isSearchUIVisible ? (
            <motion.div
              key="searchInputContainer"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '100%' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-grow flex items-center gap-1.5 pl-1"
            >
              <SearchIcon className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
              <Input
                key="modelSearchActualInput"
                ref={searchInputRef}
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="h-7 text-xs flex-grow bg-transparent border-0 shadow-none focus-visible:ring-0 px-1 py-0"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 rounded-full"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchUIVisible(false);
                }}
              >
                <KeyRound className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="searchButtonPlaceholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-grow"
            >
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 pl-2">Select Model</span>
            </motion.div>
          )}
        </AnimatePresence>
        {!isSearchUIVisible && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              e.stopPropagation();
              setIsSearchUIVisible(true);
            }}
          >
            <SearchIcon className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Tabs defaultValue="free" value={currentPlan} onValueChange={(value: string) => onPlanChange(value as 'free' | 'pro')} className="w-full flex flex-col flex-grow min-h-0">
        <TabsList className="grid w-full grid-cols-2 h-10 rounded-none bg-neutral-100 dark:bg-neutral-800/50 p-1 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          <TabsTrigger value="free" className="text-xs h-full data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm data-[state=active]:border border-transparent data-[state=active]:border-green-500 dark:data-[state=active]:border-green-600">
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-green-500" /> Free Models
          </TabsTrigger>
          <TabsTrigger value="pro" className={cn("text-xs h-full data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm data-[state=active]:border border-transparent data-[state=active]:border-indigo-500 dark:data-[state=active]:border-indigo-600")}>
            <DollarSign className="mr-1.5 h-3.5 w-3.5 text-indigo-500" /> Pro Models
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent p-1 space-y-0.5 max-h-[var(--form-model-list-max-height,350px)]">
          {Object.entries(groupedModels).length === 0 && (
            <div className="px-2 py-8 text-center text-xs text-neutral-500 dark:text-neutral-400">
              {searchQuery.trim()
                ? "No models match your search."
                : hasAttachments && !applicableModels.some(m => m.features?.includes('vision'))
                  ? "No vision models available for this plan."
                  : `No ${currentPlan} models available.`}
            </div>
          )}
          {Object.entries(groupedModels).map(([baseModelKey, modelsInGroup]) => {
            if (modelsInGroup.length === 1) {
              const model = modelsInGroup[0];
              return (
                <ModelListItemDisplay
                  key={model.value}
                  model={model}
                  selectedModelValue={selectedModelValue}
                  onSelect={handleModelSelectionInternal}
                  renderIconFn={renderIconFn}
                  getColorClassesFn={getColorClassesFn}
                  getTagClassFn={getTagClassFn}
                  tierTagClassFn={tierTagClassFn}
                />
              );
            } else {
              return (
                <ModelGroupDisplay
                  key={baseModelKey}
                  baseModelKey={baseModelKey}
                  modelsInGroup={modelsInGroup}
                  selectedModelValue={selectedModelValue}
                  expandedProviderGroup={expandedProviderGroup}
                  onToggleGroup={handleProviderGroupToggle}
                  onSelectModel={handleModelSelectionInternal}
                  renderIconFn={renderIconFn}
                  getColorClassesFn={getColorClassesFn}
                  getTagClassFn={getTagClassFn}
                  tierTagClassFn={tierTagClassFn}
                  checkFeatureSupportForProviderListFn={checkFeatureSupportForProviderListFn}
                  availableModelsFromParent={availableModelsFromParent}
                />
              );
            }
          })}
        </div>
      </Tabs>
    </DropdownMenuContent>
  );
};