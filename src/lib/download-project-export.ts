/**
 * Download full project export (JSON). Used by project detail and command palette.
 */
import { getFullProjectExport } from "@/lib/api-projects";
import { safeFilenameSegment, downloadBlob } from "@/lib/download-helpers";

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
  const segment = safeFilenameSegment(projectName, 80, "project");
  const filename = `${segment}-${date}.json`;

  const blob = new Blob([json], { type: "application/json" });
  downloadBlob(blob, filename);
}
