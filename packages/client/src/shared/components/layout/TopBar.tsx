import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Menu, Bell, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { Avatar } from '@/shared/components/ui/Avatar';
import { LanguageSwitcher } from './LanguageSwitcher';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const handleLogout = useLogout();
  const navigate = useNavigate();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 md:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />

        <button
          className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100"
          aria-label={t('nav.notifications')}
        >
          <Bell size={18} />
        </button>

        {user && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                <Avatar name={user.name} size="sm" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="z-50 min-w-[200px] rounded-md border border-gray-200 bg-white p-1 shadow-lg"
              >
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />
                <DropdownMenu.Item
                  onSelect={() => navigate('/app/settings')}
                  className="flex cursor-pointer items-center gap-2 rounded-sm px-3 py-1.5 text-sm text-gray-700 outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100 data-[highlighted]:bg-gray-100"
                >
                  <Settings size={14} />
                  {t('nav.settings')}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={handleLogout}
                  className="flex cursor-pointer items-center gap-2 rounded-sm px-3 py-1.5 text-sm text-red-600 outline-none transition-colors hover:bg-red-50 focus:bg-red-50 data-[highlighted]:bg-red-50"
                >
                  <LogOut size={14} />
                  {t('auth.logout')}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
      </div>
    </header>
  );
}
