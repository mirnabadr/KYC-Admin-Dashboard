import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router';
import { LayoutDashboard, ArrowLeftRight, FileText, Users, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from './ui/utils';
import { useState } from 'react';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  allowedRoles?: string[];
}

const navItems: NavItem[] = [
  {
    to: '/',
    icon: LayoutDashboard,
    label: 'Dashboard',
  },
  {
    to: '/transactions',
    icon: ArrowLeftRight,
    label: 'Transactions',
  },
  {
    to: '/audit-logs',
    icon: FileText,
    label: 'Audit Logs',
  },
  {
    to: '/users',
    icon: Users,
    label: 'Users',
    allowedRoles: ['Global Admin'],
  },
  {
    to: '/settings',
    icon: Settings,
    label: 'Settings',
  },
];

export function Sidebar() {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  /* When collapsed, active link: no grey background in either theme - icon stands out by color only */
  const collapsedActiveStyle: React.CSSProperties =
    resolvedTheme === 'dark'
      ? { backgroundColor: 'transparent', backgroundImage: 'none', background: 'transparent', color: 'rgb(248 250 252)' } /* no grey - bright icon */
      : { backgroundColor: 'transparent', backgroundImage: 'none', background: 'transparent', color: 'rgb(17 24 39)' }; /* no grey - dark icon */

  const canAccessRoute = (item: NavItem) => {
    if (!item.allowedRoles) return true;
    return user && item.allowedRoles.includes(user.role);
  };

  return (
      <aside
        className={cn(
          'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 transition-all duration-300 relative sidebar-container',
          collapsed ? 'w-20 sidebar-collapsed' : 'w-64'
        )}
        data-collapsed={collapsed}
      >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-white dark:bg-slate-800 p-0"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-slate-700 dark:text-slate-300" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-slate-700 dark:text-slate-300" />
        )}
      </Button>

      <nav className="space-y-1 mt-2">
        <TooltipProvider>
          {navItems.map((item) => {
            const Icon = item.icon;
            const hasAccess = canAccessRoute(item);

            if (!hasAccess) {
              return null;
            }

            const navContent = (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                    isActive && !collapsed
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white relative'
                      : isActive && collapsed
                        ? 'sidebar-link-active-collapsed'
                        : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 font-medium',
                    collapsed && 'justify-center px-2 min-w-[2.5rem]'
                  )
                }
                style={({ isActive }) =>
                  collapsed && isActive ? collapsedActiveStyle : undefined
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon 
                      className={cn(
                        'h-5 w-5 flex-shrink-0 transition-colors duration-200 sidebar-icon',
                        isActive && !collapsed
                          ? 'sidebar-icon-active text-white' 
                          : isActive && collapsed
                            ? 'sidebar-icon-active-collapsed'
                            : 'sidebar-icon-inactive-light dark:sidebar-icon-inactive-dark'
                      )}
                      strokeWidth={isActive ? 2 : 2.5}
                      style={
                        collapsed && isActive
                          ? {
                              color: resolvedTheme === 'dark' ? 'rgb(248 250 252)' : 'rgb(17 24 39)',
                              stroke: resolvedTheme === 'dark' ? 'rgb(248 250 252)' : 'rgb(17 24 39)',
                            }
                          : undefined
                      }
                    />
                    {!collapsed && (
                      <span className={cn(
                        'transition-colors',
                        isActive && !collapsed
                          ? 'sidebar-label-active font-semibold text-white' 
                          : 'font-medium text-slate-800 dark:text-slate-200'
                      )}>
                        {item.label}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>
                    {navContent}
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return navContent;
          })}
        </TooltipProvider>
      </nav>
    </aside>
  );
}