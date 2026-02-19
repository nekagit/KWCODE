/** Stop Button component. */
import { ButtonComponent } from "@/components/shared/ButtonComponent";
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
    <ButtonComponent
      variant="destructive"
      onClick={onClick}
      disabled={disabled}
      icon={Square}
      text="Stop"
    />
  );
};