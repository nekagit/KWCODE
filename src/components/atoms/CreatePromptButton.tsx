import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CreatePromptButtonProps {
  onClick: () => void;
}

export const CreatePromptButton: React.FC<CreatePromptButtonProps> = ({
  onClick,
}) => {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      <Plus className="h-4 w-4" />
      Create prompt
    </Button>
  );
};
