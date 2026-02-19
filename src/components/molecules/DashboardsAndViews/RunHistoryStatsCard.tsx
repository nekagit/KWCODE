"use client";

/** Run History Stats Card component. */
import type { TerminalOutputHistoryEntry } from "@/types/run";
import { computeRunHistoryStats, formatRunHistoryStatsSummary } from "@/lib/run-history-stats";
import { copyRunHistoryStatsSummaryToClipboard } from "@/lib/copy-run-history-stats-summary";
import { downloadRunHistoryStatsAsJson, copyRunHistoryStatsAsJsonToClipboard } from "@/lib/download-run-history-stats-json";
import { downloadRunHistoryStatsAsCsv, copyRunHistoryStatsAsCsvToClipboard } from "@/lib/download-run-history-stats-csv";
import { downloadAllRunHistoryCsv, copyAllRunHistoryCsvToClipboard } from "@/lib/download-all-run-history-csv";
import { setRunHistoryPreferences, DEFAULT_RUN_HISTORY_PREFERENCES, RUN_HISTORY_PREFERENCES_RESTORED_EVENT } from "@/lib/run-history-preferences";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Copy, FileJson, FileSpreadsheet, RotateCcw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export interface RunHistoryStatsCardProps {
  entries: TerminalOutputHistoryEntry[];
}

/**
 * Dashboard card showing run history aggregate stats (total runs, passed, failed, total duration)
 * and a "Copy summary" button. Uses the same stats and copy logic as the Run tab and command palette.
 */
export function RunHistoryStatsCard({ entries }: RunHistoryStatsCardProps) {
  const stats = computeRunHistoryStats(entries);
  const summary = formatRunHistoryStatsSummary(stats);
  const isEmpty = entries.length === 0;

  const handleCopy = () => {
    copyRunHistoryStatsSummaryToClipboard(entries);
  };

  const handleRestoreDefaults = () => {
    setRunHistoryPreferences(DEFAULT_RUN_HISTORY_PREFERENCES);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(RUN_HISTORY_PREFERENCES_RESTORED_EVENT));
    }
    toast.success("Run history filters restored to defaults.");
  };

  return (
    <Card className="border-border/80 bg-card">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <Activity className="h-4 w-4 text-primary" aria-hidden />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Run history</h3>
              <p className="text-xs text-muted-foreground">
                Recent terminal run stats
              </p>
            </div>
          </div>
          <Link
            href="/run"
            className="text-xs font-medium text-primary hover:underline"
          >
            View Run
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-foreground tabular-nums mb-3">
          {isEmpty ? "No runs" : summary}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestoreDefaults}
            aria-label="Restore run history filters to defaults"
            title="Restore default sort and filter preferences for run history"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" aria-hidden />
            Restore defaults
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isEmpty}
            onClick={handleCopy}
            aria-label="Copy run history stats summary to clipboard"
            title={isEmpty ? "No run history to copy" : "Copy summary to clipboard"}
          >
            <Copy className="h-3.5 w-3.5 mr-1.5" aria-hidden />
            Copy summary
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isEmpty}
            onClick={() => downloadRunHistoryStatsAsJson(entries)}
            aria-label="Download run history stats as JSON"
            title={isEmpty ? "No run history to export" : "Download stats as JSON"}
          >
            <FileJson className="h-3.5 w-3.5 mr-1.5" aria-hidden />
            Download stats as JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isEmpty}
            onClick={() => void copyRunHistoryStatsAsJsonToClipboard(entries)}
            aria-label="Copy run history stats as JSON to clipboard"
            title={isEmpty ? "No run history to copy" : "Copy stats as JSON"}
          >
            <FileJson className="h-3.5 w-3.5 mr-1.5" aria-hidden />
            Copy stats as JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isEmpty}
            onClick={() => downloadRunHistoryStatsAsCsv(entries)}
            aria-label="Download run history stats as CSV"
            title={isEmpty ? "No run history to export" : "Download stats as CSV"}
          >
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" aria-hidden />
            Download stats as CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isEmpty}
            onClick={() => void copyRunHistoryStatsAsCsvToClipboard(entries)}
            aria-label="Copy run history stats as CSV to clipboard"
            title={isEmpty ? "No run history to copy" : "Copy stats as CSV"}
          >
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" aria-hidden />
            Copy stats as CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isEmpty}
            onClick={() => downloadAllRunHistoryCsv(entries)}
            aria-label="Download run history as CSV"
            title={isEmpty ? "No run history to export" : "Download run history as CSV"}
          >
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" aria-hidden />
            Download as CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isEmpty}
            onClick={() => void copyAllRunHistoryCsvToClipboard(entries)}
            aria-label="Copy run history as CSV to clipboard"
            title={isEmpty ? "No run history to copy" : "Copy run history as CSV"}
          >
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" aria-hidden />
            Copy as CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
