/** Ticket Search Input component. */
import { Input } from "@/components/ui/input";
import { type Table } from "@tanstack/react-table";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("FormsAndDialogs/TicketSearchInput.tsx");

type TicketSearchInputProps<TData> = {
  table: Table<TData>;
  globalFilter: string;
  setGlobalFilter: (filter: string) => void;
};

export function TicketSearchInput<TData>({
  table,
  globalFilter,
  setGlobalFilter,
}: TicketSearchInputProps<TData>) {
  return (
    <div className={classes[0]}>
      <Input
        placeholder="Search tickets (title, description…)"
        value={globalFilter ?? ""}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className={classes[1]}
      />
      <span className={classes[2]}>
        {table.getFilteredRowModel().rows.length} of {table.getRowCount()} ticket{table.getRowCount() !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
