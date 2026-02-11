import React from 'react';

interface ErrorDisplayProps {
  message: string;
  title?: string;
  details?: string;
  variant?: "default" | "destructive";
  icon?: React.ReactNode;
  onRetry?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, title, details, icon, onRetry }) => {
  return (
    <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
      {(title || icon) && (
        <div className="flex items-center gap-2 mb-1">
          {icon}
          {title && <strong className="font-bold">{title}</strong>}
        </div>
      )}
      {!title && <strong className="font-bold">Error:</strong>}
      <span className="block sm:inline ml-2">{message}</span>
      {details && <pre className="mt-2 text-xs whitespace-pre-wrap">{details}</pre>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          Retry
        </button>
      )}
    </div>
  );
};
