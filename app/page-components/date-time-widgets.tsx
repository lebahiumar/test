import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarBlank, Clock as PhosphorClock } from '@phosphor-icons/react';

interface DateTimeWidgetsProps {
  status: 'ready' | 'processing' | 'error';
  apiKey: string | null;
  onDateTimeClick: () => void;
}

/**
 * Component to display date and time widgets.
 * Clicking these widgets can trigger an action via `onDateTimeClick`.
 */
export const DateTimeWidgets: React.FC<DateTimeWidgetsProps> = memo(({ status, apiKey, onDateTimeClick }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const timerRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        const now = new Date();
        const delay = 1000 - now.getMilliseconds();
        const timeout = setTimeout(() => {
            setCurrentTime(new Date());
            timerRef.current = setInterval(() => setCurrentTime(new Date()), 1000);
        }, delay);
        return () => {
            clearTimeout(timeout);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const dateFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: timezone });
    const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: timezone });
    const formattedDate = dateFormatter.format(currentTime);
    const formattedTime = timeFormatter.format(currentTime);

    const handleInternalDateTimeClick = useCallback(() => {
        if (status !== 'ready' || !apiKey) return;
        onDateTimeClick();
    }, [status, apiKey, onDateTimeClick]);

    return (
        <div className="mt-8 w-full">
            <div className="flex flex-wrap gap-3 justify-center">
                <Button variant="outline" className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:shadow-xs transition-all h-auto" onClick={handleInternalDateTimeClick} disabled={status === 'processing' || !apiKey}>
                    <PhosphorClock weight="duotone" className="h-5 w-5 text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">{formattedTime}</span>
                </Button>
                <Button variant="outline" className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:shadow-xs transition-all h-auto" onClick={handleInternalDateTimeClick} disabled={status === 'processing' || !apiKey}>
                    <CalendarBlank weight="duotone" className="h-5 w-5 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">{formattedDate}</span>
                </Button>
            </div>
        </div>
    );
});
DateTimeWidgets.displayName = 'DateTimeWidgets';