import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface PromptsButtonProps {
  onClick: () => void;
}

export const PromptsButton: React.FC<PromptsButtonProps> = ({
  onClick,
}) => {
  return (
    <Button variant="outline" onClick={onClick}>
      <MessageSquare className="h-4 w-4 mr-2" />
      Prompts
    </Button>
  );
};
