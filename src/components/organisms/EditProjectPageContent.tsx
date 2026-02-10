"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Project } from "@/types/project";
import { getProject } from "@/lib/api-projects";
import { isTauri } from "@/lib/tauri";
import { ProjectForm } from "@/components/molecules/ProjectForm";
import { ProjectLoadingState } from "@/components/molecules/ProjectLoadingState";
import { EditProjectHeader } from "@/components/molecules/EditProjectHeader";
import { ProjectNotFoundState } from "@/components/molecules/ProjectNotFoundState";

type PromptItem = { id: number; title: string };
type TicketItem = { id: string; title: string; status?: string };
type FeatureItem = { id: string; title: string };
type IdeaItem = { id: number; title: string; category?: string };

export function EditProjectPageContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const [project, setProject] = useState<Project | null>(null);

  const [prompts, setPrompts] = useState<PromptItem[]>([]);
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
    const projectPromise = isTauri()
      ? getProject(id)
      : fetch(`/api/data/projects/${id}`).then((res) => {
          if (!res.ok) throw new Error("Project not found");
          return res.json();
        });
    const restPromise = isTauri()
      ? Promise.resolve([[], { tickets: [], features: [], prompts: [] }, [], [], []])
      : Promise.all([
          fetch("/api/data/prompts").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/data").then((r) => (r.ok ? r.json() : { tickets: [], features: [], prompts: [] })),
          fetch("/api/data/ideas").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/data/designs").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/data/architectures").then((r) => (r.ok ? r.json() : [])),
        ]);
    Promise.all([projectPromise, restPromise])
      .then(([proj, rest]) => {
        if (cancelled) return;
        const p = proj as Project & { designIds?: string[]; architectureIds?: string[] };
        setProject(p);

        if (isTauri()) {
          const [promptsList, data, ideasList, designsList, architecturesList] = rest as [unknown[], { tickets: TicketItem[]; features: FeatureItem[] }, IdeaItem[], { id: string; name: string }[], { id: string; name: string }[]];
          setPrompts(Array.isArray(promptsList) ? (promptsList as { id: number; title: string }[]).map((x) => ({ id: Number(x.id), title: x.title ?? "" })) : []);
          setTickets(Array.isArray(data?.tickets) ? data.tickets : []);
          setFeatures(Array.isArray(data?.features) ? data.features : []);
          setIdeas(Array.isArray(ideasList) ? ideasList : []);
          setDesigns(Array.isArray(designsList) ? designsList.map((x) => ({ id: x.id, name: x.name ?? "" })) : []);
          setArchitectures(Array.isArray(architecturesList) ? architecturesList.map((x) => ({ id: x.id, name: x.name ?? "" })) : []);
        } else {
          const [promptsList, data, ideasList, designsList, architecturesList] = rest as [unknown[], { tickets: TicketItem[]; features: FeatureItem[] }, IdeaItem[], { id: string; name: string }[], { id: string; name: string }[]];
          setPrompts(Array.isArray(promptsList) ? (promptsList as { id: number; title: string }[]).map((x) => ({ id: Number(x.id), title: x.title ?? "" })) : []);
          setTickets(Array.isArray(data?.tickets) ? data.tickets : []);
          setFeatures(Array.isArray(data?.features) ? data.features : []);
          setIdeas(Array.isArray(ideasList) ? ideasList : []);
          setDesigns(Array.isArray(designsList) ? designsList.map((x) => ({ id: x.id, name: x.name ?? "" })) : []);
          setArchitectures(Array.isArray(architecturesList) ? architecturesList.map((x) => ({ id: x.id, name: x.name ?? "" })) : []);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
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
