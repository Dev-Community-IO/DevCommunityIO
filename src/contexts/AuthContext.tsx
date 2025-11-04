import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/api/auth.service';
import onboardingService from '../services/api/onboarding.service';
import { isNetworkError } from '../services/api/config';

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

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
    
    // Listen for logout events
    const handleLogout = () => {
      setUser(null);
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
      // Normalize avatar field: ensure avatarUrl is used, fallback to avatar for legacy support
      const normalizedUser = {
        ...userData,
        avatarUrl: userData.avatarUrl || userData.avatar_url || userData.avatar,
        avatar: userData.avatar || userData.avatarUrl || userData.avatar_url, // Legacy support
      };
      setUser(normalizedUser);
      
      // Check onboarding status if user is authenticated
      if (normalizedUser) {
        try {
          const onboardingStatus = await onboardingService.getStatus();
          // Show onboarding if not completed and user doesn't have onboardingCompleted flag
          if (!onboardingStatus.completed && !normalizedUser.onboardingCompleted) {
            setShowOnboarding(true);
          }
        } catch (error) {
          console.error('Failed to check onboarding status:', error);
          // Don't block auth if onboarding check fails
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
    
    // Check onboarding status after login
    try {
      const onboardingStatus = await onboardingService.getStatus();
      if (!onboardingStatus.completed && !userData.onboardingCompleted) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Failed to check onboarding status after login:', error);
      // Don't block login if onboarding check fails
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
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Hide onboarding if user completed it
      if (userData.onboardingCompleted) {
        setShowOnboarding(false);
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

