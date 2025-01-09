"use client";
import { createContext, useContext, useEffect, useState, useCallback  } from "react";

interface ChatRoom {
  id: string;
  title: string;
}

interface Message {
  role: "user" | "ai";
  content: string;
}

interface ChatContextType {
  chatRooms: ChatRoom[];
  addChatRoom: (room: ChatRoom) => void;
  deleteChatRoom: (id: string) => void; // Add delete functionality
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  loading: boolean;
  currentConversationId: string | null;
  setCurrentConversationId: (id: string | null) => void;
  clearCurrentChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  useEffect(() => {
    const loadChatRooms = () => {
      if (typeof window !== 'undefined') {
        const storedRooms = window.localStorage.getItem("chatRooms");
        if (storedRooms) {
          setChatRooms(JSON.parse(storedRooms));
        }
        setLoading(false);
      }
    };
    loadChatRooms();
  }, []);

  useEffect(() => {
    if (chatRooms.length > 0) {
      localStorage.setItem("chatRooms", JSON.stringify(chatRooms));
    }
  }, [chatRooms]);

  useEffect(() => {
    if (currentConversationId) {
      const storedMessages = localStorage.getItem(`messages_${currentConversationId}`);
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      } else {
        setMessages([]);
      }
    }
  }, [currentConversationId]);

  const addChatRoom = (room: ChatRoom) => { 
    setChatRooms((prev) => {
      const newRooms = [...prev, room];
      localStorage.setItem("chatRooms", JSON.stringify(newRooms));
      return newRooms;
    });
  };

  const deleteChatRoom = useCallback((id: string) => {
    setChatRooms((prev) => {
      const newRooms = prev.filter((room) => room.id !== id);
      localStorage.setItem("chatRooms", JSON.stringify(newRooms));
      return newRooms;
    });
    localStorage.removeItem(`messages_${id}`);
  }, []);
  
  const clearCurrentChat = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(null);
  }, []);
  
  return (
    <ChatContext.Provider value={{ 
      chatRooms, 
      addChatRoom, 
      deleteChatRoom, 
      messages, 
      setMessages, 
      loading ,
      currentConversationId,
      setCurrentConversationId,
      clearCurrentChat
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
