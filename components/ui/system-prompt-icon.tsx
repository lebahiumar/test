// components/ui/system-prompt-icon.tsx
import React from 'react';

interface SystemPromptIconProps {
  className?: string;
  size?: number;
}

const SystemPromptIcon: React.FC<SystemPromptIconProps> = ({ 
  className, 
  size = 14 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M6 8h.01" />
      <path d="M10 8h.01" />
      <path d="M14 8h.01" />
      <path d="M18 8h.01" />
      <path d="M8 12h8" />
      <path d="M8 16h8" />
    </svg>
  );
};

export default SystemPromptIcon;
