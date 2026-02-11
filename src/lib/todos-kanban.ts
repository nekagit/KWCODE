/**
 * Parsed feature from .cursor/features.md (checklist line with ticket refs).
 */
export type ParsedFeature = {
  id: string;
  title: string;
  ticketRefs: number[];
  done: boolean;
};

/**
 * Parsed ticket from .cursor/tickets.md (checklist item under a feature and priority).
 */
export type ParsedTicket = {
  id: string;
  number: number;
  title: string;
  description?: string;
  priority: "P0" | "P1" | "P2" | "P3";
  featureName: string;
  done: boolean;
  status: "Todo" | "Done";
};

/**
 * JSON structure used for Kanban display and export.
 */
export type TodosKanbanData = {
  features: ParsedFeature[];
  tickets: ParsedTicket[];
  /** ISO date when parsed (for display). */
  parsedAt: string;
};

const FEATURE_CHECKLIST_RE = /^-\s*\[([ x])\]\s+(.+)$/gm;
const TICKET_REF_RE = /#(\d+)/g;

/**
 * Parse .cursor/features.md into a list of features (checklist items with optional #N refs).
 */
export function parseFeaturesMd(content: string): ParsedFeature[] {
  if (!content?.trim()) return [];
  const features: ParsedFeature[] = [];
  let match: RegExpExecArray | null;
  FEATURE_CHECKLIST_RE.lastIndex = 0;
  while ((match = FEATURE_CHECKLIST_RE.exec(content)) !== null) {
    const done = match[1].toLowerCase() === "x";
    const rest = match[2].trim();
    const ticketRefs: number[] = [];
    let refM: RegExpExecArray | null;
    TICKET_REF_RE.lastIndex = 0;
    while ((refM = TICKET_REF_RE.exec(rest)) !== null) ticketRefs.push(parseInt(refM[1], 10));
    const title = rest.replace(/\s*—\s*#[\d,\s#]+$/, "").replace(/\s*#\d+(\s*,\s*#\d+)*\s*$/, "").trim() || rest;
    const id = `feature-${features.length + 1}-${title.slice(0, 30).replace(/\s+/g, "-")}`;
    features.push({ id, title, ticketRefs, done });
  }
  return features;
}

const PRIORITY_HEADER_RE = /^###\s+(P[0-3])\s+/m;
const FEATURE_HEADER_RE = /^####\s*Feature:\s*(.+?)(?:\n|$)/gm;
const TICKET_ITEM_RE = /^-\s*\[([ x])\]\s+#(\d+)\s+(.+?)(?:\s*—\s*(.+))?$/gm;

/**
 * Parse .cursor/tickets.md into a list of tickets (checklist items by priority and feature).
 */
export function parseTicketsMd(content: string): ParsedTicket[] {
  if (!content?.trim()) return [];
  const tickets: ParsedTicket[] = [];
  const lines = content.split("\n");
  let currentPriority: "P0" | "P1" | "P2" | "P3" = "P0";
  let currentFeature = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const pMatch = line.match(/^###\s+(P[0-3])\s+/);
    if (pMatch) {
      currentPriority = pMatch[1] as "P0" | "P1" | "P2" | "P3";
      continue;
    }
    const fMatch = line.match(/^####\s*Feature:\s*(.+)/);
    if (fMatch) {
      currentFeature = fMatch[1].trim();
      continue;
    }
    const tMatch = line.match(/^-\s*\[([ x])\]\s+#(\d+)\s+(.+)/);
    if (tMatch) {
      const done = tMatch[1].toLowerCase() === "x";
      const num = parseInt(tMatch[2], 10);
      const rest = tMatch[3].trim();
      const dashIdx = rest.indexOf(" — ");
      const title = dashIdx >= 0 ? rest.slice(0, dashIdx).trim() : rest;
      const description = dashIdx >= 0 ? rest.slice(dashIdx + 3).trim() : undefined;
      const id = `ticket-${num}`;
      tickets.push({
        id,
        number: num,
        title,
        description,
        priority: currentPriority,
        featureName: currentFeature,
        done,
        status: done ? "Done" : "Todo",
      });
    }
  }
  return tickets;
}

/**
 * Parse both markdown contents into a single JSON structure for Kanban and export.
 */
export function parseTodosToKanban(featureIds: string[] | undefined, ticketIds: string[] | undefined): TodosKanbanData {
  // These are just placeholders, as the actual parsing happens from markdown files.
  // The ProjectTicketsTab component currently passes Project.ticketIds and Project.featureIds (arrays of strings/numbers).
  // These functions expect markdown content (string).
  // For now, we'll return empty arrays or mock data until the parsing logic is aligned.
  // This needs to be resolved by ensuring project.ticketIds and project.featureIds are raw markdown content
  // or by providing a way to fetch the markdown content here.
  return {
    features: [],
    tickets: [],
    parsedAt: new Date().toISOString(),
  };
}

const TICKET_LINE_RE = /^(-\s*)\[\s\](\s+#\d+\s+.+)$/gm;

/**
 * Mark given ticket numbers as done in .cursor/tickets.md content.
 * Replaces `- [ ] #N` with `- [x] #N` for each N in ticketNumbers.
 */
export function markTicketsDone(tickets: ParsedTicket[], ticketIds: string[]): ParsedTicket[] {
  if (!ticketIds.length) return tickets;
  const ticketIdsSet = new Set(ticketIds);
  return tickets.map((ticket) => ({
    ...ticket,
    done: ticketIdsSet.has(ticket.id) ? true : ticket.done,
  }));
}

/**
 * Validation result for features.md and tickets.md correlation (per .cursor/sync.md).
 */
export type CorrelationValidation = {
  ok: boolean;
  /** Human-readable summary message. */
  message: string;
  /** Detailed issues (errors) and info (e.g. tickets not in features). */
  details: string[];
  /** Indicates if there are invalid features (features referencing non-existent tickets or tickets not linked to project). */
  hasInvalidFeatures: boolean;
};

/**
 * Validate features.md and tickets.md correlation per .cursor/sync.md.
 * Errors (cause ok=false): refs in features that don't exist in tickets; features without ticket refs;
 * feature names in tickets without matching feature in features.
 * Info (in details but ok=true): tickets not referenced in any feature.
 */
export function validateFeaturesTicketsCorrelation(
  kanbanData: TodosKanbanData
): CorrelationValidation {
  const details: string[] = [];
  const features = kanbanData.features;
  const tickets = kanbanData.tickets;

  const ticketNumbers = new Set(tickets.map((t) => t.number));
  const refsInFeatures = new Set(features.flatMap((f) => f.ticketRefs));
  const ticketsFeatureNames = new Set(tickets.map((t) => t.featureName.toLowerCase().trim()).filter(Boolean));

  const refsOnlyInFeatures = [...refsInFeatures].filter((n) => !ticketNumbers.has(n));
  const ticketsNotInFeatures = [...ticketNumbers].filter((n) => !refsInFeatures.has(n));

  let hasInvalidFeatures = false;

  if (refsOnlyInFeatures.length > 0) {
    details.push(
      `Ticket number(s) in features.md not found in tickets.md: #${refsOnlyInFeatures.sort((a, b) => a - b).join(", #")}.`
    );
    hasInvalidFeatures = true;
  }
  if (features.some((f) => f.ticketRefs.length === 0)) {
    const withoutRefs = features.filter((f) => f.ticketRefs.length === 0).map((f) => f.title);
    details.push(
      `features.md has checklist items without ticket refs (#N): ${withoutRefs.join("; ")}. Each feature should reference at least one ticket.`
    );
    hasInvalidFeatures = true;
  }
  const featureTitlesLower = new Set(features.map((f) => f.title.toLowerCase().trim()));
  const missingFeatures = [...ticketsFeatureNames].filter(
    (fn) => ![...featureTitlesLower].some((ft) => ft.includes(fn) || fn.includes(ft))
  );
  if (missingFeatures.length > 0 && ticketsFeatureNames.size > 0) {
    details.push(
      `Feature name(s) in tickets.md without matching feature in features.md: ${missingFeatures.join(", ")}. Add a feature line for each.`
    );
    hasInvalidFeatures = true;
  }
  const errorCount = details.length;
  if (ticketsNotInFeatures.length > 0) {
    details.push(
      `Ticket(s) in tickets.md not referenced in any feature: #${ticketsNotInFeatures.sort((a, b) => a - b).join(", #")}. Add to a feature for full correlation.`
    );
  }

  const ok = errorCount === 0;
  return {
    ok,
    message: ok
      ? "features.md and tickets.md are in sync (correlation and format check passed)."
      : "features.md and tickets.md need to be aligned.",
    details,
    hasInvalidFeatures,
  };
}

/**
 * Mark the feature checklist line that has the given ticket refs as done in .cursor/features.md.
 * Finds a line like `- [ ] Feature name — #1, #2` where the set of #N equals ticketRefs and sets [x].
 */
export function markFeatureDoneByTicketRefs(featuresMd: string, ticketRefs: number[]): string {
  if (!ticketRefs.length) return featuresMd;
  const refSet = new Set(ticketRefs);
  const lines = featuresMd.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const openMatch = line.match(/^(-\s*)\[\s\]\s+(.+)$/);
    if (!openMatch) continue;
    const rest = openMatch[2];
    const refsInLine: number[] = [];
    let m: RegExpExecArray | null;
    const re = /#(\d+)/g;
    while ((m = re.exec(rest)) !== null) refsInLine.push(parseInt(m[1], 10));
    const lineSet = new Set(refsInLine);
    if (refSet.size === lineSet.size && [...refSet].every((r) => lineSet.has(r))) {
      lines[i] = line.replace(/^(-\s*)\[\s\]/, "$1[x]");
      return lines.join("\n");
    }
  }
  return featuresMd;
}
