import React from 'react';
import { Plus } from "lucide-react";
import { ButtonComponent } from "@/components/shared/ButtonComponent";

interface AddTicketButtonProps {
  onClick: () => void;
}

export const AddTicketButton: React.FC<AddTicketButtonProps> = ({
  onClick,
}) => {
  return (
    <ButtonComponent
      onClick={onClick}
      icon={Plus}
      text="Add ticket"
      variant="default"
    />
  );
};
