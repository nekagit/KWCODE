"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TestTube2,
  Zap,
  ShieldCheck,
  Monitor,
} from "lucide-react";
import { TEST_PHASES } from "@/data/test-best-practices";

export function TestingPhasesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Testing phases</CardTitle>
        <CardDescription>
          Recommended order: static first, then unit, integration, E2E. Automation runs these in CI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {TEST_PHASES.map((phase, i) => (
            <li key={phase.id}>
              <Card className="bg-muted/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {i + 1}
                    </span>
                    {phase.icon === "static" && <ShieldCheck className="h-5 w-5 text-muted-foreground" />}
                    {phase.icon === "unit" && <TestTube2 className="h-5 w-5 text-muted-foreground" />}
                    {phase.icon === "integration" && <Zap className="h-5 w-5 text-muted-foreground" />}
                    {phase.icon === "e2e" && <Monitor className="h-5 w-5 text-muted-foreground" />}
                    <h3 className="font-medium">{phase.name}</h3>
                    <Badge variant="outline">{phase.phase}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 ml-10">{phase.description}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
