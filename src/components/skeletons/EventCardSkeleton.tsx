import React from 'react';

export const EventCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm animate-pulse">
      {/* Title */}
      <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-4/5 mb-3" />
      
      {/* Type badge */}
      <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded-full w-20 mb-3" />
      
      {/* Date and location */}
      <div className="space-y-2 mb-3">
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-32" />
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-28" />
      </div>
      
      {/* Attendees */}
      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20" />
    </div>
  );
};

export const EventCardSkeletonList: React.FC<{ count?: number }> = ({ count = 2 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <EventCardSkeleton key={index} />
      ))}
    </div>
  );
};

