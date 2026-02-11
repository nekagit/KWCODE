import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Terminal } from "lucide-react";
import { type Run } from "@/types/run";

type TerminalStatusBadgeProps = {
  runningRuns: Run[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function TerminalStatusBadge({
  runningRuns,
  onOpenChange,
  open,
}: TerminalStatusBadgeProps) {
  const runningCount = runningRuns.filter((r) => r.status === "running").length;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="fixed top-3 right-3 z-50 flex items-center gap-1.5 rounded-lg border bg-background/95 px-2.5 py-1.5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60 hover:bg-muted/50 transition-colors glasgmorphism"
        >
          <Terminal className="h-4 w-4 text-muted-foreground" />
          <Badge variant="secondary" className="tabular-nums font-medium">
            {runningCount} running
          </Badge>
        </button>
      </PopoverTrigger>
    </Popover>
  );
}
