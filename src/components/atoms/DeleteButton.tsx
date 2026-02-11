import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  onClick: (event: React.MouseEvent) => void;
  title?: string;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({ onClick, title = "Delete" }) => {
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive z-10"
      title={title}
      onClick={onClick}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};
