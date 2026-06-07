import type { User } from '../contexts/AuthContext';
import type { Tag } from '../services/api/tags.service';

export interface TagAccessContext {
  postingAsVerifiedPage?: boolean;
}

export function isPlatformAdmin(user: User | null | undefined): boolean {
  return user?.role === 'admin' || user?.role === 'super_admin';
}

export function canManageTagRestrictions(user: User | null | undefined): boolean {
  return isPlatformAdmin(user);
}

export function canUseRestrictedTag(
  tag: Pick<Tag, 'restrictedToRoles'> | null | undefined,
  user: User | null | undefined,
  context: TagAccessContext = {}
): boolean {
  const roles = tag?.restrictedToRoles;
  if (!roles || roles.length === 0) return true;
  if (!user) return false;
  if (isPlatformAdmin(user)) return true;

  return roles.some((role) => {
    if (role === 'verified_user' && user.isVerified) return true;
    if (role === 'verified_page' && context.postingAsVerifiedPage) return true;
    return false;
  });
}

export function filterUsableTags<T extends Tag>(
  tags: T[],
  user: User | null | undefined,
  context: TagAccessContext = {}
): T[] {
  return tags.filter((tag) => canUseRestrictedTag(tag, user, context));
}
