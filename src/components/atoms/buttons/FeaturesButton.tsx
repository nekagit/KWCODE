import { GenericButton } from "./GenericButton";
import { Layers } from "lucide-react";

interface FeaturesButtonProps {
  onClick: () => void;
}

export const FeaturesButton: React.FC<FeaturesButtonProps> = ({
  onClick,
}) => {
  return (
    <GenericButton
      variant="outline"
      onClick={onClick}
      icon={Layers}
      text="Features"
    />
  );
};