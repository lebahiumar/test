import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils'; // Changed path
import { ModelUIData } from '@/lib/utils'; // Changed path
import { DropdownMenuItem } from '../../../dropdown-menu';
import { FunctionCallingTag } from './FunctionCallingTag'; // Corrected import if needed
import { EyeIcon } from 'lucide-react';

interface ModelListItemProps {
  model: ModelUIData;
  selectedModelValue: string;
  onSelect: (model: ModelUIData) => void;
  renderIconFn: (model: ModelUIData | undefined, small?: boolean) => React.ReactNode;
  getColorClassesFn: (color: string, isSelected?: boolean, isGroupHeader?: boolean) => string;
  getTagClassFn: (type: 'context' | 'tier' | 'capability' | 'owner' | 'apiProvider') => string | ((plan: 'free' | 'pro') => string);
  tierTagClassFn: (plan: 'free' | 'pro') => string;
}

export const ModelListItemDisplay: React.FC<ModelListItemProps> = ({
  model,
  selectedModelValue,
  onSelect,
  renderIconFn,
  getColorClassesFn,
  getTagClassFn,
  tierTagClassFn,
}) => {
  const providerSpecificFuncCall = model.features?.includes("function_calling");
  const isSelected = selectedModelValue === model.value;
  return (
    <DropdownMenuItem
      onSelect={() => onSelect(model)}
      className={cn(
        "flex items-start gap-2.5 px-1.5 py-1.5 rounded-md text-xs group/item cursor-pointer h-auto",
        isSelected ? getColorClassesFn(model.color, true) : getColorClassesFn(model.color, false)
      )}
    >
      <div className={cn(
        "flex items-center justify-center size-7 rounded-md shrink-0 mt-0.5 transition-all duration-300 group-hover/item:scale-110 group-hover/item:rotate-6",
        isSelected ? "bg-white/30 dark:bg-black/20" : "bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700/50"
      )}>
        {renderIconFn(model)}
      </div>
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className={cn(
              "font-medium truncate text-[11px]",
              isSelected 
                ? (model.color === 'purple' ? 'text-indigo-700 dark:text-indigo-200' : 'text-green-700 dark:text-green-200') 
                : (model.color === 'purple' ? 'text-indigo-600 dark:text-indigo-300' : 'text-neutral-700 dark:text-neutral-300')
            )}>
              {model.label}
            </span>
            <FunctionCallingTag supported={!!providerSpecificFuncCall} small={true} />
          </div>
          {isSelected && (<motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-1.5 inline-flex relative top-[-1px] h-1.5 w-1.5 rounded-full bg-green-500" />)}
        </div>
        <div className={cn(
          "text-[9px] opacity-90 truncate leading-tight",
          isSelected ? 'text-neutral-500 dark:text-neutral-400' : 'text-neutral-500 dark:text-neutral-400'
        )}>
          {model.owner} ({model.apiProvider})
        </div>
        <div className={cn(
          "text-[9px] opacity-70 truncate leading-tight mt-0.5",
          isSelected ? 'text-neutral-500 dark:text-neutral-400' : 'text-neutral-500 dark:text-neutral-400'
        )}>
          {model.description}
        </div>
        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
          <span className={tierTagClassFn(model.modelType)}>{model.modelType.charAt(0).toUpperCase() + model.modelType.slice(1)}</span>
          <span className={getTagClassFn('context') as string}>{`${Math.round(model.contextLength / 1000)}k`}</span>
          {model.features && model.features.filter((f: string) => f !== "function_calling").map((feature: string) => (
            <span key={feature} className={cn(getTagClassFn('capability') as string)}>
              {feature === 'vision' && <EyeIcon className="size-2.5 mr-0.5" />}
              {feature.charAt(0).toUpperCase() + feature.slice(1)}
            </span>
          ))}
        </div>
      </div>
    </DropdownMenuItem>
  );
};