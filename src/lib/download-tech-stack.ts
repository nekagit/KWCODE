import { toast } from "sonner";

/**
 * Shape of tech-stack.json: name?, description?, frontend?, backend?, tooling?
 */
export type TechStackExport = {
  name?: string;
  description?: string;
  frontend?: Record<string, string>;
  backend?: Record<string, string>;
  tooling?: Record<string, string>;
};

/**
 * Download the current tech stack as a JSON file.
 * Filename: tech-stack-{YYYY-MM-DD-HHmm}.json
 * If data is null/undefined, shows a toast and does nothing.
 */
export function downloadTechStack(data: TechStackExport | null | undefined): void {
  if (data == null) {
    toast.info("No tech stack to export");
    return;
  }

  const json = JSON.stringify(data, null, 2);
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5).replace(":", "");
  const filename = `tech-stack-${date}-${time}.json`;

  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast.success("Tech stack exported");
}
