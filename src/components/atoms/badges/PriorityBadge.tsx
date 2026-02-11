import { BadgeComponent } from "@/components/shared/BadgeComponent";

interface PriorityBadgeProps {
  priority: number;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  return (
    <BadgeComponent
      text={`P${priority}`}
      variant="outline"
      className="text-xs"
    />
  );
};