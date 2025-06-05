import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils'; 
import { Badge } from '../../../badge';
import { ChevronDown as ChevronDownIcon } from 'lucide-react';
import { FunctionCallingTag } from './FunctionCallingTag'; 
import { ModelUIData } from '@/lib/utils'; 

interface ModelSelectTriggerContentProps {
  modelForTrigger: ModelUIData;
  currentPlan: 'free' | 'pro';
  isOpen: boolean;
  baseModelHasFuncCallForTrigger: boolean;
  renderIconFn: (model: ModelUIData | undefined, small?: boolean) => React.ReactNode;
}

export const ModelSelectTriggerContent: React.FC<ModelSelectTriggerContentProps> = ({
  modelForTrigger,
  currentPlan,
  isOpen,
  baseModelHasFuncCallForTrigger,
  renderIconFn,
}) => {
  return (
    <div className="flex items-center gap-1.5">
      <Badge
        variant={currentPlan === 'free' ? 'secondary' : 'default'}
        className={cn(
          "h-[18px] px-1.5 py-0 text-[10px] font-semibold leading-none",
          currentPlan === 'pro' && "bg-indigo-500 text-white border-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:border-indigo-700",
          currentPlan === 'free' && "bg-green-500 text-white border-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 dark:border-green-700"
        )}
      >
        {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
      </Badge>
      {modelForTrigger.value !== "no-model-available" && renderIconFn(modelForTrigger)}
      <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium overflow-hidden text-ellipsis whitespace-nowrap max-w-[100px] sm:max-w-[150px]">
        {modelForTrigger.label}
      </span>
      <FunctionCallingTag supported={baseModelHasFuncCallForTrigger} small={true} />
      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="opacity-60">
        <ChevronDownIcon className="h-3 w-3" />
      </motion.div>
    </div>
  );
};