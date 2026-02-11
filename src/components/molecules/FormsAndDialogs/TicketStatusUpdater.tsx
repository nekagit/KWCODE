import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type TicketStatus } from "@/components/tickets-data-table";

type TicketStatusUpdaterProps = {
  status: TicketStatus;
  onStatusChange: (status: TicketStatus) => void;
};

export function TicketStatusUpdater({
  status,
  onStatusChange,
}: TicketStatusUpdaterProps) {
  return (
    <Select
      value={status}
      onValueChange={(value) => onStatusChange(value as TicketStatus)}
    >
      <SelectTrigger className="w-[120px] h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="backlog">Backlog</SelectItem>
        <SelectItem value="in_progress">In progress</SelectItem>
        <SelectItem value="done">Done</SelectItem>
        <SelectItem value="blocked">Blocked</SelectItem>
      </SelectContent>
    </Select>
  );
}
