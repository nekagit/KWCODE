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

interface PromptFormDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  description: string;
  formTitle: string;
  setFormTitle: (title: string) => void;
  formContent: string;
  setFormContent: (content: string) => void;
  handleSave: () => Promise<void>;
  saveLoading: boolean;
}

export function PromptFormDialog({
  open,
  setOpen,
  title,
  description,
  formTitle,
  setFormTitle,
  formContent,
  setFormContent,
  handleSave,
  saveLoading,
}: PromptFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="prompt-title">Title</Label>
            <Input
              id="prompt-title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Run 3000"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="prompt-content">Content</Label>
            <Textarea
              id="prompt-content"
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="Instructions for the AI..."
              rows={12}
              className="min-h-[200px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formTitle.trim() || saveLoading}>
            {saveLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
