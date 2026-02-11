"use client";

import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Lightbulb } from "lucide-react";
import { TEMPLATE_IDEAS } from "@/data/template-ideas";
import { TemplateIdeaCard } from "@/components/molecules/CardsAndDisplay/TemplateIdeaCard";
import { GridContainer } from "@/components/shared/GridContainer";

interface TemplateIdeaAccordionProps {
  setError: (error: string | null) => void;
}

export function TemplateIdeaAccordion({ setError }: TemplateIdeaAccordionProps) {
  const [generatingIdeaId, setGeneratingIdeaId] = useState<string | null>(null);

  return (
    <Accordion
      items={[
        {
          title: (
            <span className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Start from a template idea (AI generates full project)
            </span>
          ),
          content: (
            <>
              <p className="text-muted-foreground text-sm mb-4">
                Pick one of 10 template ideas. AI will create a project with prompts, tickets, features, one design, and one architecture linked to it.
              </p>
              <GridContainer>
                {TEMPLATE_IDEAS.map((template) => (
                  <TemplateIdeaCard
                    key={template.id}
                    template={template}
                    generatingIdeaId={generatingIdeaId}
                    setGeneratingIdeaId={setGeneratingIdeaId}
                    setError={setError}
                  />
                ))}
              </GridContainer>
            </>
          ),
          defaultOpen: true,
        },
      ]}
      initialActiveTab="Start from a template idea (AI generates full project)"
    />
  );
}
