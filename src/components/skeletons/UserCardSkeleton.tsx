import React from 'react';

export const UserCardSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-3 p-3 animate-pulse">
      {/* Avatar */}
      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full flex-shrink-0" />
      
      <div className="flex-1 min-w-0">
        {/* Name */}
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2" />
        {/* Username */}
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20" />
      </div>
      
      {/* Follow button */}
      <div className="h-8 w-20 bg-gray-300 dark:bg-gray-700 rounded-lg" />
    </div>
  );
};

export const UserCardSkeletonList: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <UserCardSkeleton key={index} />
      ))}
    </div>
  );
};

