import { useCallback, useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/shadcn/accordion";
import { Alert, AlertDescription } from "@/components/shadcn/alert";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { ShadcnCardContent, ShadcnCardDescription, ShadcnCardHeader, ShadcnCardTitle } from "@/components/shadcn/card";
import { Checkbox } from "@/components/shadcn/checkbox";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { ScrollArea } from "@/components/shadcn/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/select";
import { Textarea } from "@/components/shadcn/textarea";
import { TicketsDataTable, type TicketRow } from "@/components/tickets-data-table";
import { GlassCard } from "@/components/atoms/GlassCard";
import { Sparkles, Loader2, Plus, Ticket as TicketIcon } from "lucide-react";
import type { Ticket, TicketStatus } from "@/app/page";
import type { Project } from "@/types/project";
import { invoke } from "@/lib/tauri";
import { toast } from "sonner";

interface AIFileSlot {
  label: string;
  name: string;
  contentBase64: string;
  mimeType: string;
}

interface AIGeneratedTicket {
  title: string;
  description: string;
}

interface TicketManagementProps {
  tickets: Ticket[];
  saveTickets: (next: Ticket[]) => Promise<void>;
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  allProjects: string[];
  setError: (error: string | null) => void;
  isTauriEnv: boolean | null;
}

const AI_FILE_LABELS = ["Design (PDF)", "Infrastructure", "Tech stack", "Project structure"];

export function TicketManagement({
  tickets,
  saveTickets,
  updateTicket,
  deleteTicket,
  allProjects,
  setError,
  isTauriEnv,
}: TicketManagementProps) {
  const [ticketForm, setTicketForm] = useState<{
    title: string;
    description: string;
    status: TicketStatus;
    priority: number;
  }>({
    title: "",
    description: "",
    status: "backlog",
    priority: 0,
  });
  const [aiDescription, setAiDescription] = useState("");
  const [aiOptions, setAiOptions] = useState({
    granularity: "medium" as "epic" | "medium" | "small",
    defaultPriority: "medium" as "low" | "medium" | "high",
    includeAcceptanceCriteria: true,
    includeTechnicalNotes: false,
    splitByComponent: false,
  });
  const [aiFileSlots, setAiFileSlots] = useState<AIFileSlot[]>(
    AI_FILE_LABELS.map((label) => ({ label, name: "", contentBase64: "", mimeType: "" }))
  );
  const [aiPastedTexts, setAiPastedTexts] = useState<string[]>(Array(AI_FILE_LABELS.length).fill(""));
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratedTickets, setAiGeneratedTickets] = useState<AIGeneratedTicket[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [ticketPageAiProjectPath, setTicketPageAiProjectPath] = useState<string>("");

  const addTicket = async () => {
    if (!ticketForm.title.trim()) {
      setError("Title is required");
      return;
    }
    setError(null);
    const now = new Date().toISOString();
    const newTicket: Ticket = {
      id: crypto.randomUUID(),
      title: ticketForm.title.trim(),
      description: ticketForm.description.trim(),
      status: ticketForm.status,
      priority: ticketForm.priority,
      created_at: now,
      updated_at: now,
    };
    const next = [...tickets, newTicket];
    await saveTickets(next);
    setTicketForm({ title: "", description: "", status: "backlog", priority: 0 });
  };

  const pickAiFile = async (slotIndex: number) => {
    if (isTauriEnv === false) return; // Only available in Tauri
    setAiError(null);
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const selected = await open({
        multiple: false,
        title: `Select file for ${AI_FILE_LABELS[slotIndex]}`,
        filters: slotIndex === 0 ? [{ name: "PDF", extensions: ["pdf"] }] : undefined,
      });
      if (selected === null || (Array.isArray(selected) && selected.length === 0)) return;
      const path = typeof selected === "string" ? selected : selected[0];
      const contentBase64 = await invoke<string>("read_file_as_base64", { path });
      const name = path.split("/").pop() ?? path;
      const mimeType = name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "text/plain";
      setAiFileSlots((prev) =>
        prev.map((s, i) =>
          i === slotIndex ? { ...s, name, contentBase64, mimeType } : s
        )
      );
    } catch (e) {
      setAiError(e instanceof Error ? e.message : String(e));
    }
  };

  const clearAiFileSlot = (slotIndex: number) => {
    setAiFileSlots((prev) =>
      prev.map((s, i) =>
        i === slotIndex ? { ...s, name: "", contentBase64: "", mimeType: "" } : s
      )
    );
    setAiPastedTexts((prev) => prev.map((t, i) => (i === slotIndex ? "" : t)));
  };

  const generateAiTickets = async () => {
    setAiError(null);
    setAiGenerating(true);
    try {
      const files: { name: string; label: string; contentBase64: string; mimeType: string }[] = [];
      for (let i = 0; i < aiFileSlots.length; i++) {
        const slot = aiFileSlots[i];
        const pasted = aiPastedTexts[i]?.trim();
        if (slot.contentBase64) {
          files.push({
            name: slot.name || slot.label,
            label: slot.label,
            contentBase64: slot.contentBase64,
            mimeType: slot.mimeType || "text/plain",
          });
        } else if (pasted) {
          const base64 = typeof btoa !== "undefined"
            ? btoa(unescape(encodeURIComponent(pasted)))
            : Buffer.from(pasted, "utf-8").toString("base64");
          files.push({
            name: `${slot.label}.txt`,
            label: slot.label,
            contentBase64: base64,
            mimeType: "text/plain",
          });
        }
      }
      const res = await fetch("/api/generate-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: aiDescription,
          options: aiOptions,
          files,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || "Generate failed");
      setAiGeneratedTickets(data.tickets ?? []);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : String(e));
      setAiGeneratedTickets([]);
    } finally {
      setAiGenerating(false);
    }
  };

  const generateAiTicketsFromProject = async () => {
    const path = ticketPageAiProjectPath?.trim();
    if (!path) {
      setAiError("Select a project first.");
      return;
    }
    setAiError(null);
    setAiGenerating(true);
    try {
      const projectName = path.split("/").pop() ?? path;
      let project_analysis: {
        name: string;
        path: string;
        package_json?: string;
        readme_snippet?: string;
        top_level_dirs: string[];
        top_level_files: string[];
        config_snippet?: string;
      } | undefined;
      if (isTauriEnv === true) {
        try {
          const analysis = await invoke<{
            name: string;
            path: string;
            package_json?: string;
            readme_snippet?: string;
            top_level_dirs: string[];
            top_level_files: string[];
            config_snippet?: string;
          }>("analyze_project_for_tickets", { projectPath: path });
          project_analysis = {
            name: analysis.name,
            path: analysis.path,
            package_json: analysis.package_json ?? undefined,
            readme_snippet: analysis.readme_snippet ?? undefined,
            top_level_dirs: analysis.top_level_dirs ?? [],
            top_level_files: analysis.top_level_files ?? [],
            config_snippet: analysis.config_snippet ?? undefined,
          };
        } catch {
          // Fall back to description-only if analysis fails (e.g. path not accessible)
        }
      }
      const description = project_analysis
        ? `Generate development tickets for project "${project_analysis.name}". Use the attached project analysis to infer tech stack, existing structure, and produce a prioritized feature/todo list (no generic tickets like "create documentation" or "install X" unless clearly missing).`
        : `Generate development tickets for the following project.\n\nProject path: ${path}\nProject name: ${projectName}\n\nSuggest actionable work items: setup, dependencies, features, tests, and documentation. Base suggestions on typical project structure and best practices.`;
      const res = await fetch("/api/generate-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          options: aiOptions,
          files: [],
          ...(project_analysis && { project_analysis }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || "Generate failed");
      setAiGeneratedTickets(data.tickets ?? []);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : String(e));
      setAiGeneratedTickets([]);
    } finally {
      setAiGenerating(false);
    }
  };

  const addGeneratedTicketsToBacklog = async () => {
    const now = new Date().toISOString();
    const newTickets: Ticket[] = aiGeneratedTickets.map((t) => ({
      id: crypto.randomUUID(),
      title: t.title,
      description: t.description,
      status: "backlog",
      priority: aiOptions.defaultPriority === "high" ? 2 : aiOptions.defaultPriority === "low" ? 0 : 1,
      created_at: now,
      updated_at: now,
    }));
    await saveTickets([...tickets, ...newTickets]);
    setAiGeneratedTickets([]);
    setError(null);
  };

  const addSingleGeneratedTicket = async (t: { title: string; description: string }) => {
    const now = new Date().toISOString();
    const newTicket: Ticket = {
      id: crypto.randomUUID(),
      title: t.title,
      description: t.description,
      status: "backlog",
      priority: aiOptions.defaultPriority === "high" ? 2 : aiOptions.defaultPriority === "low" ? 0 : 1,
      created_at: now,
      updated_at: now,
    };
    await saveTickets([...tickets, newTicket]);
    setAiGeneratedTickets((prev) => prev.filter((x) => x !== t));
  };

  return (
    <GlassCard>
      <ShadcnCardHeader>
        <ShadcnCardTitle className="text-lg flex items-center gap-2">
          <TicketIcon className="h-5 w-5" />
          Tickets
        </ShadcnCardTitle>
        <ShadcnCardDescription className="text-base">
          Define work items: title, description, status. Combine them with prompts and projects in the Feature tab.
          {tickets.length > 0 && (
            <span className="block mt-1 font-semibold text-foreground">
              {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} total
            </span>
          )}
        </ShadcnCardDescription>
      </ShadcnCardHeader>
      <ShadcnCardContent className="space-y-4">
        <Accordion type="single" collapsible className="w-full rounded-lg border bg-muted/30 glasgmorphism">
          <AccordionItem value="add-ticket" className="border-none glasgmorphism">
            <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:border-b">
              Add ticket
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2">
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input
                  value={ticketForm.title}
                  onChange={(e) => setTicketForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Add user dashboard"
                />
                <Label>Description (optional)</Label>
                <Textarea
                  className="min-h-[60px]"
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="What should be built..."
                />
                <div className="flex items-center gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={ticketForm.status}
                      onValueChange={(v) => setTicketForm((f) => ({ ...f, status: v as TicketStatus }))}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="backlog">Backlog</SelectItem>
                        <SelectItem value="in_progress">In progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Input
                      type="number"
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm((f) => ({ ...f, priority: Number(e.target.value) || 0 }))}
                      className="w-20"
                    />
                  </div>
                </div>
                <Button onClick={addTicket}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add ticket
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <p className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI generate from project
          </p>
          <p className="text-xs text-muted-foreground">
            Select a project and generate tickets based on it. Uses the same options as the AI Generate tab.
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-2 min-w-[200px] flex-1">
              <Label>Project</Label>
              <Select
                value={ticketPageAiProjectPath || "__none__"}
                onValueChange={(v) => setTicketPageAiProjectPath(v === "__none__" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Select a project</SelectItem>
                  {allProjects.map((projectPath) => {
                    const name = projectPath.split("/").pop() ?? projectPath;
                    return (
                      <SelectItem key={projectPath} value={projectPath}>
                        {name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={generateAiTicketsFromProject}
              disabled={aiGenerating || !ticketPageAiProjectPath.trim()}
            >
              {aiGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Generate tickets
                </>
              )}
            </Button>
          </div>
          {aiError && (
            <Alert variant="destructive">
              <AlertDescription>{aiError}</AlertDescription>
            </Alert>
          )}
          {aiGeneratedTickets.length > 0 && (
            <div className="rounded-lg border p-4 space-y-3 mt-3">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">Generated tickets ({aiGeneratedTickets.length})</p>
                <Button size="sm" onClick={addGeneratedTicketsToBacklog}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add all to backlog
                </Button>
              </div>
              <ScrollArea className="h-[200px] rounded-md border p-3">
                <div className="space-y-2">
                  {aiGeneratedTickets.map((t, idx) => (
                    <div key={idx} className="flex flex-wrap items-start gap-2 rounded-lg border p-3 bg-card">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-base">{t.title}</p>
                        {t.description && (
                          <p className="text-xs text-muted-foreground line-clamp-3 mt-1">{t.description}</p>
                        )}
                      </div>
                      <Button size="sm" variant="outline" onClick={() => addSingleGeneratedTicket(t)}>
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <TicketsDataTable
          tickets={tickets as TicketRow[]}
          onUpdateStatus={(id, status) => updateTicket(id, { status })}
          onDelete={deleteTicket}
          emptyTitle="No tickets yet"
          emptyDescription="Add a ticket using the form above."
        />
      </ShadcnCardContent>
    </GlassCard>
  );
}
