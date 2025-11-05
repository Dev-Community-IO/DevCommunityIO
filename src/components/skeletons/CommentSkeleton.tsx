import { GlassCard } from '../GlassCard';

export function CommentSkeleton() {
  return (
    <GlassCard className="p-4 animate-pulse">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full flex-shrink-0" />
        
        <div className="flex-1 space-y-2">
          {/* Author and timestamp */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-600 rounded" />
          </div>
          
          {/* Comment content */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded" />
            <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-600 rounded" />
            <div className="h-4 w-4/6 bg-gray-200 dark:bg-gray-600 rounded" />
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-4 pt-2">
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-600 rounded" />
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded" />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

export function CommentSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <CommentSkeleton key={index} />
      ))}
    </div>
  );
}

