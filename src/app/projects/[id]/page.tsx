import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const ProjectDetailsPageContent = dynamic(
  () =>
    import("@/components/organisms/ProjectDetailsPageContent").then((m) => m.ProjectDetailsPageContent),
  {
    loading: () => (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

export default function ProjectDetailsPage() {
  return <ProjectDetailsPageContent />;
}
