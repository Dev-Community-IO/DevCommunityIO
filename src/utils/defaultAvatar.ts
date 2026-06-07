/**
 * Gender-neutral default avatar for users without a profile photo.
 * Uses Dicebear initials (not human illustrations).
 * Background color is derived from username — consistent per user, varied across users.
 */
const AVATAR_BACKGROUND_COLORS = [
  '6366f1', // indigo
  '8b5cf6', // violet
  'a855f7', // purple
  'ec4899', // pink
  'f43f5e', // rose
  'f97316', // orange
  'eab308', // amber
  '84cc16', // lime
  '22c55e', // green
  '14b8a6', // teal
  '06b6d4', // cyan
  '3b82f6', // blue
  '0ea5e9', // sky
  'd946ef', // fuchsia
];

export function getDefaultUserAvatar(username?: string | null): string {
  const seed = encodeURIComponent((username || 'member').trim() || 'member');
  const colors = AVATAR_BACKGROUND_COLORS.join(',');

  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=${colors}&textColor=ffffff&fontFamily=Helvetica&fontWeight=600`;
}

export const DEFAULT_GUEST_AVATAR = getDefaultUserAvatar('guest');

/** OAuth CDN avatars rate-limit when many load at once (e.g. member lists). */
export function isHotlinkedAvatarUrl(url: string | null | undefined): boolean {
  if (!url) return false;

  try {
    const host = new URL(url).hostname.toLowerCase();
    return (
      host.endsWith('googleusercontent.com') ||
      host.endsWith('ggpht.com') ||
      host.endsWith('githubusercontent.com')
    );
  } catch {
    return false;
  }
}

/** Prefer our CDN / Dicebear over hotlinked OAuth avatars to avoid 429s. */
export function resolveUserAvatarUrl(
  url: string | null | undefined,
  username?: string | null
): string {
  if (!url || isHotlinkedAvatarUrl(url)) {
    return getDefaultUserAvatar(username);
  }
  return url;
}
