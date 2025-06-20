import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import * as Icons from 'lucide-react';

const TabHeader = ({ 
  title, 
  searchPlaceholder, 
  searchTerm, 
  onSearchChange, 
  filterStatus, 
  onFilterChange, 
  filterOptions, 
  actionButton 
}) => {
  // Dynamically get the icon component
  const ActionIcon = actionButton?.icon ? Icons[actionButton.icon] : null;

  return (
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <div className="flex space-x-4">
        {searchPlaceholder && (
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>
        )}
        
        {filterOptions && filterOptions.length > 0 && (
          <select
            value={filterStatus}
            onChange={(e) => onFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
          {actionButton && (
          actionButton.to ? (
            <Link
              to={actionButton.to}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {ActionIcon && <ActionIcon className="h-4 w-4 mr-2" />}
              {actionButton.label}
            </Link>
          ) : (
            <button
              onClick={actionButton.onClick}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {ActionIcon && <ActionIcon className="h-4 w-4 mr-2" />}
              {actionButton.label}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default TabHeader;
