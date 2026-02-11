import React from 'react';

interface DialogProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  actions?: React.ReactNode;
  isOpen: boolean;
}

export const Dialog: React.FC<DialogProps> = ({ title, children, onClose, actions, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h4>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            &times;
          </button>
        </div>
        <div className="mt-3 mb-4">
          {children}
        </div>
        {actions && (
          <div className="flex justify-end pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              {actions}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
