import { Input } from "@/components/ui/input";
import { type Table } from "@tanstack/react-table";

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
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder="Search tickets (title, description…)"
        value={globalFilter ?? ""}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm h-9"
      />
      <span className="text-sm text-muted-foreground">
        {table.getFilteredRowModel().rows.length} of {table.getRowCount()} ticket{table.getRowCount() !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
