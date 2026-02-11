"use client";

import { useState, useCallback, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2 } from "lucide-react";
import { toast } from "sonner";
import type { ArchitectureRecord, ArchitectureCategory } from "@/types/architecture";
import { PageHeader } from "@/components/molecules/LayoutAndNavigation/PageHeader";
import { ArchitectureEditDialog } from "@/components/molecules/FormsAndDialogs/ArchitectureEditDialog";
import { ArchitectureViewDialog } from "@/components/molecules/FormsAndDialogs/ArchitectureViewDialog";
import { ArchitectureTemplatesTabContent } from "@/components/molecules/TabAndContentSections/ArchitectureTemplatesTabContent";
import { AiGeneratedArchitecturesTabContent } from "@/components/molecules/TabAndContentSections/AiGeneratedArchitecturesTabContent";
import { MyDefinitionsTabContent } from "@/components/molecules/TabAndContentSections/MyDefinitionsTabContent";

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

export function ArchitecturePageContent() {
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
  const [saveLoading, setSaveLoading] = useState(false); // Corrected: setLoadingSave to setSaveLoading
  const [viewItem, setViewItem] = useState<ArchitectureRecord | null>(null);

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
      record.extr-inputs
        ? Object.entries(record.extr-inputs).map(([key, value]) => ({ key, value: value as string }))
        : []
    );
    setEditOpen(true);
  }, []);

  const openView = useCallback((record: ArchitectureRecord) => {
    setViewItem(record);
    setViewOpen(true);
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
    async (item: any) => {
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
    const extraaInputs: Record<string, string> = {};
    formExtraInputs.forEach(({ key, value }) => {
      if (key.trim()) extraaInputs[key.trim()] = value.trim();
    });
    setSaveLoading(true); // Corrected: setLoadingSave to setSaveLoading
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
          "extr-inputs": Object.keys(extraaInputs).length ? extraaInputs : undefined,
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
      setSaveLoading(false); // Corrected: setLoadingSave to setSaveLoading
    }
  }, [
    formId,
    formName,
    formCategory,
    formDescription,
    formPractices,
    formScenarios,
    formReferences,
    formAntiPatterns,
    formExamples,
    formExtraInputs,
    loadItems,
    setEditOpen,
    setFormId,
    toast,
    setSaveLoading, // Corrected: setLoadingSave to setSaveLoading
  ]);

  const handleDelete = useCallback(
    async (id: string) => {
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Architecture & best practices"
        description="Select from templates or generate with AI, then edit and add more input. You cannot create from scratch—only add from templates or AI."
      />

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="ai">AI generated</TabsTrigger>
          <TabsTrigger value="mine">My definitions</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <ArchitectureTemplatesTabContent
            CATEGORY_LABELS={CATEGORY_LABELS}
            addFromTemplate={addFromTemplate}
          />
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <AiGeneratedArchitecturesTabContent
            CATEGORY_LABELS={CATEGORY_LABELS}
            addFromAi={addFromAi}
          />
        </TabsContent>

        <TabsContent value="mine" className="mt-6">
          <MyDefinitionsTabContent
            items={items}
            loading={loading}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            ALL_CATEGORIES={ALL_CATEGORIES}
            CATEGORY_LABELS={CATEGORY_LABELS}
            openView={openView}
            openEdit={openEdit}
            handleDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>

      <ArchitectureEditDialog
        editOpen={editOpen}
        setEditOpen={setEditOpen}
        formName={formName}
        setFormName={setFormName}
        formCategory={formCategory}
        setFormCategory={setFormCategory}
        formDescription={formDescription}
        setFormDescription={setFormDescription}
        formPractices={formPractices}
        setFormPractices={setFormPractices}
        formScenarios={formScenarios}
        setFormScenarios={setFormScenarios}
        formReferences={formReferences}
        setFormReferences={setFormReferences}
        formAntiPatterns={formAntiPatterns}
        setFormAntiPatterns={setFormAntiPatterns}
        formExamples={formExamples}
        setFormExamples={setFormExamples}
        formExtraInputs={formExtraInputs}
        setFormExtraInputs={setFormExtraInputs}
        handleSaveEdit={handleSaveEdit}
        saveLoading={saveLoading}
        ALL_CATEGORIES={ALL_CATEGORIES}
        CATEGORY_LABELS={CATEGORY_LABELS}
      />

      <ArchitectureViewDialog
        viewOpen={viewOpen}
        setViewOpen={setViewOpen}
        viewItem={viewItem}
        CATEGORY_LABELS={CATEGORY_LABELS}
        openEdit={openEdit}
        handleDelete={handleDelete}
      />
    </div>
  );
}
