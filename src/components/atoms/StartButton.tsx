import React from 'react';
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface StartButtonProps {
  onClick: () => Promise<void>;
  disabled: boolean;
}

export const StartButton: React.FC<StartButtonProps> = ({
  onClick,
  disabled,
}) => {
  return (
    <Button onClick={onClick} disabled={disabled}>
      <Play className="mr-2 h-4 w-4" />
      Start
    </Button>
  );
};
