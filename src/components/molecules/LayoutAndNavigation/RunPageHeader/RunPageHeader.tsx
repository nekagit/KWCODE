"use client";

import { Play } from "lucide-react";
import Link from "next/link";

export function RunPageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Run</h1>
      <p className="text-muted-foreground text-sm mt-1">
        Set prompts, projects, and optional feature to run{" "}
        <code className="text-xs bg-muted px-1 rounded">run_prompts_all_projects.sh</code>.
      </p>
    </div>
  );
}
