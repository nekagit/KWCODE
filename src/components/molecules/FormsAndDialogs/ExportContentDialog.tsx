"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClipboardCopy } from "lucide-react";

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
    <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Export Content</DialogTitle>
          <DialogDescription>Copy the generated markdown content below.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] rounded-md border bg-muted/30 p-4 font-mono text-sm">
          <pre className="whitespace-pre-wrap break-all">{exportContent}</pre>
        </ScrollArea>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigator.clipboard.writeText(exportContent)}
          >
            <ClipboardCopy className="h-4 w-4 mr-2" />
            Copy to clipboard
          </Button>
          <Button type="button" onClick={() => setShowExportDialog(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
