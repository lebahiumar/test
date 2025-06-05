
"use client";
import 'katex/dist/katex.min.css';
import '@/styles/custom-scrollbar.css';

import React, { Suspense, useCallback, useEffect, useState, useMemo } from 'react';
import Image from 'next/image'; // Keep this import
import { useTheme } from 'next-themes';

import { AnimatePresence, motion } from 'framer-motion';
import { KeyRound } from 'lucide-react';
import { ArrowDown } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { searchGroups as allSearchGroupsConfig, SearchGroup, SearchGroupId } from '@/lib/utils';
import { GroupSelector } from '@/components/ui/form-component/group-select';
import { ApiKeyNotification } from '@/components/ui/form-component/notifications';

import { Button } from '@/components/ui/button';
import FormComponent from '@/components/ui/form-component';
import Messages from '@/components/messages';
import { SimpleApiKeyInput } from '@/components/api-keys'; 
import { SettingsDialog } from '@/components/settings-dialog'; 
import { ChatHistorySidebar } from '@/components/chat-history-sidebar';

import { useUserAvatar } from '@/hooks/use-user-avatar';
import { cn } from '@/lib/utils';

import { useChatLogic } from '@/app/page-hooks/use-chat-logic';
import { useScrollManagement } from '@/app/page-hooks/use-scroll-management';
import { PageNavbar } from '@/app/page-components/page-navbar';
import { DateTimeWidgets } from '@/app/page-components/date-time-widgets';


