import { ReactNode } from "react";
import { GridContainer } from "@/components/shared/GridContainer";

interface ProjectListContainerProps {
  children: ReactNode;
}

export function ProjectListContainer({ children }: ProjectListContainerProps) {
  return (
    <GridContainer>
      {children}
    </GridContainer>
  );
}
