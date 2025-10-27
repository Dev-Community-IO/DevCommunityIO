interface VerifiedBadgeProps {
  size?: number;
  className?: string;
}

export function VerifiedBadge({ size = 16, className = '' }: VerifiedBadgeProps) {
  return (
    <img
      src="/Twitter Verified Badge.svg"
      alt="Verified"
      width={size}
      height={size}
      className={`inline-block ${className}`}
      title="Verified User"
    />
  );
}
