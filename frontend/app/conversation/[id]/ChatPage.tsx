'use client';

import { useCallback, useEffect,  useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ChatWindow from "@/components/conversation/ChatWindow";
import ChatInput from "@/components/conversation/ChatInput";
import { useChat } from '@/components/providers/ChatProvider';
import useChatMessages, { Message } from '@/hooks/useChatMessage';
import { useSendMessage } from '@/hooks/useSendMessage';

const ConversationChatPage = () => {
  const {id}: {id: string} = useParams();
  const router = useRouter();
  const { chatRooms, setCurrentConversationId, setMessages } = useChat();
  const [isLoading, setIsLoading] = useState(true);
  const { mutate: sendMessage, isPending } = useSendMessage(id);

  useEffect(() => {
    const roomExists = chatRooms.some(room => room.id === id);
    if (!roomExists) {
      router.push('/');
    } else {
      setCurrentConversationId(id);
      setIsLoading(false);
    }
  }, [id, chatRooms, router, setCurrentConversationId]);

  const handleSendMessage = useCallback(async (input: string) => {
    if (input.trim()) {
      const userMessage = { role: 'user', content: input } as Message;
      const storedMessages = localStorage.getItem(`messages_${id}`);
      const currentMessages = storedMessages ? JSON.parse(storedMessages) : [];
      const updatedMessages = [...currentMessages, userMessage];

      localStorage.setItem(`messages_${id}`, JSON.stringify(updatedMessages));
      setMessages(updatedMessages);

      sendMessage(
        { text: input, conversation_id: id },
        {
          onSuccess: (response) => {
            const aiMessage = { role: 'ai', content: response } as Message;
            const finalMessages = [...updatedMessages, aiMessage];
            localStorage.setItem(`messages_${id}`, JSON.stringify(finalMessages));
            setMessages(finalMessages);
          },
          onError: (error) => {
            console.error('Failed to send message:', error);
          },
        }
      );
    }
  }, [id, sendMessage, setMessages]);

  if (isLoading) return null;

  return (
    <div className="flex flex-col h-[80vh]">
      <ChatWindow  />
      <ChatInput onSendMessage={handleSendMessage} disabled={isPending}/>
    </div>
  );
};

export default ConversationChatPage;
