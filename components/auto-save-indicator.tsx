"use client"

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, RotateCw } from 'lucide-react';

interface AutoSaveIndicatorProps {
  isSaving: boolean;
  isSaved: boolean;
}

const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  isSaving,
  isSaved
}) => {
  return (
    <div className="flex items-center">
      <AnimatePresence mode="wait">
        {isSaving && (
          <motion.div
            key="saving"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="mr-1"
          >
            <RotateCw className="w-3 h-3 text-neutral-500 dark:text-neutral-400 animate-spin" />
          </motion.div>
        )}
        {isSaved && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="mr-1"
          >
            <Check className="w-3 h-3 text-green-500 dark:text-green-400" />
          </motion.div>
        )}
      </AnimatePresence>
      {(isSaving || isSaved) && (
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {isSaving ? 'Saving...' : 'Saved'}
        </span>
      )}
    </div>
  );
};

export default AutoSaveIndicator;
