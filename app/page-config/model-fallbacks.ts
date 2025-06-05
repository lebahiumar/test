import { ModelUIData } from '@/lib/utils';
import { Bot } from 'lucide-react';

export const baseFallbackModels: ModelUIData[] = [
    {
      value: "system-provider/default-fallback-free",
      label: "Fallback Model (Free)",
      baseModel: "Fallback Model",
      apiProvider: "system-provider",
      owner: "System",
      icon: Bot,
      logoUrl: undefined,
      description: "Default free model if API is unavailable.",
      modelType: 'free',
      contextLength: 2000,
      features: [],
      color: 'green',
    },
    {
      value: "system-provider/default-fallback-pro",
      label: "Fallback Model (Pro)",
      baseModel: "Fallback Model",
      apiProvider: "system-provider",
      owner: "System",
      icon: Bot,
      logoUrl: undefined,
      description: "Default pro model if API is unavailable.",
      modelType: 'pro',
      contextLength: 4000,
      features: ["vision"],
      color: 'purple',
    },
];

export const fallbackModels: ModelUIData[] = baseFallbackModels;