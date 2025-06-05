import { ModelUIData, cn } from '../../../lib/utils';

export const hasVisionSupport = (modelValue: string, models: ModelUIData[]): boolean => {
    const selectedModelData = models.find(model => model.value === modelValue);
    return !!(selectedModelData?.features && selectedModelData.features.includes('vision'));
};

export const getColorClasses = (color: string, isSelected: boolean = false, isGroupHeader: boolean = false) => {
    const baseClasses = "transition-colors duration-200";
    if (isSelected) {
        if (isGroupHeader) {
             return color === "purple"
            ? `${baseClasses} bg-indigo-500/15 dark:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border-indigo-400/50 dark:border-indigo-500/50`
            : `${baseClasses} bg-green-500/15 dark:bg-green-500/25 text-green-700 dark:text-green-300 border-green-400/50 dark:border-green-500/50`;
        }
        return color === "purple"
            ? `${baseClasses} bg-indigo-500/20 dark:bg-indigo-500/30 text-indigo-700 dark:text-indigo-200 border-indigo-500 dark:border-indigo-400`
            : `${baseClasses} bg-green-500/20 dark:bg-green-500/30 text-green-700 dark:text-green-200 border-green-500 dark:border-green-400`;
    }
    return color === "purple"
        ? `${baseClasses} text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50`
        : `${baseClasses} text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60`;
};

export const getTagClass = (type: 'context' | 'tier' | 'capability' | 'owner' | 'apiProvider') => {
    let base = "px-1.5 py-0.5 rounded-full text-[8px] font-semibold border whitespace-nowrap flex items-center gap-0.5 leading-none";
    if (type === 'context') return `${base} bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700`;
    if (type === 'tier') {
        return (plan: 'free' | 'pro') => plan === 'pro'
            ? `${base} bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-700`
            : `${base} bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700`;
    }
    if (type === 'capability') return `${base} bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700`;
    if (type === 'owner') return `${base} bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600`;
    if (type === 'apiProvider') return `${base} bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-300 dark:border-cyan-700`;
    return base;
};