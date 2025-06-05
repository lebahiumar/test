// components/api-keys/types.ts
import { ApiKeyType, ApiKeyInfo } from '@/hooks/use-api-keys';

export interface ApiKeyTabProps {
  keyType: ApiKeyType;
  keyInfo: ApiKeyInfo;
  tempKey: string;
  onTempKeyChange: (value: string) => void;
  onSave: (type: ApiKeyType) => void;
  onRemove: (type: ApiKeyType) => void;
}

export interface ApiKeysDialogProps {
  apiKeys: Record<ApiKeyType, ApiKeyInfo>;
  setApiKey: (type: ApiKeyType, key: string | null) => void;
  isKeysLoaded: boolean;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSwitchToWebSearch?: () => void;
}

export interface SimpleApiKeyInputProps {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
  isKeyLoaded: boolean;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}
