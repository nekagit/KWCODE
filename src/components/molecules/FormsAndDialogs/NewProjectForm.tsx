"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createProject } from "@/lib/api-projects";
import { showOpenDirectoryDialog } from "@/lib/electron";
import { Card } from "@/components/shared/Card";
import { Form } from "@/components/shared/Form";
import { ProjectInput } from "@/components/atoms/inputs/ProjectInput";
import { ProjectTextarea } from "@/components/atoms/inputs/ProjectTextarea";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";
import { ButtonGroup } from "@/components/shared/ButtonGroup";

export function NewProjectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [repoPath, setRepoPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const repoPathFromQuery = searchParams.get("repoPath");
    if (repoPathFromQuery) {
      setRepoPath(decodeURIComponent(repoPathFromQuery));
      if (!name) {
        const segment = repoPathFromQuery.split("/").filter(Boolean).pop() ?? "";
        if (segment) setName(decodeURIComponent(segment));
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const project = await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        repoPath: repoPath.trim() || undefined,
        promptIds: [],
        ticketIds: [],
        featureIds: [],
        ideaIds: [],
      });
      router.push(`/projects/${project.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleBrowseRepoPath = async () => {
    const selectedPath = await showOpenDirectoryDialog();
    if (selectedPath) {
      setRepoPath(selectedPath);
    }
  };

  return (
    <Card
      title="Project"
      subtitle="Name and optional description and repo path."
    >
      <Form onSubmit={handleSubmit}>
        <ProjectInput
          id="name"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. My SaaS app"
          required
        />
        <ProjectTextarea
          id="description"
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="Short description of the project"
        />
        <ProjectInput
          id="repoPath"
          label="Repo path (optional)"
          value={repoPath}
          onChange={(e) => setRepoPath(e.target.value)}
          placeholder="/path/to/repo"
          className="font-mono text-sm"
          onBrowse={handleBrowseRepoPath}
        />
        {error && (
          <ErrorDisplay message={error} />
        )}
        <ButtonGroup alignment="left">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating…
              </>
            ) : (
              "Create project"
            )}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/projects">Cancel</Link>
          </Button>
        </ButtonGroup>
      </Form>
    </Card>
  );
}
