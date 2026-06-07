function userKey(userId: string) {
  return `onboarding_completed_${userId}`;
}

/** True only when this specific user finished onboarding on this device. */
export function isOnboardingDoneLocally(userId?: string | null): boolean {
  if (typeof window === 'undefined' || !userId) return false;
  return localStorage.getItem(userKey(userId)) === 'true';
}

export function markOnboardingDone(userId?: string | null): void {
  if (typeof window === 'undefined' || !userId) return;
  localStorage.setItem(userKey(userId), 'true');
}

export function clearOnboardingDone(userId?: string | null): void {
  if (typeof window === 'undefined' || !userId) return;
  localStorage.removeItem(userKey(userId));
}

/** Remove legacy global flag that incorrectly hid onboarding for all users. */
export function migrateLegacyOnboardingStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('onboarding_skipped');
}
