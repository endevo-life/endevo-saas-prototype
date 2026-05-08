import Image from 'next/image';

interface LRMonogramProps {
  size?: number;
  className?: string;
  /** Use the full name lockup instead of the round icon. */
  variant?: 'round' | 'lockup';
  /** Theme mode controls whether dark or light logo assets are used. */
  themeMode?: 'dark' | 'light';
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
  themeMode = 'dark',
  priority = false,
}: LRMonogramProps) {
  const roundSrc =
    themeMode === 'light' ? '/asset/light_theme/lros_logo_round.png' : '/asset/dark_theme/lros_logo_round.png';
  const lockupSrc =
    themeMode === 'light' ? '/asset/light_theme/lros_logo_name.png' : '/asset/dark_theme/lros_logo_name.png';

  if (variant === 'lockup') {
    // The name lockup is wide; treat `size` as the height.
    return (
      <Image
        src={lockupSrc}
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
      src={roundSrc}
      alt="Legacy Readiness OS"
      width={size}
      height={size}
      priority={priority}
      className={className}
    />
  );
}
