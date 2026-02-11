import React from 'react';

interface CardProps {
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode; // Main content
  footerButtons?: React.ReactNode; // Right-aligned button group
  [key: string]: any; // Allow arbitrary props
}

export const Card: React.FC<CardProps> = ({ title, subtitle, children, footerButtons, ...rest }) => {
  return (
    <div className="bg-card text-card-foreground shadow-md rounded-lg p-6 mb-4 border border-border" {...rest}>
      {(title || subtitle) && (
        <div className="mb-4">
          {typeof title === 'string' ? <h3 className="text-xl font-semibold">{title}</h3> : title}
          {typeof subtitle === 'string' ? <p className="text-muted-foreground text-sm">{subtitle}</p> : subtitle}
        </div>
      )}
      <div className="mb-4">
        {children}
      </div>
      {footerButtons && (
        <div className="flex justify-end pt-4 border-t border-border">
          <div className="flex space-x-2">
            {footerButtons}
          </div>
        </div>
      )}
    </div>
  );
};
