import { Lineicons } from '@lineiconshq/react-lineicons';
import type { IconData } from '@lineiconshq/free-icons';
import {
  Bookmark1Outlined,
  Bookmark1Solid,
  Comment1Outlined,
  EmojiSmileOutlined,
  EyeOutlined,
  Share1Outlined,
} from '@lineiconshq/free-icons';

export const postActionIcons = {
  react: EmojiSmileOutlined,
  comment: Comment1Outlined,
  share: Share1Outlined,
  view: EyeOutlined,
  bookmark: Bookmark1Outlined,
  bookmarkActive: Bookmark1Solid,
} as const;

type PostActionIconName = keyof typeof postActionIcons;

interface PostActionIconProps {
  name: PostActionIconName;
  size?: number;
  className?: string;
}

export function PostActionIcon({ name, size = 14, className = '' }: PostActionIconProps) {
  const icon: IconData = postActionIcons[name];
  return (
    <Lineicons
      icon={icon}
      size={size}
      className={`shrink-0 ${className}`}
      strokeWidth={1.75}
      color="currentColor"
    />
  );
}
