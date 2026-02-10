"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Checkbox } from "@/components/shadcn/checkbox";
import { ScrollArea } from "@/components/shadcn/scroll-area";
import { MessageSquare } from "lucide-react";

interface PromptSelectionCardProps {
  prompts: { id: number; title: string }[];
  selectedPromptIds: number[];
  setSelectedPromptIds: (ids: number[]) => void;
}

export function PromptSelectionCard({
  prompts,
  selectedPromptIds,
  setSelectedPromptIds,
}: PromptSelectionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Prompts
        </CardTitle>
        <CardDescription>
          Select at least one prompt to run (script <code className="text-xs">-p ID ...</code>).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[180px] rounded-md border p-3">
          <div className="flex flex-wrap gap-2">
            {prompts.map((p) => (
              <label
                key={p.id}
                className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 hover:bg-muted/50"
              >
                <Checkbox
                  checked={selectedPromptIds.includes(p.id)}
                  onCheckedChange={(checked) => {
                    setSelectedPromptIds((prev) =>
                      checked ? [...prev, p.id] : prev.filter((id) => id !== p.id)
                    );
                  }}
                />
                <span className="text-sm">
                  {p.id}: {p.title}
                </span>
              </label>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
