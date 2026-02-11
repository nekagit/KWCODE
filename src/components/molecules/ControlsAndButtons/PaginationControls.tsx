import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Table } from "@tanstack/react-table";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("ControlsAndButtons/PaginationControls.tsx");

type PaginationControlsProps<TData> = {
  table: Table<TData>;
};

export function PaginationControls<TData>({ table }: PaginationControlsProps<TData>) {
  return (
    <div className={classes[0]}>
      <span className={classes[1]}>
        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
      </span>
      <Button
        variant="outline"
        size="sm"
        className={classes[2]}
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        <ChevronLeft className={classes[3]} />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={classes[2]}
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        <ChevronRight className={classes[3]} />
      </Button>
    </div>
  );
}
