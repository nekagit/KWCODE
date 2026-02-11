"use client";

import { useState, useCallback, useMemo } from "react";
import { Card } from "@/components/shared/Card";
import { Accordion } from "@/components/shared/Accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Layers, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/types/project";
import { Feature, Ticket } from "@/components/organisms/HomePageContent";
import { TitleWithIcon } from "@/components/atoms/TitleWithIcon";
import { FeatureAddForm } from "@/components/atoms/FeatureAddForm";
import { FeatureFilterSelect } from "@/components/atoms/FeatureFilterSelect";
import { FeatureQueueActions } from "@/components/atoms/FeatureQueueActions";
import { EmptyState } from "@/components/shared/EmptyState";
import { FeatureListItem } from "@/components/atoms/FeatureListItem";

interface FeatureManagementCardProps {
  features: Feature[];
  tickets: Ticket[];
  prompts: { id: number; title: string }[];
  allProjects: string[];
  activeProjects: string[];
  runningRuns: any[];
  featureQueue: any[];
  setError: (error: string | null) => void;
  addFeatureToQueue: (feature: any) => void;
  removeFeatureFromQueue: (id: string) => void;
  clearFeatureQueue: () => void;
  runFeatureQueue: (projects: string[]) => void;
  runForFeature: (feature: Feature) => Promise<void>;
  saveFeatures: (features: Feature[]) => Promise<void>;
}

export function FeatureManagementCard({
  features,
  tickets,
  prompts,
  allProjects,
  activeProjects,
  runningRuns,
  featureQueue,
  setError,
  addFeatureToQueue,
  removeFeatureFromQueue,
  clearFeatureQueue,
  runFeatureQueue,
  runForFeature,
  saveFeatures,
}: FeatureManagementCardProps) {
  const [featureProjectFilter, setFeatureProjectFilter] = useState<string>("");

  const projectsList = allProjects.map(path => ({ id: path, name: path.split('/').pop() || path }));

  const filteredFeatures = useMemo(() => {
    if (!featureProjectFilter) return features;
    const project = projectsList.find((p) => p.id === featureProjectFilter);
    // Assuming Project type has featureIds, which is not currently in the Project type from @/types/project
    // For now, we'll filter based on project_paths in the feature itself.
    return features.filter((f) => f.project_paths.includes(featureProjectFilter));
  }, [features, featureProjectFilter, projectsList]);

  const running = runningRuns.some((r) => r.status === "running");

  const handleAddFeature = async (newFeatureData: Omit<Feature, 'id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const newFeature: Feature = {
      id: crypto.randomUUID(),
      title: newFeatureData.title,
      ticket_ids: newFeatureData.ticket_ids,
      prompt_ids: newFeatureData.prompt_ids,
      project_paths: newFeatureData.project_paths,
      created_at: now,
      updated_at: now,
    };
    await saveFeatures([...features, newFeature]);
    toast.success("Feature added successfully");
  };

  const deleteFeature = async (featureId: string) => {
    await saveFeatures(features.filter(f => f.id !== featureId));
    removeFeatureFromQueue(featureId);
    toast.success("Feature deleted");
  };

  const deleteAllFeatures = async () => {
    if (features.length === 0) return;
    await saveFeatures([]);
    clearFeatureQueue();
    toast.success("All features deleted");
  };

  return (
    <Card
      title={
        <TitleWithIcon
          icon={Layers}
          title={
            `Feature ${features.length > 0 && (featureProjectFilter ? `(${filteredFeatures.length} of ${features.length})` : `(${features.length})`)}`
          }
          className="text-lg"
        />
      }
      subtitle="Combine tickets with prompts and projects; run automation or use in run. Filter by project below. Scroll to see all."
    >
      <Accordion
        items={[
          {
            title: "Add feature",
            content: (
              <FeatureAddForm
                tickets={tickets}
                prompts={prompts}
                allProjects={allProjects}
                onAddFeature={handleAddFeature}
                onError={setError}
              />
            ),
          },
        ]}
      />
      <div className="flex items-center gap-2 flex-wrap mt-4">
        <FeatureFilterSelect
          projectsList={projectsList}
          featureProjectFilter={featureProjectFilter}
          onFilterChange={setFeatureProjectFilter}
        />
        {features.length > 0 && (
          <Button type="button" variant="destructive" size="sm" onClick={deleteAllFeatures}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete all
          </Button>
        )}
        <FeatureQueueActions
          featureQueueLength={featureQueue.length}
          running={running}
          onRunQueue={() => runFeatureQueue(activeProjects)}
          onClearQueue={clearFeatureQueue}
        />
      </div>
      <ScrollArea className="min-h-[280px] h-[60vh] rounded-md border p-3 mt-4">
        <div className="space-y-2">
          {filteredFeatures.length === 0 ? (
            <EmptyState
              message={featureProjectFilter ? "No features in this project" : "No features yet"}
              icon={Layers}
              action={featureProjectFilter ? undefined : "Add a feature above (tickets + prompts + projects)."}
            />
          ) : (
            filteredFeatures.map((f) => (
              <FeatureListItem
                key={f.id}
                feature={f}
                tickets={tickets}
                inQueue={featureQueue.some((q) => q.id === f.id)}
                running={runningRuns.some((r) => r.label === f.title && r.status === "running")}
                onAddFeatureToQueue={addFeatureToQueue}
                onRemoveFeatureFromQueue={removeFeatureFromQueue}
                onRunForFeature={runForFeature}
                onDeleteFeature={deleteFeature}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
