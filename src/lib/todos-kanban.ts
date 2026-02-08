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
      });
    }
  }
  return tickets;
}

/**
 * Parse both markdown contents into a single JSON structure for Kanban and export.
 */
export function parseTodosToKanban(featuresMd: string, ticketsMd: string): TodosKanbanData {
  const features = parseFeaturesMd(featuresMd);
  const tickets = parseTicketsMd(ticketsMd);
  return {
    features,
    tickets,
    parsedAt: new Date().toISOString(),
  };
}

const TICKET_LINE_RE = /^(-\s*)\[\s\](\s+#\d+\s+.+)$/gm;

/**
 * Mark given ticket numbers as done in .cursor/tickets.md content.
 * Replaces `- [ ] #N` with `- [x] #N` for each N in ticketNumbers.
 */
export function markTicketsDone(ticketsMd: string, ticketNumbers: number[]): string {
  if (!ticketNumbers.length) return ticketsMd;
  const set = new Set(ticketNumbers);
  return ticketsMd.replace(TICKET_LINE_RE, (_, prefix, rest) => {
    const numMatch = rest.match(/\s*#(\d+)/);
    const num = numMatch ? parseInt(numMatch[1], 10) : 0;
    if (set.has(num)) return `${prefix}[x]${rest}`;
    return `${prefix}[ ]${rest}`;
  });
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
