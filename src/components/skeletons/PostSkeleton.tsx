import React from 'react';

export const PostSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {/* Avatar */}
        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full flex-shrink-0" />
        
        <div className="flex-1">
          {/* User name */}
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-2" />
          {/* Timestamp */}
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/6" />
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-16" />
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-20" />
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-14" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-12" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-12" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-12" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-12" />
      </div>
    </div>
  );
};

export const PostSkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <PostSkeleton key={index} />
      ))}
    </div>
  );
};

