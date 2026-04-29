interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  color?: 'gold' | 'navy' | 'steel';
  size?: 'sm' | 'md' | 'lg';
}

export default function ProgressBar({
  current,
  total,
  showLabel = true,
  color = 'gold',
  size = 'md',
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  const fillByColor: Record<string, string> = {
    gold:  'var(--lr-gold)',
    navy:  'var(--lr-navy-deep)',
    steel: 'var(--lr-steel)',
  };

  const heightStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="font-(family-name:--font-jura) text-xs tracking-widest uppercase text-(--lr-warm-slate)">
            {current} of {total}
          </span>
          <span className="font-(family-name:--font-jetbrains) text-sm text-(--lr-navy-deep)">
            {percentage}%
          </span>
        </div>
      )}
      <div
        className={`w-full rounded-full ${heightStyles[size]}`}
        style={{ backgroundColor: 'var(--lr-pearl)' }}
      >
        <div
          className={`${heightStyles[size]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%`, backgroundColor: fillByColor[color] }}
        />
      </div>
    </div>
  );
}
