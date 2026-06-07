import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/api/auth.service';
import onboardingService from '../services/api/onboarding.service';
import { isNetworkError } from '../services/api/config';
import { localStorageCache, CacheKeys } from '../utils/cache';
import { markOnboardingDone, migrateLegacyOnboardingStorage } from '../utils/onboardingStorage';
import {
  shouldShowOnboardingWizard,
  shouldForceOnboardingForNewUser,
  reconcileUserOnboardingState,
} from '../utils/resolveOnboardingVisibility';
import { resolveUserAvatarUrl } from '../utils/defaultAvatar';

function withResolvedAvatar<T extends { username?: string; avatarUrl?: string; avatar?: string }>(
  userData: T
): T {
  const raw = userData.avatarUrl || (userData as { avatar_url?: string }).avatar_url || userData.avatar;
  const resolved = resolveUserAvatarUrl(raw, userData.username);
  return {
    ...userData,
    avatarUrl: resolved,
    avatar: resolved,
  };
}

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string; // Legacy support
  avatarUrl?: string; // Backend uses this field
  coverImage?: string;
  coverImageUrl?: string;
  walletAddress?: string;
  reputation: number;
  isVerified: boolean;
  isTrusted?: boolean;
  role: 'user' | 'moderator' | 'admin' | 'super_admin';
  status: 'active' | 'suspended' | 'banned' | 'pending';
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    telegram?: string;
    github?: string;
  };
  skills?: string[];
  joinedDate?: string;
  stats?: {
    posts: number;
    replies: number;
    upvotes: number;
    followers: number;
    following: number;
  };
  permissions?: string[];
  onboardingCompleted?: boolean;
  pseudo?: string;
  deletionRequestedAt?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  login: (userData: User, token?: string) => void;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  checkAuth: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  isModerator: () => boolean;
  canModerate: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const isAuthenticated = !!user;

  // Load user from cache immediately on mount
  useEffect(() => {
    migrateLegacyOnboardingStorage();

    // Try to load from cache first for instant UI
    const cachedUser = localStorageCache.get<User>(CacheKeys.USER);
    const cachedSession = localStorageCache.get<{ timestamp: number }>(CacheKeys.USER_SESSION);
    
    if (cachedUser && cachedSession) {
      const normalizedCachedUser = withResolvedAvatar(cachedUser);
      setUser(normalizedCachedUser);
      setShowOnboarding(shouldShowOnboardingWizard(normalizedCachedUser));
      setIsLoading(false);
    }
    
    // Then validate with API in background
    checkAuth();
    
    // Listen for logout events
    const handleLogout = () => {
      setUser(null);
      localStorageCache.remove(CacheKeys.USER);
      localStorageCache.remove(CacheKeys.USER_SESSION);
    };
    
    window.addEventListener('auth:logout', handleLogout);
    
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  const checkAuth = async () => {
    try {
      // Try to fetch current user (works for both token and session-based auth)
      const userData = await authService.getCurrentUser();

      if (!userData) {
        localStorageCache.remove(CacheKeys.USER);
        localStorageCache.remove(CacheKeys.USER_SESSION);
        const token = localStorage.getItem('auth_token');
        if (token) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
        }
        setUser(null);
        setShowOnboarding(false);
        return;
      }
      
      const normalizedUser = withResolvedAvatar({
        ...userData,
        avatarUrl: userData.avatarUrl || (userData as any).avatar_url || userData.avatar,
        avatar: userData.avatar || userData.avatarUrl || (userData as any).avatar_url,
      });
      setUser(normalizedUser);
      
      // Cache user data (5 minutes expiry for session validation)
      localStorageCache.set(CacheKeys.USER, normalizedUser, 5 * 60 * 1000);
      localStorageCache.set(CacheKeys.USER_SESSION, { timestamp: Date.now() }, 5 * 60 * 1000);
      
      // Check onboarding status if user is authenticated
      if (normalizedUser) {
        try {
          const onboardingStatus = await onboardingService.getStatus();
          const reconciledUser = reconcileUserOnboardingState(normalizedUser, onboardingStatus);

          if (reconciledUser !== normalizedUser) {
            setUser(reconciledUser);
            localStorage.setItem('user', JSON.stringify(reconciledUser));
            localStorageCache.set(CacheKeys.USER, reconciledUser, 5 * 60 * 1000);
          }

          if (shouldForceOnboardingForNewUser(reconciledUser, onboardingStatus)) {
            setShowOnboarding(true);
          } else if (shouldShowOnboardingWizard(reconciledUser, onboardingStatus)) {
            setShowOnboarding(true);
          } else {
            setShowOnboarding(false);
            markOnboardingDone(reconciledUser.id);
            if (!reconciledUser.onboardingCompleted) {
              const completedUser = { ...reconciledUser, onboardingCompleted: true };
              setUser(completedUser);
              localStorage.setItem('user', JSON.stringify(completedUser));
              localStorageCache.set(CacheKeys.USER, completedUser, 5 * 60 * 1000);
            }
          }
        } catch (error) {
          console.error('Failed to check onboarding status:', error);
          // New accounts should still see onboarding when status API is unavailable
          setShowOnboarding(shouldShowOnboardingWizard(normalizedUser));
        }
      }
      
      // If we got user data but no token, it means session-based auth (OAuth)
      const token = localStorage.getItem('auth_token');
      if (!token && normalizedUser) {
        console.log('🔐 Session-based authentication detected (OAuth)');
      }
    } catch (error: any) {
      // Don't log errors for expected 401 responses (user not authenticated) or network errors
      // Network errors are already handled by the API interceptor
      if (error?.response?.status !== 401 && !isNetworkError(error)) {
        console.error('Auth check failed:', error);
      }
      // Clear cache on auth failure
      localStorageCache.remove(CacheKeys.USER);
      localStorageCache.remove(CacheKeys.USER_SESSION);
      // Only clear localStorage if we have a token (wallet auth)
      const token = localStorage.getItem('auth_token');
      if (token) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
      setUser(null);
      setShowOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: User, token?: string) => {
    migrateLegacyOnboardingStorage();

    setUser(userData);
    if (token) {
      localStorage.setItem('auth_token', token);
    }
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Cache user data
    localStorageCache.set(CacheKeys.USER, userData, 5 * 60 * 1000);
    localStorageCache.set(CacheKeys.USER_SESSION, { timestamp: Date.now() }, 5 * 60 * 1000);
    
    // New accounts always see onboarding immediately
    if (shouldForceOnboardingForNewUser(userData)) {
      setShowOnboarding(true);
    }
    
    try {
      const onboardingStatus = await onboardingService.getStatus();
      const reconciledUser = reconcileUserOnboardingState(userData, onboardingStatus);

      if (reconciledUser !== userData) {
        setUser(reconciledUser);
        localStorage.setItem('user', JSON.stringify(reconciledUser));
        localStorageCache.set(CacheKeys.USER, reconciledUser, 5 * 60 * 1000);
      }

      if (shouldShowOnboardingWizard(reconciledUser, onboardingStatus)) {
        setShowOnboarding(true);
      } else {
        setShowOnboarding(false);
        markOnboardingDone(reconciledUser.id);
        if (!reconciledUser.onboardingCompleted) {
          updateUser({ onboardingCompleted: true });
        }
      }
    } catch (error) {
      console.error('Failed to check onboarding status after login:', error);
      setShowOnboarding(shouldShowOnboardingWizard(userData));
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setShowOnboarding(false);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      // Clear cache
      localStorageCache.remove(CacheKeys.USER);
      localStorageCache.remove(CacheKeys.USER_SESSION);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update cache
      localStorageCache.set(CacheKeys.USER, updatedUser, 5 * 60 * 1000);
      
      // Hide onboarding if user completed it or skipped it
      if (userData.onboardingCompleted) {
        setShowOnboarding(false);
        markOnboardingDone(user.id);
      }
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return user.permissions?.includes(permission) || false;
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin' || user?.role === 'super_admin' || false;
  };

  const isModerator = (): boolean => {
    return user?.role === 'moderator' || isAdmin();
  };

  const canModerate = (): boolean => {
    return isModerator();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        showOnboarding,
        setShowOnboarding,
        login,
        logout,
        updateUser,
        checkAuth,
        hasPermission,
        isAdmin,
        isModerator,
        canModerate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

