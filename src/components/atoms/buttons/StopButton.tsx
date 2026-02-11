import { GenericButton } from "./GenericButton";
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
    <GenericButton
      variant="destructive"
      onClick={onClick}
      disabled={disabled}
      icon={Square}
      text="Stop"
    />
  );
};