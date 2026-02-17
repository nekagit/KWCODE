"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Cpu, Loader2, Pencil, Save, Layout, Server, Wrench } from "lucide-react";
import { toast } from "sonner";
import { SingleContentPage } from "@/components/organisms/SingleContentPage";
import { SectionCard } from "@/components/shared/DisplayPrimitives";
import { Button } from "@/components/ui/button";
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
  entries: Record<string, string> | undefined
) {
  if (!entries || Object.keys(entries).length === 0) return null;
  const meta = CATEGORY_META[title] ?? { accent: "blue" as const, icon: null };
  return (
    <SectionCard key={title} accentColor={meta.accent} className="space-y-4">
      <div className="flex items-center gap-2">
        {meta.icon && <span className="text-muted-foreground">{meta.icon}</span>}
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(entries).map(([key, value]) => (
          <TechBadge key={key} label={key} value={value} />
        ))}
      </div>
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
  const cancelledRef = useRef(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/data/technologies");
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { files?: Record<string, string> };
      if (!cancelledRef.current) setFiles(data.files ?? {});
    } catch (e) {
      if (!cancelledRef.current) {
        setError(e instanceof Error ? e.message : "Failed to load");
        setFiles({});
      }
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

  const techStack = parseTechStack(files["tech-stack.json"]);
  const librariesMd = files["libraries.md"] ?? "";
  const sourcesMd = files["sources.md"] ?? "";

  return (
    <SingleContentPage
      title="Technologies"
      description="Preferred tech stack, libraries, and open source sources for future projects. Stored in .cursor/technologies/ and .cursor_template/technologies/."
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
            </div>
            {techStack ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {renderCategoryCard("Frontend", techStack.frontend)}
                {renderCategoryCard("Backend", techStack.backend)}
                {renderCategoryCard("Tooling", techStack.tooling)}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No tech-stack.json found. Add one in .cursor/technologies/ or
                .cursor_template/technologies/.
              </p>
            )}
          </div>

          {/* Libraries & frameworks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Libraries & frameworks</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEdit("libraries.md")}
              >
                <Pencil className="size-4 mr-1.5" />
                Edit
              </Button>
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
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Open source / GitHub</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEdit("sources.md")}
              >
                <Pencil className="size-4 mr-1.5" />
                Edit
              </Button>
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
  );
}
