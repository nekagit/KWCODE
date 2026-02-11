"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, GitBranch, FolderGit2, GitPullRequest, GitCommit, Upload } from "lucide-react";
import { invoke, isTauri } from "@/lib/tauri";
import { toast } from "sonner";
import type { Project } from "@/types/project";
import type { GitInfo } from "@/types/git";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { Dialog } from "@/components/shared/Dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProjectGitTabProps {
  project: Project;
  projectId: string;
}

/** Parse status_short (git status -sb): first line is branch summary, rest are changed files. */
function parseStatusShort(statusShort: string): { branchLine: string; changedFiles: string[] } {
  const lines = statusShort.trim().split("\n").filter(Boolean);
  const branchLine = lines[0] ?? "";
  const changedFiles = lines.slice(1);
  return { branchLine, changedFiles };
}

/** Git status short: first char = index (staged), second = work tree. Returns label and Tailwind text + bg classes. */
function getStatusStyle(status: string): { label: string; className: string } {
  const s = (status || "  ").slice(0, 2);
  const hasM = s.includes("M");
  const hasD = s.includes("D");
  const hasA = s.includes("A");
  const hasU = s.includes("U");
  const hasR = s.includes("R");
  const hasC = s.includes("C");
  const untracked = s === "??" || s === " ?" || s === "? ";
  if (untracked)
    return { label: s, className: "bg-muted text-muted-foreground font-medium" };
  if (hasD) return { label: s, className: "bg-destructive/15 text-destructive font-medium" };
  if (hasU) return { label: s, className: "bg-destructive/15 text-destructive font-medium" };
  if (hasA) return { label: s, className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium" };
  if (hasM) return { label: s, className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-medium" };
  if (hasR) return { label: s, className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 font-medium" };
  if (hasC) return { label: s, className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 font-medium" };
  return { label: s, className: "bg-muted text-muted-foreground font-medium" };
}

type GitAction = "pull" | "push" | "commit" | null;

export function ProjectGitTab({ project, projectId }: ProjectGitTabProps) {
  const [gitInfo, setGitInfo] = useState<GitInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<GitAction>(null);
  const [commitDialogOpen, setCommitDialogOpen] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");

  const repoPath = project.repoPath?.trim() ?? "";

  const fetchGitInfo = useCallback(async () => {
    if (!project.repoPath?.trim()) {
      setGitInfo(null);
      setError(null);
      return;
    }
    if (!isTauri) {
      setGitInfo(null);
      setError("Git info is only available in the desktop app.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const info = await invoke<GitInfo>("get_git_info", {
        projectPath: project.repoPath.trim(),
      });
      setGitInfo(info);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setGitInfo(null);
    } finally {
      setLoading(false);
    }
  }, [project.repoPath]);

  useEffect(() => {
    fetchGitInfo();
  }, [fetchGitInfo]);

  const handlePull = useCallback(async () => {
    if (!repoPath) return;
    setActionLoading("pull");
    try {
      await invoke<string>("git_pull", { projectPath: repoPath });
      toast.success("Pulled successfully.");
      await fetchGitInfo();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setActionLoading(null);
    }
  }, [repoPath, fetchGitInfo]);

  const handlePush = useCallback(async () => {
    if (!repoPath) return;
    setActionLoading("push");
    try {
      await invoke<string>("git_push", { projectPath: repoPath });
      toast.success("Pushed successfully.");
      await fetchGitInfo();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setActionLoading(null);
    }
  }, [repoPath, fetchGitInfo]);

  const openCommitDialog = useCallback(() => {
    if (!repoPath) return;
    setCommitMessage("");
    setCommitDialogOpen(true);
  }, [repoPath]);

  const handleCommitSubmit = useCallback(async () => {
    if (!repoPath) return;
    const message = commitMessage.trim();
    if (!message) {
      toast.error("Enter a commit message.");
      return;
    }
    setActionLoading("commit");
    setCommitDialogOpen(false);
    try {
      await invoke<string>("git_commit", { projectPath: repoPath, message });
      toast.success("Committed successfully.");
      await fetchGitInfo();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setActionLoading(null);
    }
  }, [repoPath, commitMessage, fetchGitInfo]);

  if (!repoPath) {
    return (
      <div className="mt-4 space-y-6">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <FolderGit2 className="h-6 w-6" />
          Git
        </div>
        <Card className="p-6">
          <p className="text-muted-foreground">
            No repository path set. Set a repo path in{" "}
            <Link href={`/projects/${projectId}/edit`} className="text-primary underline">
              Edit project
            </Link>{" "}
            to see git status, branches, and commits here.
          </p>
        </Card>
      </div>
    );
  }

  if (!isTauri) {
    return (
      <div className="mt-4 space-y-6">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <FolderGit2 className="h-6 w-6" />
          Git
        </div>
        <Card className="p-6">
          <p className="text-muted-foreground">
            Git info (status, branches, remotes, commits) is only available when running the desktop app (Tauri).
          </p>
        </Card>
      </div>
    );
  }

  if (loading && !gitInfo) {
    return (
      <div className="mt-4 flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !gitInfo) {
    return (
      <div className="mt-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <FolderGit2 className="h-6 w-6" />
            Git
          </div>
          <Button variant="outline" size="sm" onClick={fetchGitInfo} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <Card className="p-6 border-destructive/50">
          <p className="text-destructive">{error}</p>
        </Card>
      </div>
    );
  }

  const { branchLine, changedFiles } = gitInfo
    ? parseStatusShort(gitInfo.status_short)
    : { branchLine: "", changedFiles: [] };

  const busy = loading || actionLoading !== null;

  return (
    <div className="mt-4 space-y-6">
      <Dialog
        title="Commit"
        isOpen={commitDialogOpen}
        onClose={() => setCommitDialogOpen(false)}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setCommitDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => handleCommitSubmit()}
              disabled={!commitMessage.trim() || actionLoading === "commit"}
            >
              {actionLoading === "commit" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Commit
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <Label htmlFor="commit-message">Commit message</Label>
          <Input
            id="commit-message"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="e.g. fix: update feature"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (commitMessage.trim()) handleCommitSubmit();
              }
            }}
          />
        </div>
      </Dialog>
      <div className="flex items-center justify-end">
        <ButtonGroup alignment="right">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePull}
            disabled={busy}
            title="Pull"
          >
            {actionLoading === "pull" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GitPullRequest className="h-4 w-4" />
            )}
            <span className="sr-only sm:not-sr-only sm:ml-2">Pull</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openCommitDialog}
            disabled={busy}
            title="Commit"
          >
            {actionLoading === "commit" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GitCommit className="h-4 w-4" />
            )}
            <span className="sr-only sm:not-sr-only sm:ml-2">Commit</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePush}
            disabled={busy}
            title="Push"
          >
            {actionLoading === "push" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span className="sr-only sm:not-sr-only sm:ml-2">Push</span>
          </Button>
          <Button variant="outline" size="sm" onClick={fetchGitInfo} disabled={busy}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </ButtonGroup>
      </div>

      <div className="space-y-4">
        {/* Focus: repo path + current branch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="text-xs font-medium text-muted-foreground mb-2">Repository path</h3>
            <div className="rounded-md border border-border bg-muted/30 p-3">
              <p className="font-mono text-xs break-all line-clamp-2">{project.repoPath}</p>
            </div>
          </Card>
          {gitInfo?.current_branch && (
            <Card className="p-4">
              <h3 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <GitBranch className="h-3.5 w-3.5" />
                Current branch
              </h3>
              <div className="rounded-md border border-border bg-muted/30 p-3">
                <p className="font-mono text-xs text-primary font-medium truncate">{gitInfo.current_branch}</p>
              </div>
            </Card>
          )}
        </div>

        {/* Changed files — primary focus */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Changed files</h3>
          {changedFiles.length > 0 ? (
            <ScrollArea className="h-[200px] w-full rounded-md border border-border p-0">
              <ul className="font-mono text-xs">
                {changedFiles.map((line, i) => {
                  const status = line.slice(0, 2);
                  const path = line.slice(2).trim() || line;
                  const { label, className } = getStatusStyle(status);
                  return (
                    <li
                      key={i}
                      className="flex items-center gap-2 border-b border-border px-3 py-2 last:border-b-0"
                    >
                      <span
                        className={`shrink-0 w-8 rounded px-1.5 py-0.5 text-center tabular-nums ${className}`}
                        title={status === "??" ? "Untracked" : status.includes("M") ? "Modified" : status.includes("D") ? "Deleted" : status.includes("A") ? "Added" : status.includes("R") ? "Renamed" : status.includes("U") ? "Unmerged" : "Changed"}
                      >
                        {label}
                      </span>
                      <span className="break-all text-foreground">{path}</span>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          ) : (
            <div className="rounded-md border border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
              No changed files
            </div>
          )}
        </Card>

        {/* Additional information — collapsible */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="additional-info" className="border rounded-md">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              Additional information
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {/* Status */}
                {branchLine && (
                  <Card className="p-4">
                    <h3 className="text-xs font-medium text-muted-foreground mb-2">Status</h3>
                    <div className="rounded-md border border-border bg-muted/30 p-3">
                      <p className="font-mono text-xs whitespace-pre-wrap break-all line-clamp-2">{branchLine}</p>
                    </div>
                  </Card>
                )}

                {/* HEAD ref */}
                {gitInfo?.head_ref && (
                  <Card className="p-4">
                    <h3 className="text-xs font-medium text-muted-foreground mb-2">HEAD</h3>
                    <div className="rounded-md border border-border bg-muted/30 p-3">
                      <p className="font-mono text-xs break-all line-clamp-2">{gitInfo.head_ref}</p>
                    </div>
                  </Card>
                )}

                {/* Branches */}
                {gitInfo?.branches && gitInfo.branches.length > 0 && (
                  <Card className="p-4">
                    <h3 className="text-xs font-medium text-muted-foreground mb-2">Branches</h3>
                    <ScrollArea className="h-[120px] w-full rounded-md border border-border p-0">
                      <ul className="font-mono text-xs">
                        {gitInfo.branches.map((b, i) => (
                          <li
                            key={i}
                            className="border-b border-border px-3 py-2 last:border-b-0 truncate"
                          >
                            {b}
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </Card>
                )}

                {/* Remotes */}
                {gitInfo?.remotes?.trim() && (
                  <Card className="p-4">
                    <h3 className="text-xs font-medium text-muted-foreground mb-2">Remotes</h3>
                    <div className="rounded-md border border-border bg-muted/30 p-3">
                      <pre className="font-mono text-xs whitespace-pre-wrap break-all line-clamp-4">{gitInfo.remotes}</pre>
                    </div>
                  </Card>
                )}

                {/* Last 30 commits */}
                {gitInfo?.last_commits && gitInfo.last_commits.length > 0 && (
                  <Card className="p-4 sm:col-span-2">
                    <h3 className="text-xs font-medium text-muted-foreground mb-2">Last 30 commits</h3>
                    <ScrollArea className="h-[160px] w-full rounded-md border border-border p-0">
                      <ul className="font-mono text-xs">
                        {gitInfo.last_commits.map((c, i) => (
                          <li
                            key={i}
                            className="border-b border-border px-3 py-2 last:border-b-0 break-all"
                          >
                            {c}
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </Card>
                )}

                {/* Config preview */}
                {gitInfo?.config_preview?.trim() && (
                  <Card className="p-4">
                    <h3 className="text-xs font-medium text-muted-foreground mb-2">.git/config (preview)</h3>
                    <ScrollArea className="h-[120px] w-full rounded-md border border-border p-3">
                      <pre className="font-mono text-xs whitespace-pre-wrap break-all text-muted-foreground">
                        {gitInfo.config_preview}
                      </pre>
                    </ScrollArea>
                  </Card>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
