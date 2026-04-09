import { useCallback, useState } from 'react';
import { chatApi, type AiChatResponse, type StructuredData } from '../api/chat.api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  data?: StructuredData;
  timestamp: Date;
}

export function useAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: ChatMessage = {
        role: 'user',
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const apiMessages = [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response: AiChatResponse = await chatApi.send(apiMessages);

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.content,
          data: response.data,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch {
        setError('Failed to get AI response. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [messages],
  );

  const clearConversation = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearConversation };
}
