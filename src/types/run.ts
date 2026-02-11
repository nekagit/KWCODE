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

export interface RunInfo {
  runId: string;
  label: string;
  logLines: string[];
  status: "running" | "done";
}

export interface FileEntry {
  name: string;
  path: string;
}

/** Minimal data for a feature (milestone) in the run queue: prompts + projects + label. */
export interface FeatureQueueItem {
  id: string;
  title: string;
  prompt_ids: number[];
  project_paths: string[];
}
