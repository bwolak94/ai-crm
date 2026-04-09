import { useState } from 'react';
import { Bot, User } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ChatContactResults } from './ChatContactResults';
import { ChatPipelineResults } from './ChatPipelineResults';
import { ContactCard } from '@/features/contacts/components/ContactCard';
import { useNavigate } from 'react-router-dom';
import type { ChatMessage as ChatMessageType } from '../hooks/useAiChat';
import type { ContactStatus } from '@ai-crm/shared';

interface ChatMessageProps {
  message: ChatMessageType;
}

interface ContactPayload {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: ContactStatus;
}

interface StagePayload {
  stage: string;
  count: number;
  totalValue: number;
}

function StructuredDataRenderer({ data }: { data: NonNullable<ChatMessageType['data']> }) {
  const navigate = useNavigate();

  switch (data.type) {
    case 'contacts':
      return <ChatContactResults contacts={data.payload as ContactPayload[]} />;
    case 'pipeline':
      return <ChatPipelineResults stages={data.payload as StagePayload[]} />;
    case 'contact_detail': {
      const contact = data.payload as ContactPayload;
      return (
        <div className="mt-2">
          <ContactCard
            contact={contact}
            onClick={() => navigate(`/app/contacts/${contact._id}`)}
          />
        </div>
      );
    }
    default:
      return null;
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [showTimestamp, setShowTimestamp] = useState(false);
  const isUser = message.role === 'user';

  return (
    <div
      className={cn('flex gap-3', isUser && 'flex-row-reverse')}
      onMouseEnter={() => setShowTimestamp(true)}
      onMouseLeave={() => setShowTimestamp(false)}
      data-testid="ai-chat-message"
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600',
        )}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div className={cn('max-w-[75%] space-y-1', isUser && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm',
            isUser
              ? 'rounded-tr-sm bg-blue-500 text-white'
              : 'rounded-tl-sm bg-gray-100 text-gray-900',
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {message.data && <StructuredDataRenderer data={message.data} />}

        <div
          className={cn(
            'flex items-center gap-2 text-[10px] text-gray-400 transition-opacity',
            showTimestamp ? 'opacity-100' : 'opacity-0',
            isUser && 'justify-end',
          )}
        >
          <span>
            {message.timestamp.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {message.data?.toolUsed && (
            <span className="italic">Used: {message.data.toolUsed}</span>
          )}
        </div>
      </div>
    </div>
  );
}
