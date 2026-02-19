/** Stat Badge component. */
import { BadgeComponent } from "@/components/shared/BadgeComponent";
import { LucideIcon } from 'lucide-react';

interface StatBadgeProps {
  icon: LucideIcon;
  count: number;
  label: string;
}

export const StatBadge: React.FC<StatBadgeProps> = ({ icon, count, label }) => {
  return (
    <BadgeComponent
      icon={icon}
      text={count}
      title={label}
      variant="secondary"
    />
  );
};