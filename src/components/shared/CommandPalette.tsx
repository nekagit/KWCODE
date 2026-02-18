"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { LayoutDashboard, MessageSquare, Folders, FolderOpen, FolderPlus, Lightbulb, Cpu, LayoutGrid, Settings, Moon, Keyboard, Loader2, RefreshCw, X, Activity, BookOpen, Printer, ChevronUp, Focus, ClipboardList, HardDrive } from "lucide-react";
import { useQuickActions } from "@/context/quick-actions-context";
import { useUITheme } from "@/context/ui-theme";
import { isValidUIThemeId } from "@/data/ui-theme-templates";
import { getApiHealth } from "@/lib/api-health";
import { getAppVersion } from "@/lib/app-version";
import { copyAppInfoToClipboard } from "@/lib/copy-app-info";
import { openAppDataFolderInFileManager } from "@/lib/open-app-data-folder";
import { openDocumentationFolderInFileManager } from "@/lib/open-documentation-folder";
import { listProjects } from "@/lib/api-projects";
import { isTauri } from "@/lib/tauri";
import { getRecentProjectIds } from "@/lib/recent-projects";
import type { Project } from "@/types/project";
import { useRunStore } from "@/store/run-store";
import { toast } from "sonner";
import { CommandPaletteAnnouncer } from "@/components/shared/CommandPaletteAnnouncer";

export type CommandPaletteEntry =
  | { href: string; label: string; icon: React.ComponentType<{ className?: string }>; onSelect?: never }
  | { href?: never; label: string; icon: React.ComponentType<{ className?: string }>; onSelect: () => void };

/** Nav entries aligned with SidebarNavigation (Dashboard, Tools, Work, System). */
const NAV_ENTRIES: CommandPaletteEntry[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/technologies", label: "Technologies", icon: Cpu },
  { href: "/projects", label: "Projects", icon: Folders },
  { href: "/projects/new", label: "New project", icon: FolderPlus },
  { href: "/prompts", label: "Prompts", icon: MessageSquare },
  { href: "/?tab=all", label: "Database", icon: LayoutGrid },
  { href: "/documentation", label: "Documentation", icon: BookOpen },
  { href: "/configuration", label: "Configuration", icon: Settings },
  { href: "/loading-screen", label: "Loading", icon: Moon },
];

function filterEntries(entries: CommandPaletteEntry[], query: string): CommandPaletteEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return entries;
  return entries.filter((e) => e.label.toLowerCase().includes(q));
}

