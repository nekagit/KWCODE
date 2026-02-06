"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lightbulb, Plus, Pencil, Trash2, Sparkles, Copy, Loader2, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type IdeaCategory = "saas" | "iaas" | "paas" | "website" | "webapp" | "webshop" | "other";

type IdeaRecord = {
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

export default function IdeasPage() {
  const router = useRouter();
  const [myIdeas, setMyIdeas] = useState<IdeaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState<IdeaCategory>("other");
  const [formId, setFormId] = useState<number | undefined>(undefined);
  const [saveLoading, setSaveLoading] = useState(false);
  const [generatingProjectIdeaId, setGeneratingProjectIdeaId] = useState<number | null>(null);

  const [aiTopic, setAiTopic] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<{ title: string; description: string; category: IdeaCategory }[]>([]);

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

  const handleGenerate = useCallback(async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    setAiResults([]);
    try {
      const res = await fetch("/api/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic.trim(), count: 5 }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.detail || res.statusText);
      }
      const data = await res.json();
      setAiResults(Array.isArray(data.ideas) ? data.ideas : []);
      if (!data.ideas?.length) toast.info("No ideas returned. Try another topic.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setAiLoading(false);
    }
  }, [aiTopic]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Lightbulb className="h-6 w-6" />
          Business ideas
        </h1>
        <p className="text-muted-foreground mt-1">
          SaaS, IaaS, PaaS, websites, webapps, webshops — templates, AI-generated, or your own.
        </p>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="ai">AI generated</TabsTrigger>
          <TabsTrigger value="mine">My ideas</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Template ideas</CardTitle>
              <CardDescription>
                Pre-written ideas you can add to &quot;My ideas&quot; and edit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
                <ul className="space-y-3">
                  {TEMPLATE_IDEAS.map((idea, i) => (
                    <li key={i}>
                      <Card className="bg-muted/30">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium">{idea.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{idea.description}</p>
                              <Badge variant="secondary" className="mt-2">
                                {CATEGORY_LABELS[idea.category]}
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="shrink-0"
                              onClick={() => addToMyIdeas(idea, "template")}
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Add to my ideas
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI generated ideas
              </CardTitle>
              <CardDescription>
                Enter a topic or niche; we&apos;ll suggest ideas you can add to My ideas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. developer tools, fitness apps, B2B HR"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                />
                <Button onClick={handleGenerate} disabled={aiLoading || !aiTopic.trim()}>
                  {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  <span className="ml-2">Generate</span>
                </Button>
              </div>
              {aiResults.length > 0 && (
                <ScrollArea className="h-[400px] pr-4">
                  <ul className="space-y-3">
                    {aiResults.map((idea, i) => (
                      <li key={i}>
                        <Card className="bg-muted/30">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <h3 className="font-medium">{idea.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{idea.description}</p>
                                <Badge variant="secondary" className="mt-2">
                                  {CATEGORY_LABELS[idea.category as IdeaCategory]}
                                </Badge>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="shrink-0"
                                onClick={() => addToMyIdeas(idea, "ai")}
                              >
                                <Copy className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mine" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My ideas</CardTitle>
                <CardDescription>Your saved ideas. Add new ones with the button or from Templates / AI.</CardDescription>
              </div>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add new idea
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : myIdeas.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <p>No ideas yet.</p>
                  <p className="text-sm mt-1">Add from Templates, generate with AI, or create one manually.</p>
                  <Button variant="outline" className="mt-4" onClick={openCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add new idea
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
                  <ul className="space-y-3">
                    {myIdeas.map((idea) => (
                      <li key={idea.id}>
                        <Card className={cn("bg-muted/30")}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <h3 className="font-medium">{idea.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{idea.description || "—"}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="secondary">{CATEGORY_LABELS[idea.category]}</Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {idea.source}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex shrink-0 gap-1">
                                <Button
                                  size="sm"
                                  variant="default"
                                  title="Generate a full project from this idea (prompts, tickets, features, design, architecture)"
                                  disabled={generatingProjectIdeaId !== null}
                                  onClick={async () => {
                                    setGeneratingProjectIdeaId(idea.id);
                                    try {
                                      const res = await fetch("/api/generate-project-from-idea", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ ideaId: idea.id }),
                                      });
                                      if (!res.ok) {
                                        const err = await res.json().catch(() => ({}));
                                        throw new Error(err.error || err.detail || res.statusText);
                                      }
                                      const data = await res.json();
                                      toast.success("Project created with prompts, tickets, features, design, and architecture.");
                                      if (data.project?.id) {
                                        router.push(`/projects/${data.project.id}`);
                                      }
                                    } catch (e) {
                                      toast.error(e instanceof Error ? e.message : "Generation failed");
                                    } finally {
                                      setGeneratingProjectIdeaId(null);
                                    }
                                  }}
                                >
                                  {generatingProjectIdeaId === idea.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Wand2 className="h-4 w-4" />
                                  )}
                                  <span className="ml-1.5 sr-only sm:not-sr-only">Generate project</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="shrink-0"
                                  onClick={() => openEdit(idea)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="shrink-0 text-destructive hover:text-destructive"
                                  title="Delete idea"
                                  onClick={() => handleDelete(idea.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New idea</DialogTitle>
            <DialogDescription>Add a business or product idea. You can change it later.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="create-title">Title</Label>
              <Input
                id="create-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. API usage dashboard"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-desc">Description</Label>
              <Textarea
                id="create-desc"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Short description and who it's for"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={formCategory} onValueChange={(v) => setFormCategory(v as IdeaCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORY_LABELS) as IdeaCategory[]).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCreate} disabled={saveLoading || !formTitle.trim()}>
              {saveLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit idea</DialogTitle>
            <DialogDescription>Update title, description, or category.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. API usage dashboard"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea
                id="edit-desc"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Short description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={formCategory} onValueChange={(v) => setFormCategory(v as IdeaCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORY_LABELS) as IdeaCategory[]).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saveLoading || !formTitle.trim()}>
              {saveLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
