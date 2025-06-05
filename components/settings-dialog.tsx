// components/settings-dialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ApiKeyType, ApiKeyInfo } from '@/hooks/use-api-keys';
import { SearchGroupId, searchGroups as allSearchGroupsConfig, cn, formatCurrency, formatRelativeTime, formatSimpleDate } from '@/lib/utils';
import { 
    User, KeyRound, Palette, Settings, Brain, Mic, MessageSquareText, 
    Copy, Check, BarChart2, ExternalLink, Settings2 as SettingsIconLucide, Layers, Briefcase, Info, AlertTriangle, Package, Tag, ShieldCheck, Percent, ListChecks, Coffee, XIcon,
    Volume2, RadioTower, LogOut, Save, UploadCloud
} from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

// Types from AccountDialog
interface AccountInfoForDisplay {
  account_information?: {
    username?: string;
    github_info?: {
      github_username_from_auth?: string;
      email_from_auth?: string;
      avatar_url?: string;
      supabase_user_id?: string;
    };
    api_key?: string;
    api_key_name?: string;
    node_id?: string;
    is_enabled?: boolean;
    current_plan?: string;
    model_specific_usage?: Record<string, any>;
  };
  subscription_details?: {
    creation_date?: string;
    effective_days_remaining?: number;
    plan_activation_history?: Array<{ plan: string; activated_at: string }>;
  };
  usage_statistics?: {
    overall_request_counts?: { total?: number; streaming_chat?: number };
    token_consumption?: { combined_chat_tokens?: { input_tokens?: number; output_tokens?: number; total_tokens?: number } };
  };
  billing_information?: {
    total_amount_paid_usd?: number;
    cumulative_token_cost_usd?: number;
  };
  rate_limits_and_restrictions?: {
    requests_per_minute_limit?: number;
    requests_per_day_limit?: number;
  };
}


// Props for SettingsDialog (combination of old dialogs' props)
interface SettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  
  // Account props
  accountInfo: AccountInfoForDisplay | null;
  isAccountLoading: boolean;
  onRefreshAccount: () => void;
  onLogoutAndReset: () => void; // New prop for logout

  // API Keys props
  apiKeys: Record<ApiKeyType, ApiKeyInfo>;
  setApiKey: (type: ApiKeyType, key: string | null) => void;
  isKeysLoaded: boolean;
  onSwitchToWebSearch?: () => void;

  // Customization props
  isChatHistoryFeatureEnabled: boolean;
  onToggleChatHistoryFeature: (enabled: boolean) => void;
  isTextToSpeechFeatureEnabled: boolean;
  onToggleTextToSpeechFeature: (enabled: boolean) => void;
  isSystemPromptButtonEnabled: boolean;
  onToggleSystemPromptButton: (enabled: boolean) => void;
  isAttachmentButtonEnabled: boolean;
  onToggleAttachmentButton: (enabled: boolean) => void;
  isSpeechToTextEnabled: boolean; // Added this prop
  onToggleSpeechToTextEnabled: (enabled: boolean) => void; // Added this prop
  enabledSearchGroupIds: SearchGroupId[];
  onToggleSearchGroup: (groupId: SearchGroupId) => void;
  elevenLabsApiKey: string | null;
  onSetElevenLabsApiKey: (key: string | null) => void;
  ttsProvider: 'browser' | 'elevenlabs';
  onSetTtsProvider: (provider: 'browser' | 'elevenlabs') => void;
  browserTtsSpeed: number;
  onSetBrowserTtsSpeed: (speed: number) => void;
  availableBrowserVoices: SpeechSynthesisVoice[];
  selectedBrowserTtsVoiceURI: string | undefined;
  onSetSelectedBrowserTtsVoiceURI: (uri: string | undefined) => void;
}

// Helper components from AccountDialog
const DashboardCard: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string, titleExtra?: React.ReactNode }> = 
({ title, icon, children, className, titleExtra }) => (
    <div className={cn("bg-card dark:bg-[oklch(0.14_0.02_240)] p-4 sm:p-5 rounded-xl border border-border dark:border-[oklch(0.25_0.02_240)] shadow-md overflow-hidden", className)}>
        <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
                {icon && <span className="mr-2 text-primary dark:text-primary-light">{icon}</span>}
                <h3 className="text-sm font-semibold text-foreground dark:text-neutral-100 tracking-tight">{title}</h3>
            </div>
            {titleExtra && <div className="text-xs text-muted-foreground dark:text-neutral-500">{titleExtra}</div>}
        </div>
        {children}
    </div>
);

