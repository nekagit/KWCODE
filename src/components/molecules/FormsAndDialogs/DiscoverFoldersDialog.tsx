"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog as SharedDialog } from "@/components/shared/Dialog";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, FolderPlus } from "lucide-react";
import { toast } from "sonner";
import {
  discoverFoldersNotInProjects,
  projectNameFromPath,
} from "@/lib/discover-folders";
import { createProject } from "@/lib/api-projects";

interface DiscoverFoldersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after folders were added so the parent can refresh the list. */
  onAdded?: () => void;
}

export function DiscoverFoldersDialog({
  isOpen,
  onClose,
  onAdded,
}: DiscoverFoldersDialogProps) {
  const [newPaths, setNewPaths] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const loadPaths = useCallback(async () => {
    setLoading(true);
    try {
      const { newPaths: paths } = await discoverFoldersNotInProjects();
      setNewPaths(paths);
      setSelected(new Set(paths));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(`Could not discover folders: ${msg}`);
      setNewPaths([]);
      setSelected(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadPaths();
    }
  }, [isOpen, loadPaths]);

  const toggleOne = useCallback((path: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelected(new Set(newPaths));
  }, [newPaths]);

  const deselectAll = useCallback(() => {
    setSelected(new Set());
  }, []);

  const selectedList = newPaths.filter((p) => selected.has(p));

  const handleAddSelected = useCallback(async () => {
    if (selectedList.length === 0) {
      toast.error("Select at least one folder.");
      return;
    }
    setAdding(true);
    let created = 0;
    let failed = 0;
    try {
      for (const path of selectedList) {
        try {
          await createProject({
            name: projectNameFromPath(path),
            repoPath: path,
          });
          created += 1;
        } catch {
          failed += 1;
        }
      }
      if (created > 0) {
        toast.success(
          created === 1
            ? "1 project added."
            : `${created} project${created > 1 ? "s" : ""} added.`
        );
        onAdded?.();
        onClose();
      }
      if (failed > 0) {
        toast.error(`Failed to add ${failed} folder${failed > 1 ? "s" : ""}.`);
      }
    } finally {
      setAdding(false);
    }
  }, [selectedList, onAdded, onClose]);

  return (
    <SharedDialog
      isOpen={isOpen}
      title="Discover folders"
      onClose={onClose}
      actions={
        <ButtonGroup alignment="right">
          <Button variant="outline" onClick={onClose} disabled={adding}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleAddSelected()}
            disabled={loading || adding || selectedList.length === 0}
          >
            {adding ? (
              <Loader2 className="size-4 animate-spin mr-2" aria-hidden />
            ) : (
              <FolderPlus className="size-4 mr-2" aria-hidden />
            )}
            Add selected ({selectedList.length})
          </Button>
        </ButtonGroup>
      }
      panelClassName="max-w-2xl max-h-[85vh] flex flex-col"
      bodyClassName="flex-1 min-h-0 overflow-hidden flex flex-col"
    >
      <p className="text-sm text-muted-foreground mb-3">
        Folders from your configured projects root that are not yet in the
        project list. Select which to add as projects.
      </p>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        </div>
      ) : newPaths.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">
          No new folders found. All folders from the projects root are already
          added as projects.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={selectAll}
              className="h-7 text-xs"
            >
              Select all
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={deselectAll}
              className="h-7 text-xs"
            >
              Deselect all
            </Button>
            <span className="text-xs text-muted-foreground">
              {newPaths.length} folder{newPaths.length !== 1 ? "s" : ""} found
            </span>
          </div>
          <ScrollArea className="flex-1 border rounded-md min-h-[200px] max-h-[50vh]">
            <ul className="p-2 space-y-1" role="list">
              {newPaths.map((path) => (
                <li
                  key={path}
                  className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50"
                >
                  <Checkbox
                    id={`discover-${path}`}
                    checked={selected.has(path)}
                    onCheckedChange={() => toggleOne(path)}
                    aria-label={`Add ${path}`}
                  />
                  <label
                    htmlFor={`discover-${path}`}
                    className="text-sm font-mono truncate cursor-pointer flex-1"
                    title={path}
                  >
                    {path}
                  </label>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </>
      )}
    </SharedDialog>
  );
}
