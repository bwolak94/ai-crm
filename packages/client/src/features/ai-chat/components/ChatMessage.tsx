import { useState } from 'react';
import { Bot, User, UserX } from 'lucide-react';
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

interface RawContactPayload {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: ContactStatus;
}

interface ContactPayload {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: ContactStatus;
}

function normalizeContact(raw: RawContactPayload): ContactPayload {
  return { ...raw, _id: raw._id ?? raw.id ?? '' };
}

interface StagePayload {
  stage: string;
  count: number;
  totalValue: number;
}

function StructuredDataRenderer({ data }: { data: NonNullable<ChatMessageType['data']> }) {
  const navigate = useNavigate();

  switch (data.type) {
    case 'contacts': {
      const raw = data.payload as RawContactPayload[] | null;
      const contacts = raw?.map(normalizeContact) ?? null;
      if (!contacts || contacts.length === 0) {
        return (
          <div className="mt-2 flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
            <UserX size={14} />
            No contacts found.
          </div>
        );
      }
      return <ChatContactResults contacts={contacts} />;
    }
    case 'pipeline': {
      const stages = data.payload as StagePayload[] | null;
      if (!stages || stages.length === 0) return null;
      return <ChatPipelineResults stages={stages} />;
    }
    case 'contact_detail': {
      const rawContact = data.payload as RawContactPayload | null;
      const contact = rawContact ? normalizeContact(rawContact) : null;
      if (!contact) {
        return (
          <div className="mt-2 flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
            <UserX size={14} />
            Contact not found.
          </div>
        );
      }
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
