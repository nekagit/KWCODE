"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Lightbulb, Loader2, Wand2 } from "lucide-react";
import { TEMPLATE_IDEAS } from "@/data/template-ideas";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface TemplateIdeaCategory {
  saas: string;
  iaas: string;
  paas: string;
  website: string;
  webapp: string;
  webshop: string;
  other: string;
}

interface TemplateIdeaAccordionProps {
  setError: (error: string | null) => void;
}

export function TemplateIdeaAccordion({ setError }: TemplateIdeaAccordionProps) {
  const router = useRouter();
  const [generatingIdeaId, setGeneratingIdeaId] = useState<string | null>(null);

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="template-ideas">
        <AccordionTrigger className="text-base">
          <span className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Start from a template idea (AI generates full project)
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-muted-foreground text-sm mb-4">
            Pick one of 10 template ideas. AI will create a project with prompts, tickets, features, one design, and one architecture linked to it.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATE_IDEAS.map((template) => (
              <Card key={template.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between gap-2">
                    <span className="truncate">{template.title}</span>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {template.category}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-2">
                  <Button
                    size="sm"
                    variant="default"
                    className="w-full"
                    disabled={generatingIdeaId !== null}
                    onClick={async () => {
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
                        // refetch(); // Assuming refetch is passed down or managed by context
                        if (data.project?.id) {
                          router.push(`/projects/${data.project.id}`);
                        }
                      } catch (e) {
                        setError(e instanceof Error ? e.message : String(e));
                      } finally {
                        setGeneratingIdeaId(null);
                      }
                    }}
                  >
                    {generatingIdeaId === template.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    Generate with AI
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
