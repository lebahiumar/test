// components/account-dialog.tsx
import React from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
    Copy, Check, User as UserIcon, KeyRound as KeyRoundIcon, BarChart2, 
    ExternalLink, Settings2, Layers, Briefcase, Info, AlertTriangle, Package, Tag, ShieldCheck, Percent, ListChecks, Coffee, XIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatCurrency, formatRelativeTime, formatSimpleDate } from '@/lib/utils';

interface AccountDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    accountInfo: any;
    isLoading: boolean;
    onRefresh: () => void;
}

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
            case 'active':
                statusBadgeClasses = "bg-[var(--status-active-bg-light)] text-[var(--status-active-text-light)] dark:bg-[var(--status-active-bg-dark)] dark:text-[var(--status-active-text-dark)] border-transparent";
                break;
            case 'unknown':
                statusBadgeClasses = "bg-[var(--status-unknown-bg-light)] text-[var(--status-unknown-text-light)] dark:bg-[var(--status-unknown-bg-dark)] dark:text-[var(--status-unknown-text-dark)] border-transparent";
                break;
            case 'inactive': // Falls back to loss/destructive style
                statusBadgeClasses = "bg-[var(--status-loss-bg-light)] text-[var(--status-loss-text-light)] dark:bg-[var(--status-loss-bg-dark)] dark:text-[var(--status-loss-text-dark)] border-transparent";
                break;
            case 'custom':
                 statusBadgeClasses = customStatusClasses || "bg-muted text-muted-foreground dark:bg-neutral-700 dark:text-neutral-200";
                 break;
        }
    }

    return (
        <div className="flex justify-between items-center py-1 text-xs">
            <span className="text-muted-foreground dark:text-neutral-400">{label}:</span>
            {statusType ? (
                <Badge variant="outline" className={cn("px-1.5 py-0.5 text-[10px] font-medium leading-tight rounded", statusBadgeClasses)}>
                    {value}
                </Badge>
            ) : (
                <span className={cn("font-medium text-foreground dark:text-neutral-100 text-right", valueClassName)}>
                    {value ?? 'N/A'}
                </span>
            )}
        </div>
    );
};


