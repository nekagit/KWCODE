/**
 * Persist Ideas page sort and filter preferences in localStorage.
 * Used by IdeasPageContent. See ADR 0120.
 */

const STORAGE_KEY = "kwcode-ideas-view-preference";
const MAX_FILTER_LENGTH = 500;

export type IdeasViewSort = "newest" | "oldest" | "title-asc" | "title-desc";

const VALID_SORT: IdeasViewSort[] = ["newest", "oldest", "title-asc", "title-desc"];

function isValidSort(v: unknown): v is IdeasViewSort {
  return typeof v === "string" && VALID_SORT.includes(v as IdeasViewSort);
}

export interface IdeasViewPreference {
  sort: IdeasViewSort;
  filterQuery: string;
}

export const DEFAULT_IDEAS_VIEW_PREFERENCE: IdeasViewPreference = {
  sort: "newest",
  filterQuery: "",
};

const DEFAULTS = DEFAULT_IDEAS_VIEW_PREFERENCE;

/**
 * Read and validate Ideas view preference from localStorage.
 * Invalid or missing values use defaults. SSR-safe (returns defaults when window is undefined).
 */
export function getIdeasViewPreference(): IdeasViewPreference {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const sort = isValidSort(parsed.sort) ? parsed.sort : DEFAULTS.sort;
    const filterQuery =
      typeof parsed.filterQuery === "string"
        ? parsed.filterQuery.slice(0, MAX_FILTER_LENGTH)
        : DEFAULTS.filterQuery;
    return { sort, filterQuery };
  } catch {
    return DEFAULTS;
  }
}

export interface IdeasViewPreferencePartial {
  sort?: IdeasViewSort;
  filterQuery?: string;
}

/**
 * Write Ideas view preference to localStorage. Only provided fields are updated.
 */
export function setIdeasViewPreference(partial: IdeasViewPreferencePartial): void {
  if (typeof window === "undefined") return;
  try {
    const current = getIdeasViewPreference();
    const next: IdeasViewPreference = {
      sort:
        partial.sort !== undefined && isValidSort(partial.sort) ? partial.sort : current.sort,
      filterQuery:
        partial.filterQuery !== undefined
          ? String(partial.filterQuery).slice(0, MAX_FILTER_LENGTH)
          : current.filterQuery,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}
