"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy } from "lucide-react";

interface IdeaCategoryLabels {
  saas: string;
  iaas: string;
  paas: string;
  website: string;
  webapp: string;
  webshop: string;
  other: string;
}

interface TemplateIdea {
  title: string;
  description: string;
  category: keyof IdeaCategoryLabels;
}

interface IdeaTemplateCardProps {
  TEMPLATE_IDEAS: TemplateIdea[];
  CATEGORY_LABELS: IdeaCategoryLabels;
  addToMyIdeas: (item: TemplateIdea, source: "template" | "ai") => Promise<void>;
}

export function IdeaTemplateCard({
  TEMPLATE_IDEAS,
  CATEGORY_LABELS,
  addToMyIdeas,
}: IdeaTemplateCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Template ideas</CardTitle>
        <CardDescription>
          Pre-written ideas you can add to &quot;My ideas&quot; and edit.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
          <ul className="space-y-3">
            {TEMPLATE_IDEAS.map((idea, i) => (
              <li key={i}>
                <Card className="bg-muted/30">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium">{idea.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{idea.description}</p>
                        <Badge variant="secondary" className="mt-2">
                          {CATEGORY_LABELS[idea.category]}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                        onClick={() => addToMyIdeas(idea, "template")}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Add to my ideas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
