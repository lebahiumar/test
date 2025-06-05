// components/error-message.tsx
import React from 'react';
import { ExternalLink, AlertOctagon, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  type: 'rate-limit' | 'plan-restriction' | 'empty-stream' | 'generic';
  message: string;
  details?: any;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  type,
  message,
  details,
  className
}) => {
  // Handler for upgrade button click
  const handleUpgradeClick = () => {
    window.open('https://a4f.co/pricing', '_blank');
  };

  // Different styling for different error types
  const getErrorStyle = () => {
    switch (type) {
      case 'rate-limit':
        return 'border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200';
      case 'plan-restriction':
        return 'border-purple-500 bg-purple-50 text-purple-900 dark:bg-purple-950/30 dark:border-purple-800 dark:text-purple-200';
      case 'empty-stream':
        return 'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-200';
      case 'generic':
      default:
        return 'border-red-500 bg-red-50 text-red-900 dark:bg-red-950/30 dark:border-red-800 dark:text-red-200';
    }
  };

  // Icons for different error types
  const ErrorIcon = () => {
    switch (type) {
      case 'rate-limit':
        return <Clock className="h-5 w-5 text-amber-500 dark:text-amber-400" />;
      case 'plan-restriction':
        return <AlertOctagon className="h-5 w-5 text-purple-500 dark:text-purple-400" />;
      case 'empty-stream':
        return <AlertTriangle className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
      case 'generic':
      default:
        return <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />;
    }
  };

  // Custom titles for each error type
  const getErrorTitle = () => {
    switch (type) {
      case 'rate-limit':
        return 'Rate Limit Exceeded';
      case 'plan-restriction':
        return 'Plan Restriction';
      case 'empty-stream':
        return 'Streaming Error';
      case 'generic':
      default:
        return 'Error';
    }
  };

  // Determine if we should show the upgrade button
  const showUpgradeButton = type === 'rate-limit' || type === 'plan-restriction';

  // Parse duration from rate limit message if available
  const getDurationText = () => {
    if (type === 'rate-limit') {
      if (message.toLowerCase().includes('hour')) {
        return 'for an hour';
      } else if (message.toLowerCase().includes('day')) {
        return 'for a day';
      } else {
        return 'temporarily';
      }
    }
    return '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'p-4 rounded-lg border-2 shadow-sm my-4 flex flex-col gap-3',
        getErrorStyle(),
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-1">
          <ErrorIcon />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-base mb-1">{getErrorTitle()}</h4>
          <div className="text-sm">
            {type === 'rate-limit' ? (
              <p>
                You&apos;ve been rate limited {getDurationText()}. This happens when you&apos;ve reached the 
                maximum number of requests allowed for your current plan.
              </p>
            ) : type === 'plan-restriction' ? (
              <p>
                The selected model is not available on your current plan. 
                Please choose a different model or upgrade to a plan that includes this model.
              </p>
            ) : type === 'empty-stream' ? (
              <p>
                There was an issue with the streaming response. We recommend switching to a 
                different model from provider-4 or provider-5 as they tend to be more stable.
              </p>
            ) : (
              <p>{message}</p>
            )}
          </div>
        </div>
      </div>

      {showUpgradeButton && (
        <div className="mt-1 flex justify-end">
          <Button 
            onClick={handleUpgradeClick}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
            size="sm"
          >
            Upgrade Plan <ExternalLink className="ml-2 h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </motion.div>
  );
};
