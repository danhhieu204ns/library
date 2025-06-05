import React from 'react';

export const Label = ({ 
  children,
  className = '', 
  htmlFor,
  ...props 
}) => {
  return (
    <label 
      htmlFor={htmlFor}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};
