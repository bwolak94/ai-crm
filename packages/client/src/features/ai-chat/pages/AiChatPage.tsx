import { useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Spinner } from '@/shared/components/ui/Spinner';
import { ChatInput } from '../components/ChatInput';
import { ChatMessage } from '../components/ChatMessage';
import { SuggestedQueries } from '../components/SuggestedQueries';
import { useAiChat } from '../hooks/useAiChat';

export function AiChatPage() {
  const { t } = useTranslation('chat');
  const { messages, isLoading, error, sendMessage, clearConversation } =
    useAiChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isLoading]);

  const handleSuggestedQuery = useCallback(
    (query: string) => {
      sendMessage(query);
    },
    [sendMessage],
  );

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16)-theme(spacing.8))] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3">
        <h1 className="text-lg font-semibold text-gray-900">{t('title')}</h1>
        {!isEmpty && (
          <Button variant="ghost" size="sm" onClick={clearConversation}>
            <Trash2 size={14} />
            {t('clear')}
          </Button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto py-4">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
              <Bot size={32} />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {t('empty.title')}
              </h2>
              <p className="mt-1 max-w-md text-sm text-gray-500">
                {t('empty.description')}
              </p>
            </div>
            <SuggestedQueries onSelect={handleSuggestedQuery} />
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-4 px-4">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                  <Bot size={16} className="text-gray-600" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3">
                  <Spinner size="sm" />
                </div>
              </div>
            )}
            {error && (
              <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="mx-auto w-full max-w-3xl border-t pt-3">
        <ChatInput onSend={sendMessage} disabled={isLoading} />
        <p className="mt-1.5 text-center text-[10px] text-gray-400">
          {t('disclaimer')}
        </p>
      </div>
    </div>
  );
}
