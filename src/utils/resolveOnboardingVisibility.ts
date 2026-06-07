import { clearOnboardingDone, isOnboardingDoneLocally } from './onboardingStorage';

export function isNewAccount(user: {
  id?: string;
  onboardingCompleted?: boolean;
  bio?: string;
  skills?: string[];
} | null | undefined): boolean {
  if (!user?.id) return false;
  if (user.onboardingCompleted) return false;
  if (isOnboardingDoneLocally(user.id)) return false;
  return true;
}

export function shouldShowOnboardingWizard(
  user: { id?: string; onboardingCompleted?: boolean } | null | undefined,
  status?: { completed?: boolean; skipped?: boolean; isComplete?: boolean } | null
): boolean {
  if (!user?.id) return false;

  // Server status wins over stale client flags (localStorage can lie after failed sessions)
  if (status && typeof status === 'object') {
    if (status.completed === true || status.skipped === true || status.isComplete === true) {
      return false;
    }
    if (status.completed === false || status.isComplete === false) {
      return true;
    }
  }

  if (user.onboardingCompleted || isOnboardingDoneLocally(user.id)) {
    return false;
  }

  return true;
}

export function shouldForceOnboardingForNewUser(
  user: { id?: string; onboardingCompleted?: boolean } | null | undefined,
  status?: { completed?: boolean; skipped?: boolean; isComplete?: boolean } | null
): boolean {
  if (!user?.id) return false;
  if (status && typeof status === 'object') {
    if (status.completed === true || status.skipped === true || status.isComplete === true) {
      return false;
    }
    if (status.completed === false || status.isComplete === false) {
      return true;
    }
  }
  return isNewAccount(user);
}

/** Drop stale client-side onboarding flags when the API says setup is still required. */
export function reconcileUserOnboardingState<T extends { id?: string; onboardingCompleted?: boolean }>(
  user: T,
  status?: { completed?: boolean; skipped?: boolean; isComplete?: boolean } | null
): T {
  if (!user?.id || !status || typeof status !== 'object') return user;

  const serverDone = status.completed === true || status.skipped === true || status.isComplete === true;
  const serverPending = status.completed === false || status.isComplete === false;

  if (serverPending) {
    clearOnboardingDone(user.id);
    if (user.onboardingCompleted) {
      return { ...user, onboardingCompleted: false };
    }
  } else if (serverDone && !user.onboardingCompleted) {
    return { ...user, onboardingCompleted: true };
  }

  return user;
}
