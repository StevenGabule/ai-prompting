"use client";
import { createContext, useContext, useEffect, useState } from "react";

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
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([]);

  const addChatRoom = (room: ChatRoom) => {
    setChatRooms((prev) => [...prev, room]);
  };

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

  const deleteChatRoom = (id: string) => {
    setChatRooms((prev) => prev.filter((room) => room.id !== id));
    localStorage.removeItem(`messages_${id}`);
  };

  const addMessage = (chatRoomId: string, message: Message) => {
    const existingMessages = JSON.parse(window.localStorage.getItem(`messages_${chatRoomId}`) || "[]");
    const updatedMessages = [...existingMessages, message];
    window.localStorage.setItem(`messages_${chatRoomId}`, JSON.stringify(updatedMessages));
  };

  return (
    <ChatContext.Provider value={{ chatRooms, addChatRoom, deleteChatRoom, messages, setMessages }}>
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
