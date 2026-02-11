export type TicketStatus = "backlog" | "in_progress" | "done" | "blocked";

export interface TicketRow {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: number;
  created_at: string;
  updated_at: string;
}
