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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface GeneratePromptDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  generateDescription: string;
  setGenerateDescription: (description: string) => void;
  handleGenerate: () => Promise<void>;
  generateLoading: boolean;
  generateResult: { title: string; content: string } | null;
  setGenerateResult: (result: { title: string; content: string } | null) => void;
  useGeneratedAndCreate: () => void;
  saveGeneratedAsNew: () => Promise<void>;
  saveLoading: boolean;
}

export function GeneratePromptDialog({
  open,
  setOpen,
  generateDescription,
  setGenerateDescription,
  handleGenerate,
  generateLoading,
  generateResult,
  setGenerateResult,
  useGeneratedAndCreate,
  saveGeneratedAsNew,
  saveLoading,
}: GeneratePromptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate prompt with AI</DialogTitle>
          <DialogDescription>
            Describe what you want the prompt to do. We&apos;ll generate a title and full prompt
            text you can edit and save.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          {!generateResult ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="generate-desc">Description</Label>
                <Textarea
                  id="generate-desc"
                  value={generateDescription}
                  onChange={(e) => setGenerateDescription(e.target.value)}
                  placeholder="e.g. A prompt that refactors React components to use TypeScript and strict typing"
                  rows={4}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={!generateDescription.trim() || generateLoading}
                >
                  {generateLoading ? "Generating..." : "Generate"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="grid gap-2">
                <Label>Generated title</Label>
                <Input
                  value={generateResult.title}
                  onChange={(e) =>
                    setGenerateResult((r) => (r ? { ...r, title: e.target.value } : null))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Generated content</Label>
                <Textarea
                  value={generateResult.content}
                  onChange={(e) =>
                    setGenerateResult((r) => (r ? { ...r, content: e.target.value } : null))
                  }
                  rows={10}
                  className="min-h-[200px]"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setGenerateResult(null)}>
                  Back
                </Button>
                <Button variant="outline" onClick={useGeneratedAndCreate}>
                  Edit & create
                </Button>
                <Button
                  onClick={saveGeneratedAsNew}
                  disabled={!generateResult.title.trim() || saveLoading}
                >
                  {saveLoading ? "Saving..." : "Save as new prompt"}
                </Button>
              </DialogFooter>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
