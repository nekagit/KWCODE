"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { IdeaTemplateCard } from "@/components/molecules/CardsAndDisplay/IdeaTemplateCard";
import { MyIdeasCard } from "@/components/molecules/CardsAndDisplay/MyIdeasCard";
import { AiGeneratedIdeasCard } from "@/components/molecules/CardsAndDisplay/AiGeneratedIdeasCard";
import { IdeaFormDialog } from "@/components/molecules/FormsAndDialogs/IdeaFormDialog";
import { ThreeTabResourcePageContent } from "@/components/organisms/ThreeTabResourcePageContent";
import { getOrganismClasses } from "./organism-classes";
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
  const cancelledRef = useRef(false);

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
    setFormCategory(idea.category);
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

  const config = {
    title: "Business ideas",
    description: "SaaS, IaaS, PaaS, websites, webapps, webshops — templates, AI-generated, or your own.",
    icon: <Lightbulb className={c["0"]} />,
    tabListClassName: "grid w-full max-w-xl grid-cols-3 gap-2 p-2 glass-card rounded-xl mx-auto bg-muted/20 backdrop-blur-md border-border/40 shadow-sm [&_button]:min-w-0 [&_button]:truncate [&_button]:text-sm",
    tabLabels: ["Templates", "AI generated", "My ideas"] as [string, string, string],
  };

  const resource = {
    myIdeas,
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
    <ThreeTabResourcePageContent
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
      renderMineTab={(r) => (
        <MyIdeasCard
          myIdeas={r.myIdeas}
          loading={r.loading}
          openCreate={r.openCreate}
          openEdit={r.openEdit}
          handleDelete={r.handleDelete}
          CATEGORY_LABELS={r.CATEGORY_LABELS}
        />
      )}
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
  );
}
