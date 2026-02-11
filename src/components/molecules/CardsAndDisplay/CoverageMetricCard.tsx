"use client";

import { Progress } from "@/components/ui/progress";
import { ReactNode } from "react";
import { LucideIcon, Activity } from "lucide-react";
import { Card } from "@/components/shared/Card";
import { TitleWithIcon } from "@/components/atoms/headers/TitleWithIcon";

interface CoverageMetricCardProps {
  title: string;
  value: string;
  progress: number;
  target: string;
  icon?: LucideIcon | null;
}

export function CoverageMetricCard({
  title,
  value,
  progress,
  target,
  icon,
}: CoverageMetricCardProps) {
  return (
    <Card
      title={icon ? <TitleWithIcon icon={icon} title={title} className="text-sm font-medium text-muted-foreground" /> : <TitleWithIcon icon={Activity} title={title} className="text-sm font-medium text-muted-foreground" />}
      subtitle={<p className="text-xs text-muted-foreground">Target: {target}</p>}
    >
      <div className="text-2xl font-bold">{value}</div>
      <Progress value={progress} className="mt-2 h-2" />
    </Card>
  );
}
