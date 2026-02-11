import { JsonDisplay } from "@/components/shared/JsonDisplay";

interface ActiveProjectsDisplayProps {
  activeProjects: string[];
}

export const ActiveProjectsDisplay: React.FC<ActiveProjectsDisplayProps> = ({
  activeProjects,
}) => {
  return (
    <GenericJsonDisplay
      title={`cursor_projects / active (${activeProjects.length})`}
      data={activeProjects}
      height="h-24"
    />
  );
};