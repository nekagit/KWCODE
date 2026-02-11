import { useRouter } from "next/navigation";
import type { Feature } from "@/types/project";
import { QuickActionCard } from "@/components/molecules/CardsAndDisplay/QuickActionCard";
import { QuickActionButtons } from "@/components/molecules/ControlsAndButtons/QuickActionButtons";

interface QuickActionsProps {
  features: Feature[];
  navigateToTab: (tab: "tickets" | "projects" | "feature" | "log" | "dashboard" | "prompts" | "all" | "data") => void;
  runForFeature: (feature: Feature) => Promise<void>;
  setSelectedRunId: (id: string | null) => void;
  router: ReturnType<typeof useRouter>;
}

export function QuickActions({ features, navigateToTab, runForFeature, setSelectedRunId, router }: QuickActionsProps) {
  return (
    <QuickActionCard>
    </QuickActionCard>
  );
}