const InfoRow: React.FC<{ 
    label: string; 
    value?: string | number | React.ReactNode; 
    valueClassName?: string; 
    statusType?: 'active' | 'unknown' | 'inactive' | 'custom';
    customStatusClasses?: string;
}> = ({ label, value, valueClassName, statusType, customStatusClasses }) => {
    let statusBadgeClasses = "";
    if (statusType) {
        switch (statusType) {
            case 'active': statusBadgeClasses = "bg-[var(--status-active-bg-light)] text-[var(--status-active-text-light)] dark:bg-[var(--status-active-bg-dark)] dark:text-[var(--status-active-text-dark)] border-transparent"; break;
            case 'unknown': statusBadgeClasses = "bg-[var(--status-unknown-bg-light)] text-[var(--status-unknown-text-light)] dark:bg-[var(--status-unknown-bg-dark)] dark:text-[var(--status-unknown-text-dark)] border-transparent"; break;
            case 'inactive': statusBadgeClasses = "bg-[var(--status-loss-bg-light)] text-[var(--status-loss-text-light)] dark:bg-[var(--status-loss-bg-dark)] dark:text-[var(--status-loss-text-dark)] border-transparent"; break;
            case 'custom': statusBadgeClasses = customStatusClasses || "bg-muted text-muted-foreground dark:bg-neutral-700 dark:text-neutral-200"; break;
        }
    }
    return (
        <div className="flex justify-between items-center py-1 text-xs">
            <span className="text-muted-foreground dark:text-neutral-400">{label}:</span>
            {statusType ? <Badge variant="outline" className={cn("px-1.5 py-0.5 text-[10px] font-medium leading-tight rounded", statusBadgeClasses)}>{value}</Badge>
             : <span className={cn("font-medium text-foreground dark:text-neutral-100 text-right", valueClassName)}>{value ?? 'N/A'}</span>}
        </div>
    );
};
// End AccountDialog helpers


