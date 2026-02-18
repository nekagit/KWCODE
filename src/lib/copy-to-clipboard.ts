import { toast } from "sonner";

/**
 * Copy text to the clipboard and show a success or error toast.
 * Returns true if the copy succeeded, false otherwise.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text.trim()) {
    toast.error("Nothing to copy");
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
    return true;
  } catch {
    toast.error("Failed to copy");
    return false;
  }
}
