"use client";

/** Coverage Metric Card component. */
import { Progress } from "@/components/ui/progress";
import { ReactNode } from "react";
import { LucideIcon, Activity } from "lucide-react";
import { Card } from "@/components/shared/Card";
import { TitleWithIcon } from "@/components/atoms/headers/TitleWithIcon";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("CardsAndDisplay/CoverageMetricCard.tsx");

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
      title={icon ? <TitleWithIcon icon={icon} title={title} className={classes[0]} iconClassName="text-primary/80" /> : <TitleWithIcon icon={Activity} title={title} className={classes[0]} iconClassName="text-primary/80" />}
      subtitle={<p className={classes[2]}>Target: {target}</p>}
    >
      <div className={classes[3]}>{value}</div>
      <Progress value={progress} className={classes[4]} />
    </Card>
  );
}
