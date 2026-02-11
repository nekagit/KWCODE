import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { type Column } from "@tanstack/react-table";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("Tables/DataTableHeader.tsx");

type DataTableHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>;
  title: string;
};

export function DataTableHeader<TData, TValue>({
  column,
  title,
}: DataTableHeaderProps<TData, TValue>) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={classes[0]}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <ArrowUpDown className={classes[1]} />
    </Button>
  );
}
