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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Pencil, Trash2, Loader2, FileText, Copy, Sparkles, Plus } from "lucide-react";
import { toast } from "sonner";
import type { ArchitectureRecord, ArchitectureCategory } from "@/types/architecture";
import { ARCHITECTURE_TEMPLATES } from "@/data/architecture-templates";

const CATEGORY_LABELS: Record<ArchitectureCategory, string> = {
  ddd: "DDD",
  tdd: "TDD",
  bdd: "BDD",
  dry: "DRY",
  solid: "SOLID",
  kiss: "KISS",
  yagni: "YAGNI",
  clean: "Clean Architecture",
  hexagonal: "Hexagonal",
  cqrs: "CQRS",
  event_sourcing: "Event Sourcing",
  microservices: "Microservices",
  rest: "REST",
  graphql: "GraphQL",
  scenario: "Scenario",
};

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as ArchitectureCategory[];

type AiResult = { name: string; description: string; category: ArchitectureCategory; practices: string; scenarios: string };

export default function ArchitecturePage() {
  const [items, setItems] = useState<ArchitectureRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<ArchitectureCategory | "all">("all");
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<ArchitectureCategory>("ddd");
  const [formDescription, setFormDescription] = useState("");
  const [formPractices, setFormPractices] = useState("");
  const [formScenarios, setFormScenarios] = useState("");
  const [formReferences, setFormReferences] = useState("");
  const [formAntiPatterns, setFormAntiPatterns] = useState("");
  const [formExamples, setFormExamples] = useState("");
  const [formExtraInputs, setFormExtraInputs] = useState<{ key: string; value: string }[]>([]);
  const [formId, setFormId] = useState<string | undefined>(undefined);
  const [saveLoading, setSaveLoading] = useState(false);
  const [viewItem, setViewItem] = useState<ArchitectureRecord | null>(null);

  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState(3);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<AiResult[]>([]);

  const loadItems = useCallback(async () => {
    try {
      const res = await fetch("/api/data/architectures");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load architectures");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const filteredItems =
    filterCategory === "all"
      ? items
      : items.filter((a) => a.category === filterCategory);

  const openEdit = useCallback((record: ArchitectureRecord) => {
    setFormId(record.id);
    setFormName(record.name);
    setFormCategory(record.category);
    setFormDescription(record.description);
    setFormPractices(record.practices);
    setFormScenarios(record.scenarios);
    setFormReferences(record.references ?? "");
    setFormAntiPatterns(record.anti_patterns ?? "");
    setFormExamples(record.examples ?? "");
    setFormExtraInputs(
      record.extra_inputs
        ? Object.entries(record.extra_inputs).map(([key, value]) => ({ key, value }))
        : []
    );
    setEditOpen(true);
  }, []);

  const openView = useCallback((record: ArchitectureRecord) => {
    setViewItem(record);
    setViewOpen(true);
  }, []);

  const addExtraInput = useCallback(() => {
    setFormExtraInputs((prev) => [...prev, { key: "", value: "" }]);
  }, []);

  const updateExtraInput = useCallback((index: number, field: "key" | "value", val: string) => {
    setFormExtraInputs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  }, []);

  const removeExtraInput = useCallback((index: number) => {
    setFormExtraInputs((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addFromTemplate = useCallback(
    async (t: { name: string; category: ArchitectureCategory; description: string; practices: string; scenarios: string }) => {
      try {
        const res = await fetch("/api/data/architectures", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: t.name,
            category: t.category,
            description: t.description,
            practices: t.practices,
            scenarios: t.scenarios,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || res.statusText);
        }
        await loadItems();
        toast.success("Added to My definitions");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to add");
      }
    },
    [loadItems]
  );

  const addFromAi = useCallback(
    async (item: AiResult) => {
      try {
        const res = await fetch("/api/data/architectures", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: item.name,
            category: item.category,
            description: item.description,
            practices: item.practices,
            scenarios: item.scenarios,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || res.statusText);
        }
        await loadItems();
        toast.success("Added to My definitions");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to add");
      }
    },
    [loadItems]
  );

  const handleSaveEdit = useCallback(async () => {
    if (formId === undefined || !formName.trim()) return;
    const extra_inputs: Record<string, string> = {};
    formExtraInputs.forEach(({ key, value }) => {
      if (key.trim()) extra_inputs[key.trim()] = value.trim();
    });
    setSaveLoading(true);
    try {
      const res = await fetch(`/api/data/architectures/${formId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          category: formCategory,
          description: formDescription.trim(),
          practices: formPractices.trim(),
          scenarios: formScenarios.trim(),
          references: formReferences.trim() || undefined,
          anti_patterns: formAntiPatterns.trim() || undefined,
          examples: formExamples.trim() || undefined,
          extra_inputs: Object.keys(extra_inputs).length ? extra_inputs : undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }
      await loadItems();
      setEditOpen(false);
      setFormId(undefined);
      toast.success("Architecture updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaveLoading(false);
    }
  }, [formId, formName, formCategory, formDescription, formPractices, formScenarios, formReferences, formAntiPatterns, formExamples, formExtraInputs, loadItems]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Delete this architecture definition?")) return;
      try {
        const res = await fetch(`/api/data/architectures/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || res.statusText);
        }
        await loadItems();
        setViewOpen(false);
        setViewItem(null);
        toast.success("Architecture removed");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to delete");
      }
    },
    [loadItems]
  );

  const handleAiGenerate = useCallback(async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    setAiResults([]);
    try {
      const res = await fetch("/api/generate-architectures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic.trim(), count: aiCount }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.detail || res.statusText);
      }
      const data = await res.json();
      setAiResults(Array.isArray(data.architectures) ? data.architectures : []);
      if (!data.architectures?.length) toast.info("No results. Try another topic.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setAiLoading(false);
    }
  }, [aiTopic, aiCount]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          Architecture & best practices
        </h1>
        <p className="text-muted-foreground mt-1">
          Select from templates or generate with AI, then edit and add more inputs. You cannot create from scratch—only add from templates or AI.
        </p>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="ai">AI generated</TabsTrigger>
          <TabsTrigger value="mine">My definitions</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Template architectures</CardTitle>
              <CardDescription>
                Pre-defined patterns and best practices. Add any to &quot;My definitions&quot; and edit or add more inputs there.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
                <ul className="space-y-3">
                  {ARCHITECTURE_TEMPLATES.map((t, i) => (
                    <li key={i}>
                      <Card className="bg-muted/30">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium">{t.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.description || "—"}</p>
                              <Badge variant="secondary" className="mt-2">
                                {CATEGORY_LABELS[t.category]}
                              </Badge>
                            </div>
                            <Button size="sm" variant="outline" className="shrink-0" onClick={() => addFromTemplate(t)}>
                              <Copy className="h-4 w-4 mr-1" />
                              Add to my definitions
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
                AI generated
              </CardTitle>
              <CardDescription>
                Enter a topic or scenario; we&apos;ll suggest architecture definitions you can add to My definitions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 items-end">
                <div className="flex-1 min-w-[200px] space-y-2">
                  <Label htmlFor="ai-topic">Topic or scenario</Label>
                  <Input
                    id="ai-topic"
                    placeholder="e.g. event-driven APIs, secure auth, high-throughput"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAiGenerate()}
                  />
                </div>
                <div className="w-[100px] space-y-2">
                  <Label>Count</Label>
                  <Select value={String(aiCount)} onValueChange={(v) => setAiCount(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAiGenerate} disabled={aiLoading || !aiTopic.trim()}>
                  {aiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Generate
                </Button>
              </div>
              {aiResults.length > 0 && (
                <ScrollArea className="h-[400px] pr-4">
                  <ul className="space-y-3">
                    {aiResults.map((item, i) => (
                      <li key={i}>
                        <Card className="bg-muted/30">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <h3 className="font-medium">{item.name}</h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                                <Badge variant="secondary" className="mt-2">
                                  {CATEGORY_LABELS[item.category]}
                                </Badge>
                              </div>
                              <Button size="sm" variant="outline" className="shrink-0" onClick={() => addFromAi(item)}>
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
                <CardTitle>My definitions</CardTitle>
                <CardDescription>
                  Definitions you added from templates or AI. Edit to add more inputs (references, anti-patterns, examples, custom fields).
                </CardDescription>
              </div>
              <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as ArchitectureCategory | "all")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {ALL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <p>
                    {filterCategory === "all"
                      ? "No definitions yet."
                      : `No definitions in ${CATEGORY_LABELS[filterCategory as ArchitectureCategory]}.`}
                  </p>
                  <p className="text-sm mt-1">Add from Templates or generate with AI, then edit here.</p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
                  <ul className="space-y-3">
                    {filteredItems.map((record) => (
                      <li key={record.id}>
                        <Card className="bg-muted/30">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <h3 className="font-medium">{record.name}</h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {record.description || "—"}
                                </p>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  <Badge variant="secondary">{CATEGORY_LABELS[record.category]}</Badge>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-xs"
                                    onClick={() => openView(record)}
                                  >
                                    <FileText className="h-3.5 w-3.5 mr-1" />
                                    View details
                                  </Button>
                                </div>
                              </div>
                              <div className="flex shrink-0 gap-1">
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openView(record)}>
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(record)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  onClick={() => handleDelete(record.id)}
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

      {/* Edit dialog: all fields + extra inputs */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit architecture definition</DialogTitle>
            <DialogDescription>
              Update fields and add more inputs: references, anti-patterns, examples, or custom key-value inputs.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Domain-Driven Design"
              />
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={formCategory} onValueChange={(v) => setFormCategory(v as ArchitectureCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea
                id="edit-desc"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Short overview"
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-practices">Best practices / principles</Label>
              <Textarea
                id="edit-practices"
                value={formPractices}
                onChange={(e) => setFormPractices(e.target.value)}
                placeholder="Bullet points or markdown"
                rows={4}
                className="font-mono text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-scenarios">When to use / scenarios</Label>
              <Textarea
                id="edit-scenarios"
                value={formScenarios}
                onChange={(e) => setFormScenarios(e.target.value)}
                placeholder="When to apply, scenarios, anti-patterns..."
                rows={4}
                className="font-mono text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-references">References</Label>
              <Textarea
                id="edit-references"
                value={formReferences}
                onChange={(e) => setFormReferences(e.target.value)}
                placeholder="Links, books, docs..."
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-anti">Anti-patterns</Label>
              <Textarea
                id="edit-anti"
                value={formAntiPatterns}
                onChange={(e) => setFormAntiPatterns(e.target.value)}
                placeholder="What to avoid..."
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-examples">Examples</Label>
              <Textarea
                id="edit-examples"
                value={formExamples}
                onChange={(e) => setFormExamples(e.target.value)}
                placeholder="Code snippets, diagrams, examples..."
                rows={3}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Additional inputs</Label>
                <Button type="button" variant="outline" size="sm" onClick={addExtraInput}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add input
                </Button>
              </div>
              {formExtraInputs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Add custom label-value pairs (e.g. Tools, Checklist).</p>
              ) : (
                <ul className="space-y-2">
                  {formExtraInputs.map((row, index) => (
                    <li key={index} className="flex gap-2 items-center">
                      <Input
                        placeholder="Label"
                        value={row.key}
                        onChange={(e) => updateExtraInput(index, "key", e.target.value)}
                        className="flex-1 min-w-0"
                      />
                      <Input
                        placeholder="Value"
                        value={row.value}
                        onChange={(e) => updateExtraInput(index, "value", e.target.value)}
                        className="flex-1 min-w-0"
                      />
                      <Button type="button" variant="ghost" size="sm" className="shrink-0 text-destructive" onClick={() => removeExtraInput(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saveLoading || !formName.trim()}>
              {saveLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View detail dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewItem?.name}
              {viewItem && <Badge variant="secondary">{CATEGORY_LABELS[viewItem.category]}</Badge>}
            </DialogTitle>
            {viewItem?.description && <DialogDescription>{viewItem.description}</DialogDescription>}
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4 py-4">
              {viewItem.practices && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Best practices / principles</h4>
                  <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/50 rounded-md p-3 overflow-x-auto">
                    {viewItem.practices}
                  </pre>
                </div>
              )}
              {viewItem.scenarios && (
                <div>
                  <h4 className="text-sm font-medium mb-2">When to use / scenarios</h4>
                  <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/50 rounded-md p-3 overflow-x-auto">
                    {viewItem.scenarios}
                  </pre>
                </div>
              )}
              {viewItem.references && (
                <div>
                  <h4 className="text-sm font-medium mb-2">References</h4>
                  <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/50 rounded-md p-3 overflow-x-auto">
                    {viewItem.references}
                  </pre>
                </div>
              )}
              {viewItem.anti_patterns && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Anti-patterns</h4>
                  <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/50 rounded-md p-3 overflow-x-auto">
                    {viewItem.anti_patterns}
                  </pre>
                </div>
              )}
              {viewItem.examples && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Examples</h4>
                  <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/50 rounded-md p-3 overflow-x-auto">
                    {viewItem.examples}
                  </pre>
                </div>
              )}
              {viewItem.extra_inputs && Object.keys(viewItem.extra_inputs).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Additional inputs</h4>
                  <ul className="space-y-2">
                    {Object.entries(viewItem.extra_inputs).map(([key, value]) => (
                      <li key={key}>
                        <span className="text-sm font-medium text-muted-foreground">{key}:</span>
                        <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/50 rounded-md p-2 mt-0.5 overflow-x-auto">
                          {value}
                        </pre>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {!viewItem.practices && !viewItem.scenarios && !viewItem.references && !viewItem.anti_patterns && !viewItem.examples && !(viewItem.extra_inputs && Object.keys(viewItem.extra_inputs).length) && (
                <p className="text-muted-foreground text-sm">No content defined. Edit to add practices, scenarios, or more inputs.</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              Close
            </Button>
            {viewItem && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewOpen(false);
                    openEdit(viewItem);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => viewItem && handleDelete(viewItem.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
