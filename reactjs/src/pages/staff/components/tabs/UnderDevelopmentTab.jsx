import React from 'react';
import { Settings } from 'lucide-react';

const UnderDevelopmentTab = ({ tabName }) => {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <Settings className="h-12 w-12 mx-auto" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {tabName || 'Tính năng đang phát triển'}
      </h3>
      <p className="text-gray-500">Tính năng này đang được phát triển.</p>
    </div>
  );
};

export default UnderDevelopmentTab;
