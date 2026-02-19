/** Rows Per Page Selector component. */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getClasses } from "@/components/molecules/tailwind-molecules";
import { type Table } from "@tanstack/react-table";

const classes = getClasses("ControlsAndButtons/RowsPerPageSelector.tsx");

type RowsPerPageSelectorProps<TData> = {
  table: Table<TData>;
};

export function RowsPerPageSelector<TData>({ table }: RowsPerPageSelectorProps<TData>) {
  return (
    <div className={classes[0]}>
      <span>Rows per page</span>
      <Select
        value={String(table.getState().pagination.pageSize)}
        onValueChange={(v) => table.setPageSize(Number(v))}
      >
        <SelectTrigger className={classes[1]}>
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
