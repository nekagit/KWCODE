"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClipboardCopy } from "lucide-react";
import { Dialog } from "@/components/shared/Dialog";
import { ButtonGroup } from "@/components/shared/ButtonGroup";

interface ExportContentDialogProps {
  showExportDialog: boolean;
  setShowExportDialog: (show: boolean) => void;
  exportContent: string;
}

export function ExportContentDialog({
  showExportDialog,
  setShowExportDialog,
  exportContent,
}: ExportContentDialogProps) {
  return (
    <Dialog
      title="Export Content"
      onClose={() => setShowExportDialog(false)}
      isOpen={showExportDialog}
      actions={
        <ButtonGroup alignment="right">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigator.clipboard.writeText(exportContent)}
          >
            <ClipboardCopy className="h-4 w-4 mr-2" />
            Copy to clipboard
          </Button>
          <Button type="button" onClick={() => setShowExportDialog(false)}>Close</Button>
        </ButtonGroup>
      }
    >
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Copy the generated markdown content below.</p>
      <ScrollArea className="h-[400px] rounded-md border bg-muted/30 p-4 font-mono text-sm">
        <pre className="whitespace-pre-wrap break-all">{exportContent}</pre>
      </ScrollArea>
    </Dialog>
  );
}
