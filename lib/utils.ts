
// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
// Import icons used as defaults or for specific minimal heuristics/tags
import { Bot, EyeIcon, BrainCircuit } from 'lucide-react';
import React from "react";
// Import icons for SearchGroup
import { Globe, Book, YoutubeIcon as YoutubeLucideIcon, TelescopeIcon, Code as CodeIconLucide } from 'lucide-react';
import { ChatsCircle, Memory } from '@phosphor-icons/react';
import { Image as ImageIcon } from 'lucide-react';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const API_BASE_URL = 'https://api.a4f.co/v1';
// export const API_BASE_URL = 'http://localhost:8000/v1';

export interface SimpleMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
  experimental_attachments?: Attachment[];
  isStreaming?: boolean;
  modelId?: string; // ID of the model used for this message
  isError?: boolean; // Explicitly indicates if this message is an error
  errorType?: 'rate-limit' | 'plan-restriction' | 'empty-stream' | 'generic'; // Type of error if isError is true
  errorDetails?: any; // Optional additional error details
  thinkingContent?: string; // Content found between <think> and </think> tags
  isThinkingInProgress?: boolean; // Flag indicating if currently processing content within <think> block
  thinkingCompleted?: boolean; // Flag indicating if </think> tag has been processed for this message
  isInterrupted?: boolean; // Flag indicating if message generation was stopped by the user

  // Fields for Speed Insights
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  timeToFirstToken?: number; // seconds
  streamDuration?: number; // seconds
  totalInferenceTime?: number; // seconds (timeToFirstToken + streamDuration)
  roundTripTime?: number; // seconds (total time from request sent to full response received)
}

export interface Attachment {
  name: string;
  contentType: string;
  url: string;
  size: number;
}

// Updated ModelUIData interface
export interface ModelUIData {
  value: string; // API model id, e.g., "provider-1/gpt-3.5-turbo"
  label: string; // User-friendly display name for the base model, e.g., "GPT-4o"
  baseModel: string; // The core model name, e.g., "gpt-4o"
  apiProvider: string; // The provider prefix from ID, e.g., "provider-1", "openai"
  owner: string; // The original owner, e.g., "OpenAI", "DeepSeek AI"
  icon: React.ElementType; // Fallback Lucide icon
  logoUrl?: string; // URL for the model's logo (preferably owner's logo)
  description: string; // API model description
  color: string; // Determined by modelType (e.g., 'green' for free, 'purple' for pro)
  features?: string[]; // Array of supported features (e.g., "vision", "function_calling")
  modelType: 'free' | 'pro'; // Tier of the model
  contextLength: number; // API context_window
}

export interface ApiModel {
  id: string; // e.g., "provider-1/gpt-3.5-turbo", "provider-2/claude-3-opus"
  object: "model";
  owned_by: string;
  base_model: string; // e.g., "gpt-3.5-turbo", "claude-3-opus"
  context_window: number;
  type: string;
  logo: string;
  description: string;
  features?: string[];
}

export interface ApiModelListResponse {
  object: "list";
  data: ApiModel[];
}

export interface ApiChatCompletionChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: 'assistant';
      content?: string | null;
      tool_calls?: any;
    };
    finish_reason: string | null;
  }>;
  usage?: { // This field can appear in the LAST chunk if include_usage is true
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
  } | null;
}

// Updated mapping function
export const mapApiModelToUIData = (apiModel: ApiModel, planContext: 'free' | 'pro'): ModelUIData => {
  const modelId = apiModel.id;
  const parts = modelId.split('/');
  const apiProviderPart = parts[0] || "unknown-provider";

  const modelFeatures = apiModel.features || [];

  let fallbackIconElement: React.ElementType = Bot;
  if (modelFeatures.includes('vision')) {
    fallbackIconElement = EyeIcon;
  } else if (modelId.toLowerCase().includes('claude-3-5-sonnet') || modelId.toLowerCase().includes('deepseek-v3')) {
    fallbackIconElement = BrainCircuit;
  }

  // Assign modelType directly from the planContext (passed from app/page.tsx based on API fetch)
  let modelType: 'free' | 'pro' = planContext;

  const modelColor = modelType === 'pro' ? 'purple' : 'green';

  const baseModelName = apiModel.base_model || modelId.substring(modelId.lastIndexOf('/') + 1) || modelId;
  const displayLabel = baseModelName.charAt(0).toUpperCase() + baseModelName.slice(1);

  return {
    value: modelId,
    label: displayLabel,
    baseModel: baseModelName,
    apiProvider: apiProviderPart,
    owner: apiModel.owned_by,
    icon: fallbackIconElement,
    logoUrl: apiModel.logo || undefined,
    description: apiModel.description,
    color: modelColor,
    features: modelFeatures,
    modelType: modelType,
    contextLength: apiModel.context_window,
  };
};

