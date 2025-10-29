import React from 'react';

export const PageCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
      {/* Cover image */}
      <div className="w-full h-48 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4" />
      
      {/* Title */}
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3" />
      
      {/* Excerpt */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
      </div>
      
      {/* Author and date */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full" />
        <div className="flex-1">
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-1" />
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20" />
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16" />
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16" />
      </div>
    </div>
  );
};

export const PageCardSkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <PageCardSkeleton key={index} />
      ))}
    </div>
  );
};

