import { useMutation } from "@tanstack/react-query";
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

export const useSendMessage = () => {
  return useMutation({
    mutationFn: sendMessage,
    onError: (error) => {
      console.error("Error sending message:", error);
    },
  });
};