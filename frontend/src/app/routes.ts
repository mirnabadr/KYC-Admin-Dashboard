import { createBrowserRouter } from 'react-router';
import { DashboardLayout } from './components/DashboardLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { AuditLogs } from './pages/AuditLogs';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { ComponentLibrary } from './pages/ComponentLibrary';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/',
    Component: DashboardLayout,
    children: [
      {
        index: true,
        Component: Dashboard,
      },
      {
        path: 'transactions',
        Component: Transactions,
      },
      {
        path: 'audit-logs',
        Component: AuditLogs,
      },
      {
        path: 'users',
        Component: Users,
      },
      {
        path: 'settings',
        Component: Settings,
      },
      {
        path: 'components',
        Component: ComponentLibrary,
      },
    ],
  },
]);