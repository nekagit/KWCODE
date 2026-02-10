import { ReactNode } from "react";

interface ProjectListContainerProps {
  children: ReactNode;
}

export function ProjectListContainer({ children }: ProjectListContainerProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  );
}
