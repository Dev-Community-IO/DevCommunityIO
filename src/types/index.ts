export interface User {
  id: string;
  username: string;
  avatar: string;
  walletAddress: string;
  reputation: number;
  isVerified?: boolean;
}

export interface Page {
  id: string;
  name: string;
  logo: string;
}

export interface Post {
  id: string;
  author: User;
  title: string;
  content: string;
  category: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  commentCount: number;
  timestamp: Date;
  hasUpvoted?: boolean;
  hasDownvoted?: boolean;
  coverImage?: string;
  page?: Page;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  upvotes: number;
  downvotes: number;
  timestamp: Date;
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
  | 'system';

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
