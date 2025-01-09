import { useQuery } from "@tanstack/react-query";

interface Message {
  role: "user" | "ai";
  content: string;
}

const getMessages = (conversationId: string): Message[] => {
  if (typeof window === 'undefined') return [];
  const messages = localStorage.getItem(`messages_${conversationId}`);
  return messages ? JSON.parse(messages) : [];
};

export const useMessages = (conversationId: string) => {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessages(conversationId),
    enabled: !!conversationId && typeof window !== 'undefined'
  });
};