import React from 'react';
import { Button } from "@/components/ui/button";
import { Layers } from "lucide-react";

interface FeaturesButtonProps {
  onClick: () => void;
}

export const FeaturesButton: React.FC<FeaturesButtonProps> = ({
  onClick,
}) => {
  return (
    <Button variant="outline" onClick={onClick}>
      <Layers className="h-4 w-4 mr-2" />
      Features
    </Button>
  );
};
