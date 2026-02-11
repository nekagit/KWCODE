"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/shared/Card";
import { EmptyState, LoadingState } from "@/components/shared/EmptyState";
import { IdeaListItem } from "@/components/atoms/list-items/IdeaListItem";
import { ButtonGroup } from "@/components/shared/ButtonGroup";

interface IdeaCategoryLabels {
  saas: string;
  iaas: string;
  paas: string;
  website: string;
  webapp: string;
  webshop: string;
  other: string;
}

interface IdeaRecord {
  id: number;
  title: string;
  description: string;
  category: keyof IdeaCategoryLabels;
  source: "template" | "ai" | "manual";
  created_at?: string;
  updated_at?: string;
}

interface MyIdeasCardProps {
  myIdeas: IdeaRecord[];
  loading: boolean;
  openCreate: () => void;
  openEdit: (idea: IdeaRecord) => void;
  handleDelete: (ideaId: number) => Promise<void>;
  CATEGORY_LABELS: IdeaCategoryLabels;
}

export function MyIdeasCard({
  myIdeas,
  loading,
  openCreate,
  openEdit,
  handleDelete,
  CATEGORY_LABELS,
}: MyIdeasCardProps) {
  const router = useRouter();
  const [generatingProjectIdeaId, setGeneratingProjectIdeaId] = useState<number | null>(null);

  const handleGenerateProject = async (ideaId: number) => {
    setGeneratingProjectIdeaId(ideaId);
    try {
      const res = await fetch("/api/generate-project-from-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId: ideaId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.detail || res.statusText);
      }
      const data = await res.json();
      toast.success("Project created with prompts, tickets, features, design, and architecture.");
      if (data.project?.id) {
        router.push(`/projects/${data.project.id}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGeneratingProjectIdeaId(null);
    }
  };

  return (
    <Card
      title="My ideas"
      subtitle="Your saved ideas. Add new ones with the button or from Templates / AI."
      footerButtons={
        <ButtonGroup alignment="right">
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add new idea
          </Button>
        </ButtonGroup>
      }
    >
      {loading ? (
        <LoadingState />
      ) : myIdeas.length === 0 ? (
        <EmptyState
          message="No ideas yet."
          action={
            <Button variant="outline" className="mt-4" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add new idea
            </Button>
          }
        />
      ) : (
        <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
          <ul className="space-y-3">
            {myIdeas.map((idea) => (
              <IdeaListItem
                key={idea.id}
                idea={idea}
                CATEGORY_LABELS={CATEGORY_LABELS}
                generatingProjectIdeaId={generatingProjectIdeaId}
                onGenerateProject={handleGenerateProject}
                onOpenEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        </ScrollArea>
      )}
    </Card>
  );
}
