import React from 'react';
import sharedClasses from './shared-classes';

interface CardProps {
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode; // Main content
  footerButtons?: React.ReactNode; // Right-aligned button group
  [key: string]: any; // Allow arbitrary props
}

export const Card: React.FC<CardProps> = ({ title, subtitle, children, footerButtons, ...rest }) => {
  return (
    <div data-shared-ui className={sharedClasses.Card.root} {...rest}>
      {(title || subtitle) && (
        <div className={sharedClasses.Card.header}>
          {typeof title === 'string' ? <h3 className={sharedClasses.Card.title}>{title}</h3> : title}
          {typeof subtitle === 'string' ? <p className={sharedClasses.Card.subtitle}>{subtitle}</p> : subtitle}
        </div>
      )}
      <div className={sharedClasses.Card.body}>
        {children}
      </div>
      {footerButtons && (
        <div className={sharedClasses.Card.footer}>
          <div className={sharedClasses.Card.footerInner}>
            {footerButtons}
          </div>
        </div>
      )}
    </div>
  );
};
