export function ProfileHeaderSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Cover Image Skeleton */}
      <div className="relative h-32 sm:h-48 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
      
      {/* Profile Card Skeleton */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 -mt-16 sm:-mt-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            {/* Avatar and Info */}
            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-end">
              {/* Avatar */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-300 dark:bg-gray-700 ring-4 ring-white dark:ring-gray-900" />
              
              {/* User Info */}
              <div className="space-y-2 text-center sm:text-left">
                {/* Username */}
                <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded-lg" />
                {/* Role */}
                <div className="h-5 w-32 bg-gray-200 dark:bg-gray-600 rounded" />
                {/* Location */}
                <div className="h-4 w-40 bg-gray-200 dark:bg-gray-600 rounded" />
              </div>
            </div>
            
            {/* Action Button */}
            <div className="h-12 w-32 bg-gray-300 dark:bg-gray-700 rounded-xl" />
          </div>
          
          {/* Bio Section */}
          <div className="mt-6 space-y-3">
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded" />
            <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-600 rounded" />
            <div className="h-4 w-4/6 bg-gray-200 dark:bg-gray-600 rounded" />
          </div>
          
          {/* Social Links */}
          <div className="mt-4 flex gap-3">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg" />
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg" />
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg" />
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg" />
          </div>
          
          {/* Skills */}
          <div className="mt-6">
            <div className="h-5 w-20 bg-gray-300 dark:bg-gray-700 rounded mb-3" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-8 w-24 bg-gray-200 dark:bg-gray-600 rounded-full" />
              ))}
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2 text-center">
                <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded mx-auto" />
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
