import { GenericButton } from "./GenericButton";
import { Play, Loader2 } from "lucide-react";
import type { Feature } from "@/types/project";
import type { RunningRun } from "@/store/run-store";

interface RunFeatureButtonProps {
  feature: Feature;
  runForFeature: (feature: Feature) => Promise<void>;
  runningRuns: RunningRun[];
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
    <GenericButton
      variant="default"
      onClick={() => runForFeature(feature)}
      disabled={feature.prompt_ids.length === 0 || isRunning}
      icon={buttonIcon}
      text={buttonText}
      iconClassName={isRunning ? "animate-spin" : ""}
    />
  );
};