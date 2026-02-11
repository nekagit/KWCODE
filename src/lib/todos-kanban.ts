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

/** Kanban column for UI (e.g. backlog, in_progress, done, blocked). */
export type KanbanColumn = {
  name: string;
  items: ParsedTicket[];
};

/**
 * JSON structure used for Kanban display and export.
 */
export type TodosKanbanData = {
  features: ParsedFeature[];
  tickets: ParsedTicket[];
  /** ISO date when parsed (for display). */
  parsedAt: string;
  /** Columns keyed by status (backlog, in_progress, done, blocked). */
  columns: Record<string, KanbanColumn>;
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
 * Build Kanban data from .cursor/tickets.md and .cursor/features.md content.
 * Column mapping: ticket.done → done; !ticket.done → backlog. in_progress and blocked stay empty.
 */
export function buildKanbanFromMd(ticketsMd: string, featuresMd: string): TodosKanbanData {
  const tickets = parseTicketsMd(ticketsMd);
  const features = parseFeaturesMd(featuresMd);
  const columns: Record<string, KanbanColumn> = {
    backlog: { name: "Backlog", items: [] },
    in_progress: { name: "In progress", items: [] },
    done: { name: "Done", items: [] },
    blocked: { name: "Blocked", items: [] },
  };
  for (const t of tickets) {
    if (t.done) columns.done.items.push(t);
    else columns.backlog.items.push(t);
  }
  return {
    features,
    tickets,
    parsedAt: new Date().toISOString(),
    columns,
  };
}

/**
 * Parse both markdown contents into a single JSON structure for Kanban and export.
 * Prefer buildKanbanFromMd when you have raw markdown; this remains for callers passing project IDs.
 */
export function parseTodosToKanban(featureIds: string[] | undefined, ticketIds: string[] | undefined): TodosKanbanData {
  const columns: Record<string, KanbanColumn> = {
    backlog: { name: "Backlog", items: [] },
    in_progress: { name: "In progress", items: [] },
    done: { name: "Done", items: [] },
    blocked: { name: "Blocked", items: [] },
  };
  return {
    features: [],
    tickets: [],
    parsedAt: new Date().toISOString(),
    columns,
  };
}

const PRIORITY_ORDER: Array<"P0" | "P1" | "P2" | "P3"> = ["P0", "P1", "P2", "P3"];

/**
 * Serialize parsed tickets to full .cursor/tickets.md content (H1, metadata, Summary placeholders, Prioritized work items).
 */
export function serializeTicketsToMd(
  tickets: ParsedTicket[],
  options?: { projectName?: string }
): string {
  const projectName = options?.projectName ?? "project";
  const date = new Date().toISOString().slice(0, 10);
  const lines: string[] = [
    `# Work items (tickets) — ${projectName}`,
    "",
    `**Project:** ${projectName}`,
    "**Source:** Kanban",
    `**Last updated:** ${date}`,
    "",
    "---",
    "",
    "## Summary: Done vs missing",
    "",
    "### Done",
    "",
    "| Area | What's implemented |",
    "|------|--------------------|",
    "",
    "### Missing or incomplete",
    "",
    "| Area | Gap |",
    "",
    "---",
    "",
    "## Prioritized work items (tickets)",
    "",
  ];
  const byPriority = new Map<ParsedTicket["priority"], ParsedTicket[]>();
  for (const p of PRIORITY_ORDER) byPriority.set(p, []);
  for (const t of tickets) byPriority.get(t.priority)!.push(t);
  for (const p of PRIORITY_ORDER) {
    const priorityTickets = byPriority.get(p)!;
    if (priorityTickets.length === 0) continue;
    const label = p === "P0" ? "Critical / foundation" : p === "P1" ? "High / quality and maintainability" : p === "P2" ? "Medium / polish and scale" : "Lower / later";
    lines.push(`### ${p} — ${label}`, "");
    const byFeature = new Map<string, ParsedTicket[]>();
    for (const t of priorityTickets) {
      const fn = t.featureName || "Uncategorized";
      if (!byFeature.has(fn)) byFeature.set(fn, []);
      byFeature.get(fn)!.push(t);
    }
    for (const [featureName, featureTickets] of byFeature) {
      featureTickets.sort((a, b) => a.number - b.number);
      lines.push(`#### Feature: ${featureName}`, "");
      for (const t of featureTickets) {
        const checkbox = t.done ? "[x]" : "[ ]";
        const desc = t.description ? ` — ${t.description}` : "";
        lines.push(`- ${checkbox} #${t.number} ${t.title}${desc}`);
      }
      lines.push("");
    }
  }
  lines.push("## Next steps", "", "1. Add or update tickets in the Kanban.", "");
  return lines.join("\n").replace(/\n{3,}/g, "\n\n");
}

/**
 * Serialize parsed features to .cursor/features.md content (intro + Major features + checklist lines).
 */
export function serializeFeaturesToMd(features: ParsedFeature[]): string {
  const lines: string[] = [
    "# Features roadmap",
    "",
    "Features below are derived from `.cursor/tickets.md`. Each major feature groups one or more work items (tickets); ticket numbers are listed so the Kanban and project details page parse and stay in sync.",
    "",
    "## Major features",
    "",
  ];
  for (const f of features) {
    const checkbox = f.done ? "[x]" : "[ ]";
    const refs = f.ticketRefs.length > 0 ? ` — ${f.ticketRefs.map((n) => `#${n}`).join(", ")}` : "";
    lines.push(`- ${checkbox} ${f.title}${refs}`);
  }
  return lines.join("\n");
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
