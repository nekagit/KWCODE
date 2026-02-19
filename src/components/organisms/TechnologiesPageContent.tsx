"use client";

/** Technologies Page Content component. */
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Copy, Cpu, Download, FileText, FolderOpen, Loader2, Pencil, RefreshCw, Save, Layout, Search, Server, Wrench, X } from "lucide-react";
import { toast } from "sonner";
import { PrintButton } from "@/components/atoms/buttons/PrintButton";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { SingleContentPage } from "@/components/organisms/SingleContentPage";
import { SectionCard } from "@/components/shared/DisplayPrimitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { getOrganismClasses } from "./organism-classes";
import { getTechLogoUrl } from "@/lib/tech-logos";
import { copyTechStackToClipboard } from "@/lib/copy-tech-stack";
import { copyTechnologiesFolderPath } from "@/lib/copy-technologies-folder-path";
import {
  copyTechnologiesDocumentAsMarkdownToClipboard,
  downloadTechnologiesDocumentAsMarkdown,
} from "@/lib/download-technologies-document";
import {
  copyTechStackAsMarkdownToClipboard,
  downloadTechStack,
  downloadTechStackAsMarkdown,
} from "@/lib/download-tech-stack";
import {
  downloadTechStackAsCsv,
  copyTechStackAsCsvToClipboard,
} from "@/lib/download-tech-stack-csv";
import { openTechnologiesFolderInFileManager } from "@/lib/open-technologies-folder";
import { useTechnologiesFocusFilterShortcut } from "@/lib/technologies-focus-filter-shortcut";

const c = getOrganismClasses("TechnologiesPageContent.tsx");

type TechStackJson = {
  name?: string;
  description?: string;
  frontend?: Record<string, string>;
  backend?: Record<string, string>;
  tooling?: Record<string, string>;
};

function parseTechStack(raw: string | undefined): TechStackJson | null {
  if (!raw || typeof raw !== "string") return null;
  try {
    const data = JSON.parse(raw) as TechStackJson;
    return data && typeof data === "object" ? data : null;
  } catch {
    return null;
  }
}

/** Filter tech stack entries by query (label or value, case-insensitive). */
function filterTechStackEntries(
  entries: Record<string, string> | undefined,
  query: string
): Record<string, string> {
  if (!entries || typeof entries !== "object") return {};
  const q = query.trim().toLowerCase();
  if (!q) return entries;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(entries)) {
    if (
      key.toLowerCase().includes(q) ||
      (value && String(value).toLowerCase().includes(q))
    ) {
      out[key] = value;
    }
  }
  return out;
}

