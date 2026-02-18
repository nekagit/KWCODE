import { toast } from "sonner";
import {
  filenameTimestamp,
  triggerFileDownload,
} from "@/lib/download-helpers";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";

const DESCRIPTION =
  "App documentation lives in the repository. Use your editor or file manager to open the following locations.";

const PATHS = [
  {
    path: ".cursor/documentation/",
    description:
      "setup guide, development guide, architecture overview, API reference",
  },
  {
    path: "docs/",
    description:
      "Docusaurus-ready docs (getting started, architecture, development, api, guides, contributing)",
  },
] as const;

export type DocumentationInfoJsonPayload = {
  exportedAt: string;
  description: string;
  paths: Array<{ path: string; description: string }>;
};

/**
 * Build the JSON payload for Documentation page export.
 * Same information as the Markdown export (description + paths).
 * Optional exportedAt for deterministic tests.
 */
export function buildDocumentationInfoJsonPayload(
  exportedAt?: string
): DocumentationInfoJsonPayload {
  const at = exportedAt ?? new Date().toISOString();
  return {
    exportedAt: at,
    description: DESCRIPTION,
    paths: PATHS.map((p) => ({ path: p.path, description: p.description })),
  };
}

/**
 * Download Documentation page info as a JSON file.
 * Filename: documentation-info-{timestamp}.json
 */
export function downloadDocumentationInfoAsJson(): void {
  const payload = buildDocumentationInfoJsonPayload();
  const content = JSON.stringify(payload, null, 2);
  const filename = `documentation-info-${filenameTimestamp()}.json`;
  triggerFileDownload(content, filename, "application/json;charset=utf-8");
  toast.success("Documentation info exported as JSON");
}

/**
 * Copy Documentation page info to the clipboard as pretty-printed JSON.
 * Same payload as downloadDocumentationInfoAsJson.
 */
export async function copyDocumentationInfoAsJsonToClipboard(): Promise<void> {
  const payload = buildDocumentationInfoJsonPayload();
  const content = JSON.stringify(payload, null, 2);
  const ok = await copyTextToClipboard(content);
  if (ok) {
    toast.success("Documentation info copied as JSON");
  } else {
    toast.error("Failed to copy to clipboard");
  }
}
