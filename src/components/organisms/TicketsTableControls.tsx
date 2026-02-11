import { type Table } from "@tanstack/react-table";
import { TicketSearchInput } from "@/components/molecules/FormsAndDialogs/TicketSearchInput";
import { RowsPerPageSelector } from "@/components/molecules/ControlsAndButtons/RowsPerPageSelector";
import { PaginationControls } from "@/components/molecules/ControlsAndButtons/PaginationControls";

type TicketsTableControlsProps<TData> = {
  table: Table<TData>;
  globalFilter: string;
  setGlobalFilter: (filter: string) => void;
};

export function TicketsTableControls<TData>({
  table,
  globalFilter,
  setGlobalFilter,
}: TicketsTableControlsProps<TData>) {
  return (
    <div className="space-y-4">
      <TicketSearchInput
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <RowsPerPageSelector table={table} />
        <PaginationControls table={table} />
      </div>
    </div>
  );
}
