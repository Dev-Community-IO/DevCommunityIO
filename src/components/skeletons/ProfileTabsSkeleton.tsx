export function ProfileTabsSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Tabs */}
      <div className="flex gap-2 sm:gap-4 p-2 overflow-x-auto scrollbar-hide border-b border-gray-200 dark:border-gray-700">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
        ))}
      </div>
      
      {/* Content */}
      <div className="mt-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0" />
              
              {/* Content */}
              <div className="flex-1 space-y-3">
                <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-600 rounded" />
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded" />
                
                {/* Actions */}
                <div className="flex gap-4 mt-4">
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

