import Image from 'next/image';

interface LRMonogramProps {
  size?: number;
  className?: string;
  /** Use the full name lockup instead of the round icon. */
  variant?: 'round' | 'lockup';
  priority?: boolean;
}

/**
 * Legacy Readiness OS brand mark.
 *
 * - `round`  -> /asset/lros_logo_round.png  (default — concentric ring icon)
 * - `lockup` -> /asset/lros_logo_name.png   (full name, for hero / login)
 */
export default function LRMonogram({
  size = 48,
  className = '',
  variant = 'round',
  priority = false,
}: LRMonogramProps) {
  if (variant === 'lockup') {
    // The name lockup is wide; treat `size` as the height.
    return (
      <Image
        src="/asset/lros_logo_name.png"
        alt="Legacy Readiness OS"
        width={size * 4}
        height={size}
        priority={priority}
        className={className}
        style={{ height: size, width: 'auto' }}
      />
    );
  }

  return (
    <Image
      src="/asset/lros_logo_round.png"
      alt="Legacy Readiness OS"
      width={size}
      height={size}
      priority={priority}
      className={className}
    />
  );
}
