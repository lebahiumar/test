// app/page-hooks/chat-logic/stream-handler-helpers/errorHandler.ts
import OpenAI from 'openai';
import { SimpleMessage } from '@/lib/utils';
import React from 'react';

type SetMessagesType = React.Dispatch<React.SetStateAction<SimpleMessage[]>>;

export interface HandleStreamErrorParams {
  error: any;
  setMessages: SetMessagesType;
  currentAssistantMessageIdRef: React.MutableRefObject<string | null>;
  selectedModelValue: string;
  setLastError: (error: string | null) => void;
  setErrorType: (type: SimpleMessage['errorType']) => void;
  setErrorDetails: (details: any) => void;
}

/**
 * Handles errors occurring during chat completion stream, updates message state and error states.
 */
export function handleStreamError({
  error,
  setMessages,
  currentAssistantMessageIdRef,
  selectedModelValue,
  setLastError,
  setErrorType,
  setErrorDetails,
}: HandleStreamErrorParams): void {
  console.error("Chat completion error (OpenAI SDK):", error);
  let errorMessage = 'Failed to get response';
  let errorTypeToSet: SimpleMessage['errorType'] = 'generic';
  let errorDetailsToSet: any = null;

  if (error instanceof OpenAI.APIError) {
    if (error.status === 429) {
      errorTypeToSet = 'rate-limit';
      errorMessage = `Rate limit exceeded. Please try again later or upgrade your plan for unlimited access.`;
      errorDetailsToSet = { status: error.status, type: error.type, code: error.code };
    } else if (error.status === 403) {
       try {
          const errorDetailJson = typeof error.error === 'string' ? JSON.parse(error.error) : error.error;
          const errorDetail = errorDetailJson?.detail || errorDetailJson;

          if (errorDetail?.error?.type === 'permission_denied' && errorDetail?.error?.code === 'provider_plan_restricted') {
            errorTypeToSet = 'plan-restriction';
            errorMessage = `The provider for model '${selectedModelValue}' is not available for your current plan.`;
            errorDetailsToSet = errorDetail;
          } else {
            errorTypeToSet = 'generic';
            errorMessage = `API Error (403): ${error.name || 'PermissionDenied'} - ${error.message || 'No message'}`;
          }
      } catch (e) {
          errorTypeToSet = 'generic';
          errorMessage = `API Error (403): ${error.name || 'PermissionDenied'} - ${error.message || 'No message'}`;
      }
    } else {
      errorMessage = `API Error (${error.status || 'N/A'}): ${error.name || 'UnknownError'} - ${error.message || 'No message'}`;
      if (error.code) errorMessage += ` (Code: ${error.code})`;
      if (error.type) errorMessage += ` (Type: ${error.type})`;
    }
  } else if (error instanceof Error) {
    errorMessage = `Error: ${error.message}`;
  }

  setLastError(errorMessage);
  setErrorType(errorTypeToSet);
  setErrorDetails(errorDetailsToSet);

  const errorHandlingMessageId = currentAssistantMessageIdRef.current;
  if (errorHandlingMessageId) {
    setMessages(prev =>
      prev.map((msg: SimpleMessage) =>
        msg.id === errorHandlingMessageId
          ? { 
              ...msg, 
              content: errorMessage, 
              isStreaming: false, 
              modelId: selectedModelValue, 
              isError: true, 
              errorType: errorTypeToSet, 
              errorDetails: errorDetailsToSet,
              isInterrupted: false 
            }
          : msg
      )
    );
  } else {
    const errorMsgToAdd: SimpleMessage = {
      id: `error-${Date.now()}`, 
      role: 'assistant', 
      content: errorMessage, 
      createdAt: new Date(),
      isStreaming: false, 
      modelId: selectedModelValue, 
      isError: true, 
      errorType: errorTypeToSet, 
      errorDetails: errorDetailsToSet,
      isInterrupted: false
    };
    setMessages(prev => [...prev, errorMsgToAdd]);
  }
}