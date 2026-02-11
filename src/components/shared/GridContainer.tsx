import React from 'react';

interface GridContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const GridContainer: React.FC<GridContainerProps> = ({
  children,
  className = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
}) => {
  return <div className={className}>{children}</div>;
};
