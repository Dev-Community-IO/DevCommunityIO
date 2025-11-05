import { GlassCard } from '../GlassCard';

export function PostDetailSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 animate-pulse">
      {/* Back Button Skeleton */}
      <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />

      {/* Main Content Card Skeleton */}
      <GlassCard className="p-4 sm:p-6 lg:p-8">
        <div className="space-y-5">
          {/* Header Skeleton */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 flex-1">
              {/* Avatar Skeleton */}
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full flex-shrink-0" />
              
              <div className="flex-1">
                {/* Author Name */}
                <div className="h-5 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                {/* Timestamp */}
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded" />
              </div>
            </div>
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>

          {/* Title Skeleton */}
          <div className="space-y-2">
            <div className="h-8 w-full bg-gray-300 dark:bg-gray-700 rounded-lg" />
            <div className="h-8 w-4/5 bg-gray-300 dark:bg-gray-700 rounded-lg" />
          </div>

          {/* Cover Image Skeleton */}
          <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />

          {/* Tags Skeleton */}
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-7 w-20 bg-gray-200 dark:bg-gray-600 rounded-lg" />
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded" />
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded" />
            <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-600 rounded" />
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded" />
            <div className="h-4 w-4/6 bg-gray-200 dark:bg-gray-600 rounded" />
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded" />
          </div>

          {/* Actions Skeleton */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-16 bg-gray-200 dark:bg-gray-600 rounded" />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-600 rounded-lg" />
              <div className="h-10 w-20 bg-gray-200 dark:bg-gray-600 rounded-lg" />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Comment Form Skeleton */}
      <GlassCard className="p-4 sm:p-6">
        <div className="h-6 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-4" />
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
        <div className="h-10 w-32 bg-gray-300 dark:bg-gray-700 rounded-lg ml-auto" />
      </GlassCard>

      {/* Comments List Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-40 bg-gray-300 dark:bg-gray-700 rounded mb-4" />
        {[1, 2, 3].map((i) => (
          <GlassCard key={i} className="p-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded" />
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-600 rounded" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

