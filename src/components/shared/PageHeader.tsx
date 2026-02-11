import React from 'react';
import sharedClasses from './shared-classes';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode; // e.g., buttons for page-level actions
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <div data-shared-ui className={sharedClasses.PageHeader.root}>
      <div className={sharedClasses.PageHeader.inner}>
        <h1 className={sharedClasses.PageHeader.title}>{title}</h1>
        {subtitle && <p className={sharedClasses.PageHeader.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={sharedClasses.PageHeader.actions}>
        {actions}
      </div>}
    </div>
  );
};
