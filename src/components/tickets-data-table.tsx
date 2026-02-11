"use client";

import * as React from "react";
import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Ticket as TicketIcon } from "lucide-react";

import { Empty } from "@/components/ui/empty";
import { DataTableHeader } from "@/components/molecules/Tables/DataTableHeader";
import { StatusBadge } from "@/components/molecules/Display/StatusBadge";
import { DescriptionTooltip } from "@/components/molecules/Display/DescriptionTooltip";
import { TicketActionsMenu } from "@/components/molecules/FormsAndDialogs/TicketActionsMenu";
import { TicketStatusUpdater } from "@/components/molecules/FormsAndDialogs/TicketStatusUpdater";
import { TicketsTable } from "@/components/organisms/TicketsTable";
import { TicketsTableControls } from "@/components/organisms/TicketsTableControls";
import { formatDate } from "@/lib/utils";
import { type TicketRow, type TicketStatus } from "@/types/ticket";

interface TicketsDataTableProps {
  tickets: TicketRow[];
  onUpdateStatus: (id: string, status: TicketStatus) => void;
  onDelete: (id: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function TicketsDataTable({
  tickets,
  onUpdateStatus,
  onDelete,
  emptyTitle = "No tickets yet",
  emptyDescription = "Add a ticket using the form above.",
}: TicketsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "updated_at", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const columns = React.useMemo<ColumnDef<TicketRow>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => <DataTableHeader column={column} title="Title" />,
        cell: ({ row }) => (
          <span className="font-medium max-w-[200px] truncate block" title={row.original.title}>
            {row.original.title}
          </span>
        ),
        enableColumnFilter: true,
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <DescriptionTooltip description={row.original.description} />
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => <DataTableHeader column={column} title="Status" />,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
        filterFn: "includesString",
      },
      {
        accessorKey: "priority",
        header: ({ column }) => <DataTableHeader column={column} title="Priority" />,
        cell: ({ row }) => <span className="text-muted-foreground text-xs">P{row.original.priority}</span>,
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => <DataTableHeader column={column} title="Created" />,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-xs whitespace-nowrap">
            {formatDate(row.original.created_at)}
          </span>
        ),
      },
      {
        accessorKey: "updated_at",
        header: ({ column }) => <DataTableHeader column={column} title="Updated" />,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-xs whitespace-nowrap">
            {formatDate(row.original.updated_at)}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <TicketStatusUpdater
              status={row.original.status}
              onStatusChange={(status) => onUpdateStatus(row.original.id, status)}
            />
            <TicketActionsMenu onDelete={() => onDelete(row.original.id)} />
          </div>
        ),
      },
    ],
    [onUpdateStatus, onDelete]
  );

  const table = useReactTable({
    data: tickets,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = String(filterValue).toLowerCase();
      if (!q) return true;
      const title = row.original.title?.toLowerCase() ?? "";
      const desc = row.original.description?.toLowerCase() ?? "";
      return title.includes(q) || desc.includes(q);
    },
    initialState: {
      pagination: { pageSize: 25 },
    },
  });

  if (tickets.length === 0) {
    return (
      <Empty
        title={emptyTitle}
        description={emptyDescription}
        icon={<TicketIcon className="h-6 w-6" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <TicketsTableControls
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />
      <TicketsTable table={table} columns={columns} />
    </div>
  );
}
