import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { GlassCard } from '../components/GlassCard';
import { Logo } from '../components/Logo';
import { UserAvatar } from '../components/UserAvatar';
import { CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react';

export function ComponentLibrary() {
  return (
    <div className="p-6 space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Component Library</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Production-ready components for KYC Control Center
        </p>
      </div>

      {/* Logo Variants */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Logo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">Full Logo</h3>
            <Logo variant="full" />
          </GlassCard>
          <GlassCard className="p-6">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">Icon Only</h3>
            <Logo variant="icon" />
          </GlassCard>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Buttons</h2>
        <GlassCard className="p-6">
          <div className="flex flex-wrap gap-3">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon"><ArrowRight className="h-4 w-4" /></Button>
          </div>
        </GlassCard>
      </section>

      {/* Badges */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Badges</h2>
        <GlassCard className="p-6">
          <div className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <Badge className="bg-green-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Approved
            </Badge>
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </Badge>
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              Rejected
            </Badge>
          </div>
        </GlassCard>
      </section>

      {/* Inputs */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Inputs</h2>
        <GlassCard className="p-6">
          <div className="space-y-4 max-w-md">
            <Input placeholder="Default input" />
            <Input placeholder="Email input" type="email" />
            <Input placeholder="Disabled input" disabled />
          </div>
        </GlassCard>
      </section>

      {/* Glass Cards */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Glass Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Standard Card</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Glassmorphic card with backdrop blur
            </p>
          </GlassCard>
          <div className="group">
            <GlassCard hover className="p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Hover Card</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Try hovering over this card
              </p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Avatars */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">User Avatars</h2>
        <GlassCard className="p-6">
          <div className="flex flex-wrap gap-6">
            <UserAvatar name="Sarah Chen" size="sm" />
            <UserAvatar name="Marcus Weber" size="md" />
            <UserAvatar name="Alex Johnson" size="lg" />
          </div>
          <div className="mt-6">
            <UserAvatar name="Sarah Chen" email="admin@kyc.com" />
          </div>
        </GlassCard>
      </section>

      {/* Color Palette */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Color Palette</h2>
        <GlassCard className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="h-20 bg-blue-500 rounded-lg mb-2"></div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Primary Blue</p>
            </div>
            <div>
              <div className="h-20 bg-purple-500 rounded-lg mb-2"></div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Secondary Purple</p>
            </div>
            <div>
              <div className="h-20 bg-green-500 rounded-lg mb-2"></div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Success Green</p>
            </div>
            <div>
              <div className="h-20 bg-red-500 rounded-lg mb-2"></div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Error Red</p>
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
