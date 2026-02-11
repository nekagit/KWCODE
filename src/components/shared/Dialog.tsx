import React from 'react';
import sharedClasses from './shared-classes';

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
    <div data-shared-ui className={sharedClasses.Dialog.overlay}>
      <div className={sharedClasses.Dialog.panel}>
        <div className={sharedClasses.Dialog.header}>
          <h4 className={sharedClasses.Dialog.title}>{title}</h4>
          <button onClick={onClose} className={sharedClasses.Dialog.closeButton}>
            &times;
          </button>
        </div>
        <div className={sharedClasses.Dialog.body}>
          {children}
        </div>
        {actions && (
          <div className={sharedClasses.Dialog.actions}>
            <div className={sharedClasses.Dialog.actionsInner}>
              {actions}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
