import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Parse error message from an API response (JSON body or status text). Avoids showing raw JSON or generic "Internal Server Error". */
export async function getApiErrorMessage(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const j = JSON.parse(text) as { error?: string; detail?: string };
    if (j?.error && typeof j.error === "string") return j.error;
    if (j?.detail && typeof j.detail === "string") return j.detail;
  } catch {
    // not JSON
  }
  if (text?.trim()) return text.trim().slice(0, 200);
  return res.status === 500 ? "Server error loading data" : res.statusText || "Request failed";
}
