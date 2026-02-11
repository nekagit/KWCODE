import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CheckboxGroup } from "@/components/shared/CheckboxGroup";
import { GenericInputWithLabel } from "@/components/shared/GenericInputWithLabel";
import type { Feature } from "@/types/project";
import type { TicketRow } from "@/types/ticket";

interface FeatureAddFormProps {
  tickets: TicketRow[];
  prompts: { id: number; title: string }[];
  allProjects: string[];
  onAddFeature: (feature: Omit<Feature, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onError: (error: string | null) => void;
}

export const FeatureAddForm: React.FC<FeatureAddFormProps> = ({
  tickets,
  prompts,
  allProjects,
  onAddFeature,
  onError,
}) => {
  const [featureForm, setFeatureForm] = useState<{
    title: string;
    ticket_ids: string[];
    prompt_ids: number[];
    project_paths: string[];
  }>({
    title: "",
    ticket_ids: [],
    prompt_ids: [],
    project_paths: [],
  });

  const handleAddFeature = async () => {
    if (!featureForm.title.trim()) {
      onError("Feature title is required");
      return;
    }
    if (featureForm.ticket_ids.length === 0) {
      onError("A feature is a milestone and must have at least one ticket");
      return;
    }
    if (featureForm.prompt_ids.length === 0) {
      onError("Select at least one prompt for the feature");
      return;
    }
    onError(null);
    await onAddFeature(featureForm);
    setFeatureForm({ title: "", ticket_ids: [], prompt_ids: [], project_paths: [] });
  };

  return (
    <div className="px-4 pb-4 pt-3 grid gap-5">
      <GenericInputWithLabel
        id="feature-title"
        label="Title"
        value={featureForm.title}
        onChange={(e) => setFeatureForm((f) => ({ ...f, title: e.target.value }))}
        placeholder="e.g. Calendar event adding"
      />
      <CheckboxGroup
        label="Tickets (required, at least one)"
        items={tickets.map(t => ({id: t.id, name: t.title}))}
        selectedItems={featureForm.ticket_ids}
        onToggleItem={(id) => setFeatureForm((f) => ({
          ...f,
          ticket_ids: f.ticket_ids.includes(id as string)
            ? f.ticket_ids.filter((tid) => tid !== id)
            : [...f.ticket_ids, id as string],
        }))}
      />
      <CheckboxGroup
        label="PromptRecords (required)"
        items={prompts.map(p => ({id: p.id, name: `${p.id}: ${p.title}`}))}
        selectedItems={featureForm.prompt_ids}
        onToggleItem={(id) => setFeatureForm((f) => ({
          ...f,
          prompt_ids: f.prompt_ids.includes(id as number)
            ? f.prompt_ids.filter((pid) => pid !== id)
            : [...f.prompt_ids, id as number],
        }))}
      />
      <CheckboxGroup
        label="Projects"
        items={allProjects.map(p => ({id: p, name: p.split("/").pop() ?? p}))}
        selectedItems={featureForm.project_paths}
        onToggleItem={(id) => setFeatureForm((f) => ({
          ...f,
          project_paths: f.project_paths.includes(id as string)
            ? f.project_paths.filter((pp) => pp !== id)
            : [...f.project_paths, id as string],
        }))}
      />
      <Button onClick={handleAddFeature}>
        <Plus className="h-4 w-4 mr-2" />
        Add feature
      </Button>
    </div>
  );
};
