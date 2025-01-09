"use client";
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from "react";
export interface Message {
  role: 'user' | 'ai';
  content: string;
}
const useChatMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    // Initialize messages from localStorage only on initial render
    if (typeof window !== 'undefined') {
      const storedMessages = localStorage.getItem(`messages_${conversationId}`);
      return storedMessages ? JSON.parse(storedMessages) : [];
    }
    return [];
  });

  const queryClient = useQueryClient();

  const addMessage = useCallback((newMessage: Message) => {
    setMessages((prev: any) => {
      const updated = [...prev, newMessage];
      if (typeof window !== 'undefined') {
        localStorage.setItem(`messages_${conversationId}`, JSON.stringify(updated));
      }
      return updated;
    });
    
    queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
  } ,[conversationId, queryClient]);

  return { messages, addMessage };
};

export default useChatMessages;
