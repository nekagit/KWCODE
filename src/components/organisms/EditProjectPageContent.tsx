"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Project } from "@/types/project";
import { getProjectResolved } from "@/lib/api-projects";
import { isTauri } from "@/lib/tauri";
import { ProjectForm } from "@/components/molecules/FormsAndDialogs/ProjectForm";
import { ProjectLoadingState } from "@/components/molecules/UtilitiesAndHelpers/ProjectLoadingState";
import { EditProjectHeader } from "@/components/molecules/UtilitiesAndHelpers/EditProjectHeader";
import { ProjectNotFoundState } from "@/components/molecules/UtilitiesAndHelpers/ProjectNotFoundState";
import type { ResolvedProject } from "@/lib/api-projects";

type PromptRecordItem = { id: number; title: string };
type TicketItem = { id: string; title: string; status?: string };
type FeatureItem = { id: string; title: string };
type IdeaItem = { id: number; title: string; category?: string };

export function EditProjectPageContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const [project, setProject] = useState<Project | null>(null);

  const [prompts, setPromptRecords] = useState<PromptRecordItem[]>([]);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [designs, setDesigns] = useState<{ id: string; name: string }[]>([]);
  const [architectures, setArchitectures] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchProjectData = async () => {
      try {
        let fetchedProject: ResolvedProject;
        if (isTauri()) {
          const { invoke } = await import("@tauri-apps/api/tauri");
          fetchedProject = await invoke<ResolvedProject>("get_project_resolved", { id });
        } else {
          const res = await fetch(`/api/data/projects/${id}?resolve=1`);
          if (!res.ok) throw new Error("Project not found");
          fetchedProject = await res.json();
        }

        if (cancelled) return;
        setProject(fetchedProject);
        setPromptRecords(Array.isArray(fetchedProject.prompts) ? (fetchedProject.prompts as PromptRecordItem[]) : []);
        setTickets(Array.isArray(fetchedProject.tickets) ? (fetchedProject.tickets as TicketItem[]) : []);
        setFeatures(Array.isArray(fetchedProject.features) ? (fetchedProject.features as FeatureItem[]) : []);
        setIdeas(Array.isArray(fetchedProject.ideas) ? (fetchedProject.ideas as IdeaItem[]) : []);
        setDesigns(Array.isArray(fetchedProject.designs) ? (fetchedProject.designs as { id: string; name: string }[]) : []);
        setArchitectures(Array.isArray(fetchedProject.architectures) ? (fetchedProject.architectures as { id: string; name: string }[]) : []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProjectData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!id) {
    return (
      <ProjectNotFoundState message="Missing project id." />
    );
  }

  if (loading) {
    return (
      <ProjectLoadingState />
    );
  }

  if (!project) {
    return (
      <ProjectNotFoundState message={error || "Project not found."} />
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <EditProjectHeader projectId={id} />

      <ProjectForm
        project={project}
        prompts={prompts}
        tickets={tickets}
        features={features}
        ideas={ideas}
        designs={designs}
        architectures={architectures}
      />
    </div>
  );
}
