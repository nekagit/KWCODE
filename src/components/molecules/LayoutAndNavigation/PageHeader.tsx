"use client";

import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: ReactNode;
}

export function PageHeader({ title, description, icon }: PageHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-semibold flex items-center gap-2">
        {icon}
        {title}
      </h1>
      <p className="text-muted-foreground mt-1">{description}</p>
    </div>
  );
}
