"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Project } from "@/types/project";
import { updateProject } from "@/lib/api-projects";
import { useRouter } from "next/navigation";
import { Card } from "@/components/shared/Card";
import { Form } from "@/components/shared/Form";
import { ProjectInput } from "@/components/atoms/inputs/ProjectInput";
import { ProjectTextarea } from "@/components/atoms/inputs/ProjectTextarea";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { ProjectCheckboxGroup } from "@/components/atoms/checkbox-groups/ProjectCheckboxGroup";

type PromptRecordItem = { id: number; title: string };
type TicketItem = { id: string; title: string; status?: string };
type FeatureItem = { id: string; title: string };
type IdeaItem = { id: number; title: string; category?: string };

interface ProjectFormProps {
  project: Project;
  prompts: PromptRecordItem[];
  tickets: TicketItem[];
  features: FeatureItem[];
  ideas: IdeaItem[];
  designs: { id: string; name: string }[];
  architectures: { id: string; name: string }[];
}

export function ProjectForm({
  project,
  prompts,
  tickets,
  features,
  ideas,
  designs,
  architectures,
}: ProjectFormProps) {
  const router = useRouter();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [repoPath, setRepoPath] = useState(project.repoPath ?? "");
  const [promptIds, setPromptRecordIds] = useState<number[]>(project.promptIds ?? []);
  const [ticketIds, setTicketIds] = useState<string[]>(project.ticketIds ?? []);
  const [featureIds, setFeatureIds] = useState<string[]>(project.featureIds ?? []);
  const [ideaIds, setIdeaIds] = useState<number[]>(project.ideaIds ?? []);
  const [designIds, setDesignIds] = useState<string[]>(project.designIds ?? []);
  const [architectureIds, setArchitectureIds] = useState<string[]>(project.architectureIds ?? []);

  const togglePromptRecord = useCallback((pid: number) => {
    setPromptRecordIds((prev) =>
      prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid]
    );
  }, []);
  const toggleTicket = useCallback((tid: string) => {
    setTicketIds((prev) =>
      prev.includes(tid) ? prev.filter((id) => id !== tid) : [...prev, tid]
    );
  }, []);
  const toggleFeature = useCallback((fid: string) => {
    setFeatureIds((prev) =>
      prev.includes(fid) ? prev.filter((id) => id !== fid) : [...prev, fid]
    );
  }, []);
  const toggleIdea = useCallback((iid: number) => {
    setIdeaIds((prev) =>
      prev.includes(iid) ? prev.filter((id) => id !== iid) : [...prev, iid]
    );
  }, []);
  const toggleDesign = useCallback((did: string) => {
    setDesignIds((prev) =>
      prev.includes(did) ? prev.filter((id) => id !== did) : [...prev, did]
    );
  }, []);
  const toggleArchitecture = useCallback((aid: string) => {
    setArchitectureIds((prev) =>
      prev.includes(aid) ? prev.filter((id) => id !== aid) : [...prev, aid]
    );
  }, []);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project.id || !name.trim()) return;
    setError(null);
    setSaving(true);
    try {
      await updateProject(project.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        repoPath: repoPath.trim() || undefined,
        promptIds,
        ticketIds,
        featureIds,
        ideaIds,
        designIds,
        architectureIds,
      });
      router.push(`/projects/${project.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      title="Project"
      subtitle="Name, description, repo path, and links to prompts, tickets, features, and ideas."
    >
      <Form onSubmit={handleSubmit}>
        <ProjectInput
          id="name"
          label="Name"
          value={name}
          onChange={setName}
          placeholder="e.g. My SaaS app"
          required
        />
        <ProjectTextarea
          id="description"
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="Short description"
        />
        <ProjectInput
          id="repoPath"
          label="Repo path (optional)"
          value={repoPath}
          onChange={setRepoPath}
          placeholder="/path/to/repo"
          className="font-mono text-sm"
        />

        <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t">
          <ProjectCheckboxGroup
            label="PromptRecords"
            items={prompts.map(p => ({id: String(p.id), name: p.title}))}
            selectedItems={promptIds.map(String)}
            onToggleItem={(id) => togglePromptRecord(Number(id))}
          />
          <ProjectCheckboxGroup
            label="Tickets"
            items={tickets.map(t => ({id: t.id, name: t.title}))}
            selectedItems={ticketIds}
            onToggleItem={toggleTicket}
          />
          <ProjectCheckboxGroup
            label="Features"
            items={features.map(f => ({id: f.id, name: f.title}))}
            selectedItems={featureIds}
            onToggleItem={toggleFeature}
          />
          <ProjectCheckboxGroup
            label="Ideas"
            items={ideas.map(i => ({id: String(i.id), name: i.title}))}
            selectedItems={ideaIds.map(String)}
            onToggleItem={(id) => toggleIdea(Number(id))}
          />
          <ProjectCheckboxGroup
            label="Designs"
            items={designs.map(d => ({id: d.id, name: d.name}))}
            selectedItems={designIds}
            onToggleItem={toggleDesign}
          />
          <ProjectCheckboxGroup
            label="Architectures"
            items={architectures}
            selectedItems={architectureIds}
            onToggleItem={toggleArchitecture}
          />
        </div>

        {error && (
          <ErrorDisplay message={error} />
        )}
        <ButtonGroup alignment="left">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={`/projects/${project.id}`}>Cancel</Link>
          </Button>
        </ButtonGroup>
      </Form>
    </Card>
  );
}
