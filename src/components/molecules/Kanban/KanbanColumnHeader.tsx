import React from "react";
import {
  ListTodo,
  Play,
  CheckCircle2,
  TestTube2,
} from "lucide-react";
import type { KanbanColumn } from "@/lib/todos-kanban";

interface KanbanColumnHeaderProps {
  columnId: string;
  column: KanbanColumn;
}

export const KanbanColumnHeader: React.FC<KanbanColumnHeaderProps> = ({
  columnId,
  column,
}) => (
  <div className="pb-4">
    <h3 className="text-base font-semibold flex items-center gap-2">
      {columnId === "backlog" && <ListTodo className="h-4 w-4" />}
      {columnId === "in_progress" && <Play className="h-4 w-4" />}
      {columnId === "done" && <CheckCircle2 className="h-4 w-4" />}
      {columnId === "testing" && <TestTube2 className="h-4 w-4" />}
      {column.name} ({column.items.length})
    </h3>
  </div>
);
