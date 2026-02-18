"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { KEYBOARD_SHORTCUT_GROUPS } from "@/data/keyboard-shortcuts";
import {
  formatKeyboardShortcutsAsPlainText,
  downloadKeyboardShortcutsAsMarkdown,
} from "@/lib/export-keyboard-shortcuts";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { Keyboard, Copy, Download } from "lucide-react";

interface ShortcutsHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShortcutsHelpDialog({ open, onOpenChange }: ShortcutsHelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xl max-h-[85vh] overflow-hidden flex flex-col"
        aria-describedby="shortcuts-help-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" aria-hidden />
            Keyboard shortcuts
          </DialogTitle>
        </DialogHeader>
        <div id="shortcuts-help-description" className="sr-only">
          List of keyboard shortcuts available in the app.
        </div>
        <div className="overflow-auto flex-1 min-h-0 -mx-1 px-1">
          {KEYBOARD_SHORTCUT_GROUPS.map((group) => (
            <div key={group.title} className="mb-6 last:mb-0">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                {group.title}
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Keys</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.shortcuts.map((entry, i) => (
                    <TableRow key={`${group.title}-${i}`}>
                      <TableCell className="font-mono text-sm">
                        {entry.keys}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {entry.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
        <DialogFooter className="flex-shrink-0 gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              copyTextToClipboard(formatKeyboardShortcutsAsPlainText())
            }
            className="gap-2"
          >
            <Copy className="h-4 w-4" aria-hidden />
            Copy list
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => downloadKeyboardShortcutsAsMarkdown()}
            className="gap-2"
          >
            <Download className="h-4 w-4" aria-hidden />
            Download as Markdown
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
