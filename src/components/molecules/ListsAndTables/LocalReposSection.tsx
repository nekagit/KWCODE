"use client";

import { useState, useEffect } from "react";
import { FolderOpen } from "lucide-react";
import { invoke, isTauri } from "@/lib/tauri";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/shared/EmptyState";
import { TitleWithIcon } from "@/components/atoms/headers/TitleWithIcon";
import { LocalProjectListItem } from "@/components/atoms/list-items/LocalProjectListItem";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { getClasses } from "@/components/molecules/tailwind-molecules";
import { toast } from "sonner";
const classes = getClasses("ListsAndTables/LocalReposSection.tsx");

/**
 * Lists all folders in the configured projects root so the user can create a project from a path
 * without having to find or type it. Uses Tauri list_february_folders or /api/data/february-folders.
 * Shown inside a collapsible section that is collapsed by default.
 */
export function LocalReposSection() {
  const [localPaths, setLocalPaths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const done = () => {
      if (!cancelled) setLoading(false);
    };
    const apply = (paths: string[]) => {
      if (!cancelled) setLocalPaths(Array.isArray(paths) ? paths : []);
    };

    const fetchFromApi = () =>
      fetch("/api/data/february-folders")
        .then((r) => (r.ok ? r.json() : { folders: [] }))
        .then((data) => Array.isArray(data.folders) ? data.folders : [] as string[])
        .catch(() => [] as string[]);

    if (isTauri) {
      // In Tauri, always use the Rust backend so listing uses the app's filesystem context and february-dir.txt resolution (same as exe/cwd).
      invoke<string[]>("list_february_folders")
        .then((paths) => {
          if (!cancelled) apply(paths ?? []);
        })
        .catch(() => {
          if (!cancelled) apply([]);
        })
        .finally(done);
    } else {
      fetchFromApi().then((paths) => {
        if (!cancelled) apply(paths);
      }).finally(done);
    }
    return () => {
      cancelled = true;
    };
  }, []);

  const triggerLabel =
    localPaths.length > 0
      ? `Local repos (${localPaths.length})`
      : "Local repos";

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <p className={classes[0]}>
            Folders in the configured projects directory (or directories). Create a project from one to avoid typing the path.
          </p>
          <div className={classes[1]}>Loading…</div>
        </>
      );
    }
    if (localPaths.length === 0) {
      return (
        <>
          <p className={classes[0]}>
            Folders in the configured projects directory.
          </p>
          <EmptyState
            icon={FolderOpen}
            message="No project folders found"
            description="No subfolders in the configured projects directory, or the app cannot read that path. Set data/february-dir.txt (one path per line) or FEBRUARY_DIR (paths separated by ; or ,), or run from the Tauri desktop app."
          />
        </>
      );
    }
    return (
      <>
        <p className={classes[0]}>
          All {localPaths.length} folders in the configured projects directory (or directories). Create a project from one to avoid typing the path. Tip: add more parent paths in <code className="rounded bg-muted px-1 py-0.5 text-[10px]">data/february-dir.txt</code> (one per line) or <code className="rounded bg-muted px-1 py-0.5 text-[10px]">FEBRUARY_DIR</code> (paths separated by <code className="rounded bg-muted px-0.5 text-[10px]">;</code> or <code className="rounded bg-muted px-0.5 text-[10px]">,</code>) to see repos from other folders.
        </p>
        {isTauri && (
          <div className="flex flex-wrap gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] text-muted-foreground"
              onClick={async () => {
                try {
                  const out = await invoke<{ root: string; count: number; names: string[] }>("list_february_folders_debug");
                  const msg = `Backend sees ${out.count} folders under ${out.root}. Names: ${(out.names ?? []).join(", ")}`;
                  toast.info(msg, { duration: 8000 });
                  console.log("list_february_folders_debug", out);
                } catch (e) {
                  toast.error(String(e));
                }
              }}
            >
              Check backend count
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] text-muted-foreground"
              onClick={async () => {
                try {
                  const out = await invoke<{
                    root: string;
                    total_entries: number;
                    included_count: number;
                    skipped: { name: string; is_dir: boolean; is_symlink: boolean; file_type_err: string | null }[];
                    entries: { name: string; included: boolean; is_dir: boolean; is_symlink: boolean; file_type_err: string | null }[];
                  }>("list_february_folders_debug_entries");
                  console.log("list_february_folders_debug_entries", out);
                  if (out.skipped?.length > 0) {
                    const skippedList = out.skipped
                      .map((s) => `${s.name} (is_dir=${s.is_dir}, is_symlink=${s.is_symlink}${s.file_type_err ? `, err=${s.file_type_err}` : ""})`)
                      .join("; ");
                    toast.warning(`Skipped ${out.skipped.length}: ${skippedList}`, { duration: 12000 });
                  } else {
                    toast.info(`All ${out.total_entries} entries included. Root: ${out.root}`, { duration: 6000 });
                  }
                } catch (e) {
                  toast.error(String(e));
                }
              }}
            >
              Debug: why skipped?
            </Button>
          </div>
        )}
        <ScrollArea className={classes[4]}>
          <ul className={classes[5]}>
            {localPaths.map((path, i) => (
              <LocalProjectListItem key={i} path={path} />
            ))}
          </ul>
        </ScrollArea>
      </>
    );
  };

  return (
    <Accordion type="single" collapsible className={classes[6]}>
      <AccordionItem value="local-repos" className={classes[7]}>
        <AccordionTrigger className={classes[8]}>
          <TitleWithIcon icon={FolderOpen} title={triggerLabel} className={classes[9]} iconClassName="text-success/90" />
        </AccordionTrigger>
        <AccordionContent className={classes[10]}>
          {renderContent()}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
