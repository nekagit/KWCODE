import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Table } from "@tanstack/react-table";

type RowsPerPageSelectorProps<TData> = {
  table: Table<TData>;
};

export function RowsPerPageSelector<TData>({ table }: RowsPerPageSelectorProps<TData>) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>Rows per page</span>
      <Select
        value={String(table.getState().pagination.pageSize)}
        onValueChange={(v) => table.setPageSize(Number(v))}
      >
        <SelectTrigger className="h-8 w-[70px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {[10, 25, 50, 100].map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
