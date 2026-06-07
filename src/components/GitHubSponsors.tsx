interface GitHubSponsorsButtonProps {
  className?: string;
}

export function GitHubSponsorsButton({ className = '' }: GitHubSponsorsButtonProps) {
  return (
    <iframe
      src="https://github.com/sponsors/Dev-Community-IO/button"
      title="Sponsor Dev-Community-IO"
      height={32}
      width={114}
      style={{ border: 0, borderRadius: 6 }}
      className={className}
    />
  );
}

interface GitHubSponsorsCardProps {
  className?: string;
}

export function GitHubSponsorsCard({ className = '' }: GitHubSponsorsCardProps) {
  return (
    <iframe
      src="https://github.com/sponsors/Dev-Community-IO/card"
      title="Sponsor Dev-Community-IO"
      height={225}
      width={600}
      style={{ border: 0 }}
      className={`max-w-full ${className}`.trim()}
    />
  );
}
