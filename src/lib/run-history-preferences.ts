/**
 * Persist run history sort and filter preferences in localStorage.
 * Used by WorkerHistorySection in ProjectRunTab. See ADR 0230.
 */

const STORAGE_KEY = "kwcode-run-history-preferences";

export type StoredSortOrder = "newest" | "oldest" | "shortest" | "longest";
export type StoredExitStatusFilter = "all" | "success" | "failed";
export type StoredDateRangeFilter = "all" | "24h" | "7d" | "30d";
export type StoredSlotFilter = "all" | "1" | "2" | "3";

const VALID_SORT: StoredSortOrder[] = ["newest", "oldest", "shortest", "longest"];
const VALID_EXIT: StoredExitStatusFilter[] = ["all", "success", "failed"];
const VALID_DATE: StoredDateRangeFilter[] = ["all", "24h", "7d", "30d"];
const VALID_SLOT: StoredSlotFilter[] = ["all", "1", "2", "3"];

function isValidSort(v: unknown): v is StoredSortOrder {
  return typeof v === "string" && VALID_SORT.includes(v as StoredSortOrder);
}
function isValidExit(v: unknown): v is StoredExitStatusFilter {
  return typeof v === "string" && VALID_EXIT.includes(v as StoredExitStatusFilter);
}
function isValidDate(v: unknown): v is StoredDateRangeFilter {
  return typeof v === "string" && VALID_DATE.includes(v as StoredDateRangeFilter);
}
function isValidSlot(v: unknown): v is StoredSlotFilter {
  return typeof v === "string" && VALID_SLOT.includes(v as StoredSlotFilter);
}

export interface RunHistoryPreferences {
  sortOrder: StoredSortOrder;
  exitStatusFilter: StoredExitStatusFilter;
  dateRangeFilter: StoredDateRangeFilter;
  slotFilter: StoredSlotFilter;
}

/** Default run history preferences. Exported for "Restore defaults" UI (ADR 0231). */
export const DEFAULT_RUN_HISTORY_PREFERENCES: RunHistoryPreferences = {
  sortOrder: "newest",
  exitStatusFilter: "all",
  dateRangeFilter: "all",
  slotFilter: "all",
};

const DEFAULTS = DEFAULT_RUN_HISTORY_PREFERENCES;

/**
 * Read and validate run history preferences from localStorage.
 * Invalid or missing values use defaults.
 */
export function getRunHistoryPreferences(): RunHistoryPreferences {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      sortOrder: isValidSort(parsed.sortOrder) ? parsed.sortOrder : DEFAULTS.sortOrder,
      exitStatusFilter: isValidExit(parsed.exitStatusFilter) ? parsed.exitStatusFilter : DEFAULTS.exitStatusFilter,
      dateRangeFilter: isValidDate(parsed.dateRangeFilter) ? parsed.dateRangeFilter : DEFAULTS.dateRangeFilter,
      slotFilter: isValidSlot(parsed.slotFilter) ? parsed.slotFilter : DEFAULTS.slotFilter,
    };
  } catch {
    return DEFAULTS;
  }
}

export interface RunHistoryPreferencesPartial {
  sortOrder?: StoredSortOrder;
  exitStatusFilter?: StoredExitStatusFilter;
  dateRangeFilter?: StoredDateRangeFilter;
  slotFilter?: StoredSlotFilter;
}

/**
 * Write run history preferences to localStorage. Only provided fields are updated.
 */
export function setRunHistoryPreferences(partial: RunHistoryPreferencesPartial): void {
  if (typeof window === "undefined") return;
  try {
    const current = getRunHistoryPreferences();
    const next: RunHistoryPreferences = {
      sortOrder: partial.sortOrder !== undefined && isValidSort(partial.sortOrder) ? partial.sortOrder : current.sortOrder,
      exitStatusFilter: partial.exitStatusFilter !== undefined && isValidExit(partial.exitStatusFilter) ? partial.exitStatusFilter : current.exitStatusFilter,
      dateRangeFilter: partial.dateRangeFilter !== undefined && isValidDate(partial.dateRangeFilter) ? partial.dateRangeFilter : current.dateRangeFilter,
      slotFilter: partial.slotFilter !== undefined && isValidSlot(partial.slotFilter) ? partial.slotFilter : current.slotFilter,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}
