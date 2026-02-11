"use client";

import { Input } from "@/components/shadcn/input";
import { Card } from "@/components/shared/Card";

interface RunLabelCardProps {
  runLabel: string;
  setRunLabel: (label: string) => void;
}

export function RunLabelCard({
  runLabel,
  setRunLabel,
}: RunLabelCardProps) {
  return (
    <Card
      title="Run label"
      subtitle="Optional name for this run (shown in running terminals and log)."
    >
      <Input
        placeholder="e.g. Manual run"
        value={runLabel}
        onChange={(e) => setRunLabel(e.target.value)}
        className="max-w-md"
      />
    </Card>
  );
}
