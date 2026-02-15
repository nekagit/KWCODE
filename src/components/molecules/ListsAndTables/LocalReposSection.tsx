"use client";

import { useState, useEffect } from "react";
import { FolderOpen } from "lucide-react";
import { invoke, isTauri } from "@/lib/tauri";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/shared/EmptyState";
import { TitleWithIcon } from "@/components/atoms/headers/TitleWithIcon";
import { LocalProjectListItem } from "@/components/atoms/list-items/LocalProjectListItem";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getClasses } from "@/components/molecules/tailwind-molecules";
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
      fetchFromApi().then((folders) => {
        if (cancelled) return;
        if (folders.length > 0) {
          apply(folders);
          done();
          return;
        }
        invoke<string[]>("list_february_folders")
          .then((paths) => {
            if (!cancelled) apply(paths ?? []);
          })
          .catch(() => {
            if (!cancelled) apply([]);
          })
          .finally(done);
      });
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
            Folders in the configured projects directory. Create a project from one to avoid typing the path.
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
            description="No subfolders in the configured projects directory, or the app cannot read that path. Set data/february-dir.txt or FEBRUARY_DIR, or run from the Tauri desktop app."
          />
        </>
      );
    }
    return (
      <>
        <p className={classes[0]}>
          All {localPaths.length} folders in the configured projects directory. Create a project from one to avoid typing the path.
        </p>
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
