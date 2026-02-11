import { GenericButton } from "./GenericButton";
import { ScrollText } from "lucide-react";
import type { RunningRun } from "@/store/run-store";

interface ViewLogButtonProps {
  onClick: () => void;
  runningRuns: RunningRun[];
  setSelectedRunId: (id: string | null) => void;
}

export const ViewLogButton: React.FC<ViewLogButtonProps> = ({
  onClick,
  runningRuns,
  setSelectedRunId,
}) => {
  const handleViewLogClick = () => {
    setSelectedRunId(runningRuns[runningRuns.length - 1]?.runId ?? null);
    onClick();
  };

  return (
    <GenericButton
      variant="outline"
      onClick={handleViewLogClick}
      icon={ScrollText}
      text="View log"
    />
  );
};