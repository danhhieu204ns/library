import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
  let sizeClass = 'h-8 w-8';
  if (size === 'sm') sizeClass = 'h-5 w-5';
  if (size === 'lg') sizeClass = 'h-12 w-12';
  
  let colorClass = 'text-yellow-500';
  if (color === 'white') colorClass = 'text-white';
  if (color === 'gray') colorClass = 'text-gray-600';
  
  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full border-t-2 border-b-2 ${colorClass} ${sizeClass}`}></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
