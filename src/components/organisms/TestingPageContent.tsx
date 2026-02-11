"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TestTube2,
  BookOpen,
  ListChecks,
  BarChart3,
  FileCode,
} from "lucide-react";
import { PageHeader } from "@/components/molecules/LayoutAndNavigation/PageHeader";
import { TestingTemplatesTabContent } from "@/components/molecules/TabAndContentSections/TestingTemplatesTabContent";
import { TestingPracticesTabContent } from "@/components/molecules/TabAndContentSections/TestingPracticesTabContent";
import { TestingPhasesTabContent } from "@/components/molecules/TabAndContentSections/TestingPhasesTabContent";
import { TestingCoverageTabContent } from "@/components/molecules/TabAndContentSections/TestingCoverageTabContent";

const MY_TEST_PRACTICES_KEY = "testing-my-practices";

export function TestingPageContent() {
  const [myPractices, setMyPractices] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [aiPromptRecord, setAiPromptRecord] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MY_TEST_PRACTICES_KEY);
      setMyPractices(raw ?? "");
    } catch {
      setMyPractices("");
    }
  }, []);

  const saveMyPractices = useCallback((value: string) => {
    setMyPractices(value);
    try {
      localStorage.setItem(MY_TEST_PRACTICES_KEY, value);
    } catch {
      /* ignore */
    }
  }, []);

  const handleAiGenerate = useCallback(async () => {
    if (!aiPromptRecord.trim()) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: `Test plan generation: You are a test automation expert. The user wants a concise test plan or test cases (bullet list or short outline). Focus on best practices: clear test names, arrange-act-assert, edge cases. Request: ${aiPromptRecord.trim()}`,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.detail || res.statusText);
      }
      const data = await res.json();
      setAiResult(data.content ?? "No content returned.");
    } catch (e) {
      setAiResult(`Error: ${e instanceof Error ? e.message : "Generation failed"}`);
    }
    finally {
      setAiLoading(false);
    }
  }, [aiPromptRecord]);

  const generationProps = {
    aiPromptRecord,
    setAiPromptRecord,
    aiLoading,
    aiResult,
    handleAiGenerate,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Testing"
        description="AI test templates, best practices, automation phases, and test coverage dashboard."
        icon={<TestTube2 className="h-6 w-6 text-info/90" />}
      />

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="practices" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Best practices
          </TabsTrigger>
          <TabsTrigger value="phases" className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            Phases
          </TabsTrigger>
          <TabsTrigger value="coverage" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Coverage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6 space-y-6">
          <TestingTemplatesTabContent
            aiPromptRecord={aiPromptRecord}
            setAiPromptRecord={setAiPromptRecord}
            aiLoading={aiLoading}
            aiResult={aiResult}
            handleAiGenerate={handleAiGenerate}
            copiedId={copiedId}
            setCopiedId={setCopiedId}
          />
        </TabsContent>

        <TabsContent value="practices" className="mt-6 space-y-6">
          <TestingPracticesTabContent
            myPractices={myPractices}
            saveMyPractices={saveMyPractices}
          />
        </TabsContent>

        <TabsContent value="phases" className="mt-6">
          <TestingPhasesTabContent />
        </TabsContent>

        <TabsContent value="coverage" className="mt-6">
          <TestingCoverageTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
