import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';

interface SuggestedQueriesProps {
  onSelect: (query: string) => void;
}

const SUGGESTIONS = [
  'chat.suggestions.atRiskLeads',
  'chat.suggestions.topProspects',
  'chat.suggestions.negotiationValue',
  'chat.suggestions.companyContacts',
  'chat.suggestions.noContact30Days',
] as const;

export function SuggestedQueries({ onSelect }: SuggestedQueriesProps) {
  const { t } = useTranslation('chat');

  return (
    <div className="flex flex-wrap justify-center gap-2" data-testid="suggested-queries">
      {SUGGESTIONS.map((key) => {
        const text = t(key.replace('chat.', ''));
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(text)}
            className="inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            <Sparkles size={12} className="text-blue-400" />
            {text}
          </button>
        );
      })}
    </div>
  );
}
