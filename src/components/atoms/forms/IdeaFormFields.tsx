import React from 'react';
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

interface IdeaCategoryLabels {
  saas: string;
  iaas: string;
  paas: string;
  website: string;
  webapp: string;
  webshop: string;
  other: string;
}

interface IdeaFormFieldsProps {
  formTitle: string;
  setFormTitle: (title: string) => void;
  formDescription: string;
  setFormDescription: (description: string) => void;
  formCategory: keyof IdeaCategoryLabels;
  setFormCategory: (category: keyof IdeaCategoryLabels) => void;
  CATEGORY_LABELS: IdeaCategoryLabels;
}

export const IdeaFormFields: React.FC<IdeaFormFieldsProps> = ({
  formTitle,
  setFormTitle,
  formDescription,
  setFormDescription,
  formCategory,
  setFormCategory,
  CATEGORY_LABELS,
}) => {
  return (
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
  );
};
