interface LogoProps {
  variant?: 'full' | 'icon';
  className?: string;
}

export function Logo({ variant = 'full', className = '' }: LogoProps) {
  if (variant === 'icon') {
    return (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <rect width="32" height="32" rx="8" className="fill-blue-600 dark:fill-blue-500" />
        <path
          d="M16 8L21 11.5V18.5L16 22L11 18.5V11.5L16 8Z"
          className="fill-white dark:fill-slate-900 stroke-white dark:stroke-slate-900"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M13.5 15L15.5 17L19 13.5"
          className="stroke-blue-600 dark:stroke-blue-400"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="8" className="fill-blue-600 dark:fill-blue-500" />
        <path
          d="M16 8L21 11.5V18.5L16 22L11 18.5V11.5L16 8Z"
          fill="white"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M13.5 15L15.5 17L19 13.5"
          className="stroke-blue-600 dark:stroke-blue-400"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-semibold text-lg text-slate-900 dark:text-white">
        KYC Control Center
      </span>
    </div>
  );
}
