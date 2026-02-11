import React from 'react';
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { Loader2, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TEMPLATE_IDEAS } from "@/data/template-ideas";

interface TemplateIdeaCardProps {
  template: typeof TEMPLATE_IDEAS[number];
  generatingIdeaId: string | null;
  setGeneratingIdeaId: (id: string | null) => void;
  setError: (error: string | null) => void;
}

export const TemplateIdeaCard: React.FC<TemplateIdeaCardProps> = ({
  template,
  generatingIdeaId,
  setGeneratingIdeaId,
  setError,
}) => {
  const router = useRouter();

  const handleGenerate = async () => {
    setGeneratingIdeaId(template.id);
    setError(null);
    try {
      const res = await fetch("/api/generate-project-from-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: {
            title: template.title,
            description: template.description,
            category: template.category,
          },
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.detail || res.statusText);
      }
      const data = await res.json();
      if (data.project?.id) {
        router.push(`/projects/${data.project.id}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setGeneratingIdeaId(null);
    }
  };

  return (
    <Card
      title={template.title}
      subtitle={template.description}
      className="flex flex-col"
      footerButtons={
        <ButtonGroup alignment="left">
          <Badge variant="secondary" className="shrink-0 text-xs">
            {template.category}
          </Badge>
          <Button
            size="sm"
            variant="default"
            className="w-full"
            disabled={generatingIdeaId !== null}
            onClick={handleGenerate}
          >
            {generatingIdeaId === template.id ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Wand2 className="h-4 w-4 mr-2" />
            )}
            Generate with AI
          </Button>
        </ButtonGroup>
      }
    ></Card>
  );
};
