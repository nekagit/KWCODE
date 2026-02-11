import { Badge } from "@/components/ui/badge";
import { type TicketStatus } from "@/types/ticket";

type StatusBadgeProps = {
  status: TicketStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className="capitalize text-xs">
      {status === "in_progress" ? "In progress" : status}
    </Badge>
  );
}
