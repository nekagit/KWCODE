/** Data Table Layout component. */
import {
  flexRender,
  type Table as ReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getClasses } from "@/components/molecules/tailwind-molecules";

const classes = getClasses("Tables/DataTableLayout.tsx");

type DataTableLayoutProps<TData> = {
  table: ReactTable<TData>;
  columns: ColumnDef<TData, unknown>[];
  emptyMessage?: string;
  className?: string;
};

export function DataTableLayout<TData>({
  table,
  columns,
  emptyMessage = "No results.",
  className,
}: DataTableLayoutProps<TData>) {
  return (
    <div className={className ?? "rounded-md border"}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className={classes[0]}
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
