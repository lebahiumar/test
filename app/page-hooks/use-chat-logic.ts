import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { fallbackModels } from '@/app/page-config/model-fallbacks';
import { useApiManagement } from './chat-logic/useApiManagement';
import { useChatCoreState } from './chat-logic/useChatCoreState';
import { useChatStreamHandler } from './chat-logic/useChatStreamHandler';
import type { SimpleMessage, Attachment, SearchGroupId, ChatHistoryEntry, SearchGroup } from '@/lib/utils';
import { searchGroups as allSearchGroupsConfig } from '@/lib/utils';
import { toast } from 'sonner';

type SpeechRecognitionEvent = any;

const MAX_HISTORY_LENGTH = 10;
const CHAT_HISTORY_KEY = 'a4f-chat-history';

/**
 * Main composer hook for chat page logic. Integrates API management,
 * core chat state, and stream handling functionalities.
 */
export function useChatLogic() {
  const [selectedModel, setSelectedModel] = useLocalStorage<string>(
      'scira-selected-model',
      fallbackModels.find(m => m.modelType === 'free')?.value || "system-provider/default-fallback-free"
  );

  const {
    apiKey, setApiKey, isKeyLoaded,
    apiKeys, setApiKeyByType, isKeysLoaded,
    accountInfo, isAccountLoading, fetchAccountInfo,
    availableModels,
    showSimpleApiKeyInput, setShowSimpleApiKeyInput,
    currentPlan, setCurrentPlan,
    modelFetchingStatus, modelFetchingError,
    isTavilyKeyAvailable, handleGroupSelection: apiHandleGroupSelection,
  } = useApiManagement(selectedModel, setSelectedModel);

  const {
    messages, setMessages,
    input, setInput,
    attachments, setAttachments,
    selectedGroup, setSelectedGroup,
    hasSubmitted, setHasSubmitted,
    systemPrompt, setSystemPrompt,
    isSystemPromptVisible, setIsSystemPromptVisible,
    resetChatState: coreResetChatState,
    fileInputRef, inputRef, systemPromptInputRef,
  } = useChatCoreState();

  const [chatHistory, setChatHistory] = useLocalStorage<ChatHistoryEntry[]>(CHAT_HISTORY_KEY, []);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Customization States
  const [isChatHistoryFeatureEnabled, setIsChatHistoryFeatureEnabled] = useLocalStorage<boolean>('a4f-chat-history-feature-enabled', true);
  const defaultEnabledGroupIds = allSearchGroupsConfig.filter(g => g.show).map(g => g.id);
  const [enabledSearchGroupIds, setEnabledSearchGroupIds] = useLocalStorage<SearchGroupId[]>('a4f-enabled-search-groups', defaultEnabledGroupIds);
  const [isTextToSpeechFeatureEnabled, setIsTextToSpeechFeatureEnabled] = useLocalStorage<boolean>('a4f-tts-feature-enabled', true);
  const [isSystemPromptButtonEnabled, setIsSystemPromptButtonEnabled] = useLocalStorage<boolean>('a4f-system-prompt-button-enabled', true);
  const [isAttachmentButtonEnabled, setIsAttachmentButtonEnabled] = useLocalStorage<boolean>('a4f-attachment-button-enabled', true);
  const [isSpeechToTextEnabled, setIsSpeechToTextEnabled] = useLocalStorage<boolean>('a4f-speech-to-text-enabled', true);
  const [ttsProvider, setTtsProvider] = useLocalStorage<'browser' | 'elevenlabs'>('a4f-tts-provider', 'browser');
  const [browserTtsSpeed, setBrowserTtsSpeed] = useLocalStorage<number>('a4f-browser-tts-speed', 1.0);
  const [selectedBrowserTtsVoiceURI, setSelectedBrowserTtsVoiceURI] = useLocalStorage<string | undefined>('a4f-browser-tts-voice-uri', undefined);
  const [availableBrowserVoices, setAvailableBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // Speech-to-text states
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Editing message states
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);


  const isSearchGroupEnabled = useCallback((groupId: SearchGroupId) => {
    return enabledSearchGroupIds.includes(groupId);
  }, [enabledSearchGroupIds]);

  const toggleSearchGroup = useCallback((groupId: SearchGroupId) => {
    setEnabledSearchGroupIds(prev => {
      const newEnabled = prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId];
      if (selectedGroup === groupId && !newEnabled.includes(groupId)) {
        const chatGroupAvailable = newEnabled.includes('chat');
        setSelectedGroup(chatGroupAvailable ? 'chat' : (newEnabled[0] || 'chat'));
      }
      return newEnabled;
    });
  }, [selectedGroup, setSelectedGroup, setEnabledSearchGroupIds]);

    useEffect(() => {
    const populateVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const allVoices = window.speechSynthesis.getVoices();
        if (allVoices.length === 0 && 'onvoiceschanged' in window.speechSynthesis) {
          return;
        }

        const desiredVoiceNames = [
          'en-GB-MaisieNeural',
          'en-GB-RyanNeural',
          'en-GB-SoniaNeural',
          'en-US-EmmaNeural',
          'en-US-EricNeural'
        ];
        const desiredLangsForFallback = ['en-GB', 'en-US'];
        const keywordMap: Record<string, string[]> = {
          'en-GB': ['Maisie', 'Ryan', 'Sonia'],
          'en-US': ['Eric' , 'Emma'],
        };
        let matchedVoices: SpeechSynthesisVoice[] = [];

        // 1. Exact name or URI match
        desiredVoiceNames.forEach(name => {
          const voice = allVoices.find(v => v.name === name || v.voiceURI === name);
          if (voice) matchedVoices.push(voice);
        });

        // 2. Fuzzy name match within language (if exact names not found)
        if (matchedVoices.length < desiredVoiceNames.length) {
          desiredLangsForFallback.forEach(lang => {
            const langVoices = allVoices.filter(v => v.lang === lang);
            (keywordMap[lang] || []).forEach(keyword => {
              // Ensure we haven't already added this exact voice
              const voice = langVoices.find(v => v.name.includes(keyword) && !matchedVoices.some(mv => mv.voiceURI === v.voiceURI));
              if (voice) matchedVoices.push(voice);
            });
          });
        }
        
        // 3. Language-based fallback if specific names still not found or not enough matches
        if (matchedVoices.length === 0 || (matchedVoices.length < desiredVoiceNames.length && (desiredLangsForFallback.includes('af-ZA') || desiredLangsForFallback.includes('am-ET')) )) {
            desiredLangsForFallback.forEach(lang => {
                const langVoices = allVoices.filter(v => v.lang === lang);
                if (langVoices.length > 0) {
                    // Try to find by keywords again for this language if not already fully populated
                    (keywordMap[lang] || []).forEach(keyword => {
                         const voiceByName = langVoices.find(v => v.name.includes(keyword) && !matchedVoices.some(mv => mv.voiceURI === v.voiceURI));
                         if (voiceByName) matchedVoices.push(voiceByName);
                    });

                    // If specific names still not found for this lang, add first 1-2 generic voices
                    const langSpecificKeywords = keywordMap[lang] || [];
                    const keywordsFoundForLang = langSpecificKeywords.some(kw => matchedVoices.some(mv => mv.name.includes(kw) && mv.lang === lang));
                    
                    if (!keywordsFoundForLang) {
                        langVoices.slice(0, lang === 'af-ZA' ? 2 : 1).forEach(v => {
                             if (!matchedVoices.some(mv => mv.voiceURI === v.voiceURI)) matchedVoices.push(v);
                        });
                    }
                }
            });
        }

        const uniqueVoiceURIs = new Set<string>();
        const finalFilteredVoices = matchedVoices.filter(voice => {
          if (!uniqueVoiceURIs.has(voice.voiceURI)) {
            uniqueVoiceURIs.add(voice.voiceURI);
            return true;
          }
          return false;
        });

        setAvailableBrowserVoices(finalFilteredVoices);
        
        if (finalFilteredVoices.length > 0) {
          const currentSelectedVoiceExists = finalFilteredVoices.some(v => v.voiceURI === selectedBrowserTtsVoiceURI);
          if (!selectedBrowserTtsVoiceURI || !currentSelectedVoiceExists) {
            let defaultVoice: SpeechSynthesisVoice | undefined = undefined;
            for (const name of desiredVoiceNames) {
                defaultVoice = finalFilteredVoices.find(v => v.name === name || v.voiceURI === name);
                if (defaultVoice) break;
            }
            if (!defaultVoice) {
                defaultVoice = finalFilteredVoices[0];
            }
            setSelectedBrowserTtsVoiceURI(defaultVoice?.voiceURI);
          }
        } else if (selectedBrowserTtsVoiceURI) {
            setSelectedBrowserTtsVoiceURI(undefined);
        }
      }
    };

    populateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = populateVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [selectedBrowserTtsVoiceURI, setSelectedBrowserTtsVoiceURI]);


  const saveOrUpdateCurrentChatInHistory = useCallback((messagesForHistory: SimpleMessage[]) => {
    if (!isChatHistoryFeatureEnabled || messagesForHistory.length === 0) return;

    const cleanMessagesForHistory = messagesForHistory.filter(msg =>
        !(msg.role === 'assistant' && msg.isStreaming && !msg.content && !msg.thinkingContent)
    );

    if (cleanMessagesForHistory.length === 0) return;

    let entryToSave: ChatHistoryEntry;
    let newHistory = [...chatHistory];

    if (currentChatId) { 
      const existingEntryIndex = newHistory.findIndex(chat => chat.id === currentChatId);
      if (existingEntryIndex !== -1) {
        const existingEntry = newHistory[existingEntryIndex];
        entryToSave = {
          ...existingEntry,
          messages: cleanMessagesForHistory,
          timestamp: Date.now(),
          selectedModel,
          selectedGroup,
          systemPrompt,
          attachments,
        };
        newHistory.splice(existingEntryIndex, 1); 
        newHistory.unshift(entryToSave); 
      } else {
        const newId = `chat-${Date.now()}`;
        setCurrentChatId(newId);
        const firstUserMessage = cleanMessagesForHistory.find(m => m.role === 'user');
        const title = firstUserMessage?.content.substring(0, 50) || "Untitled Chat";
        entryToSave = {
          id: newId, title, timestamp: Date.now(), messages: cleanMessagesForHistory,
          selectedModel, selectedGroup, systemPrompt, attachments,
        };
        newHistory.unshift(entryToSave);
      }
    } else { 
      const newId = `chat-${Date.now()}`;
      setCurrentChatId(newId);
      const firstUserMessage = cleanMessagesForHistory.find(m => m.role === 'user');
      const title = firstUserMessage?.content.substring(0, 50) || "Untitled Chat";
      entryToSave = {
        id: newId, title, timestamp: Date.now(), messages: cleanMessagesForHistory,
        selectedModel, selectedGroup, systemPrompt, attachments,
      };
      newHistory.unshift(entryToSave);
    }

    if (newHistory.length > MAX_HISTORY_LENGTH) {
      newHistory = newHistory.slice(0, MAX_HISTORY_LENGTH);
    }
    setChatHistory(() => newHistory);

  }, [currentChatId, chatHistory, selectedModel, selectedGroup, systemPrompt, attachments, setChatHistory, setCurrentChatId, isChatHistoryFeatureEnabled]);


  const loadChatFromHistory = useCallback((chatId: string) => {
    if (!isChatHistoryFeatureEnabled) {
        toast.info("Chat history feature is currently disabled.");
        return;
    }
    const chatToLoad = chatHistory.find(chat => chat.id === chatId);
    if (chatToLoad) {
      setMessages(chatToLoad.messages);
      setSelectedModel(chatToLoad.selectedModel);
      setSelectedGroup(chatToLoad.selectedGroup);
      setSystemPrompt(chatToLoad.systemPrompt);
      setAttachments(chatToLoad.attachments || []);
      setCurrentChatId(chatToLoad.id);
      setHasSubmitted(true);
      setInput('');
      setEditingMessageId(null); 
      toast.info(`Loaded chat: "${chatToLoad.title}"`);
    }
  }, [chatHistory, setMessages, setSelectedModel, setSelectedGroup, setSystemPrompt, setAttachments, setCurrentChatId, setHasSubmitted, setInput, isChatHistoryFeatureEnabled, setEditingMessageId]);

  const deleteChatFromHistory = useCallback((chatId: string) => {
    if (!isChatHistoryFeatureEnabled) return;
    setChatHistory(prevHistory => prevHistory.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
        setCurrentChatId(null);
        coreResetChatState(); 
        setEditingMessageId(null);
        toast.info("Active chat removed from history. New chat started.");
    } else {
        toast.info("Chat removed from history");
    }
  }, [setChatHistory, currentChatId, setCurrentChatId, coreResetChatState, isChatHistoryFeatureEnabled, setEditingMessageId]);


  const handleNewChatSession = useCallback(() => {
    setCurrentChatId(null);
    coreResetChatState();
    setEditingMessageId(null);
    toast.info("New chat session started");
  }, [coreResetChatState, setCurrentChatId, setEditingMessageId]);

  const clearAllChatHistory = useCallback(() => {
    if (!isChatHistoryFeatureEnabled) {
        toast.info("Chat history feature is currently disabled. Enable it in settings to clear history.");
        return;
    }
    setChatHistory(() => []); 
    setCurrentChatId(null);
    coreResetChatState();
    setEditingMessageId(null);
    toast.success("All chat history cleared!");
  }, [setChatHistory, setCurrentChatId, coreResetChatState, isChatHistoryFeatureEnabled, setEditingMessageId]);

  const handleFullReset = useCallback(() => {
    setApiKeyByType('a4f', null);
    setApiKeyByType('tavily', null);
    setApiKeyByType('elevenlabs', null);
    clearAllChatHistory(); 
    setCurrentPlan('free');
    setSelectedModel(fallbackModels.find(m => m.modelType === 'free')?.value || "system-provider/default-fallback-free");
    setIsChatHistoryFeatureEnabled(true);
    setEnabledSearchGroupIds(allSearchGroupsConfig.filter(g => g.show).map(g => g.id));
    setIsTextToSpeechFeatureEnabled(true);
    setIsSystemPromptButtonEnabled(true);
    setIsAttachmentButtonEnabled(true);
    setIsSpeechToTextEnabled(true);
    setTtsProvider('browser');
    setBrowserTtsSpeed(1.0);
    setSelectedBrowserTtsVoiceURI(undefined);
    setShowSimpleApiKeyInput(true);
    setEditingMessageId(null);
    toast.success("Application has been reset to defaults.");
  }, [
    setApiKeyByType, 
    clearAllChatHistory, 
    setCurrentPlan, 
    setSelectedModel, 
    setIsChatHistoryFeatureEnabled, 
    setEnabledSearchGroupIds, 
    setIsTextToSpeechFeatureEnabled, 
    setIsSystemPromptButtonEnabled, 
    setIsAttachmentButtonEnabled, 
    setIsSpeechToTextEnabled,
    setTtsProvider, 
    setBrowserTtsSpeed,
    setSelectedBrowserTtsVoiceURI,
    setShowSimpleApiKeyInput,
    setEditingMessageId
  ]);


  const handleGroupSelection = useCallback((group: SearchGroup) => {
    if (!enabledSearchGroupIds.includes(group.id)) {
        toast.error(`${group.name} group is currently disabled. You can enable it in Customization settings.`);
        return; 
    }
    apiHandleGroupSelection(group, selectedGroup, setSelectedGroup);
  }, [apiHandleGroupSelection, selectedGroup, setSelectedGroup, enabledSearchGroupIds]);

  const handleToggleListening = useCallback(() => {
    if (!isSpeechToTextEnabled) {
      toast.info("Speech-to-text is disabled in settings.");
      return;
    }
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      toast.error("Speech recognition is not supported by your browser.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      // setIsListening(false); // onend will handle this
      // recognitionRef.current = null; // onend will handle this
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        toast.success("Listening...", { duration: 2000, id: "stt-listening-toast" });
      };

      let finalTranscript = '';
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        // Append final transcript to input.
        if (finalTranscript) {
            setInput(prevInput => prevInput + (prevInput ? " " : "") + finalTranscript.trim());
            finalTranscript = ''; 
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        toast.dismiss("stt-listening-toast");
        if (event.error === 'no-speech') {
          toast.error("No speech detected. Please try again.", {id: "stt-error-toast"});
        } else if (event.error === 'audio-capture') {
          toast.error("Microphone problem. Ensure it's connected and permission is granted.", {id: "stt-error-toast"});
        } else if (event.error === 'not-allowed') {
          toast.error("Microphone access denied. Please allow access in browser settings.", {id: "stt-error-toast"});
        } else {
          toast.error(`Speech recognition error: ${event.error}`, {id: "stt-error-toast"});
        }
        
        if (recognitionRef.current) {
            recognitionRef.current.stop(); // Ensure it's stopped
        }
        setIsListening(false);
        recognitionRef.current = null; 
      };

      recognitionRef.current.onend = () => {
        toast.dismiss("stt-listening-toast");
        setIsListening(false);
        recognitionRef.current = null; 
      };
      
      try {
        recognitionRef.current.start();
      } catch (e: any) {
        toast.error(`Could not start speech recognition: ${e.message}`, {id: "stt-error-toast"});
        setIsListening(false);
        recognitionRef.current = null;
      }
    }
  }, [isListening, setInput, isSpeechToTextEnabled]);
  
  useEffect(() => {
      if (!isSpeechToTextEnabled && isListening) {
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
          // setIsListening(false); // onend will handle this
          // recognitionRef.current = null; // onend will handle this
      }
  }, [isSpeechToTextEnabled, isListening]);

  const {
    handleSend: streamHandlerSend,
    handleStopStreaming,
    handleRetry,
    chatStatus,
    isStreamCancelledByUser,
    lastError: chatLastError,
    errorType: chatErrorType,
    errorDetails: chatErrorDetails,
  } = useChatStreamHandler({
    apiKey,
    selectedModelValue: selectedModel,
    availableModels,
    currentMessages: messages,
    currentAttachments: attachments,
    currentSelectedGroup: selectedGroup,
    currentSystemPrompt: systemPrompt,
    setMessages,
    setInput,
    setHasSubmitted,
    onMessagesUpdatedForHistory: saveOrUpdateCurrentChatInHistory,
  });

  const handleSendWrapper = useCallback(async (messageContent: string) => {
    if (editingMessageId) {
      const messageIndex = messages.findIndex(msg => msg.id === editingMessageId);
      if (messageIndex !== -1) {
        const messagesToKeep = messages.slice(0, messageIndex);
        const updatedUserMessage: SimpleMessage = {
          ...messages[messageIndex], 
          content: messageContent,
          createdAt: new Date(), 
        };
        const newMessagesState = [...messagesToKeep, updatedUserMessage];
        setMessages(newMessagesState); 
      }
      setEditingMessageId(null); 
    }
    await streamHandlerSend(messageContent);
  }, [streamHandlerSend, editingMessageId, messages, setMessages, setEditingMessageId]);

  const handleStartEdit = useCallback((messageId: string, currentContent: string) => {
    setEditingMessageId(messageId);
    setInput(currentContent);
    if (inputRef.current) {
      inputRef.current.focus();
      setTimeout(() => {
        if (inputRef.current) {
            inputRef.current.selectionStart = inputRef.current.selectionEnd = inputRef.current.value.length;
        }
      }, 0);
    }
  }, [setInput, inputRef, setEditingMessageId]);

  const handleCancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setInput(''); 
  }, [setInput, setEditingMessageId]);

  const [overallStatus, setOverallStatus] = useState<'ready' | 'processing' | 'error'>('ready');
  useEffect(() => {
    if (modelFetchingStatus === 'processing' || chatStatus === 'processing') {
      setOverallStatus('processing');
    } else if (modelFetchingStatus === 'error' || chatStatus === 'error') {
      setOverallStatus('error');
    } else {
      setOverallStatus('ready');
    }
  }, [modelFetchingStatus, chatStatus]);

  const lastError = chatLastError || modelFetchingError;
  const errorType = chatErrorType || (modelFetchingStatus === 'error' ? 'generic' : 'generic');
  const errorDetails = chatErrorDetails || null;


  return {
    apiKey, setApiKey, isKeyLoaded,
    apiKeys, setApiKeyByType, isKeysLoaded,
    availableModels,
    selectedModel, setSelectedModel,
    messages, setMessages,
    input, setInput,
    attachments, setAttachments,
    systemPrompt, setSystemPrompt,
    isSystemPromptVisible, setIsSystemPromptVisible,
    status: overallStatus,
    handleSend: handleSendWrapper, 
    handleStopStreaming, handleRetry, fetchAccountInfo,
    resetChatState: handleNewChatSession,
    selectedGroup, setSelectedGroup,
    hasSubmitted, setHasSubmitted,
    showSimpleApiKeyInput, setShowSimpleApiKeyInput,
    accountInfo,
    isAccountLoading,
    currentPlan, setCurrentPlan,
    fileInputRef, inputRef, systemPromptInputRef,
    isStreamCancelledByUser,
    lastError,
    errorType,
    errorDetails,
    isTavilyKeyAvailable,
    handleGroupSelection, 
    chatHistory,
    loadChatFromHistory,
    deleteChatFromHistory,
    clearAllChatHistory,
    handleFullReset,
    
    // Customization states and functions
    isChatHistoryFeatureEnabled, setIsChatHistoryFeatureEnabled,
    enabledSearchGroupIds,
    isSearchGroupEnabled,
    toggleSearchGroup,
    isTextToSpeechFeatureEnabled, setIsTextToSpeechFeatureEnabled,
    isSystemPromptButtonEnabled, setIsSystemPromptButtonEnabled,
    isAttachmentButtonEnabled, setIsAttachmentButtonEnabled,
    isSpeechToTextEnabled, setIsSpeechToTextEnabled, 
    ttsProvider, setTtsProvider,
    browserTtsSpeed, setBrowserTtsSpeed,
    availableBrowserVoices, 
    selectedBrowserTtsVoiceURI, setSelectedBrowserTtsVoiceURI, 

    // Speech-to-text
    isListening, 
    handleToggleListening,

    // Editing messages
    editingMessageId,
    handleStartEdit,
    handleCancelEdit,
  };
}
