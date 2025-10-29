export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  avatarUrl?: string;
  coverImage?: string;
  coverImageUrl?: string;
  walletAddress?: string;
  reputation: number;
  isVerified: boolean;
  role?: 'user' | 'moderator' | 'admin' | 'super_admin';
  status?: 'active' | 'suspended' | 'banned' | 'pending';
  bio?: string;
  location?: string;
  website?: string;
  pseudo?: string;
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
}

export interface Page {
  id: string;
  name: string;
  logo: string;
}

export interface Post {
  id: string;
  slug: string;
  author: User;
  title: string;
  content: string;
  category: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  commentCount: number;
  timestamp?: Date | string;
  createdAt?: string;
  publishedAt?: string;
  updatedAt?: string;
  hasUpvoted?: boolean;
  hasDownvoted?: boolean;
  coverImage?: string;
  coverImageUrl?: string;
  ogImageUrl?: string;
  page?: Page;
}

export interface Comment {
  id: string;
  postId?: string;
  parentId?: string;
  author: User;
  content: string;
  upvotes: number;
  downvotes: number;
  timestamp?: Date | string;
  createdAt?: string;
  updatedAt?: string;
  replies?: Comment[];
  hasUpvoted?: boolean;
  hasDownvoted?: boolean;
}

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type NotificationType =
  | 'comment'
  | 'reply'
  | 'upvote'
  | 'mention'
  | 'follow'
  | 'post'
  | 'achievement'
  | 'system'
  | 'bookmark'
  | 'reaction'
  | 'share'
  | 'page_invite'
  | 'verification';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  user?: User;
  post?: {
    id: string;
    title: string;
  };
  actionUrl?: string;
}