export const AccountDialog: React.FC<AccountDialogProps> = ({
    isOpen,
    onOpenChange,
    accountInfo,
    isLoading,
    onRefresh
}) => {
    React.useEffect(() => {
        // Fetch account info when dialog opens
        if (isOpen) { 
            onRefresh();
        }
    }, [isOpen, onRefresh]); // Remove isLoading from dependency array to prevent refresh loops

    const [copiedKey, setCopiedKey] = React.useState(false);

    const copyApiKey = (keyToCopy?: string) => {
        const actualKey = keyToCopy || accountInfo?.account_information?.api_key;
        if (actualKey) {
            navigator.clipboard.writeText(actualKey);
            setCopiedKey(true);
            toast.success("API Key copied to clipboard");
            setTimeout(() => setCopiedKey(false), 2000);
        }
    };

    const formatPlanName = (plan: string) => {
        if (!plan) return 'N/A';
        const lowerPlan = plan.toLowerCase();
        if (lowerPlan === 'pro') return 'Professional';
        if (lowerPlan === 'basic') return 'Basic';
        if (lowerPlan === 'free') return 'Free';
        return plan.charAt(0).toUpperCase() + plan.slice(1);
    };
    
    const getMaskedApiKey = (key?: string) => {
        if (!key || key.length < 10) return key || "N/A";
        return `${key.substring(0, 3)}••••••••${key.substring(key.length - 6)}`;
    };
    
    const accInfo = accountInfo?.account_information;
    const subDetails = accountInfo?.subscription_details;
    const usageStats = accountInfo?.usage_statistics;
    const billingInfo = accountInfo?.billing_information;
    const rateLimits = accountInfo?.rate_limits_and_restrictions;

    const maxLastUsedTimestamp = React.useMemo(() => {
        if (!accInfo?.model_specific_usage) return null;
        const timestamps = Object.values(accInfo.model_specific_usage)
                            .map((usage: any) => usage.last_used) 
                            .filter(ts => typeof ts === 'number' && ts > 0);
        if (timestamps.length === 0) return null;
        return Math.max(...timestamps) * 1000; 
    }, [accInfo]);

    const topModels = React.useMemo(() => {
        if (!accInfo?.model_specific_usage) return [];
        const usage = accInfo.model_specific_usage;
        return Object.entries(usage)
            .map(([modelId, data]: [string, any]) => ({
                id: modelId,
                requests: data.total_requests || 0,
                successful: data.successful_requests || 0,
                cost: data.token_cost_usd || 0,
                lastUsed: data.last_used && data.last_used > 0 ? new Date(data.last_used * 1000) : null,
                inputTokens: data.input_tokens || 0,
                outputTokens: data.output_tokens || 0
            }))
            .sort((a, b) => b.requests - a.requests)
            .slice(0, 5);
    }, [accInfo]);

    const renderSkeleton = () => (
        <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
            {/* Row 1 Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
                <div className="lg:col-span-1 bg-card dark:bg-[oklch(0.22_0.03_240)] p-4 sm:p-5 rounded-xl border border-border dark:border-[oklch(0.2_0.01_240)] shadow-md">
                    <Skeleton className="h-5 w-3/5 mb-3" />
                    <div className="space-y-2.5">
                        {[...Array(4)].map((_, i) => <Skeleton key={`info-skel-${i}`} className="h-4 w-full" />)}
                    </div>
                </div>
                <div className="lg:col-span-2 bg-card dark:bg-[oklch(0.22_0.03_240)] p-4 sm:p-5 rounded-xl border border-border dark:border-[oklch(0.2_0.01_240)] shadow-md flex items-center">
                     <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-full mr-3 sm:mr-4" />
                     <div className="flex-1 space-y-2">
                         <Skeleton className="h-6 w-3/5" />
                         <Skeleton className="h-4 w-4/5" />
                         <Skeleton className="h-4 w-2/5 mt-1" />
                     </div>
                </div>
            </div>
             {/* Row 2 Skeleton - Plan Details */}
            <div className="bg-card dark:bg-[oklch(0.22_0.03_240)] p-4 sm:p-5 rounded-xl border border-border dark:border-[oklch(0.2_0.01_240)] shadow-md">
                <Skeleton className="h-5 w-1/4 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => <Skeleton key={`plan-detail-skel-${i}`} className="h-8 w-full" />)}
                </div>
            </div>
            {/* Row 3 & 4 Skeletons */}
            {[...Array(2)].map((_, rowIndex) => (
                <div key={`skel-row-${rowIndex}`} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {[...Array(2)].map((_, colIndex) => (
                         <div key={`skel-card-${rowIndex}-${colIndex}`} className="bg-card dark:bg-[oklch(0.22_0.03_240)] p-4 sm:p-5 rounded-xl border border-border dark:border-[oklch(0.2_0.01_240)] shadow-md">
                            <Skeleton className="h-5 w-1/2 mb-3" />
                            <div className="space-y-2.5">
                                {[...Array(colIndex === 0 && rowIndex === 0 ? 5 : (colIndex === 1 && rowIndex === 0 ? 3 : (rowIndex === 1 && colIndex === 0 ? 5 : 2)))].map((_, j) => <Skeleton key={`inner-skel-${rowIndex}-${colIndex}-${j}`} className="h-4 w-full" />)}
                                { (colIndex === 1 && rowIndex === 0 ) && <Skeleton className="h-8 w-full mt-3"/> }
                                { (rowIndex === 1 && colIndex === 1) && <> <Skeleton className="h-8 w-full mt-3"/> <Skeleton className="h-8 w-full mt-2"/> </> }
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );

    let apiKeyStatusString = "Unknown";
    let apiKeyStatusType: 'active' | 'unknown' | 'inactive' = 'unknown';
    if (accInfo && typeof accInfo.is_enabled !== 'undefined') {
        if (accInfo.is_enabled) {
            apiKeyStatusString = "Active";
            apiKeyStatusType = 'active';
        } else {
            apiKeyStatusString = "Inactive";
            apiKeyStatusType = 'inactive';
        }
    }
    

    // Add console logging to help debug the state
    React.useEffect(() => {
        if (isLoading) {
            console.log('Account dialog is loading...');
        } else if (accountInfo) {
            console.log('Account info loaded successfully:', accountInfo);
        } else {
            console.log('No account info available');
        }
    }, [isLoading, accountInfo]);
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl w-[95vw] max-h-[90vh] p-0 gap-0 bg-background dark:bg-[oklch(0.09_0.01_240)] rounded-xl shadow-2xl overflow-hidden">
                <DialogHeader className="px-4 sm:px-5 py-3 border-b border-border dark:border-[oklch(0.18_0.015_240)] flex flex-row justify-between items-center sticky top-0 bg-background dark:bg-[oklch(0.09_0.01_240)] z-10">
                    <DialogTitle className="text-md font-semibold text-foreground dark:text-neutral-50">
                        Dashboard
                        <DialogDescription className="text-xs text-muted-foreground dark:text-neutral-300 leading-tight mt-0.5">
                            Welcome, {accInfo?.username || accInfo?.github_info?.github_username_from_auth || 'User'}!
                        </DialogDescription>
                    </DialogTitle>
                    <button 
                        onClick={() => onOpenChange(false)} 
                        className="h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors" 
                        aria-label="Close dialog"
                    >
                        <XIcon className="h-4 w-4" />
                    </button>
                </DialogHeader>
                
                <ScrollArea className="h-[calc(90vh-57px)] dialog-custom-scrollbar overflow-auto"> {/* Adjusted height for header */}
                    {/* Force render content if accountInfo exists, even if isLoading is true */}
                    {(!accountInfo || isLoading) ? renderSkeleton() : accountInfo ? (
                        <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
                            {/* --- Row 1: Account Overview & User Profile --- */}
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-5 overflow-hidden">
                                <DashboardCard 
                                    title="Account Overview" 
                                    icon={<Info size={14} className="text-muted-foreground dark:text-neutral-400"/>} 
                                    className="md:col-span-2"
                                    titleExtra={<span className="text-[10px] text-muted-foreground dark:text-neutral-500">Last Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>}
                                >
                                    <div className="space-y-1 text-xs">
                                        <InfoRow label="Service" value="A4F API Services" valueClassName="text-foreground dark:text-neutral-200" />
                                        <InfoRow label="Node ID" value={accInfo?.node_id || 'N/A'} valueClassName="text-foreground dark:text-neutral-100" />
                                        <InfoRow label="Account Status" value={accInfo?.is_enabled ? "Enabled" : "Disabled"} statusType={accInfo?.is_enabled ? 'active' : 'inactive'} />
                                        <InfoRow label="Current Plan" value={formatPlanName(accInfo?.current_plan)} valueClassName="text-primary dark:text-[#80c9ff]" />
                                        <InfoRow label="Plan Validity" value={subDetails?.effective_days_remaining !== undefined ? `${subDetails.effective_days_remaining} days left` : 'N/A'} />
                                    </div>
                                </DashboardCard>

                                <DashboardCard title="" className="md:col-span-3 !p-0 overflow-hidden">
                                    <div className="flex flex-col sm:flex-row items-center h-full overflow-hidden">
                                        <div className="p-4 pt-3 sm:p-5 flex-shrink-0">
                                            {(accInfo?.github_info?.avatar_url && accInfo.github_info.avatar_url.trim() !== '') ? (
                                                <Image 
                                                    src={accInfo.github_info.avatar_url} 
                                                    alt="Profile" 
                                                    width={64}
                                                    height={64}
                                                    className="rounded-full object-cover border-2 border-border dark:border-[oklch(0.28_0.025_240)] shadow-sm"
                                                    unoptimized={true}
                                                />
                                            ) : (
                                                <div className="h-16 w-16 rounded-full bg-muted dark:bg-[oklch(0.17_0.025_240)] flex items-center justify-center border border-border dark:border-[oklch(0.2_0.01_240)]">
                                                    <UserIcon className="h-7 w-7 text-muted-foreground dark:text-neutral-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 p-4 pt-0 sm:pt-4 sm:p-5 sm:pl-0 text-center sm:text-left overflow-hidden">
                                            <h3 className="text-base font-semibold text-foreground dark:text-neutral-50 break-all overflow-hidden text-ellipsis">
                                                {accInfo?.username || accInfo?.github_info?.github_username_from_auth || 'User'}
                                            </h3>
                                            {accInfo?.github_info?.email_from_auth && (
                                                <p className="text-xs text-muted-foreground dark:text-neutral-300 break-all mt-0.5 overflow-hidden text-ellipsis">
                                                    {accInfo.github_info.email_from_auth}
                                                </p>
                                            )}
                                            <p className="text-[11px] text-muted-foreground dark:text-neutral-500 mt-1 overflow-hidden text-ellipsis">
                                                Member Since: {formatSimpleDate(subDetails?.creation_date)}
                                            </p>
                                            {accInfo?.github_info?.supabase_user_id && (
                                                <div className="mt-2 text-[10px] bg-neutral-100 dark:bg-[oklch(0.17_0.015_240)] p-1.5 rounded-sm overflow-hidden">
                                                    <div className="text-muted-foreground dark:text-neutral-400">Supabase ID:</div>
                                                    <div className="text-neutral-700 dark:text-neutral-200 font-mono truncate">{accInfo.github_info.supabase_user_id}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </DashboardCard>
                            </div>
                            
                            {/* Plan Details Card */}
                            <DashboardCard title="Plan Details" icon={<Tag size={14} className="text-muted-foreground dark:text-neutral-400"/>}>
                                <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-2 text-xs overflow-hidden">
                                    <div className="flex items-center flex-wrap"><span className="text-muted-foreground dark:text-neutral-400 mr-1.5">Current Plan:</span> <span className="font-semibold text-primary dark:text-[#80c9ff]">{formatPlanName(accInfo?.current_plan)}</span></div>
                                    <div className="flex items-center"><span className="text-muted-foreground dark:text-neutral-400 mr-1.5">Plan Validity:</span> <span className="font-semibold text-foreground dark:text-neutral-100">{subDetails?.effective_days_remaining !== undefined ? `${subDetails.effective_days_remaining} days left` : 'N/A'}</span></div>
                                    <div className="flex items-center"><span className="text-muted-foreground dark:text-neutral-400 mr-1.5">Total Payments:</span> <span className="font-semibold text-foreground dark:text-neutral-100">{formatCurrency(billingInfo?.total_amount_paid_usd, 'USD')}</span></div>
                                    <div className="flex items-center"><span className="text-muted-foreground dark:text-neutral-400 mr-1.5">Last Plan Change:</span> <span className="font-semibold text-foreground dark:text-neutral-100">{subDetails?.plan_activation_history?.length > 0 ? 
                                        `${formatPlanName(subDetails.plan_activation_history[subDetails.plan_activation_history.length-1].plan)} on ${formatSimpleDate(subDetails.plan_activation_history[subDetails.plan_activation_history.length-1].activated_at)}`
                                        : 'N/A'}</span></div>
                                </div>
                            </DashboardCard>

                            {/* --- Row 2: Usage Statistics & API Key Details --- */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 overflow-hidden">
                                <DashboardCard title="Usage Statistics" icon={<BarChart2 size={14} className="text-muted-foreground dark:text-neutral-400"/>} titleExtra="Your recent API activity.">
                                    <div className="space-y-0.5 text-xs">
                                        <InfoRow label="Total Requests" value={usageStats?.overall_request_counts?.total?.toLocaleString()} />
                                        <InfoRow label="Streaming Reqs" value={`${usageStats?.overall_request_counts?.streaming_chat || 0} (${usageStats?.overall_request_counts?.streaming_chat && usageStats?.overall_request_counts?.total && usageStats?.overall_request_counts?.total > 0 ? Math.round((usageStats.overall_request_counts.streaming_chat / usageStats.overall_request_counts.total) * 100) : 0}%)`} />
                                        <InfoRow label="Input Tokens" value={usageStats?.token_consumption?.combined_chat_tokens?.input_tokens?.toLocaleString()} />
                                        <InfoRow label="Output Tokens" value={usageStats?.token_consumption?.combined_chat_tokens?.output_tokens?.toLocaleString()} />
                                        <InfoRow label="Total Tokens" value={usageStats?.token_consumption?.combined_chat_tokens?.total_tokens?.toLocaleString()} />
                                        <InfoRow label="Limits (RPM)" value={`${rateLimits?.requests_per_minute_limit || 'N/A'} RPM`} />
                                        {(!accInfo?.current_plan || accInfo?.current_plan.toLowerCase() === 'free') && (
                                            <InfoRow label="Limits (RPD)" value={`${rateLimits?.requests_per_day_limit || 'N/A'} RPD`} />
                                        )}
                                    </div>
                                </DashboardCard>

                                <DashboardCard title="API Key Details" icon={<KeyRoundIcon size={14} className="text-muted-foreground dark:text-neutral-400"/>} titleExtra="Information about your active API key.">
                                    <div className="space-y-0.5 text-xs">
                                        <InfoRow label="Name" value={accInfo?.api_key_name || "Primary Key"} />
                                        <div className="flex justify-between items-center py-1 text-xs">
                                            <span className="text-muted-foreground dark:text-neutral-400">Key Preview:</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-medium text-foreground dark:text-neutral-100 font-mono">{getMaskedApiKey(accInfo?.api_key)}</span>
                                                {accInfo?.api_key && (
                                                    <button onClick={() => copyApiKey(accInfo?.api_key)} className="text-muted-foreground dark:text-neutral-500 hover:text-primary dark:hover:text-primary-light transition-colors">
                                                        {copiedKey ? <Check size={12}/> : <Copy size={12}/>}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <InfoRow label="Account Registered" value={subDetails?.creation_date ? formatRelativeTime(subDetails.creation_date) : "N/A"} />
                                        <InfoRow label="Last Used" value={maxLastUsedTimestamp ? formatRelativeTime(new Date(maxLastUsedTimestamp)) : "N/A"} />
                                        <InfoRow label="Status" value={apiKeyStatusString} statusType={apiKeyStatusType} />
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full mt-3 text-xs font-medium dark:bg-[oklch(0.17_0.025_240)] dark:border-[oklch(0.28_0.025_240)] dark:text-neutral-200 dark:hover:bg-[oklch(0.2_0.015_240)]">
                                        <Settings2 size={12} className="mr-1.5" /> Manage API Key
                                    </Button>
                                </DashboardCard>
                            </div>

                            {/* --- Row 3: Model Usage & Usage Cost --- */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 overflow-hidden mt-2">
                                <DashboardCard title="Model Usage (Top 5 by Requests)" icon={<Layers size={14} className="text-muted-foreground dark:text-neutral-400"/>} titleExtra="Your most frequently used models.">
                                    {topModels.length > 0 ? (
                                        <div className="space-y-2.5 text-xs">
                                            {topModels.map(model => {
                                                const successRate = model.requests > 0 ? (model.successful / model.requests) * 100 : 0;
                                                return (
                                                    <div key={model.id} className="border-b border-border/30 dark:border-[oklch(0.25_0.02_240)]/40 pb-2 last:border-0 last:pb-0">
                                                        <div className="flex justify-between items-center mb-0.5">
                                                            <span className="font-medium text-foreground dark:text-neutral-100 truncate w-3/5 text-[11px] break-all" title={model.id}>{model.id}</span>
                                                            <span className={cn("text-[10px] font-semibold", successRate >= 75 ? "text-[var(--status-active-text-light)] dark:text-[var(--status-active-text-dark)]" : "text-[var(--status-loss-text-light)] dark:text-[var(--status-loss-text-dark)]")}>
                                                                {model.successful}/{model.requests} reqs
                                                            </span>
                                                        </div>
                                                        <Progress 
                                                            value={successRate} 
                                                            className={cn("h-1 rounded-sm mb-1", 
                                                                successRate >= 75 ? "[&>div]:bg-[var(--progress-success)]" : "[&>div]:bg-[var(--progress-loss)]"
                                                            )}
                                                        />
                                                        <div className="flex justify-between items-center text-[10px] text-muted-foreground dark:text-neutral-400 mt-1">
                                                            <span>Cost: ${model.cost.toFixed(8)}</span>
                                                            {model.lastUsed && <span>Used: {formatSimpleDate(model.lastUsed)}</span>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground dark:text-neutral-400">No model usage data available.</p>
                                    )}
                                </DashboardCard>
                                
                                <DashboardCard title="Usage Cost" icon={<Briefcase size={14} className="text-muted-foreground dark:text-neutral-400"/>} titleExtra="Current estimated costs.">
                                    <div className="mb-2">
                                        <p className="text-xs text-muted-foreground dark:text-neutral-400">Est. Token Cost (USD):</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-foreground dark:text-neutral-100 my-0.5">{formatCurrency(billingInfo?.cumulative_token_cost_usd, 'USD', {maximumFractionDigits: (billingInfo?.cumulative_token_cost_usd ?? 0) > 0.01 || (billingInfo?.cumulative_token_cost_usd ?? 0) === 0 ? 2 : 4})}</p>
                                    </div>
                                    {subDetails?.effective_days_remaining !== undefined && (
                                        <InfoRow label={`${formatPlanName(accInfo?.current_plan)} Plan - Days left`} value={`${subDetails.effective_days_remaining} days`} valueClassName="text-xs" />
                                    )}
                                    <Button variant="outline" size="sm" className="w-full mt-3 text-xs font-medium dark:bg-[oklch(0.17_0.025_240)] dark:border-[oklch(0.28_0.025_240)] dark:text-neutral-200 dark:hover:bg-[oklch(0.2_0.015_240)]">
                                        <ExternalLink size={12} className="mr-1.5" /> View Pricing / Manage Plan
                                    </Button>
                                     <Button size="sm" className="w-full mt-1.5 text-xs a4f-gradient-button-yellow font-semibold">
                                        <Coffee size={12} className="mr-1.5" /> Buy me a coffee
                                    </Button>
                                </DashboardCard>
                            </div>

                        </div>
                    ) : (
                         <div className="flex flex-col items-center justify-center h-full text-center p-6 sm:p-10 space-y-3">
                            <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
                            <h3 className="text-lg sm:text-xl font-medium text-foreground dark:text-neutral-100">Account Information Unavailable</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground dark:text-neutral-400 max-w-xs">
                                Could not fetch account details. Please ensure your API key is correct and active, or try again later.
                            </p>
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};