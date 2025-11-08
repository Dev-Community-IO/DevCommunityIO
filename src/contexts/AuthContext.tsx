import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/api/auth.service';
import onboardingService from '../services/api/onboarding.service';
import { isNetworkError } from '../services/api/config';
import { localStorageCache, CacheKeys } from '../utils/cache';

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
    // Try to load from cache first for instant UI
    const cachedUser = localStorageCache.get<User>(CacheKeys.USER);
    const cachedSession = localStorageCache.get<{ timestamp: number }>(CacheKeys.USER_SESSION);
    
    if (cachedUser && cachedSession) {
      // Normalize avatar field
      const normalizedUser = {
        ...cachedUser,
        avatarUrl: cachedUser.avatarUrl || (cachedUser as any).avatar_url || cachedUser.avatar,
        avatar: cachedUser.avatar || cachedUser.avatarUrl || (cachedUser as any).avatar_url,
      };
      setUser(normalizedUser);
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
      
      // Check if userData exists before normalizing
      if (!userData) {
        throw new Error('No user data returned');
      }
      
      // Normalize avatar field: ensure avatarUrl is used, fallback to avatar for legacy support
      const normalizedUser = {
        ...userData,
        avatarUrl: userData.avatarUrl || (userData as any).avatar_url || userData.avatar,
        avatar: userData.avatar || userData.avatarUrl || (userData as any).avatar_url, // Legacy support
      };
      setUser(normalizedUser);
      
      // Cache user data (5 minutes expiry for session validation)
      localStorageCache.set(CacheKeys.USER, normalizedUser, 5 * 60 * 1000);
      localStorageCache.set(CacheKeys.USER_SESSION, { timestamp: Date.now() }, 5 * 60 * 1000);
      
      // Check onboarding status if user is authenticated
      if (normalizedUser) {
        try {
          const onboardingStatus = await onboardingService.getStatus();
          
          // Database state is the source of truth - check completed and skipped flags
          const isCompleted = onboardingStatus.completed === true;
          const isSkipped = onboardingStatus.skipped === true;
          
          // Show onboarding if NOT completed AND NOT skipped
          if (!isCompleted && !isSkipped) {
            setShowOnboarding(true);
          } else {
            // Hide onboarding if completed or skipped
            setShowOnboarding(false);
            // Update user object with completion status
            if (!normalizedUser.onboardingCompleted) {
              updateUser({ onboardingCompleted: true });
            }
            // Sync skip flag to localStorage for consistency
            if (isSkipped) {
              localStorage.setItem('onboarding_skipped', 'true');
            } else if (isCompleted) {
              localStorage.setItem('onboarding_skipped', 'true'); // Also set for completed
            }
          }
        } catch (error) {
          console.error('Failed to check onboarding status:', error);
          // Don't block auth if onboarding check fails
          // Default to showing onboarding for new users if API fails
          const skippedInLocalStorage = localStorage.getItem('onboarding_skipped') === 'true';
          if (skippedInLocalStorage || normalizedUser.onboardingCompleted) {
            setShowOnboarding(false);
          } else {
            // New user - show onboarding by default if we can't check status
            setShowOnboarding(true);
          }
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
    setUser(userData);
    if (token) {
      localStorage.setItem('auth_token', token);
    }
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Cache user data
    localStorageCache.set(CacheKeys.USER, userData, 5 * 60 * 1000);
    localStorageCache.set(CacheKeys.USER_SESSION, { timestamp: Date.now() }, 5 * 60 * 1000);
    
    // For new users, show onboarding immediately (don't wait for API check)
    // But we'll validate with API right after
    const skippedInLocalStorage = localStorage.getItem('onboarding_skipped') === 'true';
    const isNewUser = !userData.onboardingCompleted && !skippedInLocalStorage;
    
    if (isNewUser) {
      // Immediately show onboarding for new users (optimistic)
      setShowOnboarding(true);
    }
    
    // Then check onboarding status from API (database is source of truth)
    try {
      const onboardingStatus = await onboardingService.getStatus();
      
      // Database state is the source of truth - check completed and skipped flags
      const isCompleted = onboardingStatus.completed === true;
      const isSkipped = onboardingStatus.skipped === true;
      
      // Show onboarding if NOT completed AND NOT skipped
      if (!isCompleted && !isSkipped) {
        setShowOnboarding(true);
      } else {
        // Hide onboarding if completed or skipped
        setShowOnboarding(false);
        // Ensure userData has onboardingCompleted flag
        if (!userData.onboardingCompleted) {
          updateUser({ onboardingCompleted: true });
        }
        // Sync skip flag to localStorage for consistency
        if (isSkipped) {
          localStorage.setItem('onboarding_skipped', 'true');
        } else if (isCompleted) {
          localStorage.setItem('onboarding_skipped', 'true'); // Also set for completed
        }
      }
    } catch (error) {
      console.error('Failed to check onboarding status after login:', error);
      // Don't block login if onboarding check fails
      // For new users (no onboardingCompleted flag), show onboarding by default
      // Only skip if user explicitly has onboardingCompleted flag or skip flag in localStorage
      if (skippedInLocalStorage || userData.onboardingCompleted) {
        setShowOnboarding(false);
      } else {
        // New user - show onboarding by default
        setShowOnboarding(true);
      }
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
        // Also set skip flag in localStorage as backup
        localStorage.setItem('onboarding_skipped', 'true');
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

