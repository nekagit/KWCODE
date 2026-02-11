import React from 'react';
import { Trash2 } from "lucide-react";
import { GenericButton } from "./GenericButton";

interface DeleteButtonProps {
  onClick: (event: React.MouseEvent) => void;
  title?: string;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({ onClick, title = "Delete" }) => {
  return (
    <GenericButton
      onClick={onClick}
      icon={Trash2}
      text=""
      variant="ghost"
      size="sm"
      className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive z-10"
      title={title}
    />
  );
};
