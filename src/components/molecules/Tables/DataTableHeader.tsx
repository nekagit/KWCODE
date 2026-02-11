import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { type Column } from "@tanstack/react-table";

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
      className="-ml-2 h-8"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
    </Button>
  );
}
