import { GlassCard } from '../GlassCard';

export function PageViewSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 animate-pulse">
      {/* Hero Section - Cover Image Skeleton */}
      <div className="relative h-72 md:h-96 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
      
      {/* Profile Section Skeleton */}
      <div className="relative px-4 sm:px-6 lg:px-8 -mt-20 z-10">
        <div className="max-w-7xl mx-auto">
          <GlassCard className="p-6 sm:p-8 shadow-2xl border-2 border-gray-200/50 dark:border-gray-700/50">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              {/* Logo Skeleton */}
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gray-300 dark:bg-gray-700 ring-4 ring-white dark:ring-gray-900" />
              </div>

              {/* Info Section Skeleton */}
              <div className="flex-1 min-w-0 pt-4 md:pt-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    {/* Page Name */}
                    <div className="h-10 w-64 bg-gray-300 dark:bg-gray-700 rounded-lg mb-3" />
                    
                    {/* Badges */}
                    <div className="flex items-center gap-3 flex-wrap mb-4">
                      <div className="h-6 w-24 bg-gray-200 dark:bg-gray-600 rounded-full" />
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-600 rounded" />
                    </div>
                  </div>

                  {/* Action Button Skeleton */}
                  <div className="h-12 w-32 bg-gray-300 dark:bg-gray-700 rounded-xl" />
                </div>

                {/* Stats Skeleton */}
                <div className="flex items-center gap-6 mb-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg" />
                    <div>
                      <div className="h-6 w-12 bg-gray-300 dark:bg-gray-700 rounded mb-1" />
                      <div className="h-3 w-16 bg-gray-200 dark:bg-gray-600 rounded" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg" />
                    <div>
                      <div className="h-6 w-12 bg-gray-300 dark:bg-gray-700 rounded mb-1" />
                      <div className="h-3 w-16 bg-gray-200 dark:bg-gray-600 rounded" />
                    </div>
                  </div>
                </div>
                
                {/* Description Skeleton */}
                <div className="space-y-2 mb-4">
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded" />
                  <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-600 rounded" />
                  <div className="h-4 w-4/6 bg-gray-200 dark:bg-gray-600 rounded" />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Tabs Navigation Skeleton */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 overflow-x-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <GlassCard key={i} className="p-4">
              <div className="space-y-3">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="h-5 w-3/4 bg-gray-300 dark:bg-gray-600 rounded" />
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded" />
                <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-600 rounded" />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}

