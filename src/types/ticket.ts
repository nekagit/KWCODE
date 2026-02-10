export type TicketStatus = "backlog" | "in_progress" | "done" | "blocked";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: number;
  created_at: string;
  updated_at: string;
  /** Legacy: present when loading old tickets.json; stripped when saving */
  prompt_ids?: number[];
  project_paths?: string[];
}
