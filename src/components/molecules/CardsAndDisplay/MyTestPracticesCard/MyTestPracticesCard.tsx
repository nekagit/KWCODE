"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface MyTestPracticesCardProps {
  myPractices: string;
  saveMyPractices: (value: string) => void;
}

export function MyTestPracticesCard({ myPractices, saveMyPractices }: MyTestPracticesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My test practices</CardTitle>
        <CardDescription>
          Your own notes and rules for tests. Saved in browser storage.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="e.g. Always use data-testid for E2E; our unit tests use Vitest and @testing-library/react..."
          value={myPractices}
          onChange={(e) => saveMyPractices(e.target.value)}
          className="min-h-[180px] font-mono text-sm"
        />
      </CardContent>
    </Card>
  );
}
