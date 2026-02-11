"use client";

import { useState, useCallback, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/molecules/LayoutAndNavigation/PageHeader";
import { IdeaTemplateCard } from "@/components/molecules/CardsAndDisplay/IdeaTemplateCard";
import { AiGeneratedIdeasCard } from "@/components/molecules/CardsAndDisplay/AiGeneratedIdeasCard";
import { MyIdeasCard } from "@/components/molecules/CardsAndDisplay/MyIdeasCard";
import { IdeaFormDialog } from "@/components/molecules/FormsAndDialogs/IdeaFormDialog";

export type IdeaCategory = "saas" | "iaas" | "paas" | "website" | "webapp" | "webshop" | "other";

export type IdeaRecord = {
  id: number;
  title: string;
  description: string;
  category: IdeaCategory;
  source: "template" | "ai" | "manual";
  created_at?: string;
  updated_at?: string;
};

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

  const loadIdeas = useCallback(async () => {
    try {
      const res = await fetch("/api/data/ideas");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setMyIdeas(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load ideas");
      setMyIdeas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIdeas();
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business ideas"
        description="SaaS, IaaS, PaaS, websites, webapps, webshops — templates, AI-generated, or your own."
        icon={<Lightbulb />} // Pass the component directly
      />

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="ai">AI generated</TabsTrigger>
          <TabsTrigger value="mine">My ideas</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <IdeaTemplateCard
            TEMPLATE_IDEAS={TEMPLATE_IDEAS}
            CATEGORY_LABELS={CATEGORY_LABELS}
            addToMyIdeas={addToMyIdeas}
          />
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <AiGeneratedIdeasCard CATEGORY_LABELS={CATEGORY_LABELS} addToMyIdeas={addToMyIdeas} />
        </TabsContent>

        <TabsContent value="mine" className="mt-6">
          <MyIdeasCard
            myIdeas={myIdeas}
            loading={loading}
            openCreate={openCreate}
            openEdit={openEdit}
            handleDelete={handleDelete}
            CATEGORY_LABELS={CATEGORY_LABELS}
          />
        </TabsContent>
      </Tabs>

      <IdeaFormDialog
        open={createOpen}
        setOpen={setCreateOpen}
        title="New idea"
        description="Add a business or product idea. You can change it later."
        formTitle={formTitle}
        setFormTitle={setFormTitle}
        formDescription={formDescription}
        setFormDescription={setFormDescription}
        formCategory={formCategory}
        setFormCategory={setFormCategory}
        handleSave={handleSaveCreate}
        saveLoading={saveLoading}
        CATEGORY_LABELS={CATEGORY_LABELS}
      />

      <IdeaFormDialog
        open={editOpen}
        setOpen={setEditOpen}
        title="Edit idea"
        description="Update title, description, or category."
        formTitle={formTitle}
        setFormTitle={setFormTitle}
        formDescription={formDescription}
        setFormDescription={setFormDescription}
        formCategory={formCategory}
        setFormCategory={setFormCategory}
        handleSave={handleSaveEdit}
        saveLoading={saveLoading}
        CATEGORY_LABELS={CATEGORY_LABELS}
      />
    </div>
  );
}
