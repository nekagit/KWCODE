import Link from "next/link";
import { Button } from "@/components/shadcn/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { FolderSearch } from "lucide-react";

interface ProjectNotFoundStateProps {
  message?: string;
}

export function ProjectNotFoundState({ message }: ProjectNotFoundStateProps) {
  return (
    <EmptyState
      icon={<FolderSearch className="h-6 w-6" />}
      title="Project Not Found"
      description={message || "The requested project could not be found."}
      action={
        <Button asChild variant="outline">
          <Link href="/projects">Back to projects</Link>
        </Button>
      }
    />
  );
}
