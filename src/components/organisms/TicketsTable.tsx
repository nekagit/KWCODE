import type { ColumnDef } from "@tanstack/react-table";
import type { Table as ReactTable } from "@tanstack/react-table";
import { DataTableLayout } from "@/components/molecules/Tables/DataTableLayout";

type TicketsTableProps<TData> = {
  table: ReactTable<TData>;
  columns: ColumnDef<TData, unknown>[];
};

export function TicketsTable<TData>({ table, columns }: TicketsTableProps<TData>) {
  return (
    <DataTableLayout
      table={table}
      columns={columns}
      emptyMessage="No tickets match the current filter."
    />
  );
}
