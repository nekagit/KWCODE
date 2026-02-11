/** Optional categorization for an entity within a project (phase, step, organization, etc.). */
export interface EntityCategory {
  phase?: string;
  step?: string;
  organization?: string;
  categorizer?: string;
  other?: string;
}

/** Per-entity categorizations keyed by entity id (e.g. prompt id, ticket id). */
export interface ProjectEntityCategories {
  prompts?: Record<string, EntityCategory>;
  tickets?: Record<string, EntityCategory>;
  features?: Record<string, EntityCategory>;
  ideas?: Record<string, EntityCategory>;
  designs?: Record<string, EntityCategory>;
  architectures?: Record<string, EntityCategory>;
}

/** First-class project: aggregates design, ideas, features, tickets, prompts (and optional repo path). */
export interface Project {
  id: string;
  name: string;
  description?: string;
  /** Optional repo path for run context */
  repoPath?: string;
  promptIds: number[];
  ticketIds: string[];
  featureIds: string[];
  ideaIds: number[];
  /** IDs of designs saved to library (linkable in link section). Optional for backward compat. */
  designIds?: string[];
  /** IDs of architectures saved to library (linkable in link section). Optional for backward compat. */
  architectureIds?: string[];
  /** Per-entity categorizations (phase, step, organization, categorizer, other) within this project. */
  entityCategories?: ProjectEntityCategories;
  /** Files in the project spec: from .cursor (path only) or exported from Design/Architecture/Features (path + content). */
  specFiles?: { name: string; path: string; content?: string }[];
  /** Spec .md file paths linked to the Tickets card (e.g. .cursor/tickets.md). Shown in Tickets card; drag from Project Spec to add. */
  specFilesTickets?: string[];
  /** Spec .md file paths linked to the Features card (e.g. .cursor/features.md, .cursor/feature-<id>.md). Shown in Features card; drag from Project Spec to add. */
  specFilesFeatures?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Feature {
  id: string;
  title: string;
  ticket_ids: string[];
  prompt_ids: number[];
  project_paths: string[];
  created_at: string;
  updated_at: string;
}

export type ProjectTabCategory = "design" | "ideas" | "features" | "tickets" | "prompts" | "architecture";

export type { PromptRecord } from "./prompt";
