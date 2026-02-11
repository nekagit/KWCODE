import React from 'react';

interface FormProps {
  children: React.ReactNode;
  onSubmit: (event: React.FormEvent) => void;
  className?: string;
}

export const Form: React.FC<FormProps> = ({ children, onSubmit, className }) => {
  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className || ''}`}>
      {children}
    </form>
  );
};