// Search Group UI Data
export type SearchGroupId = 'web' | 'buddy' | 'coder' | 'chat' | 'academic' | 'youtube' | 'image';
export interface SearchGroup {
    id: SearchGroupId;
    name: string;
    description: string;
    icon: React.ElementType;
    show: boolean;
    animationRef?: React.RefObject<any>;
}
export const searchGroups: SearchGroup[] = [
  { id: 'web', name: 'Web', description: 'Standard web search', icon: Globe, show: true, },
  { id: 'buddy', name: 'Buddy', description: 'Your personal memory', icon: Memory, show: true, },
  { id: 'coder', name: 'Coder', description: 'Your AI coding assistant for writing, debugging, and explaining code.', icon: CodeIconLucide, show: true, },
  { id: 'chat', name: 'Chat', description: 'Direct conversation', icon: ChatsCircle, show: true, },
  { id: 'academic', name: 'Academic', description: 'Search papers', icon: Book, show: true, },
  { id: 'youtube', name: 'YouTube', description: 'Search videos', icon: YoutubeLucideIcon, show: true, },
  { id: 'image', name: 'Image', description: 'Generate images from text', icon: ImageIcon, show: true, },
  { id: 'extreme' as any, name: 'Extreme', description: 'Deep research mode', icon: TelescopeIcon, show: false, } // Kept as per original
];

export function formatCurrency(
    amount: number | string | undefined,
    currencyCode: string = 'USD',
    options?: Intl.NumberFormatOptions
): string {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (numericAmount === undefined || isNaN(numericAmount)) {
        return currencyCode === 'USD' ? '$0.00' : `0.00 ${currencyCode}`;
    }

    const defaultOptions: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2, // Always show at least 2 for USD
        maximumFractionDigits: currencyCode === 'USD' ? 2 : 6, // More precision for non-USD potentially token costs
        ...options,
    };

    try {
        return new Intl.NumberFormat('en-US', defaultOptions).format(numericAmount);
    } catch (error) {
        console.warn("Currency formatting error:", error);
        const fallbackValue = numericAmount.toFixed(defaultOptions.minimumFractionDigits);
        return `${currencyCode === 'USD' ? '$' : ''}${fallbackValue} ${currencyCode !== 'USD' ? currencyCode : ''}`.trim();
    }
}

export function formatRelativeTime(dateInput?: string | number | Date): string {
  if (!dateInput) return "N/A";

  let date: Date;
  if (typeof dateInput === 'string') {
    // Attempt to parse common non-ISO format by replacing space with 'T'
    const isoAttempt = dateInput.includes(" ") && !dateInput.includes("T")
        ? dateInput.replace(" ", "T") + (dateInput.endsWith("Z") ? "" : "Z") // Add Z if not present for UTC assumption
        : dateInput;
    date = new Date(isoAttempt);
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) {
    console.warn(`formatRelativeTime: Invalid date input received: ${dateInput}`);
    return "N/A"; // Or "Invalid Date"
  }

  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const weeks = Math.round(days / 7);
  const months = Math.round(days / 30);
  const years = Math.round(days / 365);

  if (seconds < 5) return "just now";
  if (seconds < 60) return `about ${seconds} seconds ago`;
  if (minutes < 60) return `about ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `about ${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `about ${days} day${days > 1 ? 's' : ''} ago`;
  if (weeks < 5) return `about ${weeks} week${weeks > 1 ? 's' : ''} ago`;
  if (months < 12) return `about ${months} month${months > 1 ? 's' : ''} ago`;
  return `about ${years} year${years > 1 ? 's' : ''} ago`;
}

export function formatSimpleDate(dateInput?: string | number | Date): string {
  if (!dateInput) return "N/A";

  let date: Date;
  if (typeof dateInput === 'string') {
    // Attempt to parse common non-ISO format by replacing space with 'T'
    const isoAttempt = dateInput.includes(" ") && !dateInput.includes("T")
        ? dateInput.replace(" ", "T") + (dateInput.endsWith("Z") ? "" : "Z") // Add Z if not present for UTC assumption
        : dateInput;
    date = new Date(isoAttempt);
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) {
    console.warn(`formatSimpleDate: Invalid date input received: ${dateInput}`);
    return "Invalid Date";
  }
  try {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  } catch (e) {
    console.warn(`formatSimpleDate: Error formatting date: ${e}`);
    return "Invalid Date";
  }
}

export interface ChatHistoryEntry {
  id: string;
  title: string;
  timestamp: number;
  messages: SimpleMessage[];
  selectedModel: string;
  selectedGroup: SearchGroupId;
  systemPrompt: string;
  attachments?: Attachment[]; // Optional, if you want to save attachments
}

// Helper to format numbers for speed insights
export const formatSpeedInsightNumber = (num?: number, precision: number = 0): string => {
  if (typeof num === 'undefined' || num === null || isNaN(num)) return "N/A";
  return num.toFixed(precision);
};

