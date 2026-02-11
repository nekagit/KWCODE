import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TestTube2,
  Zap,
  ShieldCheck,
  Monitor,
} from "lucide-react";

interface TestingPhaseListItemProps {
  phase: {
    id: string;
    name: string;
    description: string;
    phase: string;
    icon: "static" | "unit" | "integration" | "e2e";
  };
  index: number;
}

const IconMap = {
  static: ShieldCheck,
  unit: TestTube2,
  integration: Zap,
  e2e: Monitor,
};

export const TestingPhaseListItem: React.FC<TestingPhaseListItemProps> = ({ phase, index }) => {
  const IconComponent = IconMap[phase.icon];

  return (
    <li key={phase.id}>
      <Card className="bg-muted/30">
        <div className="pt-4 p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
              {index + 1}
            </span>
            {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground" />}
            <h3 className="font-medium">{phase.name}</h3>
            <Badge variant="outline">{phase.phase}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2 ml-10">{phase.description}</p>
        </div>
      </Card>
    </li>
  );
};
