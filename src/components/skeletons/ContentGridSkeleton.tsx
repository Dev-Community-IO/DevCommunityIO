import React from 'react';

export const ContentGridSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden animate-pulse">
      {/* Image */}
      <div className="w-full h-56 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600" />
      
      <div className="p-6 space-y-4">
        {/* Header badges */}
        <div className="flex items-center gap-2">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-20" />
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-16" />
        </div>
        
        {/* Title */}
        <div className="space-y-2">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-4/5" />
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/5" />
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
        </div>
        
        {/* Meta info */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20" />
        </div>
        
        {/* Tags */}
        <div className="flex gap-2 flex-wrap">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-16" />
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-20" />
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-14" />
        </div>
        
        {/* Action button */}
        <div className="h-11 bg-gray-300 dark:bg-gray-700 rounded-xl w-full" />
      </div>
    </div>
  );
};

export const ContentGridSkeletonList: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ContentGridSkeleton key={index} />
      ))}
    </div>
  );
};

