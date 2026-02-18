import { getFullProjectExport } from "@/lib/api-projects";

/**
 * Sanitize a string for use in a filename: replace unsafe chars with underscore, limit length.
 */
function safeFilenameSegment(name: string, maxLength = 80): string {
  const sanitized = name.replace(/[^\w\s-]/g, "_").replace(/\s+/g, "-").trim();
  return sanitized.slice(0, maxLength) || "project";
}

/**
 * Download the full project export (project + prompts, tickets, ideas, designs, architectures) as a JSON file.
 * Filename: {projectName}-{YYYY-MM-DD}.json
 */
export async function downloadProjectExport(
  projectId: string,
  projectName: string
): Promise<void> {
  const json = await getFullProjectExport(projectId);
  const date = new Date().toISOString().slice(0, 10);
  const segment = safeFilenameSegment(projectName);
  const filename = `${segment}-${date}.json`;

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
