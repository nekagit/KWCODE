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
import { getOrganismClasses } from "./organism-classes";

const c = getOrganismClasses("TestingPageContent.tsx");
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
    <div className={c["0"]}>
      <PageHeader
        title="Testing"
        description="AI test templates, best practices, automation phases, and test coverage dashboard."
        icon={<TestTube2 className={c["1"]} />}
      />

      <Tabs defaultValue="templates" className={c["2"]}>
        <TabsList className={c["3"]}>
          <TabsTrigger value="templates" className={c["4"]}>
            <FileCode className={c["5"]} />
            Templates
          </TabsTrigger>
          <TabsTrigger value="practices" className={c["6"]}>
            <BookOpen className={c["7"]} />
            Best practices
          </TabsTrigger>
          <TabsTrigger value="phases" className={c["8"]}>
            <ListChecks className={c["9"]} />
            Phases
          </TabsTrigger>
          <TabsTrigger value="coverage" className={c["10"]}>
            <BarChart3 className={c["11"]} />
            Coverage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className={c["12"]}>
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

        <TabsContent value="practices" className={c["13"]}>
          <TestingPracticesTabContent
            myPractices={myPractices}
            saveMyPractices={saveMyPractices}
          />
        </TabsContent>

        <TabsContent value="phases" className={c["14"]}>
          <TestingPhasesTabContent />
        </TabsContent>

        <TabsContent value="coverage" className={c["15"]}>
          <TestingCoverageTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
