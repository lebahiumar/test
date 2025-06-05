
// app/page-hooks/chat-logic/useChatStreamHandler.ts
import { useState, useCallback, useRef } from 'react';
import OpenAI from 'openai';
import { toast } from 'sonner';
import {
    API_BASE_URL,
    SimpleMessage,
    Attachment,
    ModelUIData,
    SearchGroupId
} from '@/lib/utils';
import { processStreamChunks } from './stream-handler-helpers/chunkProcessor';
import { handleStreamError } from './stream-handler-helpers/errorHandler';

interface UseChatStreamHandlerProps {
    apiKey: string | null;
    selectedModelValue: string;
    availableModels: ModelUIData[];
    currentMessages: SimpleMessage[];
    currentAttachments: Attachment[];
    currentSelectedGroup: SearchGroupId;
    currentSystemPrompt: string;
    setMessages: React.Dispatch<React.SetStateAction<SimpleMessage[]>>;
    setInput: (input: string) => void;
    setHasSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
    onMessagesUpdatedForHistory: (updatedMessages: SimpleMessage[]) => void; // Callback to trigger history save/update
}

/**
 * Handles sending messages, streaming responses, and managing
 * errors related to chat completions.
 */
export function useChatStreamHandler({
    apiKey,
    selectedModelValue,
    availableModels,
    currentMessages,
    currentAttachments,
    currentSelectedGroup,
    currentSystemPrompt,
    setMessages,
    setInput,
    setHasSubmitted,
    onMessagesUpdatedForHistory, // New callback
}: UseChatStreamHandlerProps) {
  const [chatStatus, setChatStatus] = useState<'ready' | 'processing' | 'error'>('ready');
  const internalIsStreamCancelledByUserRef = useRef(false);
  const [isStreamCancelledForParent, setIsStreamCancelledForParent] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<SimpleMessage['errorType']>('generic');
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const currentAssistantMessageId = useRef<string | null>(null);

  const handleStopStreaming = useCallback(() => {
    internalIsStreamCancelledByUserRef.current = true;
    setIsStreamCancelledForParent(true);
    toast.info("Stopping message generation...");
  }, [setIsStreamCancelledForParent]);

  const handleSend = useCallback(async (messageContent: string) => {
    if (chatStatus === 'processing') {
        toast.warning("Please wait for the current response.");
        return;
    }
    const requestStartTime = Date.now(); // Record start time for roundTripTime

    // IMAGE MODE: If currentSelectedGroup is 'image', call image generation API
    if (currentSelectedGroup === 'image') {
      if (!apiKey) {
          toast.error("API Key is required for image generation.");
          setLastError("API Key is required for image generation.");
          setErrorType('generic');
          setChatStatus('error');
          return;
      }
      const prompt = messageContent.trim();
      if (!prompt) return;
      setChatStatus('processing');
      setLastError(null);
      setErrorType('generic');
      setErrorDetails(null);
      internalIsStreamCancelledByUserRef.current = false;
      setIsStreamCancelledForParent(false);

      const newUserMessage: SimpleMessage = {
        id: `user-${Date.now()}-${Math.random()}`,
        role: 'user',
        content: prompt,
        createdAt: new Date(),
      };
      const assistantMessageId = `assistant-${Date.now()}-${Math.random()}`;
      currentAssistantMessageId.current = assistantMessageId;
      
      const assistantResponseEndTime = Date.now();
      const roundTripTime = (assistantResponseEndTime - requestStartTime) / 1000;

      const assistantPlaceholder: SimpleMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        createdAt: new Date(),
        isStreaming: true,
        modelId: selectedModelValue,
        isError: false,
        roundTripTime: roundTripTime, // Add roundTripTime here
      };
      
      const updatedMessagesForUi = [...currentMessages, newUserMessage, assistantPlaceholder];
      setMessages(updatedMessagesForUi);
      onMessagesUpdatedForHistory(updatedMessagesForUi); // Trigger history update

      setInput('');
      if (currentMessages.length === 0) setHasSubmitted(true);
      try {
        const response = await fetch('https://api.a4f.co/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: selectedModelValue,
            prompt,
          }),
        });

        if (!response.ok) {
          let errorBodyText = `Image API request failed with status ${response.status}`;
          try {
            const errorJson = await response.json();
            errorBodyText += `: ${errorJson.message || errorJson.detail || JSON.stringify(errorJson)}`;
          } catch (e) {
            try {
                const textError = await response.text();
                errorBodyText += `. Response: ${textError.substring(0, 200)}`;
            } catch (textE) {
                // Ignore
            }
          }
          throw new Error(errorBodyText);
        }

        const data = await response.json();
        const imageUrl = data?.data?.[0]?.url;
        const imageResponseEndTime = Date.now();
        const finalRoundTripTime = (imageResponseEndTime - requestStartTime) / 1000;
        
        setMessages(prev => {
            const finalMessages = prev.map(msg =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    content: imageUrl ? `![Generated Image](${imageUrl})` : 'No image URL returned by API.',
                    isStreaming: false,
                    modelId: selectedModelValue,
                    roundTripTime: finalRoundTripTime,
                  }
                : msg
            );
            onMessagesUpdatedForHistory(finalMessages); // Update history with final image result
            return finalMessages;
        });
      } catch (error: any) {
        console.error("Image generation API error:", error);
        let errorMessageToDisplay = error.message || 'Image generation failed due to an unknown error.';
        
        if (error.message && typeof error.message === 'string' && error.message.includes('status 400')) {
            errorMessageToDisplay = `Please select an image generation model. ${errorMessageToDisplay}`;
        }
        const errorResponseEndTime = Date.now();
        const errorRoundTripTime = (errorResponseEndTime - requestStartTime) / 1000;
        
        setLastError(errorMessageToDisplay);
        setErrorType('generic'); // Set the state for errorType

        setMessages(prev => { // This is line 175
            const errorMessages = prev.map(msg =>
              msg.id === assistantMessageId 
                ? {
                    ...msg,
                    content: errorMessageToDisplay,
                    isStreaming: false,
                    isError: true,
                    errorType: 'generic' as SimpleMessage['errorType'], // Explicitly cast 'generic'
                    modelId: selectedModelValue,
                    roundTripTime: errorRoundTripTime,
                  }
                : msg
            );
            onMessagesUpdatedForHistory(errorMessages); // Update history with error message
            return errorMessages;
        });
      } finally {
        setChatStatus('ready');
      }
      return;
    }

    // Chat completion logic for non-image groups
    if (!apiKey) {
        toast.error("API Key is required for chat functions.");
        setLastError("API Key is required for chat functions.");
        setErrorType('generic');
        setChatStatus('error');
        return;
    }
    
    const modelData = availableModels.find(m => m.value === selectedModelValue);
    if (!modelData) {
        toast.error("Selected model is not available or models not loaded. Cannot send message.");
        setLastError("Selected model is not available or models not loaded.");
        setErrorType('generic');
        setChatStatus('error');
        return;
    }

    const contentToUse = messageContent.trim();
    if (!contentToUse && currentAttachments.length === 0) return;

    setChatStatus('processing');
    setLastError(null);
    setErrorType('generic');
    setErrorDetails(null);
    internalIsStreamCancelledByUserRef.current = false;
    setIsStreamCancelledForParent(false);

    const newUserMessage: SimpleMessage = {
        id: `user-${Date.now()}-${Math.random()}`,
        role: 'user',
        content: contentToUse,
        createdAt: new Date(),
    };

    const apiPayloadMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
    
    if (currentSystemPrompt && currentSystemPrompt.trim()) {
        apiPayloadMessages.push({ 
            role: 'system', 
            content: currentSystemPrompt.trim() 
        });
    }
    
    // Prepare messages for API payload from currentMessages + new user message
    [...currentMessages, newUserMessage]
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .forEach(msg => {
            const content = msg.content || '';
            
            if (msg.role === 'user') {
                apiPayloadMessages.push({
                    role: 'user',
                    content: content as string | OpenAI.Chat.Completions.ChatCompletionContentPart[]
                });
            } else {
                apiPayloadMessages.push({
                    role: 'assistant',
                    content: content as string
                });
            }
        });

    const assistantMessageId = `assistant-${Date.now()}-${Math.random()}`;
    currentAssistantMessageId.current = assistantMessageId;
    const assistantPlaceholder: SimpleMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        createdAt: new Date(),
        isStreaming: true,
        modelId: selectedModelValue,
        isError: false,
    };

    // Update UI and trigger history save with user message and assistant placeholder
    const updatedMessagesForUi = [...currentMessages, newUserMessage, assistantPlaceholder];
    setMessages(updatedMessagesForUi);
    onMessagesUpdatedForHistory(updatedMessagesForUi);

    setInput('');
    if (currentMessages.length === 0) setHasSubmitted(true);


    const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: API_BASE_URL,
        dangerouslyAllowBrowser: true,
    });

    try {
        const stream = await openai.chat.completions.create({
            model: selectedModelValue,
            messages: apiPayloadMessages,
            stream: true,
            stream_options: { include_usage: true } // Request usage statistics
        } as OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming);

        const {
          finalContent,
          finalThinkingContent,
          wasCancelled,
          isEmptyStream,
          thinkTagProcessed,
          firstChunkTimestamp, // Get TTFT
          usage, // Get usage object
        } = await processStreamChunks({
          stream,
          setMessages, 
          currentAssistantMessageIdRef: currentAssistantMessageId,
          isStreamCancelledByUserRef: internalIsStreamCancelledByUserRef,
        });
        
        const responseEndTime = Date.now();


        // After stream processing, update history with the final assistant message state
        const finalMessageIdToUpdate = currentAssistantMessageId.current;
        if (finalMessageIdToUpdate) {
            let finalContentForDisplay = finalContent;
            let messageIsError = false;
            let messageErrorTypeValue: SimpleMessage['errorType'] = undefined;
            let messageErrorDetailsValue: any = null;

            if (wasCancelled) {
                finalContentForDisplay += "\n\n*(Message generation stopped by user)*";
            } else if (isEmptyStream) {
                finalContentForDisplay = "The streaming response closed without providing any content. We recommend switching to a different model from provider-4 or provider-5 as they tend to be more stable.";
                setLastError(finalContentForDisplay);
                setErrorType('empty-stream');
                messageIsError = true;
                messageErrorTypeValue = 'empty-stream';
            }
            
            const timeToFirstToken = firstChunkTimestamp ? (firstChunkTimestamp - requestStartTime) / 1000 : undefined;
            const streamDuration = firstChunkTimestamp ? (responseEndTime - firstChunkTimestamp) / 1000 : undefined;
            const totalInferenceTime = (timeToFirstToken && streamDuration) ? timeToFirstToken + streamDuration : undefined;
            const roundTripTime = (responseEndTime - requestStartTime) / 1000;

            setMessages(prev => {
                 const finalMessagesState = prev.map((msg: SimpleMessage) =>
                    msg.id === finalMessageIdToUpdate
                        ? {
                            ...msg,
                            content: finalContentForDisplay,
                            thinkingContent: finalThinkingContent || undefined,
                            isThinkingInProgress: false,
                            thinkingCompleted: thinkTagProcessed && (finalThinkingContent || "").length > 0,
                            isStreaming: false,
                            modelId: selectedModelValue,
                            isError: messageIsError,
                            errorType: messageErrorTypeValue,
                            errorDetails: messageErrorDetailsValue,
                            isInterrupted: wasCancelled,
                            // Add speed insights
                            promptTokens: usage?.prompt_tokens,
                            completionTokens: usage?.completion_tokens,
                            totalTokens: usage?.total_tokens,
                            timeToFirstToken,
                            streamDuration,
                            totalInferenceTime,
                            roundTripTime,
                          }
                        : msg
                );
                onMessagesUpdatedForHistory(finalMessagesState); // Final update for history
                return finalMessagesState;
            });
        }
        currentAssistantMessageId.current = null;

    } catch (error: any) {
        const errorResponseEndTime = Date.now();
        const errorRoundTripTime = (errorResponseEndTime - requestStartTime) / 1000;
        
        handleStreamError({
            error,
            setMessages, // This updates UI
            currentAssistantMessageIdRef: currentAssistantMessageId,
            selectedModelValue,
            setLastError,
            setErrorType,
            setErrorDetails,
        });
        // After error handling updates messages state, propagate this to history
        setMessages(prev => {
            const erroredMessages = prev.map(msg => 
                msg.id === currentAssistantMessageId.current 
                ? { ...msg, roundTripTime: errorRoundTripTime } 
                : msg
            );
            onMessagesUpdatedForHistory(erroredMessages);
            return erroredMessages;
        });
        toast.error(lastError || 'An unexpected error occurred while processing your request.');
        currentAssistantMessageId.current = null;
    } finally {
        setChatStatus('ready');
    }
  }, [
      apiKey, 
      selectedModelValue, 
      availableModels, 
      currentMessages, 
      currentAttachments, 
      currentSelectedGroup, 
      currentSystemPrompt, 
      setMessages, 
      setInput, 
      setHasSubmitted, 
      setIsStreamCancelledForParent,
      chatStatus,
      onMessagesUpdatedForHistory,
      lastError, // Added lastError to dependency array
  ]);

  const handleRetry = useCallback(async (assistantMessageIdToRetry: string) => {
    if (chatStatus === 'processing') {
        toast.warning("Please wait for the current response.");
        return;
    }

    const assistantMsgIndex = currentMessages.findIndex(msg => msg.id === assistantMessageIdToRetry);

    if (assistantMsgIndex === -1 || assistantMsgIndex === 0) {
        toast.error("Original message not found for retry.");
        console.error("Retry: Assistant message not found or is the first message.", assistantMessageIdToRetry, currentMessages);
        return;
    }

    const userMessageToRetry = currentMessages[assistantMsgIndex - 1];

    if (!userMessageToRetry || userMessageToRetry.role !== 'user') {
        toast.error("Could not find the user prompt to retry.");
        console.error("Retry: Preceding user message not found.", assistantMessageIdToRetry, currentMessages);
        return;
    }

    const promptContent = userMessageToRetry.content;
    
    const messagesBeforeRetry = currentMessages.slice(0, assistantMsgIndex);
    setMessages(messagesBeforeRetry); 

    toast.info(`Retrying prompt...`);
    await handleSend(promptContent);

  }, [chatStatus, currentMessages, handleSend, setMessages]);


  return {
    handleSend,
    handleStopStreaming,
    handleRetry,
    chatStatus,
    isStreamCancelledByUser: isStreamCancelledForParent,
    lastError,
    errorType,
    errorDetails,
    currentAssistantMessageId,
  };
}

