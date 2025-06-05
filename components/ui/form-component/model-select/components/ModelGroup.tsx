import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils'; // Changed path
import { ModelUIData } from '@/lib/utils'; // Changed path
import { DropdownMenuItem } from '../../../dropdown-menu';
import { FunctionCallingTag } from './FunctionCallingTag'; // Corrected import if needed
import { EyeIcon, Check, ChevronsUpDown } from 'lucide-react';

interface ModelGroupProps {
  baseModelKey: string;
  modelsInGroup: ModelUIData[];
  selectedModelValue: string;
  expandedProviderGroup: string | null;
  onToggleGroup: (groupKey: string, e?: React.SyntheticEvent | Event) => void;
  onSelectModel: (model: ModelUIData) => void;
  renderIconFn: (model: ModelUIData | undefined, small?: boolean) => React.ReactNode;
  getColorClassesFn: (color: string, isSelected?: boolean, isGroupHeader?: boolean) => string;
  getTagClassFn: (type: 'context' | 'tier' | 'capability' | 'owner' | 'apiProvider') => string | ((plan: 'free' | 'pro') => string);
  tierTagClassFn: (plan: 'free' | 'pro') => string;
  checkFeatureSupportForProviderListFn: (providerModelsList: ModelUIData[], feature: string) => boolean;
  availableModelsFromParent: ModelUIData[];
}

export const ModelGroupDisplay: React.FC<ModelGroupProps> = ({
  baseModelKey,
  modelsInGroup,
  selectedModelValue,
  expandedProviderGroup,
  onToggleGroup,
  onSelectModel,
  renderIconFn,
  getColorClassesFn,
  getTagClassFn,
  tierTagClassFn,
  checkFeatureSupportForProviderListFn,
  availableModelsFromParent,
}) => {
  const representativeModel = modelsInGroup[0];
  const isGroupCurrentlySelectedBase = modelsInGroup.some(m => m.value === selectedModelValue);
  const groupHasFuncCall = checkFeatureSupportForProviderListFn(modelsInGroup, "function_calling");
  const isExpanded = expandedProviderGroup === baseModelKey;

  return (
    <div key={baseModelKey} className="flex flex-col">
      <DropdownMenuItem
        onSelect={(e) => onToggleGroup(baseModelKey, e)}
        className={cn(
          "flex items-start justify-between gap-2 px-1.5 py-1.5 rounded-md text-xs group/item cursor-pointer h-auto",
          isGroupCurrentlySelectedBase ? getColorClassesFn(representativeModel.color, true, true) : getColorClassesFn(representativeModel.color, false, true)
        )}
      >
        <div className="flex items-start gap-2.5">
          <div className={cn(
            "flex items-center justify-center size-7 rounded-md shrink-0 mt-0.5 transition-all duration-300 group-hover/item:scale-110 group-hover/item:rotate-6",
            isGroupCurrentlySelectedBase ? "bg-white/30 dark:bg-black/20" : "bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700/50"
          )}>
            {renderIconFn(representativeModel)}
          </div>
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className={cn(
                "font-medium truncate text-[11px]",
                isGroupCurrentlySelectedBase && (representativeModel.color === 'purple' ? 'text-indigo-700 dark:text-indigo-200' : 'text-green-700 dark:text-green-200')
              )}>
                {representativeModel.label}
              </span>
              {isGroupCurrentlySelectedBase && (<motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-1.5 inline-flex relative top-[-1px] h-1.5 w-1.5 rounded-full bg-green-500" />)}
              <FunctionCallingTag supported={groupHasFuncCall} small={true} />
            </div>
            <div className={cn(
              "text-[9px] opacity-70 truncate leading-tight",
              isGroupCurrentlySelectedBase ? 'text-neutral-500 dark:text-neutral-400' : 'text-neutral-500 dark:text-neutral-400'
            )}>
              {modelsInGroup.length} providers available
            </div>
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              <span className={tierTagClassFn(representativeModel.modelType)}>{representativeModel.modelType.charAt(0).toUpperCase() + representativeModel.modelType.slice(1)}</span>
              <span className={getTagClassFn('context') as string}>{`${Math.round(representativeModel.contextLength / 1000)}k`}</span>
              {representativeModel.features?.includes('vision') && (
                <span className={cn(getTagClassFn('capability') as string)}>
                  <EyeIcon className="size-2.5 mr-0.5" /> Vision
                </span>
              )}
              <span className={getTagClassFn('owner') as string}>{representativeModel.owner}</span>
            </div>
          </div>
        </div>
        <ChevronsUpDown className={cn("h-4 w-4 transition-transform opacity-70 shrink-0 self-center", isExpanded && "rotate-180")} />
      </DropdownMenuItem>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: '0.125rem', marginBottom: '0.125rem' }}
            exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="ml-6 pl-2.5 py-1 space-y-0.5 border-l-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950/50 rounded-r-md mr-1 overflow-hidden"
          >
            {modelsInGroup.map(providerModel => {
              const providerSpecificFuncCall = providerModel.features?.includes("function_calling");
              return (
                <DropdownMenuItem
                  key={providerModel.value}
                  onSelect={() => onSelectModel(providerModel)}
                  className={cn(
                    "flex items-center gap-2 px-1.5 py-1.5 rounded-md text-xs group/subitem cursor-pointer h-auto justify-between",
                    selectedModelValue === providerModel.value ? getColorClassesFn(providerModel.color, true) : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {renderIconFn(availableModelsFromParent.find(m => m.owner === providerModel.owner && m.logoUrl) || providerModel, true)}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className={cn(
                          "text-[10px] font-medium",
                          selectedModelValue === providerModel.value 
                            ? (providerModel.color === 'purple' ? 'text-indigo-700 dark:text-indigo-200' : 'text-green-700 dark:text-green-200') 
                            : (providerModel.color === 'purple' ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-600 dark:text-neutral-300')
                        )}>
                          {providerModel.apiProvider}
                        </span>
                        <FunctionCallingTag supported={!!providerSpecificFuncCall} small={true} />
                      </div>
                      <span className="text-[8px] text-neutral-400 dark:text-neutral-500">via {providerModel.owner}</span>
                    </div>
                  </div>
                  {selectedModelValue === providerModel.value && <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />}
                </DropdownMenuItem>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};