/**
 * Central list of keyboard shortcuts and quick actions for the app.
 * Used by ShortcutsHelpDialog and for consistency in docs/tooltips.
 */

export interface ShortcutEntry {
  /** Keys to show (e.g. "Shift + ?", "Enter") */
  keys: string;
  /** What the shortcut does */
  description: string;
}

export interface ShortcutGroup {
  title: string;
  shortcuts: ShortcutEntry[];
}

export const KEYBOARD_SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "Help",
    shortcuts: [
      { keys: "⌘K / Ctrl+K", description: "Open command palette" },
      { keys: "Shift + ?", description: "Open keyboard shortcuts help" },
      { keys: "⌘P / Ctrl+P", description: "Print current page" },
      { keys: "⌘⇧H / Ctrl+Alt+D", description: "Go to Dashboard" },
      { keys: "⌘⇧P / Ctrl+Alt+P", description: "Go to Projects" },
      { keys: "⌘⇧M / Ctrl+Alt+M", description: "Go to Prompts" },
      { keys: "⌘⇧I / Ctrl+Alt+I", description: "Go to Ideas" },
      { keys: "⌘⇧T / Ctrl+Alt+T", description: "Go to Technologies" },
      { keys: "⌘⇧O / Ctrl+Alt+O", description: "Go to Configuration" },
      { keys: "⌘⇧L / Ctrl+Alt+L", description: "Go to Loading" },
      { keys: "⌘⇧G / Ctrl+Alt+G", description: "Go to Database" },
      { keys: "⌘⇧N / Ctrl+Alt+N", description: "Go to New project" },
      { keys: "⌘⇧W / Ctrl+Alt+W", description: "Go to Run" },
      { keys: "⌘⇧D / Ctrl+Alt+E", description: "Go to Documentation" },
      { keys: "⌘⇧R / Ctrl+Alt+R", description: "Refresh data" },
      { keys: "⌘B / Ctrl+B", description: "Toggle sidebar (collapse/expand)" },
    ],
  },
  {
    title: "Navigation",
    shortcuts: [
      { keys: "⌘ Home / Ctrl+Home", description: "Scroll main content to top" },
      { keys: "Tab", description: "Move focus forward" },
      { keys: "Shift + Tab", description: "Move focus backward" },
      { keys: "Enter", description: "Activate focused link or button" },
      { keys: "Space", description: "Activate focused button or toggle" },
    ],
  },
  {
    title: "Dialogs & overlays",
    shortcuts: [
      { keys: "Escape", description: "Close dialog or cancel" },
      { keys: "Enter", description: "Submit form or confirm (when in form)" },
    ],
  },
  {
    title: "Quick actions",
    shortcuts: [
      { keys: "FAB → Configuration", description: "Open Configuration (theme, shortcuts) from the floating action button" },
    ],
  },
];
