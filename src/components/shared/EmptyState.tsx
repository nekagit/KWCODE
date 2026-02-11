import React from 'react';

interface StateProps {
  message?: string;
  title?: string;
  description?: string;
  icon?: React.ElementType | React.ReactNode;
  action?: React.ReactNode; // e.g., a button to create new item
}

/** Treat as component (render <Icon />): function or forwardRef-like object. Treat as node: React elements (<Lightbulb />), strings, etc. */
function isIconComponent(value: unknown): value is React.ElementType {
  if (typeof value === "function") return true;
  // forwardRef / memo components are objects with a render function
  return (
    typeof value === "object" &&
    value !== null &&
    "render" in value &&
    typeof (value as { render: unknown }).render === "function"
  );
}

export const EmptyState: React.FC<StateProps> = ({ message, title, description, icon, action }) => {
  const displayMessage = message ?? title ?? "";
  const Icon = icon != null && isIconComponent(icon) ? (icon as React.ElementType) : null;
  const iconAsNode = icon != null && !isIconComponent(icon) ? (icon as React.ReactNode) : null;
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-card text-card-foreground rounded-lg border border-border">
      {Icon != null && <Icon className="w-12 h-12 mb-4 text-primary/80" />}
      {iconAsNode != null && <div className="w-12 h-12 mb-4 flex items-center justify-center text-primary/80">{iconAsNode}</div>}
      {title && <p className="text-lg font-medium mb-2">{title}</p>}
      {(description || displayMessage) && <p className="text-muted-foreground mb-2">{description ?? displayMessage}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-card text-card-foreground rounded-lg border border-border">
      <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="mt-4 text-lg font-medium">Loading...</p>
    </div>
  );
};
