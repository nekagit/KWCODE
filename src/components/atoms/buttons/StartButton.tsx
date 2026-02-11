import { ButtonComponent } from "@/components/shared/ButtonComponent";
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
    <ButtonComponent
      onClick={onClick}
      disabled={disabled}
      icon={Play}
      text="Start"
    />
  );
};