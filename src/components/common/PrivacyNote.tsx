import React from 'react';

interface PrivacyNoteProps {
  children: React.ReactNode;
  variant?: 'info' | 'warning';
  icon?: string;
}

export default function PrivacyNote({
  children,
  variant = 'info',
  icon = '🔒',
}: PrivacyNoteProps) {
  const variantStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-orange-50 border-orange-200 text-orange-800',
  };

  return (
    <div className={`border rounded-lg p-4 ${variantStyles[variant]}`}>
      <div className="flex items-start">
        <span className="text-2xl mr-3">{icon}</span>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}
