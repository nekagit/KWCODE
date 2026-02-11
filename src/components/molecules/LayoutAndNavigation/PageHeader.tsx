import React from 'react';

interface PageHeaderProps {
  title: string | React.ReactNode;
  description?: string;
  icon?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, icon }) => {
  return (
    <div className="flex items-center space-x-2">
      {icon && <div className="text-gray-600 dark:text-gray-400">{icon}</div>}
      <div className="flex flex-col space-y-2">
        {typeof title === 'string' ? <h1 className="text-3xl font-bold tracking-tight">{title}</h1> : title}
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
};
