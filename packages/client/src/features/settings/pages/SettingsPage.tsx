import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Globe, User, Shield } from 'lucide-react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Button } from '@/shared/components/ui/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function SettingsPage() {
  const { t, i18n } = useTranslation('settings');
  const { t: tCommon } = useTranslation('common');
  const { user } = useAuth();

  const [language, setLanguage] = useState(i18n.language);
  const [saved, setSaved] = useState(false);

  const handleLanguageChange = (lng: string) => {
    setLanguage(lng);
    i18n.changeLanguage(lng);
    localStorage.setItem('ai-crm-lang', lng);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} />

      {/* Profile section */}
      <section className="rounded-lg border bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <User size={18} className="text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">{t('profile.title')}</h2>
        </div>
        <div className="grid max-w-md grid-cols-1 gap-4">
          <Input
            label={t('profile.name')}
            value={user?.name ?? ''}
            disabled
            hint={t('profile.nameHint')}
          />
          <Input
            label={t('profile.email')}
            value={user?.email ?? ''}
            disabled
            hint={t('profile.emailHint')}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('profile.role')}
            </label>
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-gray-400" />
              <span className="text-sm capitalize text-gray-700">{user?.role ?? 'user'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Language section */}
      <section className="rounded-lg border bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Globe size={18} className="text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">{t('language.title')}</h2>
        </div>
        <div className="max-w-xs">
          <Select
            label={t('language.select')}
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            options={[
              { value: 'en', label: 'English' },
              { value: 'pl', label: 'Polski' },
            ]}
          />
          {saved && (
            <p className="mt-2 flex items-center gap-1 text-sm text-green-600">
              <Save size={14} />
              {t('language.saved')}
            </p>
          )}
        </div>
      </section>

      {/* App info */}
      <section className="rounded-lg border bg-white p-6">
        <h2 className="mb-2 text-base font-semibold text-gray-900">{t('about.title')}</h2>
        <div className="space-y-1 text-sm text-gray-500">
          <p>{t('about.version')}: 1.0.0</p>
          <p>{t('about.stack')}: React + Express + MongoDB</p>
        </div>
      </section>
    </div>
  );
}
