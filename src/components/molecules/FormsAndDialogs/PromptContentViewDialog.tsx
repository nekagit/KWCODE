"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export type PromptForView = {
  id: number;
  title: string;
  content: string;
};

interface PromptContentViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: PromptForView | null;
}

export function PromptContentViewDialog({
  open,
  onOpenChange,
  prompt,
}: PromptContentViewDialogProps) {
  const [copied, setCopied] = useState(false);

  const copyContent = useCallback(() => {
    if (!prompt?.content) return;
    navigator.clipboard.writeText(prompt.content).then(() => {
      setCopied(true);
      toast.success("Prompt copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    });
  }, [prompt?.content]);

  if (!prompt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="pr-8">{prompt.title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-auto rounded-md border bg-muted/30 p-4">
          <pre className="whitespace-pre-wrap text-sm font-sans text-foreground">
            {prompt.content || "(No content)"}
          </pre>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={copyContent}>
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="ml-2">{copied ? "Copied" : "Copy prompt"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
