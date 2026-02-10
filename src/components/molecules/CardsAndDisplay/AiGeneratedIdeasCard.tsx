"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";

interface IdeaCategoryLabels {
  saas: string;
  iaas: string;
  paas: string;
  website: string;
  webapp: string;
  webshop: string;
  other: string;
}

interface AiGeneratedIdeasCardProps {
  CATEGORY_LABELS: IdeaCategoryLabels;
  addToMyIdeas: (item: { title: string; description: string; category: keyof IdeaCategoryLabels }, source: "template" | "ai") => Promise<void>;
}

export function AiGeneratedIdeasCard({ CATEGORY_LABELS, addToMyIdeas }: AiGeneratedIdeasCardProps) {
  const [aiTopic, setAiTopic] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<{ title: string; description: string; category: keyof IdeaCategoryLabels }[]>([]);

  const handleGenerate = useCallback(async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    setAiResults([]);
    try {
      const res = await fetch("/api/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic.trim(), count: 5 }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.detail || res.statusText);
      }
      const data = await res.json();
      setAiResults(Array.isArray(data.ideas) ? data.ideas : []);
      if (!data.ideas?.length) toast.info("No ideas returned. Try another topic.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setAiLoading(false);
    }
  }, [aiTopic]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI generated ideas
        </CardTitle>
        <CardDescription>
          Enter a topic or niche; we&apos;ll suggest ideas you can add to My ideas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="e.g. developer tools, fitness apps, B2B HR"
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />
          <Button onClick={handleGenerate} disabled={aiLoading || !aiTopic.trim()}>
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span className="ml-2">Generate</span>
          </Button>
        </div>
        {aiResults.length > 0 && (
          <ScrollArea className="h-[400px] pr-4">
            <ul className="space-y-3">
              {aiResults.map((idea, i) => (
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
                          onClick={() => addToMyIdeas(idea, "ai")}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Add
                        </Button>
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
