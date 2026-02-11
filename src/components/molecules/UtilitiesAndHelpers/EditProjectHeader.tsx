import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/molecules/LayoutAndNavigation/PageHeader/PageHeader";

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
      <PageHeader title="Edit project" />
    </div>
  );
}
