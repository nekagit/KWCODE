"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2 } from "lucide-react";

interface TestGenerationCardProps {
  aiPrompt: string;
  setAiPrompt: (value: string) => void;
  aiLoading: boolean;
  aiResult: string | null;
  handleAiGenerate: () => Promise<void>;
}

export function TestGenerationCard({
  aiPrompt,
  setAiPrompt,
  aiLoading,
  aiResult,
  handleAiGenerate,
}: TestGenerationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI test generation
        </CardTitle>
        <CardDescription>
          Describe what you want to test; we generate a short test plan or outline (uses prompt API).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="e.g. login form validation, API /users GET, checkout flow"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAiGenerate()}
          />
          <Button onClick={handleAiGenerate} disabled={aiLoading || !aiPrompt.trim()}>
            {aiLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span className="ml-2">Generate</span>
          </Button>
        </div>
        {aiResult && (
          <div className="rounded-lg border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
            {aiResult}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
