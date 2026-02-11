/**
 * Repos overview – type, description, tech stack, entrypoint.
 * No hardcoded projects. Optional data can be provided via data/february-repos-overview.json
 * and loaded from GET /api/data/february-repos-overview.
 */

export interface RepoOverview {
  name: string;
  type: string;
  description: string;
  techStack: Record<string, string[]>;
  entrypoint: string;
}

/** Default: empty. Load from /api/data/february-repos-overview when optional JSON is present. */
export const FEBRUARY_REPOS_OVERVIEW: RepoOverview[] = [];

export const FEBRUARY_REPOS_SUMMARY = {
  totalRepos: 0,
  commonTech: [] as string[],
};
