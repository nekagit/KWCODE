import React from 'react';
import { Folders } from "lucide-react";
import { GenericButton } from "./GenericButton";

interface ActiveReposButtonProps {
  onClick: () => void;
}

export const ActiveReposButton: React.FC<ActiveReposButtonProps> = ({
  onClick,
}) => {
  return (
    <GenericButton
      onClick={onClick}
      icon={Folders}
      text="Active repos"
      variant="outline"
    />
  );
};
