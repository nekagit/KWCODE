import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode; // e.g., buttons for page-level actions
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex-shrink-0 flex space-x-2">
        {actions}
      </div>}
    </div>
  );
};
