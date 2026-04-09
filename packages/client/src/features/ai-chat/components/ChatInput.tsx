import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const { t } = useTranslation('chat');
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div className="flex items-end gap-2 rounded-lg border bg-white p-2 shadow-sm">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder={t('input.placeholder')}
        disabled={disabled}
        rows={1}
        data-testid="ai-chat-input"
        className={cn(
          'flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-gray-400',
          disabled && 'cursor-not-allowed opacity-50',
        )}
        aria-label={t('input.ariaLabel')}
      />
      <Button
        size="sm"
        onClick={handleSend}
        disabled={!value.trim() || disabled}
        aria-label={t('input.send')}
        data-testid="ai-chat-send"
      >
        <Send size={16} />
      </Button>
    </div>
  );
}
