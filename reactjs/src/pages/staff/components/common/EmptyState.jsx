import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';

const EmptyState = ({ icon, title, description, actionButton }) => {
  const IconComponent = icon ? Icons[icon] : null;
  
  return (
    <div className="text-center py-8">
      {IconComponent && <IconComponent className="mx-auto h-12 w-12 text-gray-400 mb-4" />}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>      {actionButton && (
        <div className="mt-4">
          {actionButton.to ? (
            <Link
              to={actionButton.to}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {actionButton.icon && React.createElement(Icons[actionButton.icon], { 
                className: "h-4 w-4 mr-2" 
              })}
              {actionButton.label}
            </Link>
          ) : (
            <button
              onClick={actionButton.onClick}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {actionButton.icon && React.createElement(Icons[actionButton.icon], { 
                className: "h-4 w-4 mr-2" 
              })}
              {actionButton.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
