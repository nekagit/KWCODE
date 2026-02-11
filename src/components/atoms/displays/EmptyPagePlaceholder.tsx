import React from "react";

interface EmptyPagePlaceholderProps {
  title: string;
  description?: string;
}

export function EmptyPagePlaceholder({ title, description }: EmptyPagePlaceholderProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
}
