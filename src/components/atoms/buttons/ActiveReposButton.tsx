/** Active Repos Button component. */
import React from 'react';
import { Folders } from "lucide-react";
import { ButtonComponent } from "@/components/shared/ButtonComponent";

interface ActiveReposButtonProps {
  onClick: () => void;
}

export const ActiveReposButton: React.FC<ActiveReposButtonProps> = ({
  onClick,
}) => {
  return (
    <ButtonComponent
      onClick={onClick}
      icon={Folders}
      text="Active repos"
      variant="outline"
    />
  );
};
