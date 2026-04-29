import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  onClick,
  children,
  type = 'button',
  className = '',
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-[family-name:var(--font-jura)] font-medium tracking-[0.08em] uppercase transition-all duration-200 rounded-[10px] disabled:opacity-50';

  const variantStyles: Record<string, string> = {
    primary:
      'bg-(--lr-gold) text-(--lr-navy-deep) border border-(--lr-gold) hover:bg-(--lr-gold-pale) hover:shadow-md',
    secondary:
      'bg-(--lr-navy-mid) text-(--lr-pearl) border border-(--lr-navy-mid) hover:bg-(--lr-navy-deep)',
    outline:
      'bg-transparent text-(--lr-gold) border border-(--lr-gold) hover:bg-(--lr-gold) hover:text-(--lr-navy-deep)',
    ghost:
      'bg-transparent text-(--lr-pearl) hover:bg-(--surface-elevated) border border-transparent',
    gold:
      'bg-transparent text-(--lr-gold) border border-(--lr-gold) hover:bg-(--lr-gold) hover:text-(--lr-navy-deep)',
  };

  const sizeStyles: Record<string, string> = {
    sm: 'px-4 py-2 text-[0.7rem]',
    md: 'px-5 py-2.5 text-[0.78rem]',
    lg: 'px-7 py-3.5 text-[0.85rem]',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-3 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
