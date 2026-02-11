import { ButtonComponent } from "@/components/shared/ButtonComponent";
import { Play, Loader2 } from "lucide-react";
import type { Feature } from "@/types/project";
import type { RunInfo } from "@/types/run";

interface RunFeatureButtonProps {
  feature: Feature;
  runForFeature: (feature: Feature) => Promise<void>;
  runningRuns: RunInfo[];
}

export const RunFeatureButton: React.FC<RunFeatureButtonProps> = ({
  feature,
  runForFeature,
  runningRuns,
}) => {
  const isRunning = runningRuns.some((r) => r.label === feature.title && r.status === "running");

  const buttonIcon = isRunning ? Loader2 : Play;
  const buttonText = `Run "${feature.title.length > 20 ? feature.title.slice(0, 20) + "…" : feature.title}"`;

  return (
    <ButtonComponent
      variant="default"
      onClick={() => runForFeature(feature)}
      disabled={feature.prompt_ids.length === 0 || isRunning}
      icon={buttonIcon}
      text={buttonText}
      iconClassName={isRunning ? "animate-spin" : ""}
    />
  );
};