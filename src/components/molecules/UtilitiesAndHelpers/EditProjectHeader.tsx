import Link from "next/link";
import { Button } from "@/components/shadcn/button";
import { ArrowLeft } from "lucide-react";

interface EditProjectHeaderProps {
  projectId: string;
}

export function EditProjectHeader({ projectId }: EditProjectHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" asChild>
        <Link href={`/projects/${projectId}`}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>
      <h1 className="text-2xl font-semibold tracking-tight">Edit project</h1>
    </div>
  );
}
