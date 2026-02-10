"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Pencil, Trash2, Loader2, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>My ideas</CardTitle>
          <CardDescription>Your saved ideas. Add new ones with the button or from Templates / AI.</CardDescription>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add new idea
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : myIdeas.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>No ideas yet.</p>
            <p className="text-sm mt-1">Add from Templates, generate with AI, or create one manually.</p>
            <Button variant="outline" className="mt-4" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add new idea
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
            <ul className="space-y-3">
              {myIdeas.map((idea) => (
                <li key={idea.id}>
                  <Card className={cn("bg-muted/30")}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium">{idea.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{idea.description || "—"}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">{CATEGORY_LABELS[idea.category]}</Badge>
                            <Badge variant="outline" className="text-xs">
                              {idea.source}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button
                            size="sm"
                            variant="default"
                            title="Generate a full project from this idea (prompts, tickets, features, design, architecture)"
                            disabled={generatingProjectIdeaId !== null}
                            onClick={async () => {
                              setGeneratingProjectIdeaId(idea.id);
                              try {
                                const res = await fetch("/api/generate-project-from-idea", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ ideaId: idea.id }),
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
                            }}
                          >
                            {generatingProjectIdeaId === idea.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Wand2 className="h-4 w-4" />
                            )}
                            <span className="ml-1.5 sr-only sm:not-sr-only">Generate project</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="shrink-0"
                            onClick={() => openEdit(idea)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="shrink-0 text-destructive hover:text-destructive"
                            title="Delete idea"
                            onClick={() => handleDelete(idea.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
