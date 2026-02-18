"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Copy, FileJson, FileText, FolderOpen, Lightbulb, Loader2, Printer, RefreshCw, RotateCcw, Search, Table, X } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IdeaTemplateCard } from "@/components/molecules/CardsAndDisplay/IdeaTemplateCard";
import { MyIdeasCard } from "@/components/molecules/CardsAndDisplay/MyIdeasCard";
import { AiGeneratedIdeasCard } from "@/components/molecules/CardsAndDisplay/AiGeneratedIdeasCard";
import { IdeaFormDialog } from "@/components/molecules/FormsAndDialogs/IdeaFormDialog";
import { ThreeTabResourcePageContent } from "@/components/organisms/ThreeTabResourcePageContent";
import { getOrganismClasses } from "./organism-classes";
import { copyMyIdeasAsJsonToClipboard, downloadMyIdeasAsJson } from "@/lib/download-my-ideas";
import {
  downloadMyIdeasAsCsv,
  copyMyIdeasAsCsvToClipboard,
} from "@/lib/download-my-ideas-csv";
import { downloadMyIdeasAsMarkdown, copyAllMyIdeasMarkdownToClipboard } from "@/lib/download-my-ideas-md";
import { copyIdeasFolderPath } from "@/lib/copy-ideas-folder-path";
import { openIdeasFolderInFileManager } from "@/lib/open-ideas-folder";
import {
  getIdeasViewPreference,
  setIdeasViewPreference,
  type IdeasViewSort,
} from "@/lib/ideas-view-preference";
import { useIdeasFocusFilterShortcut } from "@/lib/ideas-focus-filter-shortcut";
import { IdeaCategory, IdeaRecord } from "@/types/idea";

const c = getOrganismClasses("IdeasPageContent.tsx");

type TemplateIdea = { title: string; description: string; category: IdeaCategory };

const TEMPLATE_IDEAS: TemplateIdea[] = [
  { title: "API usage dashboard for dev teams", description: "SaaS that tracks API calls, quotas, and costs per project with alerts and simple reports.", category: "saas" },
  { title: "Low-code internal tool builder", description: "PaaS to build admin panels, forms, and workflows without code, with DB and auth included.", category: "paas" },
  { title: "Managed Redis / cache hosting", description: "IaaS-style managed Redis with auto-scaling, backups, and a simple control panel.", category: "iaas" },
  { title: "Niche affiliate comparison site", description: "Website that compares products in one vertical (e.g. project management, CRM) with honest reviews and affiliate links.", category: "website" },
  { title: "Micro-SaaS for recurring reports", description: "Webapp that connects to Google Analytics, Stripe, or DB and emails scheduled PDF/Excel reports to stakeholders.", category: "webapp" },
  { title: "Print-on-demand storefront", description: "Webshop for custom merch (T-shirts, mugs) with design upload, fulfillment integration, and basic SEO.", category: "webshop" },
  { title: "Waitlist & early-access landing pages", description: "SaaS to create landing pages, collect emails, and send launch updates with minimal setup.", category: "saas" },
  { title: "Serverless job queue as a service", description: "PaaS to enqueue and run background jobs (cron, webhooks) without managing servers.", category: "paas" },
  { title: "Static site + form backend", description: "Simple hosting for static sites with form submissions, file uploads, and optional serverless functions.", category: "paas" },
  { title: "Developer changelog & release notes", description: "Webapp for teams to publish product changelogs, release notes, and roadmap with a public page and optional auth.", category: "webapp" },
  { title: "Local-first docs / wiki", description: "Website or webapp for documentation that works offline and syncs when online, with markdown and search.", category: "webapp" },
  { title: "White-label invoicing for agencies", description: "SaaS for freelancers and agencies to send branded invoices, track payments, and basic client portal.", category: "saas" },
  { title: "Domain & SSL monitoring", description: "Webapp that checks domain expiry, SSL validity, and uptime and sends alerts before issues.", category: "webapp" },
  { title: "Niche SaaS directory", description: "Curated directory website for one niche (e.g. HR tools, design tools) with filters and short reviews.", category: "website" },
  { title: "Subscription box e-commerce", description: "Webshop platform for subscription boxes: recurring billing, shipping, and basic customer portal.", category: "webshop" },
];

const CATEGORY_LABELS: Record<IdeaCategory, string> = {
  saas: "SaaS",
  iaas: "IaaS",
  paas: "PaaS",
  website: "Website",
  webapp: "Webapp",
  webshop: "Webshop",
  other: "Other",
};

