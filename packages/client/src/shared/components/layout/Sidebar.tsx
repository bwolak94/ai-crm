import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  Kanban,
  Activity,
  MessageSquare,
  BarChart2,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge } from '@/shared/components/ui/Badge';
import { cn } from '@/shared/lib/utils';

interface SidebarProps {
  collapsed?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavItem {
  key: string;
  path: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', path: '/app/dashboard', icon: LayoutDashboard },
  { key: 'contacts', path: '/app/contacts', icon: Users },
  { key: 'pipeline', path: '/app/pipeline', icon: Kanban },
  { key: 'activities', path: '/app/activities', icon: Activity },
  { key: 'aiChat', path: '/app/ai-chat', icon: MessageSquare, badge: 'AI' },
  { key: 'analytics', path: '/app/analytics', icon: BarChart2 },
  { key: 'settings', path: '/app/settings', icon: Settings },
];

export function Sidebar({ collapsed = false, mobileOpen = false, onMobileClose }: SidebarProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const handleLogout = useLogout();
  const location = useLocation();

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-14 shrink-0 items-center border-b border-gray-200', collapsed ? 'justify-center px-2' : 'justify-between px-4')}>
        {collapsed ? (
          <span className="text-lg font-bold text-blue-600">AI</span>
        ) : (
          <span className="text-lg font-bold text-blue-600">AI CRM</span>
        )}
        {mobileOpen && onMobileClose && (
          <button onClick={onMobileClose} className="rounded-md p-1 text-gray-400 hover:text-gray-600 md:hidden" aria-label="Close menu">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {NAV_ITEMS.map(({ key, path, icon: Icon, badge }) => {
          const isActive = location.pathname.startsWith(path);
          return (
            <NavLink
              key={key}
              to={path}
              onClick={onMobileClose}
              title={collapsed ? t(`nav.${key}`) : undefined}
              className={cn(
                'group flex items-center rounded-md text-sm font-medium transition-colors',
                collapsed ? 'justify-center px-2 py-2' : 'gap-3 px-3 py-2',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100',
              )}
            >
              <Icon size={20} />
              {!collapsed && (
                <>
                  <span className="flex-1">{t(`nav.${key}`)}</span>
                  {badge && <Badge variant="info" size="sm">{badge}</Badge>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className={cn('shrink-0 border-t border-gray-200 p-2', collapsed && 'flex flex-col items-center')}>
        {user && (
          <div className={cn('mb-2 flex items-center rounded-md px-2 py-2', collapsed ? 'justify-center' : 'gap-3')}>
            <Avatar name={user.name} size="sm" />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
                <p className="truncate text-xs text-gray-500">{user.email}</p>
              </div>
            )}
          </div>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? t('auth.logout') : undefined}
          className={cn(
            'flex w-full items-center rounded-md text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100',
            collapsed ? 'justify-center px-2 py-2' : 'gap-3 px-3 py-2',
          )}
        >
          <LogOut size={20} />
          {!collapsed && t('auth.logout')}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden shrink-0 border-r border-gray-200 bg-white md:flex md:flex-col',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onMobileClose} />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-white shadow-xl md:hidden">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
