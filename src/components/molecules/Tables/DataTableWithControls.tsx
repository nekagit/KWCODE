import type { ColumnDef } from "@tanstack/react-table";
import type { Table as ReactTable } from "@tanstack/react-table";
import { DataTableLayout } from "@/components/molecules/Tables/DataTableLayout";
import { RowsPerPageSelector } from "@/components/molecules/ControlsAndButtons/RowsPerPageSelector";
import { PaginationControls } from "@/components/molecules/ControlsAndButtons/PaginationControls";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("Tables/DataTableWithControls.tsx");

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
    <div className={classes[0]}>
      {searchSlot}
      <div className={classes[1]}>
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
