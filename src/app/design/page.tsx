"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PAGE_TEMPLATES, createDefaultDesignConfig } from "@/data/design-templates";
import { designConfigToMarkdown } from "@/lib/design-to-markdown";
import type { DesignConfig, DesignSection } from "@/types/design";
import {
  Palette,
  Type,
  Layout as LayoutIcon,
  Layers,
  FileCode,
  Eye,
  Sparkles,
  Copy,
  Download,
  Loader2,
  Trash2,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";

export default function DesignPage() {
  const [config, setConfig] = useState<DesignConfig>(() => createDefaultDesignConfig("landing"));
  const [generatedMd, setGeneratedMd] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [saveToLibraryLoading, setSaveToLibraryLoading] = useState(false);

  type DesignLibraryItem = { id: string; name: string; created_at?: string; updated_at?: string };
  const [designsLibrary, setDesignsLibrary] = useState<DesignLibraryItem[]>([]);
  const [designsLibraryLoading, setDesignsLibraryLoading] = useState(false);
  const loadDesignsLibrary = useCallback(async () => {
    setDesignsLibraryLoading(true);
    try {
      const res = await fetch("/api/data/designs");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setDesignsLibrary(Array.isArray(data) ? data : []);
    } catch {
      setDesignsLibrary([]);
    } finally {
      setDesignsLibraryLoading(false);
    }
  }, []);
  useEffect(() => {
    loadDesignsLibrary();
  }, [loadDesignsLibrary]);
  const handleDeleteDesign = useCallback(
    async (id: string) => {
      if (!confirm("Delete this design from the library?")) return;
      try {
        const res = await fetch(`/api/data/designs/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || res.statusText);
        }
        await loadDesignsLibrary();
        toast.success("Design removed from library");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to delete design");
      }
    },
    [loadDesignsLibrary]
  );

  const updateConfig = useCallback((patch: Partial<DesignConfig>) => {
    setConfig((c) => ({ ...c, ...patch }));
  }, []);

  const setTemplate = useCallback(
    (templateId: string) => {
      const next = createDefaultDesignConfig(templateId);
      setConfig((c) => ({
        ...next,
        projectName: c.projectName,
        pageTitle: c.pageTitle || next.pageTitle,
        colors: c.colors,
        typography: c.typography,
        layout: c.layout,
        notes: c.notes,
      }));
    },
    []
  );

  const updateSection = useCallback((id: string, patch: Partial<DesignSection>) => {
    setConfig((c) => ({
      ...c,
      sections: c.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }, []);

  const mdOutput = useMemo(() => designConfigToMarkdown(config), [config]);

  const generateMd = useCallback(() => {
    setGeneratedMd(mdOutput);
    toast.success("Design spec generated");
  }, [mdOutput]);

  const copyMd = useCallback(() => {
    const text = generatedMd || mdOutput;
    void navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }, [generatedMd, mdOutput]);

  const downloadMd = useCallback(() => {
    const text = generatedMd || mdOutput;
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `design-${config.templateId}-${config.pageTitle.replace(/\s+/g, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Download started");
  }, [generatedMd, mdOutput, config.templateId, config.pageTitle]);

  const designJson = useMemo(() => JSON.stringify(config, null, 2), [config]);

  const copyJson = useCallback(() => {
    void navigator.clipboard.writeText(designJson);
    toast.success("JSON copied to clipboard");
  }, [designJson]);

  const downloadJson = useCallback(() => {
    const blob = new Blob([designJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `design-${config.templateId}-${config.pageTitle.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON download started");
  }, [designJson, config.templateId, config.pageTitle]);

  const saveToLibrary = useCallback(async () => {
    const name = (config.projectName || config.pageTitle || "Untitled design").trim() || "Untitled design";
    setSaveToLibraryLoading(true);
    try {
      const res = await fetch("/api/data/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, config }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }
      await loadDesignsLibrary();
      toast.success("Design saved to library. You can link it to projects on the project details page.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save to library");
    } finally {
      setSaveToLibraryLoading(false);
    }
  }, [config, loadDesignsLibrary]);

  const handleAiGenerate = useCallback(async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/generate-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: aiPrompt.trim(),
          templateId: config.templateId,
          projectName: config.projectName,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }
      const data = await res.json();
      if (data.markdown) setGeneratedMd(data.markdown);
      if (data.config) setConfig((c) => ({ ...c, ...data.config }));
      toast.success("AI design generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI generation failed");
    } finally {
      setAiLoading(false);
    }
  }, [aiPrompt, config.templateId, config.projectName]);

  return (
    <div className="flex flex-col gap-6 p-4 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-semibold">Design Configurator</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure page templates, colors, typography, and structure. Generate .md design specs and use AI to refine.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Configuration */}
        <div className="xl:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Template</CardTitle>
              <CardDescription>Page type and default structure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Select value={config.templateId} onValueChange={setTemplate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_TEMPLATES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {PAGE_TEMPLATES.find((t) => t.id === config.templateId)?.description}
              </p>
            </CardContent>
          </Card>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="space-y-4 mt-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <LayoutIcon className="h-4 w-4" />
                    General
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>Project name</Label>
                    <Input
                      value={config.projectName}
                      onChange={(e) => updateConfig({ projectName: e.target.value })}
                      placeholder="My Product"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Page title</Label>
                    <Input
                      value={config.pageTitle}
                      onChange={(e) => updateConfig({ pageTitle: e.target.value })}
                      placeholder="Home"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Textarea
                      value={config.notes ?? ""}
                      onChange={(e) => updateConfig({ notes: e.target.value || undefined })}
                      placeholder="Design notes..."
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Sections (outline)
                  </CardTitle>
                  <CardDescription>Order and enable/disable sections</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px] rounded-md border p-2">
                    <ul className="space-y-2">
                      {[...config.sections]
                        .sort((a, b) => a.order - b.order)
                        .map((s) => (
                          <li
                            key={s.id}
                            className="flex items-center gap-2 rounded-md border bg-muted/30 px-2 py-1.5"
                          >
                            <Switch
                              checked={s.enabled}
                              onCheckedChange={(v) => updateSection(s.id, { enabled: v })}
                            />
                            <span className="text-sm flex-1 truncate">
                              {s.order + 1}. {s.title}
                            </span>
                            <span className="text-xs text-muted-foreground">{s.kind}</span>
                          </li>
                        ))}
                    </ul>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="style" className="space-y-4 mt-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Colors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(
                    [
                      ["primary", "Primary"],
                      ["secondary", "Secondary"],
                      ["accent", "Accent"],
                      ["background", "Background"],
                      ["surface", "Surface"],
                      ["text", "Text"],
                      ["textMuted", "Text muted"],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-2">
                      <input
                        type="color"
                        className="h-8 w-10 rounded border cursor-pointer"
                        value={config.colors[key]}
                        onChange={(e) =>
                          updateConfig({
                            colors: { ...config.colors, [key]: e.target.value },
                          })
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <Label className="text-xs">{label}</Label>
                        <Input
                          className="font-mono text-xs h-8"
                          value={config.colors[key]}
                          onChange={(e) =>
                            updateConfig({
                              colors: { ...config.colors, [key]: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Typography
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Heading font</Label>
                    <Input
                      value={config.typography.headingFont}
                      onChange={(e) =>
                        updateConfig({
                          typography: { ...config.typography, headingFont: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Body font</Label>
                    <Input
                      value={config.typography.bodyFont}
                      onChange={(e) =>
                        updateConfig({
                          typography: { ...config.typography, bodyFont: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Base size</Label>
                      <Input
                        value={config.typography.baseSize}
                        onChange={(e) =>
                          updateConfig({
                            typography: { ...config.typography, baseSize: e.target.value },
                          })
                        }
                        placeholder="16px"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Scale</Label>
                      <Input
                        value={config.typography.scale}
                        onChange={(e) =>
                          updateConfig({
                            typography: { ...config.typography, scale: e.target.value },
                          })
                        }
                        placeholder="1.25"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Layout</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Max width</Label>
                    <Input
                      value={config.layout.maxWidth}
                      onChange={(e) =>
                        updateConfig({
                          layout: { ...config.layout, maxWidth: e.target.value },
                        })
                      }
                      placeholder="1200px"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Spacing</Label>
                      <Input
                        value={config.layout.spacing}
                        onChange={(e) =>
                          updateConfig({
                            layout: { ...config.layout, spacing: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Border radius</Label>
                      <Input
                        value={config.layout.borderRadius}
                        onChange={(e) =>
                          updateConfig({
                            layout: { ...config.layout, borderRadius: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Nav style</Label>
                    <Select
                      value={config.layout.navStyle}
                      onValueChange={(v: "minimal" | "centered" | "full" | "sidebar") =>
                        updateConfig({ layout: { ...config.layout, navStyle: v } })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="centered">Centered</SelectItem>
                        <SelectItem value="full">Full</SelectItem>
                        <SelectItem value="sidebar">Sidebar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Preview + Generated .md */}
        <div className="xl:col-span-2 space-y-4">
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="output" className="flex items-center gap-2">
                <FileCode className="h-4 w-4" />
                Generated .md
              </TabsTrigger>
              <TabsTrigger value="json" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                JSON
              </TabsTrigger>
              <TabsTrigger value="library" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Library
              </TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="mt-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Live preview</CardTitle>
                  <CardDescription>Structure and colors applied</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="rounded-lg border overflow-hidden text-left"
                    style={{
                      maxWidth: config.layout.maxWidth,
                      fontFamily: config.typography.bodyFont,
                      fontSize: config.typography.baseSize,
                      color: config.colors.text,
                      background: config.colors.background,
                    }}
                  >
                    {[...config.sections]
                      .filter((s) => s.enabled)
                      .sort((a, b) => a.order - b.order)
                      .map((s) => (
                        <div
                          key={s.id}
                          className="border-b last:border-b-0 p-4"
                          style={{
                            background: s.kind === "nav" || s.kind === "footer" ? config.colors.surface : undefined,
                            padding: config.layout.spacing,
                          }}
                        >
                          <div
                            className="font-semibold mb-1"
                            style={{
                              fontFamily: config.typography.headingFont,
                              color: s.kind === "hero" ? config.colors.primary : config.colors.text,
                            }}
                          >
                            {s.title}
                          </div>
                          <div
                            className="text-sm"
                            style={{ color: config.colors.textMuted }}
                          >
                            Section type: {s.kind}
                            {s.copy && ` · ${s.copy}`}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="output" className="mt-3">
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Design spec (.md)</CardTitle>
                    <CardDescription>Generate, copy, or download</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={generateMd}>
                      Generate
                    </Button>
                    <Button size="sm" variant="outline" onClick={copyMd}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={downloadMd}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    className="font-mono text-xs min-h-[320px] resize-y"
                    value={generatedMd || mdOutput}
                    onChange={(e) => setGeneratedMd(e.target.value)}
                    placeholder="Click Generate or use AI to produce design spec..."
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="library" className="mt-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Saved designs
                  </CardTitle>
                  <CardDescription>Designs saved to the library. You can link them to projects on the project details page. Delete to remove from library.</CardDescription>
                </CardHeader>
                <CardContent>
                  {designsLibraryLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : designsLibrary.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">No saved designs. Save the current config from the JSON tab to add one.</p>
                  ) : (
                    <ScrollArea className="h-[280px] rounded-md border p-2">
                      <ul className="space-y-2">
                        {designsLibrary.map((d) => (
                          <li
                            key={d.id}
                            className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2"
                          >
                            <span className="text-sm font-medium truncate min-w-0">{d.name}</span>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 shrink-0 text-destructive hover:text-destructive"
                              title="Delete design from library"
                              onClick={() => handleDeleteDesign(d.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="json" className="mt-3">
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Design config (JSON)</CardTitle>
                    <CardDescription>Copy, download, or save to library (then link to projects on project details)</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={copyJson}>
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                    <Button size="sm" variant="outline" onClick={downloadJson}>
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                    <Button size="sm" variant="default" onClick={saveToLibrary} disabled={saveToLibraryLoading}>
                      {saveToLibraryLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Save to library
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    className="font-mono text-xs min-h-[320px] resize-y"
                    value={designJson}
                    readOnly
                    placeholder="Design config as JSON..."
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* AI Generate */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Generate design
              </CardTitle>
              <CardDescription>
                Describe your page (e.g. &quot;Modern SaaS landing, blue accent, minimal nav&quot;). AI will suggest a design spec and optionally update config.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="e.g. Dark theme contact page with orange CTA, 3-column footer, centered form..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <Button onClick={handleAiGenerate} disabled={aiLoading}>
                {aiLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate with AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
