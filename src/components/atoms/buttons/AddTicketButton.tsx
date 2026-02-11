import React from 'react';
import { Plus } from "lucide-react";
import { GenericButton } from "./GenericButton";

interface AddTicketButtonProps {
  onClick: () => void;
}

export const AddTicketButton: React.FC<AddTicketButtonProps> = ({
  onClick,
}) => {
  return (
    <GenericButton
      onClick={onClick}
      icon={Plus}
      text="Add ticket"
      variant="default"
    />
  );
};
