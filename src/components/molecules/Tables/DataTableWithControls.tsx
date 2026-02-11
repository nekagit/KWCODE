import type { ColumnDef } from "@tanstack/react-table";
import type { Table as ReactTable } from "@tanstack/react-table";
import { DataTableLayout } from "@/components/molecules/Tables/DataTableLayout";
import { RowsPerPageSelector } from "@/components/molecules/ControlsAndButtons/RowsPerPageSelector";
import { PaginationControls } from "@/components/molecules/ControlsAndButtons/PaginationControls";

type DataTableWithControlsProps<TData> = {
  table: ReactTable<TData>;
  columns: ColumnDef<TData, unknown>[];
  emptyMessage?: string;
  searchSlot?: React.ReactNode;
};

export function DataTableWithControls<TData>({
  table,
  columns,
  emptyMessage = "No results.",
  searchSlot,
}: DataTableWithControlsProps<TData>) {
  return (
    <div className="space-y-4">
      {searchSlot}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <RowsPerPageSelector table={table} />
        <PaginationControls table={table} />
      </div>
      <DataTableLayout
        table={table}
        columns={columns}
        emptyMessage={emptyMessage}
      />
    </div>
  );
}
