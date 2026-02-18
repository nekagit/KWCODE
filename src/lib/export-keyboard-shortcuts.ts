import type { ShortcutGroup } from "@/data/keyboard-shortcuts";
import { KEYBOARD_SHORTCUT_GROUPS } from "@/data/keyboard-shortcuts";
import { toast } from "sonner";

/**
 * Format keyboard shortcut groups as plain text (for clipboard).
 * Format: group title, then "Keys\tDescription" lines per shortcut.
 */
export function formatKeyboardShortcutsAsPlainText(
  groups: ShortcutGroup[] = KEYBOARD_SHORTCUT_GROUPS
): string {
  const lines: string[] = [];
  for (const group of groups) {
    lines.push(group.title);
    lines.push("");
    for (const entry of group.shortcuts) {
      lines.push(`${entry.keys}\t${entry.description}`);
    }
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}

/**
 * Format keyboard shortcut groups as Markdown.
 * Format: # title per group, then table | Keys | Action |
 */
export function formatKeyboardShortcutsAsMarkdown(
  groups: ShortcutGroup[] = KEYBOARD_SHORTCUT_GROUPS
): string {
  const lines: string[] = [
    "# Keyboard shortcuts",
    "",
    `Exported: ${new Date().toISOString()}`,
    "",
    "---",
    "",
  ];
  for (const group of groups) {
    lines.push(`## ${group.title}`);
    lines.push("");
    lines.push("| Keys | Action |");
    lines.push("| --- | --- |");
    for (const entry of group.shortcuts) {
      const keys = entry.keys.replace(/\|/g, "\\|");
      const desc = entry.description.replace(/\|/g, "\\|");
      lines.push(`| ${keys} | ${desc} |`);
    }
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}

/**
 * Download the keyboard shortcuts list as a Markdown file.
 * Filename: keyboard-shortcuts-YYYY-MM-DD-HHmm.md
 */
export function downloadKeyboardShortcutsAsMarkdown(): void {
  const markdown = formatKeyboardShortcutsAsMarkdown();
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5).replace(":", "");
  const filename = `keyboard-shortcuts-${date}-${time}.md`;

  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast.success("Keyboard shortcuts exported as Markdown");
}
