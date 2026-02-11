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
