import React from 'react';

interface ButtonGroupProps {
  children: React.ReactNode;
  alignment?: 'left' | 'center' | 'right'; // Default to 'right' for footer buttons
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ children, alignment = 'right', className }) => {
  const justifyClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }[alignment];

  return (
    <div className={`flex space-x-2 ${justifyClass} ${className || ''}`}>
      {children}
    </div>
  );
};
