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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface IdeaCategoryLabels {
  saas: string;
  iaas: string;
  paas: string;
  website: string;
  webapp: string;
  webshop: string;
  other: string;
}

interface IdeaFormDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  description: string;
  formTitle: string;
  setFormTitle: (title: string) => void;
  formDescription: string;
  setFormDescription: (description: string) => void;
  formCategory: keyof IdeaCategoryLabels;
  setFormCategory: (category: keyof IdeaCategoryLabels) => void;
  handleSave: () => Promise<void>;
  saveLoading: boolean;
  CATEGORY_LABELS: IdeaCategoryLabels;
}

export function IdeaFormDialog({
  open,
  setOpen,
  title,
  description,
  formTitle,
  setFormTitle,
  formDescription,
  setFormDescription,
  formCategory,
  setFormCategory,
  handleSave,
  saveLoading,
  CATEGORY_LABELS,
}: IdeaFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="idea-title">Title</Label>
            <Input
              id="idea-title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. API usage dashboard"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="idea-desc">Description</Label>
            <Textarea
              id="idea-desc"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Short description and who it's for"
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={formCategory} onValueChange={(v) => setFormCategory(v as keyof IdeaCategoryLabels)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(CATEGORY_LABELS) as Array<keyof IdeaCategoryLabels>).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saveLoading || !formTitle.trim()}>
            {saveLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
