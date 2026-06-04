import { Lineicons } from '@lineiconshq/react-lineicons';
import {
  DiscordOutlined,
  FacebookOutlined,
  GithubOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  TelegramOutlined,
  XOutlined,
  YoutubeOutlined,
} from '@lineiconshq/free-icons';
import type { IconData } from '@lineiconshq/free-icons';

export type SocialPlatform =
  | 'twitter'
  | 'x'
  | 'github'
  | 'linkedin'
  | 'telegram'
  | 'facebook'
  | 'instagram'
  | 'youtube'
  | 'discord';

type SocialLinksRecord = Partial<Record<SocialPlatform | string, string>>;

interface SocialConfig {
  icon: IconData;
  label: string;
  buildHref: (value: string) => string;
  hoverClass: string;
}

const SOCIAL_CONFIG: Record<string, SocialConfig> = {
  twitter: {
    icon: XOutlined,
    label: 'X (Twitter)',
    buildHref: (v) => (v.startsWith('http') ? v : `https://x.com/${v.replace(/^@/, '')}`),
    hoverClass: 'hover:border-zinc-800 hover:bg-zinc-900 hover:text-white dark:hover:border-zinc-300 dark:hover:bg-zinc-100 dark:hover:text-zinc-900',
  },
  x: {
    icon: XOutlined,
    label: 'X',
    buildHref: (v) => (v.startsWith('http') ? v : `https://x.com/${v.replace(/^@/, '')}`),
    hoverClass: 'hover:border-zinc-800 hover:bg-zinc-900 hover:text-white dark:hover:border-zinc-300 dark:hover:bg-zinc-100 dark:hover:text-zinc-900',
  },
  github: {
    icon: GithubOutlined,
    label: 'GitHub',
    buildHref: (v) => (v.startsWith('http') ? v : `https://github.com/${v.replace(/^@/, '')}`),
    hoverClass: 'hover:border-zinc-800 hover:bg-zinc-900 hover:text-white dark:hover:border-zinc-300 dark:hover:bg-zinc-100 dark:hover:text-zinc-900',
  },
  linkedin: {
    icon: LinkedinOutlined,
    label: 'LinkedIn',
    buildHref: (v) => (v.startsWith('http') ? v : `https://linkedin.com/in/${v}`),
    hoverClass: 'hover:border-[#0A66C2]/40 hover:bg-[#0A66C2] hover:text-white',
  },
  telegram: {
    icon: TelegramOutlined,
    label: 'Telegram',
    buildHref: (v) => (v.startsWith('http') ? v : `https://t.me/${v.replace(/^@/, '')}`),
    hoverClass: 'hover:border-[#229ED9]/40 hover:bg-[#229ED9] hover:text-white',
  },
  facebook: {
    icon: FacebookOutlined,
    label: 'Facebook',
    buildHref: (v) => (v.startsWith('http') ? v : `https://facebook.com/${v}`),
    hoverClass: 'hover:border-[#1877F2]/40 hover:bg-[#1877F2] hover:text-white',
  },
  instagram: {
    icon: InstagramOutlined,
    label: 'Instagram',
    buildHref: (v) => (v.startsWith('http') ? v : `https://instagram.com/${v.replace(/^@/, '')}`),
    hoverClass: 'hover:border-pink-500/40 hover:bg-gradient-to-br hover:from-[#f58529] hover:via-[#dd2a7b] hover:to-[#8134af] hover:text-white',
  },
  youtube: {
    icon: YoutubeOutlined,
    label: 'YouTube',
    buildHref: (v) => (v.startsWith('http') ? v : `https://youtube.com/${v}`),
    hoverClass: 'hover:border-red-500/40 hover:bg-red-600 hover:text-white',
  },
  discord: {
    icon: DiscordOutlined,
    label: 'Discord',
    buildHref: (v) => (v.startsWith('http') ? v : `https://discord.gg/${v}`),
    hoverClass: 'hover:border-[#5865F2]/40 hover:bg-[#5865F2] hover:text-white',
  },
};

const ORDER: string[] = [
  'twitter',
  'x',
  'github',
  'linkedin',
  'telegram',
  'facebook',
  'instagram',
  'youtube',
  'discord',
];

interface SocialLinksProps {
  links: SocialLinksRecord;
  size?: 'sm' | 'md';
  className?: string;
}

export function SocialLinks({ links, size = 'sm', className = '' }: SocialLinksProps) {
  const entries = ORDER.filter((key) => Boolean(links[key]?.trim())).map((key) => ({
    key,
    value: links[key]!.trim(),
    config: SOCIAL_CONFIG[key],
  }));

  if (entries.length === 0) return null;

  const dim = size === 'sm' ? 32 : 36;
  const iconSize = size === 'sm' ? 15 : 17;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {entries.map(({ key, value, config }) => {
        if (!config) return null;
        return (
          <a
            key={key}
            href={config.buildHref(value)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={config.label}
            title={config.label}
            className={`inline-flex items-center justify-center rounded-full border border-zinc-200/90 bg-white text-zinc-600 transition-all duration-200 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 ${config.hoverClass} touch-manipulation`}
            style={{ width: dim, height: dim }}
          >
            <Lineicons icon={config.icon} size={iconSize} strokeWidth={1.75} />
          </a>
        );
      })}
    </div>
  );
}
