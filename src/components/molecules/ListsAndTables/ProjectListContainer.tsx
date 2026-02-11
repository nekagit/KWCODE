import React, { ReactNode } from "react";
import { GridContainer } from "@/components/shared/GridContainer";

interface ProjectListContainerProps {
  children: ReactNode;
}

export function ProjectListContainer({ children }: ProjectListContainerProps) {
  return (
    <GridContainer>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { key: child.key || index });
        }
        return child;
      })}
    </GridContainer>
  );
}
