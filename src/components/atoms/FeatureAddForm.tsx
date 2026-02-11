import React, { useState } from 'react';
import { Button } from "@/components/shadcn/button";
import { Plus } from "lucide-react";
import { FeatureInput } from "@/components/atoms/FeatureInput";
import { TicketCheckboxGroup } from "@/components/atoms/TicketCheckboxGroup";
import { PromptCheckboxGroup } from "@/components/atoms/PromptCheckboxGroup";
import { ProjectCheckboxGroup } from "@/components/atoms/ProjectCheckboxGroup";
import type { Feature, Ticket } from "@/components/organisms/HomePageContent";

interface FeatureAddFormProps {
  tickets: Ticket[];
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
    <div className="px-4 pb-4 pt-1 grid gap-2">
      <FeatureInput
        label="Title"
        value={featureForm.title}
        onChange={(title) => setFeatureForm((f) => ({ ...f, title }))}
        placeholder="e.g. Calendar event adding"
      />
      <TicketCheckboxGroup
        tickets={tickets}
        selectedTicketIds={featureForm.ticket_ids}
        onSelectionChange={(ids) => setFeatureForm((f) => ({ ...f, ticket_ids: ids }))}
      />
      <PromptCheckboxGroup
        prompts={prompts}
        selectedPromptIds={featureForm.prompt_ids}
        onSelectionChange={(ids) => setFeatureForm((f) => ({ ...f, prompt_ids: ids }))}
      />
      <ProjectCheckboxGroup
        allProjects={allProjects}
        selectedProjectPaths={featureForm.project_paths}
        onSelectionChange={(paths) => setFeatureForm((f) => ({ ...f, project_paths: paths }))}
      />
      <Button onClick={handleAddFeature}>
        <Plus className="h-4 w-4 mr-2" />
        Add feature
      </Button>
    </div>
  );
};
