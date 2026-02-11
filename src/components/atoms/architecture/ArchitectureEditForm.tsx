import React, { useCallback } from 'react';
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
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { ArchitectureCategory } from "@/types/architecture";

interface ExtraInput {
  key: string;
  value: string;
}

interface ArchitectureEditFormProps {
  formName: string;
  setFormName: (name: string) => void;
  formCategory: ArchitectureCategory;
  setFormCategory: (category: ArchitectureCategory) => void;
  formDescription: string;
  setFormDescription: (description: string) => void;
  formPractices: string;
  setFormPractices: (practices: string) => void;
  formScenarios: string;
  setFormScenarios: (scenarios: string) => void;
  formReferences: string;
  setFormReferences: (references: string) => void;
  formAntiPatterns: string;
  setFormAntiPatterns: (antiPatterns: string) => void;
  formExamples: string;
  setFormExamples: (examples: string) => void;
  formExtraInputs: ExtraInput[];
  setFormExtraInputs: (inputs: ExtraInput[]) => void;
  ALL_CATEGORIES: ArchitectureCategory[];
  CATEGORY_LABELS: Record<ArchitectureCategory, string>;
}

export const ArchitectureEditForm: React.FC<ArchitectureEditFormProps> = ({
  formName,
  setFormName,
  formCategory,
  setFormCategory,
  formDescription,
  setFormDescription,
  formPractices,
  setFormPractices,
  formScenarios,
  setFormScenarios,
  formReferences,
  setFormReferences,
  formAntiPatterns,
  setFormAntiPatterns,
  formExamples,
  setFormExamples,
  formExtraInputs,
  setFormExtraInputs,
  ALL_CATEGORIES,
  CATEGORY_LABELS,
}) => {
  const addExtraInput = useCallback(() => {
    setFormExtraInputs((prev) => [...prev, { key: "", value: "" }]);
  }, [setFormExtraInputs]);

  const updateExtraInput = useCallback(
    (index: number, field: "key" | "value", val: string) => {
      setFormExtraInputs((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: val };
        return next;
      });
    },
    [setFormExtraInputs]
  );

  const removeExtraInput = useCallback(
    (index: number) => {
      setFormExtraInputs((prev) => prev.filter((_, i) => i !== index));
    },
    [setFormExtraInputs]
  );

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="edit-name">Name</Label>
        <Input
          id="edit-name"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          placeholder="e.g. Domain-Driven Design"
        />
      </div>
      <div className="grid gap-2">
        <Label>Category</Label>
        <Select value={formCategory} onValueChange={(v) => setFormCategory(v as ArchitectureCategory)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALL_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-desc">Description</Label>
        <Textarea
          id="edit-desc"
          value={formDescription}
          onChange={(e) => setFormDescription(e.target.value)}
          placeholder="Short overview"
          rows={2}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-practices">Best practices / principles</Label>
        <Textarea
          id="edit-practices"
          value={formPractices}
          onChange={(e) => setFormPractices(e.target.value)}
          placeholder="Bullet points or markdown"
          rows={4}
          className="font-mono text-sm"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-scenarios">When to use / scenarios</Label>
        <Textarea
          id="edit-scenarios"
          value={formScenarios}
          onChange={(e) => setFormScenarios(e.target.value)}
          placeholder="When to apply, scenarios, anti-patterns..."
          rows={4}
          className="font-mono text-sm"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-references">References</Label>
        <Textarea
          id="edit-references"
          value={formReferences}
          onChange={(e) => setFormReferences(e.target.value)}
          placeholder="Links, books, docs..."
          rows={2}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-anti">Anti-patterns</Label>
        <Textarea
          id="edit-anti"
          value={formAntiPatterns}
          onChange={(e) => setFormAntiPatterns(e.target.value)}
          placeholder="What to avoid..."
          rows={2}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-examples">Examples</Label>
        <Textarea
          id="edit-examples"
          value={formExamples}
          onChange={(e) => setFormExamples(e.target.value)}
          placeholder="Code snippets, diagrams, examples..."
          rows={3}
          className="font-mono text-sm"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Additional inputs</Label>
          <Button type="button" variant="outline" size="sm" onClick={addExtraInput}>
            <Plus className="h-4 w-4 mr-1" />
            Add input
          </Button>
        </div>
        {formExtraInputs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Add custom label-value pairs (e.g. Tools, Checklist).</p>
        ) : (
          <ul className="space-y-2">
            {formExtraInputs.map((row, index) => (
              <li key={index} className="flex gap-2 items-center">
                <Input
                  placeholder="Label"
                  value={row.key}
                  onChange={(e) => updateExtraInput(index, "key", e.target.value)}
                  className="flex-1 min-w-0"
                />
                <Input
                  placeholder="Value"
                  value={row.value}
                  onChange={(e) => updateExtraInput(index, "value", e.target.value)}
                  className="flex-1 min-w-0"
                />
                <Button type="button" variant="ghost" size="sm" className="shrink-0 text-destructive" onClick={() => removeExtraInput(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
