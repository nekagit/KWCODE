import { ButtonComponent } from "@/components/shared/ButtonComponent";
import { Layers } from "lucide-react";

interface FeaturesButtonProps {
  onClick: () => void;
}

export const FeaturesButton: React.FC<FeaturesButtonProps> = ({
  onClick,
}) => {
  return (
    <ButtonComponent
      variant="outline"
      onClick={onClick}
      icon={Layers}
      text="Features"
    />
  );
};