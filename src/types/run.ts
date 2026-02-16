export const DEFAULT_TIMING = {
  sleep_after_open_project: 4,
  sleep_after_window_focus: 1.5,
  sleep_between_shift_tabs: 0.5,
  sleep_after_all_shift_tabs: 0.8,
  sleep_after_cmd_n: 2,
  sleep_before_paste: 0.8,
  sleep_after_paste: 1,
  sleep_after_enter: 2,
  sleep_between_projects: 3,
  sleep_between_rounds: 270,
};

export type Timing = typeof DEFAULT_TIMING;

export interface PromptRecordItem {
  id: number;
  title: string;
  content: string;
}

/** Metadata for post-run actions (write file, parse and notify). Used by temp tickets. */
export interface RunMeta {
  projectId?: string;
  outputPath?: string;
  /** How to handle stdout when run exits: write_file | parse_ideas | parse_ticket | parse_architectures | parse_prompt | parse_project_from_idea | improve_idea */
  onComplete?: string;
  /** Extra payload for onComplete handlers (e.g. repoPath for writeProjectFile). */
  payload?: Record<string, unknown>;
  /** For ticket Implement All runs: repo path for git diff. */
  repoPath?: string;
  /** Ticket number (for implementation_log). */
  ticketNumber?: number;
  /** Ticket title (for implementation_log). */
  ticketTitle?: string;
  /** Milestone id (for implementation_log). */
  milestoneId?: number;
  /** Idea id (for implementation_log). */
  ideaId?: number;
  /** Git ref (e.g. HEAD) at run start for diff when run exits. */
  gitRefAtStart?: string;
}

export interface Run {
  runId: string;
  label: string;
  logLines: string[];
  status: "running" | "done";
  /** When the run was started (ms since epoch). Used for elapsed timer. */
  startedAt?: number;
  /** When the run finished (ms since epoch). Set on script-exited for duration. */
  doneAt?: number;
  /** Optional metadata for post-run actions (temp tickets). */
  meta?: RunMeta;
}

/** Alias for Run used by run store and UI. */
export type RunInfo = Run;

export interface FileEntry {
  name: string;
  path: string;
}


