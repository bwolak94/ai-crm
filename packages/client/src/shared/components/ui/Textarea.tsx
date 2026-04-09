import { type TextareaHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '@/shared/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  resize?: 'none' | 'y' | 'both';
  showCount?: boolean;
}

const resizeStyles: Record<string, string> = {
  none: 'resize-none',
  y: 'resize-y',
  both: 'resize',
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, resize = 'y', showCount = false, rows = 4, className, required, disabled, maxLength, value, defaultValue, ...props }, ref) => {
    const id = useId();
    const inputId = props.id ?? id;
    const currentLength = typeof value === 'string' ? value.length : typeof defaultValue === 'string' ? defaultValue.length : 0;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          className={cn(
            'block w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
            error
              ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
              : 'border-gray-300 focus-visible:border-blue-500 focus-visible:ring-blue-500',
            resizeStyles[resize],
            disabled && 'bg-gray-50 cursor-not-allowed',
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        <div className="flex justify-between">
          <div>
            {error && (
              <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            {hint && !error && (
              <p id={`${inputId}-hint`} className="mt-1 text-sm text-gray-500">
                {hint}
              </p>
            )}
          </div>
          {showCount && maxLength && (
            <p className="mt-1 text-xs text-gray-400">
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