const HomeContent = () => {
    const {
        apiKey, setApiKey, isKeyLoaded,
        apiKeys, setApiKeyByType, isKeysLoaded,
        availableModels,
        selectedModel, setSelectedModel,
        messages,
        input, setInput,
        attachments, setAttachments,
        systemPrompt, setSystemPrompt,
        isSystemPromptVisible, setIsSystemPromptVisible,
        status,
        handleSend, handleStopStreaming, handleRetry, fetchAccountInfo, resetChatState,
        selectedGroup, setSelectedGroup,
        hasSubmitted, setHasSubmitted,
        showSimpleApiKeyInput, setShowSimpleApiKeyInput,
        accountInfo,
        isAccountLoading,
        currentPlan, setCurrentPlan,
        isTavilyKeyAvailable, handleGroupSelection,
        fileInputRef, inputRef, systemPromptInputRef,
        chatHistory, loadChatFromHistory, deleteChatFromHistory, clearAllChatHistory,
        handleFullReset, 
        isChatHistoryFeatureEnabled, setIsChatHistoryFeatureEnabled,
        enabledSearchGroupIds, 
        toggleSearchGroup,
        isTextToSpeechFeatureEnabled, setIsTextToSpeechFeatureEnabled,
        isSystemPromptButtonEnabled, setIsSystemPromptButtonEnabled, 
        isAttachmentButtonEnabled, setIsAttachmentButtonEnabled, 
        isSpeechToTextEnabled, setIsSpeechToTextEnabled,
        ttsProvider, setTtsProvider, 
        browserTtsSpeed, setBrowserTtsSpeed,
        availableBrowserVoices, 
        selectedBrowserTtsVoiceURI, setSelectedBrowserTtsVoiceURI, 
        isListening, 
        handleToggleListening,
        editingMessageId, // New
        handleStartEdit,   // New
        handleCancelEdit,  // New
    } = useChatLogic();

    const [isStreamingState, setIsStreamingState] = useState(false);
    const [isGroupSelectorExpanded, setIsGroupSelectorExpanded] = useState(false);
    const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);
    const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false); 

    useEffect(() => {
      const streamingMessage = messages.find(msg => msg.isStreaming);
      setIsStreamingState(!!streamingMessage);
    }, [messages]);

    const { bottomRef, showScrollButton, scrollToBottom } = useScrollManagement(messages, isStreamingState);
    const userAvatarUrl = useUserAvatar(accountInfo);
    const { setTheme: setNextThemeHook } = useTheme();

    useEffect(() => {
      const handleThemeMessage = (event: MessageEvent) => {
        if (event.data.type === "THEME_CHANGE") {
          setNextThemeHook(event.data.theme);
        }
      };
      window.addEventListener("message", handleThemeMessage);
      return () => {
        window.removeEventListener("message", handleThemeMessage);
      };
    }, [setNextThemeHook]);

    const handleWidgetDateTimeClick = useCallback(() => {
      handleSend("What's the current date and time?");
    }, [handleSend]);

    const effectiveSearchGroups = useMemo(() => {
        return allSearchGroupsConfig.filter(g => g.show && enabledSearchGroupIds.includes(g.id));
    }, [enabledSearchGroupIds]);


    const showCenteredForm = messages.length === 0 && !hasSubmitted;
    const showChatInterface = isKeyLoaded && apiKey;

    return (
        <div className="flex flex-col font-sans items-center min-h-screen bg-background text-foreground transition-colors duration-500">
            <PageNavbar
                hasMessages={messages.length > 0 || hasSubmitted}
                onNewChat={resetChatState}
                onOpenSettingsDialog={() => setIsSettingsDialogOpen(true)} 
                onToggleHistorySidebar={() => setIsHistorySidebarOpen(prev => !prev)}
                isChatHistoryFeatureEnabled={isChatHistoryFeatureEnabled}
            />

            {isChatHistoryFeatureEnabled && (
                <ChatHistorySidebar
                  isOpen={isHistorySidebarOpen}
                  onOpenChange={setIsHistorySidebarOpen}
                  chatHistory={chatHistory}
                  onLoadChat={(id) => {
                    loadChatFromHistory(id);
                    setIsHistorySidebarOpen(false);
                  }}
                  onDeleteChat={deleteChatFromHistory}
                  onClearAllHistory={() => { 
                    clearAllChatHistory();
                    setIsHistorySidebarOpen(false); 
                  }}
                />
            )}

            <SimpleApiKeyInput
                apiKey={apiKey}
                setApiKey={setApiKey} 
                isKeyLoaded={isKeyLoaded}
                isOpen={showSimpleApiKeyInput}
                onOpenChange={setShowSimpleApiKeyInput}
            />
            
            <SettingsDialog
                isOpen={isSettingsDialogOpen}
                onOpenChange={setIsSettingsDialogOpen}
                // Account props
                accountInfo={accountInfo}
                isAccountLoading={isAccountLoading}
                onRefreshAccount={fetchAccountInfo}
                onLogoutAndReset={handleFullReset} 
                // API Keys props
                apiKeys={apiKeys}
                setApiKey={setApiKeyByType}
                isKeysLoaded={isKeysLoaded}
                onSwitchToWebSearch={() => { 
                    const webGroup = allSearchGroupsConfig.find(g => g.id === 'web');
                    if (webGroup && enabledSearchGroupIds.includes('web')) {
                        handleGroupSelection(webGroup);
                    } else if (webGroup && !enabledSearchGroupIds.includes('web')) {
                        toast.info("Web search group is disabled in customization settings.");
                    }
                }}
                // Customization props
                isChatHistoryFeatureEnabled={isChatHistoryFeatureEnabled}
                onToggleChatHistoryFeature={setIsChatHistoryFeatureEnabled}
                isTextToSpeechFeatureEnabled={isTextToSpeechFeatureEnabled}
                onToggleTextToSpeechFeature={setIsTextToSpeechFeatureEnabled}
                isSystemPromptButtonEnabled={isSystemPromptButtonEnabled}
                onToggleSystemPromptButton={setIsSystemPromptButtonEnabled}
                isAttachmentButtonEnabled={isAttachmentButtonEnabled}
                onToggleAttachmentButton={setIsAttachmentButtonEnabled}
                isSpeechToTextEnabled={isSpeechToTextEnabled}
                onToggleSpeechToTextEnabled={setIsSpeechToTextEnabled}
                enabledSearchGroupIds={enabledSearchGroupIds}
                onToggleSearchGroup={toggleSearchGroup}
                elevenLabsApiKey={apiKeys.elevenlabs.key}
                onSetElevenLabsApiKey={(key) => setApiKeyByType('elevenlabs', key)}
                ttsProvider={ttsProvider}
                onSetTtsProvider={setTtsProvider}
                browserTtsSpeed={browserTtsSpeed}
                onSetBrowserTtsSpeed={setBrowserTtsSpeed}
                availableBrowserVoices={availableBrowserVoices}
                selectedBrowserTtsVoiceURI={selectedBrowserTtsVoiceURI}
                onSetSelectedBrowserTtsVoiceURI={setSelectedBrowserTtsVoiceURI}
            />


            <div className={cn(
                "w-full flex-1 flex flex-col items-center",
                "pt-20",
                showCenteredForm && showChatInterface ? "justify-center" : "pb-40"
            )}>
                <div className={cn(
                    "w-full max-w-[26rem] sm:max-w-2xl space-y-6 px-2 sm:px-0 mx-auto transition-all duration-300 flex-grow flex flex-col",
                    showCenteredForm && showChatInterface ? "justify-center -mt-16" : "justify-start"
                )}>
                    {!apiKey && isKeyLoaded && !showSimpleApiKeyInput && ( 
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-center flex flex-col items-center justify-center h-full -mt-20"
                        >
                            <KeyRound size={48} className="text-muted-foreground mb-4" />
                            <h1 className="text-xl sm:text-2xl mb-2 text-neutral-800 dark:text-neutral-100 font-semibold">API Key Required</h1>
                            <p className="text-sm text-muted-foreground mb-6">
                                Please set your API key via the <KeyRound className="inline h-4 w-4 align-text-bottom"/> settings menu to begin.
                            </p>
                            <Button onClick={() => setShowSimpleApiKeyInput(true)}>Set API Key</Button>
                        </motion.div>
                    )}

                    {showCenteredForm && showChatInterface && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-center"
                        >
                            <h1 className="text-2xl sm:text-4xl mb-4 sm:mb-6 text-neutral-800 dark:text-neutral-100 font-syne">
                                What do you want to explore?
                            </h1>
                            <FormComponent
                                input={input}
                                setInput={setInput}
                                handleSend={handleSend}
                                handleStopStreaming={handleStopStreaming}
                                status={status}
                                selectedModel={selectedModel}
                                setSelectedModel={setSelectedModel}
                                models={availableModels}
                                attachments={attachments}
                                setAttachments={setAttachments}
                                fileInputRef={fileInputRef}
                                inputRef={inputRef}
                                systemPromptInputRef={systemPromptInputRef}
                                systemPrompt={systemPrompt}
                                setSystemPrompt={setSystemPrompt}
                                isSystemPromptVisible={isSystemPromptVisible}
                                setIsSystemPromptVisible={setIsSystemPromptVisible}
                                messages={messages}
                                selectedGroup={selectedGroup}
                                availableSearchGroups={effectiveSearchGroups}
                                onGroupSelect={(group: SearchGroup) => {
                                    if (!enabledSearchGroupIds.includes(group.id)){
                                        toast.error(`${group.name} is currently disabled. You can enable it in Customization settings.`);
                                        return;
                                    }
                                    handleGroupSelection(group);
                                }}
                                setHasSubmitted={setHasSubmitted}
                                currentPlan={currentPlan}
                                onPlanChange={setCurrentPlan}
                                isTextToSpeechFeatureEnabled={isTextToSpeechFeatureEnabled}
                                isSystemPromptButtonEnabled={isSystemPromptButtonEnabled}
                                isAttachmentButtonEnabled={isAttachmentButtonEnabled}
                                isSpeechToTextEnabled={isSpeechToTextEnabled}
                                isListening={isListening}
                                handleToggleListening={handleToggleListening}
                                editingMessageId={editingMessageId}
                                handleCancelEdit={handleCancelEdit}
                            />
                            <DateTimeWidgets status={status} apiKey={apiKey} onDateTimeClick={handleWidgetDateTimeClick} />
                        </motion.div>
                    )}

                    {!showCenteredForm && showChatInterface && messages.length > 0 && (
                        <Messages
                            messages={messages}
                            models={availableModels}
                            userAvatarUrl={userAvatarUrl}
                            onRetry={handleRetry}
                            isTextToSpeechFeatureEnabled={isTextToSpeechFeatureEnabled}
                            browserTtsSpeed={browserTtsSpeed}
                            selectedBrowserTtsVoiceURI={selectedBrowserTtsVoiceURI}
                            editingMessageId={editingMessageId}
                            onStartEdit={handleStartEdit}
                        />
                    )}
                    {!showCenteredForm && showChatInterface && (
                        <div ref={bottomRef} data-testid="bottom-ref" className="h-20 flex-shrink-0" />
                    )}
                </div>
            </div>

            <AnimatePresence>
                {!showCenteredForm && showChatInterface && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="fixed bottom-4 left-0 right-0 w-full max-w-[26rem] sm:max-w-2xl mx-auto z-20 px-2 sm:px-0"
                    >
                        {showScrollButton && (
                            <div className="absolute -top-14 left-0 right-0 flex justify-center">
                                <motion.button
                                    onClick={scrollToBottom}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{
                                        duration: 0.5,
                                        ease: [0.22, 1, 0.36, 1],
                                        type: "spring",
                                        stiffness: 120,
                                        damping: 14
                                    }}
                                    className="flex items-center justify-center w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border dark:border-neutral-700 shadow-sm hover:shadow-md hover:bg-background/95 transition-all duration-300"
                                    aria-label="Scroll to bottom"
                                >
                                    <ArrowDown weight="bold" className="w-5 h-5 text-foreground" />
                                </motion.button>
                            </div>
                        )}
                        <FormComponent
                            input={input}
                            setInput={setInput}
                            handleSend={handleSend}
                            handleStopStreaming={handleStopStreaming}
                            status={status}
                            selectedModel={selectedModel}
                            setSelectedModel={setSelectedModel}
                            models={availableModels}
                            attachments={attachments}
                            setAttachments={setAttachments}
                            fileInputRef={fileInputRef}
                            inputRef={inputRef}
                            systemPromptInputRef={systemPromptInputRef}
                            systemPrompt={systemPrompt}
                            setSystemPrompt={setSystemPrompt}
                            isSystemPromptVisible={isSystemPromptVisible}
                            setIsSystemPromptVisible={setIsSystemPromptVisible}
                            messages={messages}
                            selectedGroup={selectedGroup}
                            availableSearchGroups={effectiveSearchGroups}
                            onGroupSelect={(group: SearchGroup) => {
                                if (!enabledSearchGroupIds.includes(group.id)){
                                    toast.error(`${group.name} is currently disabled. You can enable it in Customization settings.`);
                                    return;
                                }
                                handleGroupSelection(group);
                            }}
                            setHasSubmitted={setHasSubmitted}
                            currentPlan={currentPlan}
                            onPlanChange={setCurrentPlan}
                            isTextToSpeechFeatureEnabled={isTextToSpeechFeatureEnabled}
                            isSystemPromptButtonEnabled={isSystemPromptButtonEnabled}
                            isAttachmentButtonEnabled={isAttachmentButtonEnabled}
                            isSpeechToTextEnabled={isSpeechToTextEnabled}
                            isListening={isListening}
                            handleToggleListening={handleToggleListening}
                            editingMessageId={editingMessageId}
                            handleCancelEdit={handleCancelEdit}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Home = () => {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen text-lg">Loading...</div>}>
            <HomeContent />
        </Suspense>
    );
};

export default Home;

    