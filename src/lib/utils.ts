import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const FRIENDLY_500 = "Server error loading data";

/** Parse error message from an API response (JSON body or status text). Avoids showing raw JSON or generic "Internal Server Error". */
export async function getApiErrorMessage(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const j = JSON.parse(text) as { error?: string; detail?: string };
    const msg = (j?.error && typeof j.error === "string" ? j.error : null) ?? (j?.detail && typeof j.detail === "string" ? j.detail : null);
    if (msg) {
      // Normalize generic server message so UI never shows "Internal Server Error"
      if (msg.trim() === "Internal Server Error") return FRIENDLY_500;
      return msg;
    }
  } catch {
    // not JSON
  }
  if (text?.trim()) {
    const trimmed = text.trim().slice(0, 200);
    if (trimmed === "Internal Server Error") return FRIENDLY_500;
    return trimmed;
  }
  return res.status === 500 ? FRIENDLY_500 : res.statusText || "Request failed";
}

/** Pseudo-random 0..1 from index (different primes to avoid column/row patterns). */
export function scatter(i: number, prime: number, mod: number) {
  return ((i * prime) % mod) / mod;
}

export function normalizePath(p: string) {
  return p.replace(/\\/g, "/");
}

export function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { dateStyle: "short" }) + " " + d.toLocaleTimeString(undefined, { timeStyle: "short" });
  } catch {
    return iso;
  }
}
