/** Ticket Status Updater component. */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getClasses } from "@/components/molecules/tailwind-molecules";
import { type TicketStatus } from "@/types/ticket";

const classes = getClasses("FormsAndDialogs/TicketStatusUpdater.tsx");

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
      <SelectTrigger className={classes[0]}>
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
