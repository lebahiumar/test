import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '../../../badge';
import { Plug } from 'lucide-react';

interface FunctionCallingTagProps {
    supported: boolean;
    small?: boolean;
}

export const FunctionCallingTag: React.FC<FunctionCallingTagProps> = ({ supported, small = false }) => {
    if (!supported) return null;
    return (
        <Badge
            variant="outline"
            className={cn(
                "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
                small ? "px-1 py-0 text-[7px] h-[14px]" : "px-1.5 py-0.5 text-[8px] h-[16px]",
                "font-semibold leading-none flex items-center gap-0.5 whitespace-nowrap"
            )}
        >
            <Plug className={cn(small ? "size-2" : "size-2.5")} />
            Fn Call
        </Badge>
    );
};