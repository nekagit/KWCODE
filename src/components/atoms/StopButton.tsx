import React from 'react';
import { Button } from "@/components/ui/button";
import { Square } from "lucide-react";

interface StopButtonProps {
  onClick: () => Promise<void>;
  disabled: boolean;
}

export const StopButton: React.FC<StopButtonProps> = ({
  onClick,
  disabled,
}) => {
  return (
    <Button variant="destructive" onClick={onClick} disabled={disabled}>
      <Square className="mr-2 h-4 w-4" />
      Stop
    </Button>
  );
};