export function CommandPalette() {
  const router = useRouter();
  const { openShortcutsModal } = useQuickActions();
  const { theme: uiTheme } = useUITheme();
  const refreshData = useRunStore((s) => s.refreshData);
  const activeProjects = useRunStore((s) => s.activeProjects);
  const effectiveTheme = isValidUIThemeId(uiTheme) ? uiTheme : "light";
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load projects when palette opens so "Go to project" entries are available
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    listProjects()
      .then((list) => {
        if (!cancelled) setProjects(list ?? []);
      })
      .catch(() => {
        if (!cancelled) setProjects([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleRefreshData = useCallback(() => {
    refreshData().then(() => toast.success("Data refreshed")).catch(() => toast.error("Refresh failed"));
  }, [refreshData]);

  const closePalette = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  const goToRun = useCallback(async () => {
    const active = activeProjects;
    if (!active.length) {
      toast.info("Select a project first");
      router.push("/projects");
      return;
    }
    const list = projects ?? (await listProjects().catch(() => []));
    const proj = list?.find((p) => p.repoPath === active[0]);
    if (!proj) {
      toast.info("Open a project first");
      router.push("/projects");
      return;
    }
    router.push(`/projects/${proj.id}?tab=worker`);
  }, [activeProjects, projects, router]);

  const handleCheckApiHealth = useCallback(async () => {
    try {
      const data = await getApiHealth();
      closePalette();
      const msg =
        data.ok && data.version
          ? `API health: OK (${data.version})`
          : "API health: OK";
      toast.success(msg);
    } catch {
      closePalette();
      toast.error("API health: Unavailable");
    }
  }, [closePalette]);

  const handleCopyAppInfo = useCallback(async () => {
    const version = await getAppVersion().catch(() => "—");
    const ok = await copyAppInfoToClipboard({ version, theme: effectiveTheme });
    if (ok) closePalette();
  }, [closePalette, effectiveTheme]);

  const handleOpenDocumentationFolder = useCallback(async () => {
    await openDocumentationFolderInFileManager();
    closePalette();
  }, [closePalette]);

  const handleOpenAppDataFolder = useCallback(async () => {
    await openAppDataFolderInFileManager();
    closePalette();
  }, [closePalette]);

  const actionEntries: CommandPaletteEntry[] = useMemo(() => {
    const entries: CommandPaletteEntry[] = [
      { label: "Refresh data", icon: RefreshCw, onSelect: handleRefreshData },
      { label: "Go to Run", icon: Activity, onSelect: () => { goToRun(); closePalette(); } },
      { label: "Keyboard shortcuts", icon: Keyboard, onSelect: openShortcutsModal },
      { label: "Copy app info", icon: ClipboardList, onSelect: handleCopyAppInfo },
      { label: "Open data folder", icon: HardDrive, onSelect: handleOpenAppDataFolder },
      { label: "Open documentation folder", icon: FolderOpen, onSelect: handleOpenDocumentationFolder },
      { label: "Print current page", icon: Printer, onSelect: () => { window.print(); closePalette(); } },
      { label: "Scroll to top", icon: ChevronUp, onSelect: () => { const main = document.getElementById("main-content"); if (main) main.scrollTop = 0; closePalette(); } },
      { label: "Focus main content", icon: Focus, onSelect: () => { document.getElementById("main-content")?.focus(); closePalette(); } },
    ];
    if (!isTauri) {
      entries.push({
        label: "Check API health",
        icon: Activity,
        onSelect: handleCheckApiHealth,
      });
    }
    return entries;
  }, [handleRefreshData, goToRun, closePalette, openShortcutsModal, handleCheckApiHealth, handleCopyAppInfo, handleOpenAppDataFolder, handleOpenDocumentationFolder]);
  const projectEntries: CommandPaletteEntry[] = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    const recentIds = getRecentProjectIds();
    const byRecentFirst = [...projects].sort((a, b) => {
      const ai = recentIds.indexOf(a.id);
      const bi = recentIds.indexOf(b.id);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
    return byRecentFirst.map((p) => ({
      href: `/projects/${p.id}`,
      label: p.name,
      icon: FolderOpen as React.ComponentType<{ className?: string }>,
    }));
  }, [projects]);
  const allEntries = useMemo(
    () => [...actionEntries, ...projectEntries, ...NAV_ENTRIES],
    [actionEntries, projectEntries]
  );

  const filtered = filterEntries(allEntries, query);
  const selectedEntry = filtered[selectedIndex] ?? null;

  const openPalette = useCallback(() => {
    setOpen(true);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  // Global ⌘K / Ctrl+K
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openPalette();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openPalette]);

  // Go to Dashboard: ⌘⇧H (Mac) / Ctrl+Alt+D (Windows/Linux); skip when palette open or focus in input/textarea/select
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (open) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const goDashboard =
        isMac ? e.metaKey && e.shiftKey && e.key === "H" : e.ctrlKey && e.altKey && e.key === "d";
      if (goDashboard) {
        e.preventDefault();
        router.push("/");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, router]);

  // Go to Projects: ⌘⇧P (Mac) / Ctrl+Alt+P (Windows/Linux); same guards as Dashboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (open) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const goProjects =
        isMac ? e.metaKey && e.shiftKey && e.key === "P" : e.ctrlKey && e.altKey && e.key === "p";
      if (goProjects) {
        e.preventDefault();
        router.push("/projects");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, router]);

  // Go to Prompts: ⌘⇧M (Mac) / Ctrl+Alt+M (Windows/Linux); same guards as Dashboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (open) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const goPrompts =
        isMac ? e.metaKey && e.shiftKey && e.key === "M" : e.ctrlKey && e.altKey && e.key === "m";
      if (goPrompts) {
        e.preventDefault();
        router.push("/prompts");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, router]);

  // Go to Ideas: ⌘⇧I (Mac) / Ctrl+Alt+I (Windows/Linux); same guards as Dashboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (open) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const goIdeas =
        isMac ? e.metaKey && e.shiftKey && e.key === "I" : e.ctrlKey && e.altKey && e.key === "i";
      if (goIdeas) {
        e.preventDefault();
        router.push("/ideas");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, router]);

  // Go to Technologies: ⌘⇧T (Mac) / Ctrl+Alt+T (Windows/Linux); same guards as Dashboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (open) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const goTechnologies =
        isMac ? e.metaKey && e.shiftKey && e.key === "T" : e.ctrlKey && e.altKey && e.key === "t";
      if (goTechnologies) {
        e.preventDefault();
        router.push("/technologies");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, router]);

  // Go to Configuration: ⌘⇧O (Mac) / Ctrl+Alt+O (Windows/Linux); same guards as Dashboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (open) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const goConfig =
        isMac ? e.metaKey && e.shiftKey && e.key === "O" : e.ctrlKey && e.altKey && e.key === "o";
      if (goConfig) {
        e.preventDefault();
        router.push("/configuration");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, router]);

  // Go to Loading: ⌘⇧L (Mac) / Ctrl+Alt+L (Windows/Linux); same guards as Dashboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (open) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const goLoading =
        isMac ? e.metaKey && e.shiftKey && e.key === "L" : e.ctrlKey && e.altKey && e.key === "l";
      if (goLoading) {
        e.preventDefault();
        router.push("/loading-screen");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, router]);

  // Go to Database: ⌘⇧G (Mac) / Ctrl+Alt+G (Windows/Linux); same guards as Dashboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (open) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const goDatabase =
        isMac ? e.metaKey && e.shiftKey && e.key === "G" : e.ctrlKey && e.altKey && e.key === "g";
      if (goDatabase) {
        e.preventDefault();
        router.push("/?tab=all");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, router]);

  // Go to New project: ⌘⇧N (Mac) / Ctrl+Alt+N (Windows/Linux); same guards as Dashboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (open) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const goNewProject =
        isMac ? e.metaKey && e.shiftKey && e.key === "N" : e.ctrlKey && e.altKey && e.key === "n";
      if (goNewProject) {
        e.preventDefault();
        router.push("/projects/new");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, router]);

  // Go to Run: ⌘⇧W (Mac) / Ctrl+Alt+W (Windows/Linux); same guards as Dashboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (open) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const goRun =
        isMac ? e.metaKey && e.shiftKey && e.key === "W" : e.ctrlKey && e.altKey && e.key === "w";
      if (goRun) {
        e.preventDefault();
        goToRun();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, goToRun]);

  // Go to Documentation: ⌘⇧D (Mac) / Ctrl+Alt+E (Windows/Linux); same guards as Dashboard (D is used for Dashboard on Windows)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (open) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const goDoc =
        isMac ? e.metaKey && e.shiftKey && e.key === "D" : e.ctrlKey && e.altKey && e.key === "e";
      if (goDoc) {
        e.preventDefault();
        router.push("/documentation");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, router]);

  // Refresh data: ⌘⇧R (Mac) / Ctrl+Alt+R (Windows/Linux); same guards as Dashboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (open) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const refreshDataShortcut =
        isMac ? e.metaKey && e.shiftKey && e.key === "R" : e.ctrlKey && e.altKey && e.key === "r";
      if (refreshDataShortcut) {
        e.preventDefault();
        handleRefreshData();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleRefreshData]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Keep selected index in bounds when filter changes
  useEffect(() => {
    setSelectedIndex((i) => (filtered.length ? Math.min(i, filtered.length - 1) : 0));
  }, [filtered.length]);

  const selectEntry = useCallback(
    (entry: CommandPaletteEntry) => {
      if (entry.onSelect) {
        entry.onSelect();
        closePalette();
      } else if (entry.href) {
        router.push(entry.href);
        closePalette();
      }
    },
    [router, closePalette]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closePalette();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i < filtered.length - 1 ? i + 1 : 0));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i > 0 ? i - 1 : filtered.length - 1));
        return;
      }
      if (e.key === "Enter" && selectedEntry) {
        e.preventDefault();
        selectEntry(selectedEntry);
      }
    },
    [open, closePalette, filtered.length, selectedEntry, selectEntry]
  );

  return (
    <>
      <CommandPaletteAnnouncer open={open} />
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && closePalette()}>
      <DialogContent
        className="sm:max-w-lg p-0 gap-0 overflow-hidden"
        onKeyDown={handleKeyDown}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="p-2 border-b border-border flex items-center gap-1">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search pages and projects…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 h-9 flex-1"
            aria-label="Search command palette"
          />
          {query.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[min(60vh,320px)]">
          <div className="p-1 pb-2" role="listbox" aria-label="Navigation targets">
            {projects === null && (
              <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground" role="status" aria-live="polite">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                <span>Loading projects…</span>
              </div>
            )}
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">No matching pages.</div>
            ) : (
              filtered.map((entry, i) => {
                const isSelected = i === selectedIndex;
                const key = "href" in entry && entry.href ? entry.href + entry.label : "action-" + entry.label;
                return (
                  <button
                    key={key}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                      isSelected
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-muted/70"
                    )}
                    onClick={() => selectEntry(entry)}
                    onMouseEnter={() => setSelectedIndex(i)}
                  >
                    <entry.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{entry.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
        <div className="px-3 py-2 border-t border-border bg-muted/30 text-[10px] text-muted-foreground flex items-center gap-4">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
