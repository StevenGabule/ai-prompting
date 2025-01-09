import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";

interface SendMessagePayload {
  text: string;
  conversation_id: string;
}

interface SendMessageResponse {
  generated_text: string;
}

const sendMessage = async (payload: SendMessagePayload) => {
  const { data } = await api.post<SendMessageResponse>("/ai", payload);
  return data.generated_text;
};

export const useSendMessage = (conversationId: string) => {
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (response, variables) => {
      const existingMessages = JSON.parse(localStorage.getItem(`messages_${conversationId}`) || '[]');
      const updatedMessages = [
        ...existingMessages,
        { role: 'user', content: variables.text },
        { role: 'ai', content: response }
      ];
      localStorage.setItem(`messages_${conversationId}`, JSON.stringify(updatedMessages));
    },
    onError: (error) => {
      console.error("Error sending message:", error);
    },
  });
};