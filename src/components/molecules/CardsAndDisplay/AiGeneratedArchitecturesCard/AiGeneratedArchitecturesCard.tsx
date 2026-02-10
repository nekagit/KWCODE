"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import type { ArchitectureCategory } from "@/types/architecture";

type AiResult = { name: string; description: string; category: ArchitectureCategory; practices: string; scenarios: string };

interface AiGeneratedArchitecturesCardProps {
  CATEGORY_LABELS: Record<ArchitectureCategory, string>;
  addFromAi: (item: AiResult) => Promise<void>;
}

export function AiGeneratedArchitecturesCard({ CATEGORY_LABELS, addFromAi }: AiGeneratedArchitecturesCardProps) {
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState(3);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<AiResult[]>([]);

  const handleAiGenerate = useCallback(async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    setAiResults([]);
    try {
      const res = await fetch("/api/generate-architectures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic.trim(), count: aiCount }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.detail || res.statusText);
      }
      const data = await res.json();
      setAiResults(Array.isArray(data.architectures) ? data.architectures : []);
      if (!data.architectures?.length) toast.info("No results. Try another topic.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setAiLoading(false);
    }
  }, [aiTopic, aiCount]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI generated
        </CardTitle>
        <CardDescription>
          Enter a topic or scenario; we&apos;ll suggest architecture definitions you can add to My definitions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[200px] space-y-2">
            <Label htmlFor="ai-topic">Topic or scenario</Label>
            <Input
              id="ai-topic"
              placeholder="e.g. event-driven APIs, secure auth, high-throughput"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAiGenerate()}
            />
          </div>
          <div className="w-[100px] space-y-2">
            <Label>Count</Label>
            <Select value={String(aiCount)} onValueChange={(v) => setAiCount(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAiGenerate} disabled={aiLoading || !aiTopic.trim()}>
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Generate
          </Button>
        </div>
        {aiResults.length > 0 && (
          <ScrollArea className="h-[400px] pr-4">
            <ul className="space-y-3">
              {aiResults.map((item, i) => (
                <li key={i}>
                  <Card className="bg-muted/30">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                          <Badge variant="secondary" className="mt-2">
                            {CATEGORY_LABELS[item.category]}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline" className="shrink-0" onClick={() => addFromAi(item)}>
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
