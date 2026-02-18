/**
 * Sanitize a string for use in a filename: replace unsafe chars with underscore, limit length.
 */
function safeLabelForFile(label: string, maxLength = 60): string {
  const sanitized = label.replace(/[^\w\s-]/g, "_").replace(/\s+/g, "-").trim();
  return sanitized.slice(0, maxLength) || "run";
}

/**
 * Download run output as a plain-text file.
 * Filename: run-{label}-{YYYY-MM-DD-HHmm}.txt
 */
export function downloadRunOutput(output: string, label: string): void {
  const segment = safeLabelForFile(label);
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5).replace(":", "");
  const filename = `run-${segment}-${date}-${time}.txt`;

  const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