export function IdeasPageContent() {
  const [myIdeas, setMyIdeas] = useState<IdeaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState<IdeaCategory>("other");
  const [formId, setFormId] = useState<number | undefined>(undefined);
  const [saveLoading, setSaveLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [ideaSort, setIdeaSort] = useState<IdeasViewSort>(() => {
    if (typeof window === "undefined") return "newest";
    return getIdeasViewPreference().sort;
  });
  const [filterQuery, setFilterQuery] = useState(() => {
    if (typeof window === "undefined") return "";
    return getIdeasViewPreference().filterQuery;
  });
  const filterInputRef = useRef<HTMLInputElement>(null);
  useIdeasFocusFilterShortcut(filterInputRef);
  const cancelledRef = useRef(false);

  // Persist sort when user changes it
  useEffect(() => {
    setIdeasViewPreference({ sort: ideaSort });
  }, [ideaSort]);

  // Persist filter query with debounce when user types
  useEffect(() => {
    const t = setTimeout(() => setIdeasViewPreference({ filterQuery }), 300);
    return () => clearTimeout(t);
  }, [filterQuery]);

  const sortedMyIdeas = useMemo(() => {
    const list = [...myIdeas];
    const dateTs = (idea: IdeaRecord) => {
      const raw = idea.created_at ?? idea.updated_at ?? "";
      if (!raw) return 0;
      const t = Date.parse(raw);
      return Number.isFinite(t) ? t : 0;
    };
    if (ideaSort === "newest") {
      list.sort((a, b) => dateTs(b) - dateTs(a) || a.id - b.id);
    } else if (ideaSort === "oldest") {
      list.sort((a, b) => dateTs(a) - dateTs(b) || a.id - b.id);
    } else if (ideaSort === "title-asc") {
      list.sort(
        (a, b) =>
          (a.title ?? "").localeCompare(b.title ?? "", undefined, { sensitivity: "base" }) ||
          a.id - b.id
      );
    } else {
      list.sort(
        (a, b) =>
          (b.title ?? "").localeCompare(a.title ?? "", undefined, { sensitivity: "base" }) ||
          a.id - b.id
      );
    }
    return list;
  }, [myIdeas, ideaSort]);

  const trimmedFilterQuery = filterQuery.trim().toLowerCase();
  const filteredMyIdeas = useMemo(
    () =>
      !trimmedFilterQuery
        ? sortedMyIdeas
        : sortedMyIdeas.filter((idea) =>
            (idea.title ?? "").toLowerCase().includes(trimmedFilterQuery)
          ),
    [sortedMyIdeas, trimmedFilterQuery]
  );

  const loadIdeas = useCallback(async () => {
    try {
      const res = await fetch("/api/data/ideas");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (!cancelledRef.current) setMyIdeas(Array.isArray(data) ? data : []);
    } catch (e) {
      if (!cancelledRef.current) {
        toast.error(e instanceof Error ? e.message : "Failed to load ideas");
        setMyIdeas([]);
      }
    } finally {
      if (!cancelledRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    loadIdeas();
    return () => {
      cancelledRef.current = true;
    };
  }, [loadIdeas]);

  const openCreate = useCallback(() => {
    setFormId(undefined);
    setFormTitle("");
    setFormDescription("");
    setFormCategory("other");
    setCreateOpen(true);
  }, []);

  const openEdit = useCallback((idea: IdeaRecord) => {
    setFormId(idea.id);
    setFormTitle(idea.title);
    setFormDescription(idea.description);
    const validCategories: IdeaCategory[] = ["saas", "iaas", "paas", "website", "webapp", "webshop", "other"];
    setFormCategory(validCategories.includes(idea.category) ? idea.category : "other");
    setEditOpen(true);
  }, []);

  const handleSaveCreate = useCallback(async () => {
    if (!formTitle.trim()) return;
    setSaveLoading(true);
    try {
      const res = await fetch("/api/data/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDescription.trim(),
          category: formCategory,
          source: "manual",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }
      await loadIdeas();
      setCreateOpen(false);
      setFormTitle("");
      setFormDescription("");
      toast.success("Idea added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaveLoading(false);
    }
  }, [formTitle, formDescription, formCategory, loadIdeas]);

  const handleSaveEdit = useCallback(async () => {
    if (formId === undefined || !formTitle.trim()) return;
    setSaveLoading(true);
    try {
      const res = await fetch("/api/data/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: formId,
          title: formTitle.trim(),
          description: formDescription.trim(),
          category: formCategory,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }
      await loadIdeas();
      setEditOpen(false);
      setFormId(undefined);
      toast.success("Idea updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaveLoading(false);
    }
  }, [formId, formTitle, formDescription, formCategory, loadIdeas]);

  const addToMyIdeas = useCallback(
    async (item: { title: string; description: string; category: IdeaCategory }, source: "template" | "ai") => {
      try {
        const res = await fetch("/api/data/ideas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: item.title,
            description: item.description,
            category: item.category,
            source,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || res.statusText);
        }
        await loadIdeas();
        toast.success("Added to My ideas");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to add");
      }
    },
    [loadIdeas]
  );

  const handleDelete = useCallback(
    async (ideaId: number) => {
      try {
        const res = await fetch(`/api/data/ideas/${ideaId}`, { method: "DELETE" });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || res.statusText);
        }
        await loadIdeas();
        setEditOpen(false);
        setFormId(undefined);
        toast.success("Idea removed");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to delete");
      }
    },
    [loadIdeas]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadIdeas();
    } catch {
      toast.error("Refresh failed");
    } finally {
      setRefreshing(false);
    }
  }, [loadIdeas]);

  const config = {
    title: "Business ideas",
    description: "SaaS, IaaS, PaaS, websites, webapps, webshops — templates, AI-generated, or your own.",
    icon: <Lightbulb className={c["0"]} />,
    tabListClassName: "grid w-full max-w-xl grid-cols-3 gap-2 p-2 glass-card rounded-xl mx-auto bg-muted/20 backdrop-blur-md border-border/40 shadow-sm [&_button]:min-w-0 [&_button]:truncate [&_button]:text-sm",
    tabLabels: ["Templates", "AI generated", "My ideas"] as [string, string, string],
  };

  const resource = {
    myIdeas,
    sortedMyIdeas,
    filteredMyIdeas,
    filterQuery,
    trimmedFilterQuery,
    loading,
    createOpen,
    setCreateOpen,
    editOpen,
    setEditOpen,
    formTitle,
    setFormTitle,
    formDescription,
    setFormDescription,
    formCategory,
    setFormCategory,
    formId,
    saveLoading,
    openCreate,
    openEdit,
    handleSaveCreate,
    handleSaveEdit,
    addToMyIdeas,
    handleDelete,
    TEMPLATE_IDEAS,
    CATEGORY_LABELS,
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 pb-12">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/" },
          { label: "Ideas" },
        ]}
      />
      <div className="flex flex-col gap-4 sm:gap-5">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none"
              aria-hidden
            />
            <Input
              ref={filterInputRef}
              type="text"
              placeholder="Filter My ideas by title…"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="pl-8 h-9 text-sm"
              aria-label="Filter My ideas by title"
            />
          </div>
          <Select
            value={ideaSort}
            onValueChange={(v) => {
              const sort = v as IdeasViewSort;
              setIdeaSort(sort);
              setIdeasViewPreference({ sort });
            }}
          >
            <SelectTrigger
              className="h-9 w-[140px] text-xs"
              aria-label="Sort My ideas"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="title-asc">Title A–Z</SelectItem>
              <SelectItem value="title-desc">Title Z–A</SelectItem>
            </SelectContent>
          </Select>
          {trimmedFilterQuery ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFilterQuery("")}
              className="h-9 gap-1.5"
              aria-label="Clear filter"
            >
              <X className="size-3.5" aria-hidden />
              Clear
            </Button>
          ) : null}
          {(trimmedFilterQuery || ideaSort !== "newest") && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterQuery("");
                setIdeaSort("newest");
                setIdeasViewPreference({ filterQuery: "", sort: "newest" });
              }}
              className="h-9 gap-1.5 text-xs"
              aria-label="Reset filters"
            >
              <RotateCcw className="size-3.5" aria-hidden />
              Reset filters
            </Button>
          )}
          {trimmedFilterQuery ? (
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Showing {filteredMyIdeas.length} of {sortedMyIdeas.length} ideas
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-border/50 pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="h-9 gap-2"
            aria-label="Print current page"
            title="Print ideas page (⌘P)"
          >
            <Printer className="size-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">Print</span>
          </Button>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3" role="group" aria-label="Export">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadMyIdeasAsJson(myIdeas)}
              className="h-9 gap-2"
              aria-label="Export my ideas as JSON"
            >
              <FileJson className="size-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Export JSON</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                copyMyIdeasAsJsonToClipboard(
                  trimmedFilterQuery ? filteredMyIdeas : sortedMyIdeas
                )
              }
              className="h-9 gap-2"
              aria-label="Copy my ideas as JSON"
              title="Copy as JSON (same data as Export JSON)"
            >
              <Copy className="size-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Copy as JSON</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                downloadMyIdeasAsMarkdown(
                  trimmedFilterQuery ? filteredMyIdeas : sortedMyIdeas
                )
              }
              className="h-9 gap-2"
              aria-label="Export my ideas as Markdown"
            >
              <FileText className="size-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Export MD</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                copyAllMyIdeasMarkdownToClipboard(
                  trimmedFilterQuery ? filteredMyIdeas : sortedMyIdeas
                )
              }
              className="h-9 gap-2"
              aria-label="Copy my ideas as Markdown"
              title="Copy as Markdown (same format as Export MD)"
            >
              <Copy className="size-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Copy as Markdown</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                downloadMyIdeasAsCsv(
                  trimmedFilterQuery ? filteredMyIdeas : sortedMyIdeas
                )
              }
              className="h-9 gap-2"
              aria-label="Export my ideas as CSV"
            >
              <Table className="size-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                void copyMyIdeasAsCsvToClipboard(
                  trimmedFilterQuery ? filteredMyIdeas : sortedMyIdeas
                )
              }
              className="h-9 gap-2"
              aria-label="Copy my ideas as CSV to clipboard"
              title="Copy as CSV (same data as Export CSV)"
            >
              <Copy className="size-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Copy as CSV</span>
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3" role="group" aria-label="Folder actions">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => copyIdeasFolderPath()}
              className="h-9 gap-2"
              aria-label="Copy ideas folder path"
            >
              <Copy className="size-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Copy path</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openIdeasFolderInFileManager()}
              className="h-9 gap-2"
              aria-label="Open ideas folder in file manager"
            >
              <FolderOpen className="size-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Open folder</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={refreshing}
              onClick={handleRefresh}
              className="h-9 gap-2"
              aria-label="Refresh ideas"
            >
              {refreshing ? (
                <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="size-4 shrink-0" aria-hidden />
              )}
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </div>
      <ThreeTabResourcePageContent
        embedded
        config={config}
        resource={resource}
      renderTemplatesTab={(r) => (
        <IdeaTemplateCard
          TEMPLATE_IDEAS={r.TEMPLATE_IDEAS}
          CATEGORY_LABELS={r.CATEGORY_LABELS}
          addToMyIdeas={r.addToMyIdeas}
        />
      )}
      renderAiTab={(r) => (
        <AiGeneratedIdeasCard CATEGORY_LABELS={r.CATEGORY_LABELS} addToMyIdeas={r.addToMyIdeas} />
      )}
      renderMineTab={(r) =>
        r.trimmedFilterQuery && r.filteredMyIdeas.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No ideas match &quot;{r.filterQuery.trim()}&quot;.
          </p>
        ) : (
          <MyIdeasCard
            myIdeas={r.filteredMyIdeas}
            loading={r.loading}
            openCreate={r.openCreate}
            openEdit={r.openEdit}
            handleDelete={r.handleDelete}
            CATEGORY_LABELS={r.CATEGORY_LABELS}
          />
        )
      }
      renderDialogs={(r) => (
        <>
          <IdeaFormDialog
            open={r.createOpen}
            setOpen={r.setCreateOpen}
            title="New idea"
            description="Add a business or product idea. You can change it later."
            formTitle={r.formTitle}
            setFormTitle={r.setFormTitle}
            formDescription={r.formDescription}
            setFormDescription={r.setFormDescription}
            formCategory={r.formCategory}
            setFormCategory={r.setFormCategory}
            handleSave={r.handleSaveCreate}
            saveLoading={r.saveLoading}
            CATEGORY_LABELS={r.CATEGORY_LABELS}
          />
          <IdeaFormDialog
            open={r.editOpen}
            setOpen={r.setEditOpen}
            title="Edit idea"
            description="Update title, description, or category."
            formTitle={r.formTitle}
            setFormTitle={r.setFormTitle}
            formDescription={r.formDescription}
            setFormDescription={r.setFormDescription}
            formCategory={r.formCategory}
            setFormCategory={r.setFormCategory}
            handleSave={r.handleSaveEdit}
            saveLoading={r.saveLoading}
            CATEGORY_LABELS={r.CATEGORY_LABELS}
          />
        </>
      )}
      />
    </div>
  );
}
