"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ReactNode } from "react";

interface CoverageMetricCardProps {
  title: string;
  value: string;
  progress: number;
  target: string;
  icon?: ReactNode;
}

export function CoverageMetricCard({
  title,
  value,
  progress,
  target,
  icon,
}: CoverageMetricCardProps) {
  return (
    <Card className="bg-muted/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <Progress value={progress} className="mt-2 h-2" />
        <p className="text-xs text-muted-foreground mt-1">Target: {target}</p>
      </CardContent>
    </Card>
  );
}
