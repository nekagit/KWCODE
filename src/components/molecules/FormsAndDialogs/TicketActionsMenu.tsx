import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getClasses } from "@/components/molecules/tailwind-molecules";
import { MoreHorizontal, Trash2 } from "lucide-react";

const classes = getClasses("FormsAndDialogs/TicketActionsMenu.tsx");

type TicketActionsMenuProps = {
  onDelete: () => void;
};

export function TicketActionsMenu({ onDelete }: TicketActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={classes[0]}>
          <MoreHorizontal className={classes[1]} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className={classes[2]}
          onClick={onDelete}
        >
          <Trash2 className={classes[3]} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
