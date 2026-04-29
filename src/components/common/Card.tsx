import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
  variant?: 'dark' | 'elevated' | 'light';
}

export default function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
  onClick,
  variant = 'dark',
}: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const baseStyle =
    variant === 'light' ? 'lr-card-light' : variant === 'elevated' ? 'lr-card-elevated' : 'lr-card';
  const hoverStyle = hover ? 'transition-shadow hover:shadow-lg cursor-pointer' : '';
  const clickableStyle = onClick ? 'cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`${baseStyle} ${paddingStyles[padding]} ${hoverStyle} ${clickableStyle} ${className}`}
    >
      {children}
    </div>
  );
}
