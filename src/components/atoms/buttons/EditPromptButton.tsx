import React from 'react';
import { Pencil } from "lucide-react";
import { GenericButton } from "./GenericButton";

interface EditPromptButtonProps {
  onClick: () => void;
  disabled: boolean;
  title: string;
}

export const EditPromptButton: React.FC<EditPromptButtonProps> = ({
  onClick,
  disabled,
  title,
}) => {
  return (
    <GenericButton
      onClick={onClick}
      icon={Pencil}
      text="Edit prompt"
      variant="outline"
      size="sm"
      disabled={disabled}
      title={title}
    />
  );
};
