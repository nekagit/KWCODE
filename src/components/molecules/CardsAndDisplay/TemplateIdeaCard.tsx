/** Template Idea Card component. */
import React from 'react';
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { Loader2, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TEMPLATE_IDEAS } from "@/data/template-ideas";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("CardsAndDisplay/TemplateIdeaCard.tsx");

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
      className={classes[0]}
      footerButtons={
        <ButtonGroup alignment="left">
          <Badge variant="secondary" className={classes[1]}>
            {template.category}
          </Badge>
          <Button
            size="sm"
            variant="default"
            className={classes[2]}
            disabled={generatingIdeaId !== null}
            onClick={handleGenerate}
          >
            {generatingIdeaId === template.id ? (
              <Loader2 className={classes[3]} />
            ) : (
              <Wand2 className={classes[4]} />
            )}
            Generate with AI
          </Button>
        </ButtonGroup>
      }
    ><div/></Card>
  );
};
