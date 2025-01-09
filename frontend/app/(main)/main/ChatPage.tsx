"use client"; 

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@/components/providers/ChatProvider"; // Access chat context
import ChatWindow from "@/components/conversation/ChatWindow";
import ChatInput from "@/components/conversation/ChatInput";
import useChatMessages from "@/hooks/useChatMessage"; // Custom hook for chat messages
import useLocalStorage from "@/hooks/useLocalStorage"; // Import the localStorage hook
import { v4 as uuidv4 } from 'uuid';
import { useSendMessage } from "@/hooks/useSendMessage";
import { Message } from 'react-hook-form';

const ChatPage = () => {
  const { addChatRoom } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { mutate: sendMessage, isPending } = useSendMessage();

  // Generate a unique chat room ID when the component mounts
  const chatRoomId = uuidv4();
  const { messages, addMessage } = useChatMessages(chatRoomId); // Pass chatRoomId to the hook

  // Use the localStorage hook to manage messages
  const [storedMessages, setStoredMessages] = useLocalStorage(`messages_${chatRoomId}`, []); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [storedMessages]); // Scroll to the end of the messages when storedMessages change
  
  const saveMessagesToLocalStorage = (conversationId: string, messages: any[]) => {
    localStorage.setItem(`messages_${conversationId}`, JSON.stringify(messages));
  };

  const handleSendMessage = async (input: string) => {
    if (input.trim()) {
      const newMessage = { role: "user", content: input };
      const updatedMessages = [...messages, newMessage];
      saveMessagesToLocalStorage(chatRoomId, updatedMessages);

      sendMessage(
        { text: input, conversation_id: chatRoomId },
        {
          onSuccess: (response) => {
            const aiMessage = { role: "ai", content: response };
            const finalMessages = [...updatedMessages, aiMessage];
            saveMessagesToLocalStorage(chatRoomId, finalMessages); 

            const maxTitleLength = 20;
            const chatRoomTitle =
              input.length > maxTitleLength
                ? `${input.slice(0, maxTitleLength)}...`
                : input;

            const newRoom = { id: chatRoomId, title: chatRoomTitle };
            addChatRoom(newRoom);
            router.push(`/conversation/${chatRoomId}`);
          },
          onError: (error) => {
            console.error("Failed to send message:", error);
          },
        }
      )
    }
  };

  return (
    <div className="flex flex-col h-[80vh]">
      <ChatWindow messages={storedMessages} /> {/* Use storedMessages instead of messages */}
      <ChatInput onSendMessage={handleSendMessage} isPending={isPending}/>
      <div ref={messagesEndRef} /> {/* Reference for scrolling */}
    </div>
  );
};

export default ChatPage;
