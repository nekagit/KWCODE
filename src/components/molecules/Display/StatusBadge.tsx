import { Badge } from "@/components/ui/badge";
import { type TicketStatus } from "@/types/ticket";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("Display/StatusBadge.tsx");

type StatusBadgeProps = {
  status: TicketStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={classes[0]}>
      {status === "in_progress" ? "In progress" : status}
    </Badge>
  );
}
