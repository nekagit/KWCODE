import React from 'react';
import { Plus } from "lucide-react";
import { GenericButton } from "./GenericButton";

interface CreatePromptButtonProps {
  onClick: () => void;
}

export const CreatePromptButton: React.FC<CreatePromptButtonProps> = ({
  onClick,
}) => {
  return (
    <GenericButton
      onClick={onClick}
      icon={Plus}
      text="Create prompt"
      variant="outline"
      size="sm"
    />
  );
};
