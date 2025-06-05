import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import { cn, Attachment } from '../../../lib/utils';
import { UploadingAttachment } from './types';

export const AttachmentPreview: React.FC<{ attachment: Attachment | UploadingAttachment, onRemove: () => void, isUploading: boolean }> = ({ attachment, onRemove, isUploading }) => {
    const formatFileSize = (bytes: number): string => { if (!bytes) return '0 bytes'; if (bytes < 1024) return bytes + ' bytes'; else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'; else return (bytes / 1048576).toFixed(1) + ' MB'; };
    const isUploadingAttachment = (attachment: Attachment | UploadingAttachment): attachment is UploadingAttachment => { return !(attachment as Attachment).url || (attachment as UploadingAttachment).progress !== undefined; };
    const truncateFilename = (filename: string | undefined, maxLength: number = 20) => { if (!filename) return 'file'; if (filename.length <= maxLength) return filename; const extension = filename.split('.').pop(); const name = filename.substring(0, maxLength - 4); return `${name}...${extension || ''}`; };
    
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className={cn(
                "relative flex items-center",
                "bg-white/90 dark:bg-neutral-800/90 backdrop-blur-xs",
                "border border-neutral-200/80 dark:border-neutral-700/80",
                "rounded-2xl p-2 pr-8 gap-2.5",
                "shadow-xs hover:shadow-md",
                "shrink-0 z-0",
                "hover:bg-white dark:hover:bg-neutral-800",
                "transition-all duration-200",
                "group"
            )}
        >
            {isUploading ? (
                <div className="w-8 h-8 flex items-center justify-center">
                    {/* Spinner placeholder, replace with actual spinner if needed */}
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-neutral-500"></div>
                </div>
            ) : isUploadingAttachment(attachment) ? (
                <div className="w-8 h-8 flex items-center justify-center">
                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-neutral-500"></div>
                </div>
            ) : (
                <div className="w-8 h-8 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 shrink-0 ring-1 ring-neutral-200/50 dark:ring-neutral-700/50">
                    <Image
                        src={(attachment as Attachment).url || '/icon.png'}
                        alt={`Preview of ${attachment.name}`}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                            // Type assertion to satisfy TypeScript for currentTarget.src
                            const target = e.target as HTMLImageElement;
                            target.src = '/icon.png';
                         }}
                        unoptimized={true}
                    />
                </div>
            )}
            <div className="grow min-w-0">
                <p className="text-xs font-medium truncate text-neutral-800 dark:text-neutral-200">
                    {truncateFilename(attachment.name)}
                </p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    {isUploading || isUploadingAttachment(attachment) ? 'Processing...' : formatFileSize((attachment as Attachment).size || 0)}
                </p>
            </div>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className={cn(
                    "absolute -top-1.5 -right-1.5 p-0.5 m-0 rounded-full",
                    "bg-white/90 dark:bg-neutral-800/90 backdrop-blur-xs",
                    "border border-neutral-200/80 dark:border-neutral-700/80",
                    "shadow-xs hover:shadow-md",
                    "transition-all duration-200 z-20",
                    "opacity-0 group-hover:opacity-100",
                    "scale-75 group-hover:scale-100",
                    "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                )}
                aria-label="Remove attachment"
            >
                <X className="h-3 w-3 text-neutral-500 dark:text-neutral-400" />
            </motion.button>
        </motion.div>
    );
};
