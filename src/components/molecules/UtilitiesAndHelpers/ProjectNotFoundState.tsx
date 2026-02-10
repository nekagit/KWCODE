import Link from "next/link";
import { Button } from "@/components/shadcn/button";

interface ProjectNotFoundStateProps {
  message?: string;
}

export function ProjectNotFoundState({ message }: ProjectNotFoundStateProps) {
  return (
    <div className="space-y-4">
      <p className="text-destructive">{message || "Project not found."}</p>
      <Button asChild variant="outline">
        <Link href="/projects">Back to projects</Link>
      </Button>
    </div>
  );
}
