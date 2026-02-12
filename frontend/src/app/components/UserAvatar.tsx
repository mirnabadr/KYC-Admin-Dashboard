import { cn } from './ui/utils';

interface UserAvatarProps {
  name: string;
  email?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UserAvatar({ name, email, size = 'md', className }: UserAvatarProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Generate consistent color based on name
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500',
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center text-white font-medium',
          bgColor,
          sizeClasses[size]
        )}
      >
        {initials}
      </div>
      {email !== undefined && (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-900 dark:text-white">{name}</span>
          {email && <span className="text-xs text-slate-500 dark:text-slate-400">{email}</span>}
        </div>
      )}
    </div>
  );
}
