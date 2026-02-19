"use client";

/** Project Header component. */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Download, FolderOpen, FolderCog, Copy, Hash, Type, Terminal, Code2, Code } from "lucide-react";
import type { Project } from "@/types/project";
import { deleteProject } from "@/lib/api-projects";
import { downloadProjectExport } from "@/lib/download-project-export";
import { openProjectFolderInFileManager } from "@/lib/open-project-folder";
import { openProjectCursorFolderInFileManager } from "@/lib/open-project-cursor-folder";
import { openProjectInSystemTerminal } from "@/lib/open-project-in-terminal";
import { openProjectInEditor } from "@/lib/open-project-in-editor";
import { copyProjectCursorFolderPath } from "@/lib/copy-project-cursor-folder-path";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { getClasses } from "@/components/molecules/tailwind-molecules";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const classes = getClasses("LayoutAndNavigation/ProjectHeader.tsx");

interface ProjectHeaderProps {
  project: Project;
  projectId: string;
}

export function ProjectHeader({ project, projectId }: ProjectHeaderProps) {
  const router = useRouter();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleExport = async () => {
    try {
      await downloadProjectExport(projectId, project.name ?? "project");
      toast.success("Project exported");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    }
  };

  return (
    <div className={classes[0]}>
      <div data-print-hide>
        <ButtonGroup alignment="right">
        <Button
          variant="outline"
          onClick={async () => {
            await copyTextToClipboard(project.id);
          }}
          aria-label="Copy project ID to clipboard"
        >
          <Hash className={classes[1]} />
          Copy ID
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            const name = project.name?.trim();
            if (name) {
              await copyTextToClipboard(name);
            } else {
              toast.info("No project name to copy");
            }
          }}
          aria-label="Copy project name to clipboard"
          title="Copy project name"
        >
          <Type className={classes[1]} />
          Copy name
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            if (project.repoPath?.trim()) {
              await copyTextToClipboard(project.repoPath);
            } else {
              toast.info("No project path set");
            }
          }}
          aria-label="Copy project path to clipboard"
        >
          <Copy className={classes[1]} />
          Copy path
        </Button>
        <Button
          variant="outline"
          onClick={() => openProjectFolderInFileManager(project.repoPath)}
          aria-label="Open project folder in file manager"
        >
          <FolderOpen className={classes[1]} />
          Open folder
        </Button>
        <Button
          variant="outline"
          onClick={() => openProjectInSystemTerminal(project.repoPath)}
          aria-label="Open project in system terminal"
        >
          <Terminal className={classes[1]} />
          Open in Terminal
        </Button>
        <Button
          variant="outline"
          onClick={() => openProjectInEditor(project.repoPath, "cursor")}
          aria-label="Open project in Cursor"
          title="Open in Cursor"
        >
          <Code2 className={classes[1]} />
          Open in Cursor
        </Button>
        <Button
          variant="outline"
          onClick={() => openProjectInEditor(project.repoPath, "vscode")}
          aria-label="Open project in VS Code"
          title="Open in VS Code"
        >
          <Code className={classes[1]} />
          Open in VS Code
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            await copyProjectCursorFolderPath(project.repoPath);
          }}
          aria-label="Copy .cursor folder path to clipboard"
          title="Copy .cursor folder path"
        >
          <Copy className={classes[1]} />
          Copy .cursor path
        </Button>
        <Button
          variant="outline"
          onClick={() => openProjectCursorFolderInFileManager(project.repoPath)}
          aria-label="Open project .cursor folder in file manager"
        >
          <FolderCog className={classes[1]} />
          Open .cursor folder
        </Button>
        <Button
          variant="outline"
          onClick={() => copyProjectCursorFolderPath(project.repoPath)}
          aria-label="Copy .cursor folder path to clipboard"
          title="Copy .cursor folder path"
        >
          <Copy className={classes[1]} />
          Copy .cursor path
        </Button>
        <Button variant="outline" onClick={handleExport}>
          <Download className={classes[1]} />
          Export
        </Button>
        <Button
          variant="destructive"
          onClick={() => setDeleteConfirmOpen(true)}
        >
          <Trash2 className={classes[1]} />
          Delete
        </Button>
      </ButtonGroup>
      </div>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete project?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This project will be removed from the app. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await deleteProject(projectId);
                setDeleteConfirmOpen(false);
                router.replace("/projects");
                toast.success("Project deleted");
              }}
            >
              Delete project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
