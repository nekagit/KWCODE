import React from 'react';
import { Button } from "@/components/shadcn/button";
import { Plus } from "lucide-react";

interface AddTicketButtonProps {
  onClick: () => void;
}

export const AddTicketButton: React.FC<AddTicketButtonProps> = ({
  onClick,
}) => {
  return (
    <Button variant="default" onClick={onClick}>
      <Plus className="h-4 w-4 mr-2" />
      Add ticket
    </Button>
  );
};
