interface TrustedBadgeProps {
  size?: number;
  className?: string;
}

export function TrustedBadge({ size = 16, className = '' }: TrustedBadgeProps) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-blue-500 text-white ${className}`}
      style={{ width: size, height: size }}
      title="Trusted User"
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    </div>
  );
}

