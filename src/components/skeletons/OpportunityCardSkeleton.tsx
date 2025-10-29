import React from 'react';

export const OpportunityCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm animate-pulse">
      {/* Title */}
      <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3" />
      
      {/* Company and location */}
      <div className="space-y-2 mb-3">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32" />
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24" />
      </div>
      
      {/* Type badge */}
      <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded-full w-20 mb-3" />
      
      {/* Date */}
      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-28" />
    </div>
  );
};

export const OpportunityCardSkeletonList: React.FC<{ count?: number }> = ({ count = 2 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <OpportunityCardSkeleton key={index} />
      ))}
    </div>
  );
};

