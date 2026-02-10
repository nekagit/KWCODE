import Link from "next/link";
import { Button } from "@/components/shadcn/button";
import { ArrowLeft } from "lucide-react";

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
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
      <p className="text-muted-foreground text-sm">
        {description}
      </p>
    </div>
  );
}
