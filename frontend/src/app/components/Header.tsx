import { useAuth } from '../context/AuthContext';
import { LogOut, ChevronDown, User, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useNavigate, useLocation } from 'react-router';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { UserAvatar } from './UserAvatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  // Get page title from route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard Overview';
    if (path === '/transactions') return 'Transactions';
    if (path === '/audit-logs') return 'Audit Logs';
    if (path === '/users') return 'Users Management';
    if (path === '/settings') return 'Settings';
    return 'Dashboard';
  };

  return (
    <header className="h-16 border-b bg-white/80 backdrop-blur-md dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <Logo variant="full" />
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
        <h2 className="text-base font-medium text-slate-800 dark:text-slate-200">
          {getPageTitle()}
        </h2>
      </div>
      
      <div className="flex items-center gap-3">
        <ThemeToggle />
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 h-auto py-2 px-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {user.name}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {user.role}
                </span>
              </div>
              <UserAvatar name={user.name} size="sm" />
              <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              <Badge variant="secondary" className="text-xs mt-2">
                {user.role} · {user.region}
              </Badge>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}