import React from 'react';
import { Button } from "@/components/ui/button";
import { Folders } from "lucide-react";

interface ActiveReposButtonProps {
  onClick: () => void;
}

export const ActiveReposButton: React.FC<ActiveReposButtonProps> = ({
  onClick,
}) => {
  return (
    <Button variant="outline" onClick={onClick}>
      <Folders className="h-4 w-4 mr-2" />
      Active repos
    </Button>
  );
};
