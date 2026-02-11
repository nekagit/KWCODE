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
      <div className="relative p-5 border border-border w-96 shadow-lg rounded-md bg-card text-card-foreground">
        <div className="flex justify-between items-center pb-3 border-b border-border">
          <h4 className="text-lg font-semibold">{title}</h4>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            &times;
          </button>
        </div>
        <div className="mt-3 mb-4">
          {children}
        </div>
        {actions && (
          <div className="flex justify-end pt-3 border-t border-border">
            <div className="flex space-x-2">
              {actions}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
