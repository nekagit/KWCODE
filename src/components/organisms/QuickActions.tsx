import { Play, Loader2, Plus, MessageSquare, Folders, Layers, ScrollText, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/shadcn/button";
import { ShadcnCardContent, ShadcnCardDescription, ShadcnCardHeader, ShadcnCardTitle } from "@/components/shadcn/card";
import { GlassCard } from "@/components/atoms/GlassCard";
import type { Feature } from "@/app/page";
import type { RunningRun } from "@/store/run-store";

interface QuickActionsProps {
  features: Feature[];
  runningRuns: RunningRun[];
  navigateToTab: (tab: "tickets" | "projects" | "feature" | "log" | "dashboard" | "prompts" | "all" | "data") => void;
  runForFeature: (feature: Feature) => Promise<void>;
  setSelectedRunId: (id: string | null) => void;
  router: ReturnType<typeof useRouter>;
}

export function QuickActions({ features, runningRuns, navigateToTab, runForFeature, setSelectedRunId, router }: QuickActionsProps) {
  return (
    <GlassCard>
      <ShadcnCardHeader className="pb-3">
        <ShadcnCardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick actions
        </ShadcnCardTitle>
        <ShadcnCardDescription className="text-base">Shortcuts to common tasks</ShadcnCardDescription>
      </ShadcnCardHeader>
      <ShadcnCardContent>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            onClick={() => navigateToTab("tickets")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add ticket
          </Button>
          {features.length > 0 && (
            <Button
              variant="default"
              onClick={() => runForFeature(features[0])}
              disabled={features[0].prompt_ids.length === 0 || runningRuns.some((r) => r.status === "running")}
            >
              {runningRuns.some((r) => r.label === features[0].title && r.status === "running") ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Run &quot;{features[0].title.length > 20 ? features[0].title.slice(0, 20) + "…" : features[0].title}&quot;
            </Button>
          )}
          <Button variant="outline" onClick={() => navigateToTab("prompts")}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Prompts
          </Button>
          <Button variant="outline" onClick={() => navigateToTab("projects")}>
            <Folders className="h-4 w-4 mr-2" />
            Active repos
          </Button>
          <Button variant="outline" onClick={() => navigateToTab("feature")}>
            <Layers className="h-4 w-4 mr-2" />
            Features
          </Button>
          <Button variant="outline" onClick={() => { setSelectedRunId(runningRuns[runningRuns.length - 1]?.runId ?? null); navigateToTab("log"); }}>
            <ScrollText className="h-4 w-4 mr-2" />
            View log
          </Button>
        </div>
      </ShadcnCardContent>
    </GlassCard>
  );
}
