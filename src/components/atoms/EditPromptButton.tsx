import React from 'react';
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

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
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      <Pencil className="h-4 w-4" />
      Edit prompt
    </Button>
  );
};
