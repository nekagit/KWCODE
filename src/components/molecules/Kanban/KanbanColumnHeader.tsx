import React from "react";
import {
  ListTodo,
  Play,
  CheckCircle2,
  TestTube2,
} from "lucide-react";
import { getClasses } from "@/components/molecules/tailwind-molecules";
import type { KanbanColumn } from "@/lib/todos-kanban";

const classes = getClasses("Kanban/KanbanColumnHeader.tsx");

interface KanbanColumnHeaderProps {
  columnId: string;
  column: KanbanColumn;
}

export const KanbanColumnHeader: React.FC<KanbanColumnHeaderProps> = ({
  columnId,
  column,
}) => (
  <div className={classes[0]}>
    <h3 className={classes[1]}>
      {columnId === "backlog" && <ListTodo className={classes[2]} />}
      {columnId === "in_progress" && <Play className={classes[2]} />}
      {columnId === "done" && <CheckCircle2 className={classes[2]} />}
      {columnId === "testing" && <TestTube2 className={classes[2]} />}
      {column.name} ({column.items.length})
    </h3>
  </div>
);
