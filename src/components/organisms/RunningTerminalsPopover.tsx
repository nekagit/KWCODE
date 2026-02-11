import { Empty } from "@/components/ui/empty";
import { Terminal } from "lucide-react";
import { RunLogItem } from "@/components/molecules/ListsAndItems/RunLogItem";
import { type Run } from "@/types/run";

type RunningTerminalsPopoverProps = {
  runningRuns: Run[];
  setSelectedRunId: (id: string) => void;
  stopRun: (id: string) => void;
  setRunningTerminalsOpen: (open: boolean) => void;
  openLogModal: (runId?: string | null) => void;
};

export function RunningTerminalsPopover({
  runningRuns,
  setSelectedRunId,
  stopRun,
  setRunningTerminalsOpen,
  openLogModal,
}: RunningTerminalsPopoverProps) {
  return (
    <>
      <p className="text-xs font-medium text-muted-foreground px-2 py-1 mb-2">
        Running terminals
      </p>
      {runningRuns.length === 0 ? (
        <Empty
          title="No runs yet"
          description="Start a run from Dashboard or Run page."
          icon={<Terminal className="h-6 w-6" />}
        />
      ) : (
        <ul className="space-y-1">
          {runningRuns.map((run) => (
            <RunLogItem
              key={run.runId}
              run={run}
              setSelectedRunId={setSelectedRunId}
              stopRun={stopRun}
              openLogModal={openLogModal}
              setRunningTerminalsOpen={setRunningTerminalsOpen}
            />
          ))}
        </ul>
      )}
    </>
  );}
