import React from 'react';

interface ErrorDisplayProps {
  message: string;
  details?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, details }) => {
  return (
    <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
      <strong className="font-bold">Error:</strong>
      <span className="block sm:inline ml-2">{message}</span>
      {details && <pre className="mt-2 text-xs whitespace-pre-wrap">{details}</pre>}
    </div>
  );
};
