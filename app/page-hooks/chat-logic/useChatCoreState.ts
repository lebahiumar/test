import { useState, useRef, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { SimpleMessage, Attachment, SearchGroupId } from '@/lib/utils';

/**
 * Manages core chat state including messages, input, attachments,
 * selected group, and input refs.
 */
export function useChatCoreState() {
  const [messages, setMessages] = useState<SimpleMessage[]>([]);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [selectedGroup, setSelectedGroup] = useLocalStorage<SearchGroupId>('scira-selected-group', 'chat');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [isSystemPromptVisible, setIsSystemPromptVisible] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const systemPromptInputRef = useRef<HTMLTextAreaElement>(null);

  const resetChatState = useCallback(() => {
    setMessages([]);
    setHasSubmitted(false);
    setInput('');
    setAttachments([]);
    setSystemPrompt('');
    setIsSystemPromptVisible(false);
    // Note: Error state is managed in useChatStreamHandler,
    // but could be reset here if needed globally
    if (inputRef.current) inputRef.current.focus();
  }, [inputRef]);

  return {
    messages,
    setMessages,
    input,
    setInput,
    attachments,
    setAttachments,
    selectedGroup,
    setSelectedGroup,
    hasSubmitted,
    setHasSubmitted,
    systemPrompt,
    setSystemPrompt,
    isSystemPromptVisible,
    setIsSystemPromptVisible,
    resetChatState,
    fileInputRef,
    inputRef,
    systemPromptInputRef,
  };
}