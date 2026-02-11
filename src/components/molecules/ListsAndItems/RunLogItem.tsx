import { Button } from "@/components/ui/button";
import { type Run } from "@/types/run";

type RunLogItemProps = {
  run: Run;
  setSelectedRunId: (id: string) => void;
  stopRun: (id: string) => void;
  openLogModal: (id: string) => void;
  setRunningTerminalsOpen: (open: boolean) => void;
};

export function RunLogItem({
  run,
  setSelectedRunId,
  stopRun,
  openLogModal,
  setRunningTerminalsOpen,
}: RunLogItemProps) {
  return (
    <li
      key={run.runId}
      className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{run.label}</p>
        <p className="text-xs text-muted-foreground">
          {run.status === "running" ? "Running…" : "Done"}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs"
          onClick={() => {
            setSelectedRunId(run.runId);
            setRunningTerminalsOpen(false);
            openLogModal(run.runId);
          }}
        >
          View log
        </Button>
        {run.status === "running" && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-destructive"
            onClick={() => stopRun(run.runId)}
          >
            Stop
          </Button>
        )}
      </div>
    </li>
  );
}
