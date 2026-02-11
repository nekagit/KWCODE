import React from 'react';

interface TitleWithIconProps {
  icon?: React.ElementType;
  title: string;
  className?: string;
}

export const TitleWithIcon: React.FC<TitleWithIconProps> = ({ icon, title, className }) => {
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      {icon && <span className="flex items-center text-lg font-semibold">{React.createElement(icon)}</span>}
      <span className="text-lg font-semibold">{title}</span>
    </div>
  );
};
