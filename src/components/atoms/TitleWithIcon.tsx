import React from 'react';

interface TitleWithIconProps {
  icon?: React.ReactNode;
  title: string;
  className?: string;
}

export const TitleWithIcon: React.FC<TitleWithIconProps> = ({ icon, title, className }) => {
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      {icon && (typeof icon === 'string' ? <span className="text-lg font-semibold">{icon}</span> : icon)}
      <span className="text-lg font-semibold">{title}</span>
    </div>
  );
};
