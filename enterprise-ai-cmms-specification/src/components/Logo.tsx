// Image is placed in public/ — referenced as relative path so it works in single-file build too
const logoSrc = './logo.png';

interface LogoProps {
  size?: number;
  variant?: 'icon' | 'full';
  className?: string;
}

export function Logo({ size = 56, variant = 'icon', className = '' }: LogoProps) {
  if (variant === 'full') {
    return (
      <div className={`inline-flex flex-col items-center justify-center ${className}`}>
        <img
          src={logoSrc}
          alt="SELEN — سلن"
          width={size}
          height={size}
          className="object-contain drop-shadow-[0_0_24px_rgba(245,158,11,0.55)]"
          style={{ width: size, height: size }}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={logoSrc}
        alt="SELEN — سلن"
        width={size}
        height={size}
        className="object-cover w-full h-full drop-shadow-[0_0_18px_rgba(245,158,11,0.45)]"
      />
    </div>
  );
}

/** Standalone SVG fallback mark (decorative use) */
export function LogoMark({ size = 64 }: { size?: number }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size}>
      <defs>
        <linearGradient id="lm-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff1c7" />
          <stop offset="35%" stopColor="#ffcb4d" />
          <stop offset="65%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#fff1c7" />
        </linearGradient>
      </defs>
      <path
        d="M 55 50 C 50 30, 70 25, 80 35 C 90 45, 88 70, 80 85 C 95 80, 130 75, 160 60 C 155 100, 145 130, 120 150 C 95 170, 60 165, 50 140 C 45 125, 50 100, 60 90 C 55 80, 52 65, 55 50 Z"
        fill="url(#lm-gold)" stroke="#92400e" strokeWidth="1.2"
      />
    </svg>
  );
}
