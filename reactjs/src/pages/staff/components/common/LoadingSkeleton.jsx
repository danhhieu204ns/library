import React from 'react';

const LoadingSkeleton = ({ count = 5, type = 'default' }) => {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse border rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="bg-gray-200 h-12 w-12 rounded"></div>
            <div className="flex-1">
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-3 w-2/3 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