const getGroupIcon = (groupId: SearchGroupId): React.ElementType => {
    const groupConfig = allSearchGroupsConfig.find(g => g.id === groupId);
    return groupConfig?.icon || Settings;
};

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onOpenChange,
  accountInfo,
  isAccountLoading,
  onRefreshAccount,
  onLogoutAndReset,
  apiKeys,
  setApiKey,
  isKeysLoaded,
  onSwitchToWebSearch,
  isChatHistoryFeatureEnabled,
  onToggleChatHistoryFeature,
  isTextToSpeechFeatureEnabled,
  onToggleTextToSpeechFeature,
  isSystemPromptButtonEnabled,
  onToggleSystemPromptButton,
  isAttachmentButtonEnabled,
  onToggleAttachmentButton,
  isSpeechToTextEnabled, // Destructure new prop
  onToggleSpeechToTextEnabled, // Destructure new prop
  enabledSearchGroupIds,
  onToggleSearchGroup,
  elevenLabsApiKey,
  onSetElevenLabsApiKey,
  ttsProvider,
  onSetTtsProvider,
  browserTtsSpeed,
  onSetBrowserTtsSpeed,
  availableBrowserVoices,
  selectedBrowserTtsVoiceURI,
  onSetSelectedBrowserTtsVoiceURI,
}) => {
  const [activeTab, setActiveTab] = useState('account');
  
  // For API Keys tab
  const [a4fTempKey, setA4fTempKey] = useState('');
  const [tavilyTempKey, setTavilyTempKey] = useState('');
  
  // For Customization tab (ElevenLabs Key)
  const [tempElevenLabsKey, setTempElevenLabsKey] = useState(elevenLabsApiKey || '');

  useEffect(() => {
    if (isOpen) {
      onRefreshAccount(); 
      setTempElevenLabsKey(elevenLabsApiKey || ''); 
    } else {
      setA4fTempKey('');
      setTavilyTempKey('');
    }
  }, [isOpen, onRefreshAccount, elevenLabsApiKey]);


  // --- Account Tab Content ---
  const accInfo = accountInfo?.account_information;
  const subDetails = accountInfo?.subscription_details;
  const usageStats = accountInfo?.usage_statistics;
  const billingInfo = accountInfo?.billing_information;
  const rateLimits = accountInfo?.rate_limits_and_restrictions;
  const [copiedKey, setCopiedKey] = React.useState(false);

  const copyApiKey = (keyToCopy?: string) => {
    const actualKey = keyToCopy || accInfo?.api_key;
    if (actualKey) { navigator.clipboard.writeText(actualKey); setCopiedKey(true); toast.success("API Key copied"); setTimeout(() => setCopiedKey(false), 2000); }
  };
  const formatPlanName = (plan: string | undefined) => { if (!plan) return 'N/A'; const lp = plan.toLowerCase(); if (lp === 'pro') return 'Professional'; if (lp === 'basic') return 'Basic'; if (lp === 'free') return 'Free'; return plan.charAt(0).toUpperCase() + plan.slice(1); };
  const getMaskedApiKey = (key?: string) => { if (!key || key.length < 10) return key || "N/A"; return `${key.substring(0, 3)}••••••••${key.substring(key.length - 6)}`; };
  const maxLastUsedTimestamp = React.useMemo(() => { if (!accInfo?.model_specific_usage) return null; const ts = Object.values(accInfo.model_specific_usage).map((u: any) => u.last_used).filter(t => typeof t === 'number' && t > 0); if (ts.length === 0) return null; return Math.max(...ts) * 1000; }, [accInfo]);
  const topModels = React.useMemo(() => { if (!accInfo?.model_specific_usage) return []; const u = accInfo.model_specific_usage; return Object.entries(u).map(([id, d]: [string, any]) => ({ id, r: d.total_requests || 0, s: d.successful_requests || 0, c: d.token_cost_usd || 0, lu: d.last_used && d.last_used > 0 ? new Date(d.last_used * 1000) : null, it: d.input_tokens || 0, ot: d.output_tokens || 0 })).sort((a, b) => b.r - a.r).slice(0, 5); }, [accInfo]);
  let apiKeyStatusString = "Unknown"; let apiKeyStatusType: 'active' | 'unknown' | 'inactive' = 'unknown'; if (accInfo && typeof accInfo.is_enabled !== 'undefined') { if (accInfo.is_enabled) { apiKeyStatusString = "Active"; apiKeyStatusType = 'active'; } else { apiKeyStatusString = "Inactive"; apiKeyStatusType = 'inactive'; } }

  const renderAccountSkeleton = () => ( <div className="p-4 sm:p-5 space-y-4 sm:space-y-5"> <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5"> <div className="lg:col-span-1 bg-card dark:bg-[oklch(0.22_0.03_240)] p-4 sm:p-5 rounded-xl border border-border dark:border-[oklch(0.2_0.01_240)] shadow-md"> <Skeleton className="h-5 w-3/5 mb-3" /> <div className="space-y-2.5">{[...Array(4)].map((_, i) => <Skeleton key={`info-skel-${i}`} className="h-4 w-full" />)}</div> </div> <div className="lg:col-span-2 bg-card dark:bg-[oklch(0.22_0.03_240)] p-4 sm:p-5 rounded-xl border border-border dark:border-[oklch(0.2_0.01_240)] shadow-md flex items-center"> <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-full mr-3 sm:mr-4" /> <div className="flex-1 space-y-2"> <Skeleton className="h-6 w-3/5" /> <Skeleton className="h-4 w-4/5" /> <Skeleton className="h-4 w-2/5 mt-1" /> </div> </div> </div> <div className="bg-card dark:bg-[oklch(0.22_0.03_240)] p-4 sm:p-5 rounded-xl border border-border dark:border-[oklch(0.2_0.01_240)] shadow-md"> <Skeleton className="h-5 w-1/4 mb-4" /> <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={`plan-detail-skel-${i}`} className="h-8 w-full" />)}</div> </div> {[...Array(2)].map((_, rI) => ( <div key={`skel-row-${rI}`} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"> {[...Array(2)].map((_, cI) => ( <div key={`skel-card-${rI}-${cI}`} className="bg-card dark:bg-[oklch(0.22_0.03_240)] p-4 sm:p-5 rounded-xl border border-border dark:border-[oklch(0.2_0.01_240)] shadow-md"> <Skeleton className="h-5 w-1/2 mb-3" /> <div className="space-y-2.5">{[...Array(cI === 0 && rI === 0 ? 5 : (cI === 1 && rI === 0 ? 3 : (rI === 1 && cI === 0 ? 5 : 2)))].map((_, j) => <Skeleton key={`inner-skel-${rI}-${cI}-${j}`} className="h-4 w-full" />)} { (cI === 1 && rI === 0 ) && <Skeleton className="h-8 w-full mt-3"/> } { (rI === 1 && cI === 1) && <> <Skeleton className="h-8 w-full mt-3"/> <Skeleton className="h-8 w-full mt-2"/> </> } </div> </div> ))} </div> ))} </div> );
  // --- End Account Tab Content ---

  // --- API Keys Tab Content Helpers ---
  const handleSaveApiKey = (type: ApiKeyType) => {
    const keyToSave = type === 'a4f' ? a4fTempKey : tavilyTempKey;
    if (keyToSave.trim()) {
      setApiKey(type, keyToSave.trim());
      if (type === 'a4f') setA4fTempKey(''); else setTavilyTempKey('');
      toast.dismiss();
      toast.success(`${apiKeys[type].name} saved`, { description: type === 'a4f' ? "Fetching account..." : "Web search available." });
    }
  };
  const handleRemoveApiKey = (type: ApiKeyType) => {
    setApiKey(type, null);
    if (type === 'a4f') setA4fTempKey(''); else setTavilyTempKey('');
    toast.dismiss();
    toast.info(`${apiKeys[type].name} removed`, { description: type === 'a4f' ? "Provide key to use chat." : "Web search disabled." });
    if (type === 'tavily' && onSwitchToWebSearch) { 
        // This might need adjustment based on exact desired behavior if removing Tavily key should auto-switch away from web.
    }
  };
  // --- End API Keys Tab Content Helpers ---

  // --- Customization Tab Content Helpers ---
  const handleSaveElevenLabsKey = () => { onSetElevenLabsApiKey(tempElevenLabsKey.trim() || null); toast.success("ElevenLabs API Key updated."); };
  const handleRemoveElevenLabsKey = () => { onSetElevenLabsApiKey(null); setTempElevenLabsKey(''); toast.info("ElevenLabs API Key removed."); };
  // --- End Customization Tab Content Helpers ---

  const handleLogoutConfirmed = () => {
    if (window.confirm("Are you sure you want to logout and reset all settings? This action cannot be undone.")) {
      onLogoutAndReset();
      onOpenChange(false); // Close dialog after reset
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl w-[95vw] max-h-[90vh] p-0 gap-0 bg-background dark:bg-[oklch(0.09_0.01_240)] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <DialogHeader className="px-4 sm:px-5 py-3 border-b border-border dark:border-[oklch(0.18_0.015_240)] flex flex-row justify-between items-center sticky top-0 bg-background dark:bg-[oklch(0.09_0.01_240)] z-10 shrink-0">
          <DialogTitle className="text-md font-semibold text-foreground dark:text-neutral-50 flex items-center">
            <SettingsIconLucide size={18} className="mr-2 text-muted-foreground" /> Settings
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-7 w-7 rounded-full text-muted-foreground hover:bg-secondary">
             <XIcon className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-4 mt-3 grid w-auto grid-cols-3 gap-1 p-1 h-auto rounded-lg bg-muted dark:bg-neutral-800 shrink-0">
            <TabsTrigger value="account" className="text-xs sm:text-sm data-[state=active]:shadow-sm"><User size={14} className="mr-1.5 hidden sm:inline"/>Account</TabsTrigger>
            <TabsTrigger value="apiKeys" className="text-xs sm:text-sm data-[state=active]:shadow-sm"><KeyRound size={14} className="mr-1.5 hidden sm:inline"/>API Keys</TabsTrigger>
            <TabsTrigger value="customization" className="text-xs sm:text-sm data-[state=active]:shadow-sm"><Palette size={14} className="mr-1.5 hidden sm:inline"/>Customize</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="flex-1 outline-none overflow-y-auto dialog-custom-scrollbar">
            <div className="p-4 sm:p-6">
              {isAccountLoading && !accountInfo ? renderAccountSkeleton() : accountInfo ? (
                <div className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-5 overflow-hidden">
                      <DashboardCard title="Account Overview" icon={<Info size={14} className="text-muted-foreground dark:text-neutral-400"/>} className="md:col-span-2" titleExtra={<span className="text-[10px] text-muted-foreground dark:text-neutral-500">Last Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>}>
                          <div className="space-y-1 text-xs"> <InfoRow label="Service" value="A4F API Services" /> <InfoRow label="Node ID" value={accInfo?.node_id} /> <InfoRow label="Account Status" value={accInfo?.is_enabled ? "Enabled" : "Disabled"} statusType={accInfo?.is_enabled ? 'active' : 'inactive'} /> <InfoRow label="Current Plan" value={formatPlanName(accInfo?.current_plan)} valueClassName="text-primary dark:text-[#80c9ff]" /> <InfoRow label="Plan Validity" value={subDetails?.effective_days_remaining !== undefined ? `${subDetails.effective_days_remaining} days left` : 'N/A'} /> </div>
                      </DashboardCard>
                      <DashboardCard title="" className="md:col-span-3 !p-0 overflow-hidden">
                          <div className="flex flex-col sm:flex-row items-center h-full overflow-hidden"> <div className="p-4 pt-3 sm:p-5 flex-shrink-0"> {(accInfo?.github_info?.avatar_url && accInfo.github_info.avatar_url.trim() !== '') ? <Image src={accInfo.github_info.avatar_url} alt="Profile" width={64} height={64} className="rounded-full object-cover border-2 border-border dark:border-[oklch(0.28_0.025_240)] shadow-sm" unoptimized={true} /> : <div className="h-16 w-16 rounded-full bg-muted dark:bg-[oklch(0.17_0.025_240)] flex items-center justify-center border border-border dark:border-[oklch(0.2_0.01_240)]"><User className="h-7 w-7 text-muted-foreground dark:text-neutral-400" /></div>} </div> <div className="flex-1 p-4 pt-0 sm:pt-4 sm:p-5 sm:pl-0 text-center sm:text-left overflow-hidden"> <h3 className="text-base font-semibold text-foreground dark:text-neutral-50 break-all overflow-hidden text-ellipsis">{accInfo?.username || accInfo?.github_info?.github_username_from_auth || 'User'}</h3> {accInfo?.github_info?.email_from_auth && <p className="text-xs text-muted-foreground dark:text-neutral-300 break-all mt-0.5 overflow-hidden text-ellipsis">{accInfo.github_info.email_from_auth}</p>} <p className="text-[11px] text-muted-foreground dark:text-neutral-500 mt-1 overflow-hidden text-ellipsis">Member Since: {formatSimpleDate(subDetails?.creation_date)}</p> {accInfo?.github_info?.supabase_user_id && <div className="mt-2 text-[10px] bg-neutral-100 dark:bg-[oklch(0.17_0.015_240)] p-1.5 rounded-sm overflow-hidden"> <div className="text-muted-foreground dark:text-neutral-400">Supabase ID:</div> <div className="text-neutral-700 dark:text-neutral-200 font-mono truncate">{accInfo.github_info.supabase_user_id}</div> </div>} </div> </div>
                      </DashboardCard>
                  </div>
                  <DashboardCard title="Plan Details" icon={<Tag size={14} className="text-muted-foreground dark:text-neutral-400"/>}> <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-2 text-xs overflow-hidden"> <div className="flex items-center flex-wrap"><span className="text-muted-foreground dark:text-neutral-400 mr-1.5">Current Plan:</span> <span className="font-semibold text-primary dark:text-[#80c9ff]">{formatPlanName(accInfo?.current_plan)}</span></div> <div className="flex items-center"><span className="text-muted-foreground dark:text-neutral-400 mr-1.5">Plan Validity:</span> <span className="font-semibold text-foreground dark:text-neutral-100">{subDetails?.effective_days_remaining !== undefined ? `${subDetails.effective_days_remaining} days left` : 'N/A'}</span></div> <div className="flex items-center"><span className="text-muted-foreground dark:text-neutral-400 mr-1.5">Total Payments:</span> <span className="font-semibold text-foreground dark:text-neutral-100">{formatCurrency(billingInfo?.total_amount_paid_usd, 'USD')}</span></div> <div className="flex items-center"><span className="text-muted-foreground dark:text-neutral-400 mr-1.5">Last Plan Change:</span> <span className="font-semibold text-foreground dark:text-neutral-100">{Array.isArray(subDetails?.plan_activation_history) && subDetails.plan_activation_history.length > 0 ? `${formatPlanName(subDetails.plan_activation_history[subDetails.plan_activation_history.length-1].plan)} on ${formatSimpleDate(subDetails.plan_activation_history[subDetails.plan_activation_history.length-1].activated_at)}` : 'N/A'}</span></div> </div> </DashboardCard>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 overflow-hidden">
                      <DashboardCard title="Usage Statistics" icon={<BarChart2 size={14} className="text-muted-foreground dark:text-neutral-400"/>} titleExtra="Your recent API activity."> <div className="space-y-0.5 text-xs"> <InfoRow label="Total Requests" value={usageStats?.overall_request_counts?.total?.toLocaleString()} /> <InfoRow label="Streaming Reqs" value={`${usageStats?.overall_request_counts?.streaming_chat || 0} (${usageStats?.overall_request_counts?.streaming_chat && usageStats?.overall_request_counts?.total && usageStats?.overall_request_counts?.total > 0 ? Math.round((usageStats.overall_request_counts.streaming_chat / usageStats.overall_request_counts.total) * 100) : 0}%)`} /> <InfoRow label="Input Tokens" value={usageStats?.token_consumption?.combined_chat_tokens?.input_tokens?.toLocaleString()} /> <InfoRow label="Output Tokens" value={usageStats?.token_consumption?.combined_chat_tokens?.output_tokens?.toLocaleString()} /> <InfoRow label="Total Tokens" value={usageStats?.token_consumption?.combined_chat_tokens?.total_tokens?.toLocaleString()} /> <InfoRow label="Limits (RPM)" value={`${rateLimits?.requests_per_minute_limit || 'N/A'} RPM`} /> {(!accInfo?.current_plan || accInfo?.current_plan.toLowerCase() === 'free') && <InfoRow label="Limits (RPD)" value={`${rateLimits?.requests_per_day_limit || 'N/A'} RPD`} />} </div> </DashboardCard>
                      <DashboardCard title="API Key Details" icon={<KeyRound size={14} className="text-muted-foreground dark:text-neutral-400"/>} titleExtra="Information about your active API key."> <div className="space-y-0.5 text-xs"> <InfoRow label="Name" value={accInfo?.api_key_name || "Primary Key"} /> <div className="flex justify-between items-center py-1 text-xs"> <span className="text-muted-foreground dark:text-neutral-400">Key Preview:</span> <div className="flex items-center gap-1.5"> <span className="font-medium text-foreground dark:text-neutral-100 font-mono">{getMaskedApiKey(accInfo?.api_key)}</span> {accInfo?.api_key && <button onClick={() => copyApiKey(accInfo?.api_key)} className="text-muted-foreground dark:text-neutral-500 hover:text-primary dark:hover:text-primary-light transition-colors">{copiedKey ? <Check size={12}/> : <Copy size={12}/>}</button>} </div> </div> <InfoRow label="Account Registered" value={subDetails?.creation_date ? formatRelativeTime(subDetails.creation_date) : "N/A"} /> <InfoRow label="Last Used" value={maxLastUsedTimestamp ? formatRelativeTime(new Date(maxLastUsedTimestamp)) : "N/A"} /> <InfoRow label="Status" value={apiKeyStatusString} statusType={apiKeyStatusType} /> </div> <Button variant="outline" size="sm" className="w-full mt-3 text-xs font-medium dark:bg-[oklch(0.17_0.025_240)] dark:border-[oklch(0.28_0.025_240)] dark:text-neutral-200 dark:hover:bg-[oklch(0.2_0.015_240)]"> <SettingsIconLucide size={12} className="mr-1.5" /> Manage API Key </Button> </DashboardCard>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 overflow-hidden mt-2">
                      <DashboardCard title="Model Usage (Top 5 by Requests)" icon={<Layers size={14} className="text-muted-foreground dark:text-neutral-400"/>} titleExtra="Your most frequently used models."> {topModels.length > 0 ? <div className="space-y-2.5 text-xs"> {topModels.map(m => { const sr = m.r > 0 ? (m.s / m.r) * 100 : 0; return ( <div key={m.id} className="border-b border-border/30 dark:border-[oklch(0.25_0.02_240)]/40 pb-2 last:border-0 last:pb-0"> <div className="flex justify-between items-center mb-0.5"> <span className="font-medium text-foreground dark:text-neutral-100 truncate w-3/5 text-[11px] break-all" title={m.id}>{m.id}</span> <span className={cn("text-[10px] font-semibold", sr >= 75 ? "text-[var(--status-active-text-light)] dark:text-[var(--status-active-text-dark)]" : "text-[var(--status-loss-text-light)] dark:text-[var(--status-loss-text-dark)]")}>{m.s}/{m.r} reqs</span> </div> <Progress value={sr} className={cn("h-1 rounded-sm mb-1", sr >= 75 ? "[&>div]:bg-[var(--progress-success)]" : "[&>div]:bg-[var(--progress-loss)]")} /> <div className="flex justify-between items-center text-[10px] text-muted-foreground dark:text-neutral-400 mt-1"> <span>Cost: ${m.c.toFixed(8)}</span> {m.lu && <span>Used: {formatSimpleDate(m.lu)}</span>} </div> </div> ); })} </div> : <p className="text-xs text-muted-foreground dark:text-neutral-400">No model usage data available.</p>} </DashboardCard>
                      <DashboardCard title="Usage Cost" icon={<Briefcase size={14} className="text-muted-foreground dark:text-neutral-400"/>} titleExtra="Current estimated costs."> <div className="mb-2"> <p className="text-xs text-muted-foreground dark:text-neutral-400">Est. Token Cost (USD):</p> <p className="text-2xl sm:text-3xl font-bold text-foreground dark:text-neutral-100 my-0.5">{formatCurrency(billingInfo?.cumulative_token_cost_usd, 'USD', {maximumFractionDigits: (billingInfo?.cumulative_token_cost_usd ?? 0) > 0.01 || (billingInfo?.cumulative_token_cost_usd ?? 0) === 0 ? 2 : 4})}</p> </div> {subDetails?.effective_days_remaining !== undefined && <InfoRow label={`${formatPlanName(accInfo?.current_plan)} Plan - Days left`} value={`${subDetails.effective_days_remaining} days`} valueClassName="text-xs" />} <Button variant="outline" size="sm" className="w-full mt-3 text-xs font-medium dark:bg-[oklch(0.17_0.025_240)] dark:border-[oklch(0.28_0.025_240)] dark:text-neutral-200 dark:hover:bg-[oklch(0.2_0.015_240)]"> <ExternalLink size={12} className="mr-1.5" /> View Pricing / Manage Plan </Button> <Button size="sm" className="w-full mt-1.5 text-xs a4f-gradient-button-yellow font-semibold"> <Coffee size={12} className="mr-1.5" /> Buy me a coffee </Button> </DashboardCard>
                  </div>
                  <Separator className="my-6" />
                  <Button 
                    variant="destructive" 
                    className="w-full sm:w-auto"
                    onClick={handleLogoutConfirmed}
                  >
                    <LogOut size={16} className="mr-2"/>
                    Logout & Reset App
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 sm:p-10 space-y-3">
                  <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
                  <h3 className="text-lg sm:text-xl font-medium text-foreground dark:text-neutral-100">Account Information Unavailable</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground dark:text-neutral-400 max-w-xs">
                    Could not fetch account details. Please ensure your API key is correct and active, or try again later. If the issue persists, consider resetting the app.
                  </p>
                   <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={handleLogoutConfirmed}
                  >
                    <LogOut size={16} className="mr-2"/>
                    Logout & Reset App
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="apiKeys" className="flex-1 outline-none overflow-y-auto dialog-custom-scrollbar">
            <div className="p-4 sm:p-6">
              <Tabs defaultValue="a4f" className="w-full">
                <TabsList className="w-full grid grid-cols-2 mb-4">
                  <TabsTrigger value="a4f">A4F</TabsTrigger>
                  <TabsTrigger value="tavily">Tavily</TabsTrigger>
                </TabsList>
                <TabsContent value="a4f">
                  <div className="space-y-2">
                    <Label htmlFor="a4f-key-input">{apiKeys.a4f.name}</Label>
                    <Input id="a4f-key-input" type="password" value={a4fTempKey} onChange={(e) => setA4fTempKey(e.target.value)} placeholder={apiKeys.a4f.key ? 'Enter new key to update' : `Enter your ${apiKeys.a4f.name}`} />
                    <p className="text-xs text-muted-foreground">{apiKeys.a4f.description}. <a href={apiKeys.a4f.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Get key</a>.</p>
                    <div className="flex justify-end gap-2 pt-2">
                      {apiKeys.a4f.key && <Button variant="destructive" size="sm" onClick={() => handleRemoveApiKey('a4f')}>Remove Key</Button>}
                      <Button size="sm" onClick={() => handleSaveApiKey('a4f')} disabled={!a4fTempKey.trim()}>{apiKeys.a4f.key ? 'Update' : 'Save'}</Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="tavily">
                  <div className="space-y-2">
                    <Label htmlFor="tavily-key-input">{apiKeys.tavily.name}</Label>
                    <Input id="tavily-key-input" type="password" value={tavilyTempKey} onChange={(e) => setTavilyTempKey(e.target.value)} placeholder={apiKeys.tavily.key ? 'Enter new key to update' : `Enter your ${apiKeys.tavily.name}`} />
                    <p className="text-xs text-muted-foreground">{apiKeys.tavily.description}. <a href={apiKeys.tavily.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Get key</a>.</p>
                    <div className="flex justify-end gap-2 pt-2">
                      {apiKeys.tavily.key && <Button variant="destructive" size="sm" onClick={() => handleRemoveApiKey('tavily')}>Remove Key</Button>}
                      <Button size="sm" onClick={() => handleSaveApiKey('tavily')} disabled={!tavilyTempKey.trim()}>{apiKeys.tavily.key ? 'Update' : 'Save'}</Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="customization" className="flex-1 outline-none overflow-y-auto dialog-custom-scrollbar">
            <div className="p-4 sm:p-6 space-y-6">
              <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2"><Brain className="h-4 w-4 text-muted-foreground"/>Core Features</h4>
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card"><Label htmlFor="ch-toggle" className="text-sm cursor-pointer">Enable Chat History</Label><Switch id="ch-toggle" checked={isChatHistoryFeatureEnabled} onCheckedChange={onToggleChatHistoryFeature} /></div>
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card"><Label htmlFor="sp-toggle" className="text-sm cursor-pointer">Show System Prompt Button</Label><Switch id="sp-toggle" checked={isSystemPromptButtonEnabled} onCheckedChange={onToggleSystemPromptButton} /></div>
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card"><Label htmlFor="at-toggle" className="text-sm cursor-pointer">Show Attachment Button</Label><Switch id="at-toggle" checked={isAttachmentButtonEnabled} onCheckedChange={onToggleAttachmentButton} /></div>
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card"><Label htmlFor="stt-toggle" className="text-sm cursor-pointer">Enable Speech-to-Text Button</Label><Switch id="stt-toggle" checked={isSpeechToTextEnabled} onCheckedChange={onToggleSpeechToTextEnabled} /></div>
              </div>
              <Separator />
              <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2"><Mic className="h-4 w-4 text-muted-foreground"/>Text-to-Speech</h4>
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card"><Label htmlFor="tts-ftoggle" className="text-sm cursor-pointer">Enable TTS Button</Label><Switch id="tts-ftoggle" checked={isTextToSpeechFeatureEnabled} onCheckedChange={onToggleTextToSpeechFeature}/></div>
                  {isTextToSpeechFeatureEnabled && (
                      <div className="p-3 rounded-lg border bg-card space-y-3">
                          <Label className="text-sm">TTS Provider</Label>
                          <Tabs value={ttsProvider} onValueChange={(v) => onSetTtsProvider(v as 'browser' | 'elevenlabs')}><TabsList className="grid w-full grid-cols-2"><TabsTrigger value="browser"><Volume2 className="mr-1.5 h-3.5 w-3.5"/>Browser</TabsTrigger><TabsTrigger value="elevenlabs"><RadioTower className="mr-1.5 h-3.5 w-3.5"/>ElevenLabs</TabsTrigger></TabsList></Tabs>
                          {ttsProvider === 'browser' && (
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="b-tts-speed" className="text-xs text-muted-foreground">Browser TTS Speed</Label>
                                    <span className="text-xs text-foreground font-medium">{browserTtsSpeed.toFixed(1)}x</span>
                                </div>
                                <Slider id="b-tts-speed" min={0.5} max={2} step={0.1} value={[browserTtsSpeed]} onValueChange={(v) => onSetBrowserTtsSpeed(v[0])} />
                                <div className="space-y-1">
                                  <Label htmlFor="browser-tts-voice" className="text-xs text-muted-foreground">Browser TTS Voice</Label>
                                  <Select
                                    value={selectedBrowserTtsVoiceURI}
                                    onValueChange={onSetSelectedBrowserTtsVoiceURI}
                                  >
                                    <SelectTrigger id="browser-tts-voice">
                                      <SelectValue placeholder="Select a voice..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableBrowserVoices.length > 0 ? (
                                        availableBrowserVoices.map((voice) => (
                                          <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                                            {voice.name} ({voice.lang}) {voice.default ? "- Default" : ""}
                                          </SelectItem>
                                        ))
                                      ) : (
                                        <SelectItem value="no-voices" disabled>
                                          No voices available or loading...
                                        </SelectItem>
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
                            </div>
                          )}
                          {ttsProvider === 'elevenlabs' && <div className="space-y-2 pt-2"> <Label htmlFor="el-key" className="text-xs text-muted-foreground">ElevenLabs API Key</Label> <Input id="el-key" type="password" value={tempElevenLabsKey} onChange={(e) => setTempElevenLabsKey(e.target.value)} placeholder="Enter ElevenLabs API Key" /> <div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={handleRemoveElevenLabsKey} disabled={!elevenLabsApiKey}>Remove</Button><Button size="sm" onClick={handleSaveElevenLabsKey} disabled={tempElevenLabsKey === (elevenLabsApiKey || '') || !tempElevenLabsKey.trim()}>{elevenLabsApiKey ? 'Update' : 'Save'}</Button></div> </div>}
                      </div>
                  )}
              </div>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2"><MessageSquareText className="h-4 w-4 text-muted-foreground"/>Enabled Search Groups</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {allSearchGroupsConfig.filter(g => g.show).map((group) => { const Icon = getGroupIcon(group.id); return (<div key={group.id} className="flex items-center justify-between p-3 rounded-lg border bg-card"><Label htmlFor={`sg-${group.id}`} className="flex items-center gap-2 text-sm cursor-pointer"><Icon className="h-4 w-4 text-muted-foreground"/>{group.name}</Label><Switch id={`sg-${group.id}`} checked={enabledSearchGroupIds.includes(group.id)} onCheckedChange={() => onToggleSearchGroup(group.id)}/></div>);})}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="p-4 border-t border-border dark:border-[oklch(0.18_0.015_240)] shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

