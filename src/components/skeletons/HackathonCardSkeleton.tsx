import React from 'react';

export const HackathonCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm animate-pulse">
      {/* Title */}
      <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3" />
      
      {/* Prize */}
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-3" />
      
      {/* Date and participants */}
      <div className="flex items-center gap-4 mb-3">
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20" />
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16" />
      </div>
      
      {/* Tags */}
      <div className="flex gap-2">
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded-full w-12" />
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded-full w-16" />
      </div>
    </div>
  );
};

export const HackathonCardSkeletonList: React.FC<{ count?: number }> = ({ count = 2 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <HackathonCardSkeleton key={index} />
      ))}
    </div>
  );
};

