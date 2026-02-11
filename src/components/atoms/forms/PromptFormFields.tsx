import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PromptFormFieldsProps {
  formTitle: string;
  setFormTitle: (title: string) => void;
  formContent: string;
  setFormContent: (content: string) => void;
}

export const PromptFormFields: React.FC<PromptFormFieldsProps> = ({
  formTitle,
  setFormTitle,
  formContent,
  setFormContent,
}) => {
  return (
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
  );
};
