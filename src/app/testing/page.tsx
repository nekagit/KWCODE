"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TestTube2,
  Sparkles,
  BookOpen,
  ListChecks,
  BarChart3,
  Copy,
  Check,
  Loader2,
  FileCode,
  Zap,
  ShieldCheck,
  Monitor,
} from "lucide-react";
import {
  TEST_TEMPLATES,
  TEST_TEMPLATE_CATEGORIES,
  type TestTemplate,
} from "@/data/test-templates";
import { TEST_BEST_PRACTICES_LIST, TEST_PHASES } from "@/data/test-best-practices";

const MY_TEST_PRACTICES_KEY = "testing-my-practices";

export default function TestingPage() {
  const [myPractices, setMyPractices] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
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

  const copyTemplate = useCallback((t: TestTemplate) => {
    const text = t.prompt;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(t.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  const handleAiGenerate = useCallback(async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: `Test plan generation: You are a test automation expert. The user wants a concise test plan or test cases (bullet list or short outline). Focus on best practices: clear test names, arrange-act-assert, edge cases. Request: ${aiPrompt.trim()}`,
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
    } finally {
      setAiLoading(false);
    }
  }, [aiPrompt]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <TestTube2 className="h-7 w-7" />
          Testing
        </h1>
        <p className="text-muted-foreground mt-1">
          AI test templates, best practices, automation phases, and test coverage dashboard.
        </p>
      </div>

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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI test generation
              </CardTitle>
              <CardDescription>
                Describe what you want to test; we generate a short test plan or outline (uses prompt API).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. login form validation, API /users GET, checkout flow"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAiGenerate()}
                />
                <Button onClick={handleAiGenerate} disabled={aiLoading || !aiPrompt.trim()}>
                  {aiLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span className="ml-2">Generate</span>
                </Button>
              </div>
              {aiResult && (
                <div className="rounded-lg border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
                  {aiResult}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test templates</CardTitle>
              <CardDescription>
                Copy a prompt to use with your AI assistant or Cursor to generate tests. Edit as needed for your stack.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-22rem)] pr-4">
                <ul className="space-y-3">
                  {TEST_TEMPLATES.map((t) => (
                    <li key={t.id}>
                      <Card className="bg-muted/30">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium">{t.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                              <Badge variant="secondary" className="mt-2">
                                {TEST_TEMPLATE_CATEGORIES[t.category]}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-2 font-mono bg-background/50 rounded p-2 border">
                                {t.prompt}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="shrink-0"
                              onClick={() => copyTemplate(t)}
                            >
                              {copiedId === t.id ? (
                                <Check className="h-4 w-4 text-success" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                              <span className="ml-1.5">Copy</span>
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

        <TabsContent value="practices" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Curated best practices</CardTitle>
              <CardDescription>
                Reference list for writing and reviewing tests. See also{" "}
                <code className="rounded bg-muted px-1">.cursor/test-best-practices.md</code>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[280px] pr-4">
                <ul className="space-y-2">
                  {TEST_BEST_PRACTICES_LIST.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="text-muted-foreground shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My test practices</CardTitle>
              <CardDescription>
                Your own notes and rules for tests. Saved in browser storage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="e.g. Always use data-testid for E2E; our unit tests use Vitest and @testing-library/react..."
                value={myPractices}
                onChange={(e) => saveMyPractices(e.target.value)}
                className="min-h-[180px] font-mono text-sm"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phases" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Testing phases</CardTitle>
              <CardDescription>
                Recommended order: static first, then unit, integration, E2E. Automation runs these in CI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {TEST_PHASES.map((phase, i) => (
                  <li key={phase.id}>
                    <Card className="bg-muted/30">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                            {i + 1}
                          </span>
                          {phase.icon === "static" && <ShieldCheck className="h-5 w-5 text-muted-foreground" />}
                          {phase.icon === "unit" && <TestTube2 className="h-5 w-5 text-muted-foreground" />}
                          {phase.icon === "integration" && <Zap className="h-5 w-5 text-muted-foreground" />}
                          {phase.icon === "e2e" && <Monitor className="h-5 w-5 text-muted-foreground" />}
                          <h3 className="font-medium">{phase.name}</h3>
                          <Badge variant="outline">{phase.phase}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 ml-10">{phase.description}</p>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverage" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Test coverage dashboard
              </CardTitle>
              <CardDescription>
                Placeholder metrics. Wire to your coverage tool (e.g. Vitest, Jest, Istanbul) for real data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Lines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">—</div>
                    <Progress value={0} className="mt-2 h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Target: 80%</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Branches</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">—</div>
                    <Progress value={0} className="mt-2 h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Target: 75%</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Functions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">—</div>
                    <Progress value={0} className="mt-2 h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Target: 80%</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Statements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">—</div>
                    <Progress value={0} className="mt-2 h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Target: 80%</p>
                  </CardContent>
                </Card>
              </div>
              <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Connect your coverage</p>
                <p className="mt-1">
                  To show real numbers here, add an API or script that reads your coverage output (e.g.{" "}
                  <code className="rounded bg-muted px-1">coverage/coverage-summary.json</code>) and expose
                  lines/branches/functions/statements. Then replace the placeholder cards with fetched values and
                  pass them to the Progress components.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
