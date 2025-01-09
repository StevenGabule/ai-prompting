"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useChat } from "@/components/providers/ChatProvider"; // Access chat context
import ChatWindow from "@/components/conversation/ChatWindow";
import ChatInput from "@/components/conversation/ChatInput";
import { Message } from "@/hooks/useChatMessage"; // Custom hook for chat messages
import { v4 as uuidv4 } from 'uuid';
import { useSendMessage } from '@/hooks/useSendMessage';

const MainChatPage = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const chatRoomId = useRef(uuidv4()).current;
  const { mutate: sendMessage, isPending } = useSendMessage(chatRoomId);
  const { addChatRoom, setCurrentConversationId, setMessages, clearCurrentChat } = useChat();
  const router = useRouter();

  useEffect(() => {
    const isNewChat = searchParams.get('conversation') === 'new';
    if (isNewChat) {
      clearCurrentChat();
    }
  }, [searchParams, clearCurrentChat]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSendMessage = useCallback(async (input: string) => {
    if (input.trim()) {
      const userMessage = { role: 'user', content: input } as Message;
      const currentMessages = [userMessage];
      localStorage.setItem(`messages_${chatRoomId}`, JSON.stringify(currentMessages));
      setMessages(currentMessages);
      scrollToBottom();

      sendMessage(
        { text: input, conversation_id: chatRoomId },
        {
          onSuccess: (response) => {
            const aiMessage = { role: 'ai', content: response } as Message;
            const updatedMessages = [...currentMessages, aiMessage];
            
            localStorage.setItem(`messages_${chatRoomId}`, JSON.stringify(updatedMessages));
            setMessages(updatedMessages);
            scrollToBottom();

            const maxTitleLength = 20;
            const chatRoomTitle = input.length > maxTitleLength 
              ? `${input.slice(0, maxTitleLength)}...` 
              : input;
            const newRoom = { id: chatRoomId, title: chatRoomTitle };
            addChatRoom(newRoom);
            
            // Set current conversation ID before navigation
            setCurrentConversationId(chatRoomId);
            router.push(`/conversation/${chatRoomId}`);
          },
          onError: (error) => {
            console.error("Failed to send message:", error);
          },
        }
      )
    }
  }, [chatRoomId, scrollToBottom, sendMessage, addChatRoom, setMessages, router, setCurrentConversationId]);

  return (
    <div className="flex flex-col h-[80vh]">
      <ChatWindow />
      <ChatInput onSendMessage={handleSendMessage} disabled={isPending} />
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MainChatPage;