function TechBadge({ label, value }: { label: string; value: string }) {
  const logoUrl = getTechLogoUrl(value);
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-sm shadow-sm transition-colors hover:border-border hover:bg-muted/50">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt=""
          className="size-5 shrink-0 object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : null}
      <span className="text-muted-foreground shrink-0 font-medium">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

const CATEGORY_META: Record<string, { accent: "blue" | "emerald" | "amber"; icon: React.ReactNode }> = {
  Frontend: { accent: "blue", icon: <Layout className="size-4" /> },
  Backend: { accent: "emerald", icon: <Server className="size-4" /> },
  Tooling: { accent: "amber", icon: <Wrench className="size-4" /> },
};

function renderCategoryCard(
  title: string,
  entries: Record<string, string> | undefined,
  options?: { emptyMessage?: string }
) {
  const meta = CATEGORY_META[title] ?? { accent: "blue" as const, icon: null };
  const hasEntries = entries && Object.keys(entries).length > 0;
  if (!hasEntries && !options?.emptyMessage) return null;
  return (
    <SectionCard key={title} accentColor={meta.accent} className="space-y-4">
      <div className="flex items-center gap-2">
        {meta.icon && <span className="text-muted-foreground">{meta.icon}</span>}
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      </div>
      {hasEntries ? (
        <div className="flex flex-wrap gap-2">
          {Object.entries(entries!).map(([key, value]) => (
            <TechBadge key={key} label={key} value={value} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{options!.emptyMessage}</p>
      )}
    </SectionCard>
  );
}

export function TechnologiesPageContent() {
  const [files, setFiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editPath, setEditPath] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [techStackFilterQuery, setTechStackFilterQuery] = useState("");
  const cancelledRef = useRef(false);
  const filterInputRef = useRef<HTMLInputElement>(null);
  useTechnologiesFocusFilterShortcut(filterInputRef);

  const load = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/data/technologies");
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { files?: Record<string, string> };
      if (!cancelledRef.current) {
        setFiles(data.files ?? {});
        setError(null);
      }
      return true;
    } catch (e) {
      if (!cancelledRef.current) {
        setError(e instanceof Error ? e.message : "Failed to load");
        setFiles({});
      }
      return false;
    } finally {
      if (!cancelledRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    load();
    return () => {
      cancelledRef.current = true;
    };
  }, [load]);

  const openEdit = useCallback(
    (path: string) => {
      setEditPath(path);
      setEditContent(files[path] ?? "");
    },
    [files]
  );

  const closeEdit = useCallback(() => {
    setEditPath(null);
    setEditContent("");
  }, []);

  const saveEdit = useCallback(async () => {
    if (editPath == null) return;
    setSaving(true);
    try {
      const res = await fetch("/api/data/technologies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: editPath, content: editContent }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Save failed");
      }
      setFiles((prev) => ({ ...prev, [editPath]: editContent }));
      closeEdit();
      toast.success("Saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [editPath, editContent, closeEdit]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const ok = await load();
      if (!ok) toast.error("Refresh failed");
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const techStack = parseTechStack(files["tech-stack.json"]);
  const { filteredFrontend, filteredBackend, filteredTooling, totalBadges, filteredBadges } = useMemo(() => {
    const fe = filterTechStackEntries(techStack?.frontend, techStackFilterQuery);
    const be = filterTechStackEntries(techStack?.backend, techStackFilterQuery);
    const to = filterTechStackEntries(techStack?.tooling, techStackFilterQuery);
    const total = [techStack?.frontend, techStack?.backend, techStack?.tooling].reduce(
      (sum, r) => sum + (r ? Object.keys(r).length : 0),
      0
    );
    const filtered = Object.keys(fe).length + Object.keys(be).length + Object.keys(to).length;
    return {
      filteredFrontend: fe,
      filteredBackend: be,
      filteredTooling: to,
      totalBadges: total,
      filteredBadges: filtered,
    };
  }, [techStack, techStackFilterQuery]);

  const librariesMd = files["libraries.md"] ?? "";
  const sourcesMd = files["sources.md"] ?? "";
  const trimmedTechStackFilter = techStackFilterQuery.trim();
  const noMatches =
    trimmedTechStackFilter.length > 0 && filteredBadges === 0;

  return (
    <div className="space-y-0">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/" },
          { label: "Technologies" },
        ]}
        className="mb-3"
      />
      <div className="mb-3 flex justify-end gap-2">
        <PrintButton
          title="Print technologies page (⌘P)"
          variant="outline"
          size="sm"
          iconClassName="h-4 w-4 mr-1.5"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => copyTechnologiesFolderPath()}
          aria-label="Copy technologies folder path"
        >
          <Copy className="h-4 w-4 mr-1.5" aria-hidden />
          Copy path
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => openTechnologiesFolderInFileManager()}
          aria-label="Open technologies folder in file manager"
        >
          <FolderOpen className="h-4 w-4 mr-1.5" aria-hidden />
          Open folder
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={refreshing}
          onClick={handleRefresh}
          aria-label="Refresh technologies"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <RefreshCw className="h-4 w-4" aria-hidden />
          )}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>
      <SingleContentPage
      title="Technologies"
      description="Preferred tech stack, libraries, and open source sources for future projects. Shown from .cursor/technologies/ or project_template (folder or project_template.zip)."
      icon={<Cpu className={c["0"] ?? "size-5 text-primary/90"} />}
      layout="card"
      error={error}
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tech stack */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold">Tech stack</h2>
                {(techStack?.description ?? techStack?.name) && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {techStack?.description ?? techStack?.name}
                  </p>
                )}
              </div>
              {(files["tech-stack.json"] != null || techStack) && (
                <div className="flex flex-wrap items-center gap-2">
                  {techStack && (
                    <>
                      <div className="relative flex-1 min-w-[160px] max-w-xs">
                        <Search
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none"
                          aria-hidden
                        />
                        <Input
                          ref={filterInputRef}
                          type="text"
                          placeholder="Filter by name or value…"
                          value={techStackFilterQuery}
                          onChange={(e) => setTechStackFilterQuery(e.target.value)}
                          className="pl-8 h-8 text-sm"
                          aria-label="Filter tech stack by name or value"
                        />
                      </div>
                      {trimmedTechStackFilter && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setTechStackFilterQuery("")}
                          className="h-8 gap-1.5"
                          aria-label="Clear filter"
                        >
                          <X className="size-3.5" aria-hidden />
                          Clear
                        </Button>
                      )}
                      {trimmedTechStackFilter && totalBadges > 0 && (
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          Showing {filteredBadges} of {totalBadges}
                        </span>
                      )}
                    </>
                  )}
                  {files["tech-stack.json"] != null && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit("tech-stack.json")}
                    >
                      <Pencil className="size-4 mr-1.5" />
                      Edit
                    </Button>
                  )}
                  {techStack && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyTechStackToClipboard(techStack)}
                        aria-label="Copy tech stack as JSON to clipboard"
                      >
                        <Copy className="size-4 mr-1.5" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyTechStackAsMarkdownToClipboard(techStack)}
                        aria-label="Copy tech stack as Markdown to clipboard"
                        title="Copy as Markdown (same structure as Download as Markdown)"
                      >
                        <FileText className="size-4 mr-1.5" />
                        Copy as Markdown
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadTechStack(techStack)}
                        aria-label="Export tech stack as JSON"
                      >
                        <Download className="size-4 mr-1.5" />
                        Export
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadTechStackAsMarkdown(techStack)}
                        aria-label="Download tech stack as Markdown"
                        title="Download as Markdown (same structure as export)"
                      >
                        <FileText className="size-4 mr-1.5" />
                        Download as Markdown
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadTechStackAsCsv(techStack)}
                        aria-label="Download tech stack as CSV"
                        title="Download as CSV (category, technology, description)"
                      >
                        <Download className="size-4 mr-1.5" />
                        Download as CSV
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void copyTechStackAsCsvToClipboard(techStack)}
                        aria-label="Copy tech stack as CSV to clipboard"
                        title="Copy as CSV (same structure as Download as CSV)"
                      >
                        <Copy className="size-4 mr-1.5" />
                        Copy as CSV
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
            {techStack ? (
              noMatches ? (
                <p className="text-sm text-muted-foreground py-2">
                  No badges match &quot;{techStackFilterQuery.trim()}&quot;.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {renderCategoryCard("Frontend", filteredFrontend, {
                    emptyMessage: trimmedTechStackFilter ? "No matches" : undefined,
                  })}
                  {renderCategoryCard("Backend", filteredBackend, {
                    emptyMessage: trimmedTechStackFilter ? "No matches" : undefined,
                  })}
                  {renderCategoryCard("Tooling", filteredTooling, {
                    emptyMessage: trimmedTechStackFilter ? "No matches" : undefined,
                  })}
                </div>
              )
            ) : (
              <p className="text-sm text-muted-foreground">
                No tech-stack.json found. Add one in .cursor/technologies/ or use the project template (project_template.zip or project_template/.cursor/technologies/).
              </p>
            )}
          </div>

          {/* Libraries & frameworks */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Libraries & frameworks</h2>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit("libraries.md")}
                >
                  <Pencil className="size-4 mr-1.5" />
                  Edit
                </Button>
                {librariesMd.trim() && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadTechnologiesDocumentAsMarkdown(librariesMd, "libraries.md")}
                      aria-label="Download Libraries as Markdown"
                      title="Download as Markdown"
                    >
                      <FileText className="size-4 mr-1.5" />
                      Download as Markdown
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void copyTechnologiesDocumentAsMarkdownToClipboard(librariesMd)}
                      aria-label="Copy Libraries as Markdown to clipboard"
                      title="Copy as Markdown"
                    >
                      <Copy className="size-4 mr-1.5" />
                      Copy as Markdown
                    </Button>
                  </>
                )}
              </div>
            </div>
            <SectionCard accentColor="violet" className="min-h-[80px]">
              {librariesMd ? (
                <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans">
                  {librariesMd}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Add libraries.md in .cursor/technologies/ to list libraries and
                  frameworks.
                </p>
              )}
            </SectionCard>
          </div>

          {/* Open source / GitHub sources */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Open source / GitHub</h2>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit("sources.md")}
                >
                  <Pencil className="size-4 mr-1.5" />
                  Edit
                </Button>
                {sourcesMd.trim() && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadTechnologiesDocumentAsMarkdown(sourcesMd, "sources.md")}
                      aria-label="Download Open source as Markdown"
                      title="Download as Markdown"
                    >
                      <FileText className="size-4 mr-1.5" />
                      Download as Markdown
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void copyTechnologiesDocumentAsMarkdownToClipboard(sourcesMd)}
                      aria-label="Copy Open source as Markdown to clipboard"
                      title="Copy as Markdown"
                    >
                      <Copy className="size-4 mr-1.5" />
                      Copy as Markdown
                    </Button>
                  </>
                )}
              </div>
            </div>
            <SectionCard accentColor="cyan" className="min-h-[80px]">
              {sourcesMd ? (
                <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans">
                  {sourcesMd}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Add sources.md in .cursor/technologies/ to list open source or
                  GitHub references.
                </p>
              )}
            </SectionCard>
          </div>
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={editPath != null} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Edit {editPath === "tech-stack.json" ? "tech-stack.json" : editPath}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[240px] font-mono text-sm"
            placeholder={editPath === "tech-stack.json" ? "{}" : ""}
          />
          <DialogFooter>
            <Button variant="outline" onClick={closeEdit}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Save className="size-4 mr-2" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SingleContentPage>
    </div>
  );
}
