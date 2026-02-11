import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

interface NewProjectHeaderProps {
  title: string;
  description: string;
}

export function NewProjectHeader({ title, description }: NewProjectHeaderProps) {
  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader title={title} subtitle={description} />
      </div>
    </div>
  );
}
