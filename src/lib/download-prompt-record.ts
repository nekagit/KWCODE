import { toast } from "sonner";

/**
 * Sanitize a string for use in a filename: replace unsafe chars with underscore, limit length.
 */
function safeTitleForFile(title: string, maxLength = 60): string {
  const sanitized = title.replace(/[^\w\s-]/g, "_").replace(/\s+/g, "-").trim();
  return sanitized.slice(0, maxLength) || "prompt";
}

/**
 * Download a prompt record as a markdown file.
 * Filename: prompt-{title}-{YYYY-MM-DD-HHmm}.md
 */
export function downloadPromptRecord(title: string, content: string): void {
  if (content == null || String(content).trim() === "") {
    toast.info("Nothing to download");
    return;
  }

  const segment = safeTitleForFile(title);
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5).replace(":", "");
  const filename = `prompt-${segment}-${date}-${time}.md`;

  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success("Prompt downloaded");
}
