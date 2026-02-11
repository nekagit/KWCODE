"use client";

import { useState, useCallback, useEffect } from "react";
import { Building2 } from "lucide-react";
import { getOrganismClasses } from "./organism-classes";

const c = getOrganismClasses("ArchitecturePageContent.tsx");
import { toast } from "sonner";
import type { ArchitectureRecord, ArchitectureCategory } from "@/types/architecture";
import { ArchitectureEditDialog } from "@/components/molecules/FormsAndDialogs/ArchitectureEditDialog";
import { ArchitectureViewDialog } from "@/components/molecules/FormsAndDialogs/ArchitectureViewDialog";
import { ArchitectureTemplatesTabContent } from "@/components/molecules/TabAndContentSections/ArchitectureTemplatesTabContent";
import { AiGeneratedArchitecturesTabContent } from "@/components/molecules/TabAndContentSections/AiGeneratedArchitecturesTabContent";
import { MyDefinitionsTabContent } from "@/components/molecules/TabAndContentSections/MyDefinitionsTabContent";
import { ThreeTabResourcePageContent } from "@/components/organisms/ThreeTabResourcePageContent";

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
  const [saveLoading, setSaveLoading] = useState(false);
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
      record.extra_inputs
        ? Object.entries(record.extra_inputs).map(([key, value]) => ({ key, value: value as string }))
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
    async (item: { name: string; category: ArchitectureCategory; description: string; practices: string; scenarios: string }) => {
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
    const extraInputs: Record<string, string> = {};
    formExtraInputs.forEach(({ key, value }) => {
      if (key.trim()) extraInputs[key.trim()] = value.trim();
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
          extra_inputs: Object.keys(extraInputs).length ? extraInputs : undefined,
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

  const config = {
    title: "Architecture & best practices",
    description: "Select from templates or generate with AI, then edit and add more input. You cannot create from scratch—only add from templates or AI.",
    icon: <Building2 className={c["0"]} />,
    tabLabels: ["Templates", "AI generated", "My definitions"] as [string, string, string],
    tabListClassName: "grid w-full max-w-2xl grid-cols-3",
  };

  const resource = {
    items,
    loading,
    filterCategory,
    setFilterCategory,
    editOpen,
    setEditOpen,
    viewOpen,
    setViewOpen,
    formName,
    setFormName,
    formCategory,
    setFormCategory,
    formDescription,
    setFormDescription,
    formPractices,
    setFormPractices,
    formScenarios,
    setFormScenarios,
    formReferences,
    setFormReferences,
    formAntiPatterns,
    setFormAntiPatterns,
    formExamples,
    setFormExamples,
    formExtraInputs,
    setFormExtraInputs,
    formId,
    saveLoading,
    viewItem,
    setViewItem,
    openEdit,
    openView,
    addFromTemplate,
    addFromAi,
    handleSaveEdit,
    handleDelete,
    CATEGORY_LABELS,
    ALL_CATEGORIES,
  };

  return (
    <ThreeTabResourcePageContent
      config={config}
      resource={resource}
      renderTemplatesTab={(r) => (
        <ArchitectureTemplatesTabContent
          CATEGORY_LABELS={r.CATEGORY_LABELS}
          addFromTemplate={r.addFromTemplate}
        />
      )}
      renderAiTab={(r) => (
        <AiGeneratedArchitecturesTabContent
          CATEGORY_LABELS={r.CATEGORY_LABELS}
          addFromAi={r.addFromAi}
        />
      )}
      renderMineTab={(r) => (
        <MyDefinitionsTabContent
          items={r.items}
          loading={r.loading}
          filterCategory={r.filterCategory}
          setFilterCategory={r.setFilterCategory}
          ALL_CATEGORIES={r.ALL_CATEGORIES}
          CATEGORY_LABELS={r.CATEGORY_LABELS}
          openView={r.openView}
          openEdit={r.openEdit}
          handleDelete={r.handleDelete}
        />
      )}
      renderDialogs={(r) => (
        <>
          <ArchitectureEditDialog
            editOpen={r.editOpen}
            setEditOpen={r.setEditOpen}
            formName={r.formName}
            setFormName={r.setFormName}
            formCategory={r.formCategory}
            setFormCategory={r.setFormCategory}
            formDescription={r.formDescription}
            setFormDescription={r.setFormDescription}
            formPractices={r.formPractices}
            setFormPractices={r.setFormPractices}
            formScenarios={r.formScenarios}
            setFormScenarios={r.setFormScenarios}
            formReferences={r.formReferences}
            setFormReferences={r.setFormReferences}
            formAntiPatterns={r.formAntiPatterns}
            setFormAntiPatterns={r.setFormAntiPatterns}
            formExamples={r.formExamples}
            setFormExamples={r.setFormExamples}
            formExtraInputs={r.formExtraInputs}
            setFormExtraInputs={r.setFormExtraInputs}
            handleSaveEdit={r.handleSaveEdit}
            saveLoading={r.saveLoading}
            ALL_CATEGORIES={r.ALL_CATEGORIES}
            CATEGORY_LABELS={r.CATEGORY_LABELS}
          />
          <ArchitectureViewDialog
            viewOpen={r.viewOpen}
            setViewOpen={r.setViewOpen}
            viewItem={r.viewItem}
            CATEGORY_LABELS={r.CATEGORY_LABELS}
            openEdit={r.openEdit}
            handleDelete={r.handleDelete}
          />
        </>
      )}
    />
  );
}
