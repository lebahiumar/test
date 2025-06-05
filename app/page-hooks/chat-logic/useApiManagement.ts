import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useApiKey, useApiKeys, ApiKeyType } from '@/hooks/use-api-keys';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { fallbackModels } from '@/app/page-config/model-fallbacks';
import {
    API_BASE_URL,
    ModelUIData,
    mapApiModelToUIData,
    ApiModelListResponse,
    SearchGroupId,
    SearchGroup,
    searchGroups
} from '@/lib/utils';

/**
 * Manages API key, account information, model fetching, and plan state.
 */
export function useApiManagement(
    initialSelectedModelValue: string,
    onModelSelectionChange: (newModelValue: string) => void
) {
  // Original API key hook for backward compatibility
  const [apiKey, setApiKey, isKeyLoaded] = useApiKey();
  
  // New multi-API key system
  const { apiKeys, setApiKey: setApiKeyByType, isKeysLoaded } = useApiKeys();
  
  // Account and model information
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [isAccountLoading, setIsAccountLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState<ModelUIData[]>(fallbackModels);
  
  // Dialog states
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [showSimpleApiKeyInput, setShowSimpleApiKeyInput] = useState(false);
  
  // Plan and model status
  const [currentPlan, setCurrentPlan] = useLocalStorage<'free' | 'pro'>('scira-selected-plan', 'free');
  const [modelFetchingStatus, setModelFetchingStatus] = useState<'ready' | 'processing' | 'error'>('ready');
  const [modelFetchingError, setModelFetchingError] = useState<string | null>(null);
  
  // Helper functions for API key checks
  const isTavilyKeyAvailable = useCallback(() => {
    return !!apiKeys.tavily.key;
  }, [apiKeys.tavily.key]);

  const fetchAccountInfo = useCallback(async () => {
      if (!apiKey) {
          console.log('No API key available, skipping account info fetch');
          setAccountInfo(null);
          setIsAccountLoading(false);
          return;
      }
      console.log('Fetching account information...');
      setIsAccountLoading(true);
      try {
          const response = await fetch(`${API_BASE_URL}/usage`, {
              headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
          });
          console.log('Account info API response status:', response.status);
          if (!response.ok) {
              const errorText = await response.text().catch(() => `HTTP error ${response.status}`);
              throw new Error(`Failed to fetch account information: ${response.status} ${response.statusText}. Server response: ${errorText}`);
          }
          const data = await response.json();
          console.log('Account info received successfully:', data ? 'Data present' : 'No data');
          setAccountInfo(data);
          if (data.account_information?.plan) {
              const planFromApi = data.account_information.plan.toLowerCase();
              console.log('Plan from API:', planFromApi);
              if (planFromApi === 'pro' || planFromApi === 'free' || planFromApi === 'basic') {
                  setCurrentPlan(planFromApi as 'pro' | 'free');
              }
          }
          setTimeout(() => {
              setIsAccountLoading(false);
          }, 100);
      } catch (error) {
          console.error('Error fetching account info:', error);
          setAccountInfo(null);
          setIsAccountLoading(false);
      }
  }, [apiKey, setCurrentPlan]);

  // Handle group selection with API key validation
  const handleGroupSelection = useCallback((group: SearchGroup, selectedGroup: SearchGroupId, setSelectedGroup: (group: SearchGroupId) => void) => {
    // If switching to web search, check if Tavily API key is available
    if (group.id === 'web') {
      if (!isTavilyKeyAvailable()) {
        toast.error('Tavily API key required for web search', {
          description: 'Please add your Tavily API key in the API Keys settings',
          action: {
            label: 'Add Key',
            onClick: () => setIsApiKeyDialogOpen(true)
          }
        });
        return false;
      }
    }
    
    // If all checks pass, update the selected group
    setSelectedGroup(group.id);
    return true;
  }, [isTavilyKeyAvailable, setIsApiKeyDialogOpen]);

  useEffect(() => {
      if (apiKey && isKeyLoaded) {
          fetchAccountInfo();
      } else if (!apiKey && isKeyLoaded) {
          setAccountInfo(null);
          setIsAccountLoading(false);
          setShowSimpleApiKeyInput(true);
      }
  }, [apiKey, isKeyLoaded, fetchAccountInfo]);

  useEffect(() => {
      if (apiKey && isKeyLoaded) {
          const fetchModels = async () => {
              setModelFetchingStatus('processing');
              setModelFetchingError(null);
              try {
                  const modelsUrl = `${API_BASE_URL}/models?plan=${currentPlan}&context_window&type&logo&description`;
                  const response = await fetch(modelsUrl);
                  if (!response.ok) {
                      const errorText = await response.text().catch(() => `HTTP error ${response.status}`);
                      throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}. Server response: ${errorText}`);
                  }
                  const data: ApiModelListResponse = await response.json();
                  let finalModelsFromApi: ModelUIData[] = [];
                  if (data && data.data && data.data.length > 0) {
                      const uiModels = data.data
                         .filter(model => model.id && model.id.includes('/'))
                         .map(apiModel => mapApiModelToUIData(apiModel, currentPlan));
                      finalModelsFromApi = uiModels;
                  }
                  const uniqueApiModels = finalModelsFromApi.filter((model, index, self) =>
                      index === self.findIndex((m) => m.value === model.value)
                  );

                  if (uniqueApiModels.length > 0) {
                      setAvailableModels(uniqueApiModels);
                      const currentSelectedModelData = uniqueApiModels.find(m => m.value === initialSelectedModelValue);
                      if (!currentSelectedModelData && uniqueApiModels.length > 0) {
                          onModelSelectionChange(uniqueApiModels[0].value);
                      }
                  } else {
                      const planFallbacks = fallbackModels.filter(m => m.modelType === currentPlan);
                      const modelsToSet = planFallbacks.length > 0 ? planFallbacks : fallbackModels;
                      setAvailableModels(modelsToSet);
                      const defaultFallbackForPlan = modelsToSet[0]?.value || "system-provider/default-fallback-free";
                      onModelSelectionChange(defaultFallbackForPlan);
                      toast.info(`No models available from the API for the '${currentPlan}' plan. Using default fallback models.`);
                  }
              } catch (error: any) {
                  console.error(`Error fetching models for plan '${currentPlan}':`, error);
                  setModelFetchingError(`Error fetching models: ${error.message}`);
                  toast.error(`Error fetching models: ${error.message}`);
                  const planFallbacksOnError = fallbackModels.filter(m => m.modelType === currentPlan);
                  const modelsToSetOnError = planFallbacksOnError.length > 0 ? planFallbacksOnError : fallbackModels;
                  setAvailableModels(modelsToSetOnError);
                  const defaultFallbackOnError = modelsToSetOnError[0]?.value || "system-provider/default-fallback-free";
                  onModelSelectionChange(defaultFallbackOnError);
              } finally {
                  setModelFetchingStatus('ready');
              }
          };
          fetchModels();
      } else if (isKeyLoaded && !apiKey) {
          const planFallbacksNoKey = fallbackModels.filter(m => m.modelType === currentPlan);
          const modelsToSetNoKey = planFallbacksNoKey.length > 0 ? planFallbacksNoKey : fallbackModels;
          setAvailableModels(modelsToSetNoKey);
          onModelSelectionChange(modelsToSetNoKey[0]?.value || "system-provider/default-fallback-free");
      }
  }, [apiKey, isKeyLoaded, currentPlan, initialSelectedModelValue, onModelSelectionChange]);

  useEffect(() => {
      if (isKeyLoaded && !apiKey) {
          setShowSimpleApiKeyInput(true);
      }
  }, [apiKey, isKeyLoaded]);

  return {
    // Original API key for backward compatibility
    apiKey,
    setApiKey,
    isKeyLoaded,
    
    // New multi-API key system
    apiKeys,
    setApiKeyByType,
    isKeysLoaded,
    
    // Account and model information
    accountInfo,
    isAccountLoading,
    fetchAccountInfo,
    availableModels,
    
    // Dialog states
    isApiKeyDialogOpen,
    setIsApiKeyDialogOpen,
    isAccountDialogOpen,
    setIsAccountDialogOpen,
    showSimpleApiKeyInput,
    setShowSimpleApiKeyInput,
    
    // Plan and model status
    currentPlan,
    setCurrentPlan,
    modelFetchingStatus,
    modelFetchingError,
    
    // Helper functions
    isTavilyKeyAvailable,
    handleGroupSelection
  };
}