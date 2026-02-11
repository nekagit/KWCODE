import { JsonDisplay } from "@/components/shared/JsonDisplay";
import type { Feature } from "@/types/project";

interface FeaturesDisplayProps {
  features: Feature[];
}

export const FeaturesDisplay: React.FC<FeaturesDisplayProps> = ({ features }) => {
  return (
    <JsonDisplay
      title={`features (${features.length})`}
      data={features}
      height="h-48"
    />
  );
};