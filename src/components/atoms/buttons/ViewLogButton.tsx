import { ButtonComponent } from "@/components/shared/ButtonComponent";
import { ScrollText } from "lucide-react";
import type { RunInfo } from "@/types/run";

interface ViewLogButtonProps {
  onClick: () => void;
  runningRuns: RunInfo[];
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
    <ButtonComponent
      variant="outline"
      onClick={handleViewLogClick}
      icon={ScrollText}
      text="View log"
    />
  );
};