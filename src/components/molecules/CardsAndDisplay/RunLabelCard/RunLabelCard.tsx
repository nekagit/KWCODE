"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Input } from "@/components/shadcn/input";

interface RunLabelCardProps {
  runLabel: string;
  setRunLabel: (label: string) => void;
}

export function RunLabelCard({
  runLabel,
  setRunLabel,
}: RunLabelCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Run label</CardTitle>
        <CardDescription>
          Optional name for this run (shown in running terminals and log).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          placeholder="e.g. Manual run"
          value={runLabel}
          onChange={(e) => setRunLabel(e.target.value)}
          className="max-w-md"
        />
      </CardContent>
    </Card>
  );
}
