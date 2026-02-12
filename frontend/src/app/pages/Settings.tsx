import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

export function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Manage your application preferences
        </p>
      </div>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Appearance
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Choose how the dashboard looks to you. Select a theme or use system preference.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setTheme('light')}
            className={`relative p-4 rounded-lg border-2 transition-all ${
              theme === 'light'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <Sun className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="text-center">
                <div className="font-medium text-slate-900 dark:text-white">Light</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Clean and bright</div>
              </div>
            </div>
            {theme === 'light' && (
              <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
            )}
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`relative p-4 rounded-lg border-2 transition-all ${
              theme === 'dark'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <Moon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="text-center">
                <div className="font-medium text-slate-900 dark:text-white">Dark</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Easy on the eyes</div>
              </div>
            </div>
            {theme === 'dark' && (
              <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
            )}
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`relative p-4 rounded-lg border-2 transition-all ${
              theme === 'system'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center">
                <Monitor className="h-6 w-6 text-white" />
              </div>
              <div className="text-center">
                <div className="font-medium text-slate-900 dark:text-white">System</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Use system preference</div>
              </div>
            </div>
            {theme === 'system' && (
              <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
            )}
          </button>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Notifications
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="transaction-alerts" className="text-base">
                Transaction Alerts
              </Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Get notified when transactions need approval
              </p>
            </div>
            <Switch id="transaction-alerts" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="audit-alerts" className="text-base">
                Audit Log Alerts
              </Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Receive notifications for critical audit events
              </p>
            </div>
            <Switch id="audit-alerts" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-digest" className="text-base">
                Daily Email Digest
              </Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Get a daily summary of platform activity
              </p>
            </div>
            <Switch id="email-digest" />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
