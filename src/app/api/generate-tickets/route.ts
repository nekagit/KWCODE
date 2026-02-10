import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { parseAndValidate, generateTicketsSchema } from "@/lib/api-validation";

export interface GenerateTicketsOptions {
  granularity: "epic" | "medium" | "small";
  defaultPriority: "low" | "medium" | "high";
  includeAcceptanceCriteria: boolean;
  includeTechnicalNotes: boolean;
  splitByComponent: boolean;
}

export interface UploadedFileInput {
  name: string;
  label: string;
  contentBase64: string;
  mimeType: string;
}

export interface ProjectAnalysisInput {
  name: string;
  path: string;
  package_json?: string;
  readme_snippet?: string;
  top_level_dirs: string[];
  top_level_files: string[];
  config_snippet?: string;
}

export interface GenerateTicketsBody {
  description: string;
  options: GenerateTicketsOptions;
  files: UploadedFileInput[];
  /** When generating from a project, pass analysis so the model can infer stack and suggest real features. */
  project_analysis?: ProjectAnalysisInput;
}

export interface GeneratedTicketItem {
  title: string;
  description: string;
}

async function extractTextFromFile(
  contentBase64: string,
  mimeType: string,
  name: string
): Promise<string> {
  const buffer = Buffer.from(contentBase64, "base64");

  if (mimeType === "application/pdf" || name.toLowerCase().endsWith(".pdf")) {
    try {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      return result?.text ?? "";
    } catch {
      return `[PDF "${name}" – text extraction not available]`;
    }
  }

  return buffer.toString("utf-8");
}

function buildPrompt(body: GenerateTicketsBody, fileTexts: { label: string; text: string }[]): string {
  const opts = body.options;
  const parts: string[] = [];
  const hasProjectAnalysis = body.project_analysis && (
    body.project_analysis.package_json ||
    body.project_analysis.readme_snippet ||
    (body.project_analysis.top_level_dirs?.length ?? 0) > 0
  );

  if (hasProjectAnalysis) {
    const pa = body.project_analysis!;
    parts.push("You are generating development tickets (work items) from a REAL project. Your job is to ANALYZE the project first, then produce a prioritized feature/todo list—not generic placeholders.");
    parts.push("");
    parts.push("## Project analysis (use this to infer tech stack, existing structure, and missing work)");
    parts.push(`Project name: ${pa.name}`);
    parts.push(`Path: ${pa.path}`);
    parts.push("");
    if (pa.package_json) {
      parts.push("### package.json");
      parts.push(pa.package_json.slice(0, 12000));
      parts.push("");
    }
    if (pa.readme_snippet) {
      parts.push("### README (excerpt)");
      parts.push(pa.readme_snippet);
      parts.push("");
    }
    if (pa.top_level_dirs?.length) {
      parts.push(`### Top-level directories: ${pa.top_level_dirs.join(", ")}`);
      parts.push("");
    }
    if (pa.top_level_files?.length) {
      parts.push(`### Top-level files: ${pa.top_level_files.join(", ")}`);
      parts.push("");
    }
    if (pa.config_snippet) {
      parts.push("### Config file (excerpt)");
      parts.push(pa.config_snippet);
      parts.push("");
    }
    parts.push("## Instructions (analysis-driven tickets)");
    parts.push("1. From the project analysis above, infer: tech stack (frameworks, libs), app type (e.g. Three.js scene, Next.js app), and what already exists.");
    parts.push("2. Generate tickets as a prioritized feature/todo list. Prefer concrete, actionable items over vague ones.");
    parts.push("3. DO NOT output low-value generic tickets like \"Create documentation\", \"Install Three.js\", or \"Set up project\" unless the analysis clearly shows something is missing (e.g. no package.json, no README).");
    parts.push("4. DO output: specific features (e.g. \"Add orbit controls to the scene\", \"Implement shadow mapping for lights\"), missing config (e.g. \"Add ESLint and run fix\"), tests (e.g. \"Unit tests for store X\"), refactors, and real next steps inferred from the codebase.");
    parts.push("5. Order tickets by: setup/deps only if needed → core features → UX/polish → tests → docs.");
    parts.push(`6. Granularity: ${opts.granularity}. Priority: ${opts.defaultPriority}.`);
    if (opts.includeAcceptanceCriteria) parts.push("7. Each ticket MUST include clear acceptance criteria in the description.");
    if (opts.includeTechnicalNotes) parts.push("8. Include brief technical notes where relevant.");
    if (opts.splitByComponent) parts.push("9. Split by component/module where it makes sense.");
    parts.push("10. Output a JSON array of objects with exactly: \"title\" (string) and \"description\" (string). No other fields. No markdown code fence.");
    parts.push("Example: [{\"title\":\"...\",\"description\":\"...\"}, ...]");
  } else {
    parts.push("Generate development tickets (work items) based on the following context.");
    parts.push("");
    parts.push("## Project / feature description");
    parts.push(body.description || "(No description provided)");
    parts.push("");

    if (fileTexts.length > 0) {
      parts.push("## Attached documents (extracted text)");
      for (const { label, text } of fileTexts) {
        parts.push(`### ${label}`);
        parts.push(text.slice(0, 30000) || "(empty)");
        parts.push("");
      }
    }

    parts.push("## Instructions");
    parts.push(`- Ticket granularity: ${opts.granularity} (epic = high-level; medium = tasks; small = subtasks).`);
    parts.push(`- Default priority level: ${opts.defaultPriority}.`);
    if (opts.includeAcceptanceCriteria) parts.push("- Each ticket MUST include clear acceptance criteria in the description.");
    if (opts.includeTechnicalNotes) parts.push("- Include brief technical notes where relevant (stack, APIs, constraints).");
    if (opts.splitByComponent) parts.push("- Split tickets by component/module where it makes sense.");
    parts.push("- Prefer concrete, actionable tickets over generic ones.");
    parts.push("- Output a JSON array of objects with exactly: \"title\" (string) and \"description\" (string).");
    parts.push("- No other fields. No markdown code fence around the JSON.");
    parts.push("Example: [{\"title\":\"...\",\"description\":\"...\"}, ...]");
  }

  return parts.join("\n");
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set. Add it in .env.local." },
      { status: 500 }
    );
  }

  const parsed = await parseAndValidate(request, generateTicketsSchema);
  if (!parsed.success) return parsed.response;
  const body = parsed.data;

  const options: GenerateTicketsOptions = {
    granularity: body.options?.granularity ?? "medium",
    defaultPriority: body.options?.defaultPriority ?? "medium",
    includeAcceptanceCriteria: body.options?.includeAcceptanceCriteria ?? true,
    includeTechnicalNotes: body.options?.includeTechnicalNotes ?? false,
    splitByComponent: body.options?.splitByComponent ?? false,
  };
  const files: UploadedFileInput[] = (Array.isArray(body.files) ? body.files : []).map((f) => ({
    name: f.name,
    label: f.label,
    contentBase64: f.contentBase64,
    mimeType: f.mimeType ?? "application/octet-stream",
  }));
  const description = typeof body.description === "string" ? body.description : "";
  const project_analysis: ProjectAnalysisInput | undefined = body.project_analysis
    ? {
        name: body.project_analysis.name,
        path: body.project_analysis.path,
        package_json: body.project_analysis.package_json,
        readme_snippet: body.project_analysis.readme_snippet,
        top_level_dirs: body.project_analysis.top_level_dirs ?? [],
        top_level_files: body.project_analysis.top_level_files ?? [],
        config_snippet: body.project_analysis.config_snippet,
      }
    : undefined;

  const fileTexts: { label: string; text: string }[] = [];
  for (const file of files) {
    if (!file.contentBase64 || !file.label) continue;
    const text = await extractTextFromFile(
      file.contentBase64,
      file.mimeType || "application/octet-stream",
      file.name || "file"
    );
    fileTexts.push({ label: file.label, text });
  }

  const userPrompt = buildPrompt(
    { description, options, files, project_analysis },
    fileTexts
  );

  const openai = new OpenAI({ apiKey });
  const systemMessage = project_analysis
    ? "You are a technical lead who analyzes real codebases and produces a prioritized feature/todo list as tickets. Infer tech stack and existing work from the project analysis; output concrete, actionable tickets—not generic placeholders like 'install X' or 'create documentation' unless clearly missing. Output only a valid JSON array of objects with \"title\" and \"description\" keys. No markdown, no explanation."
    : "You are a project manager and technical lead. You output only valid JSON arrays of ticket objects with \"title\" and \"description\" keys. No markdown, no explanation.";

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : raw;
    let tickets: GeneratedTicketItem[];
    try {
      tickets = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: "Model did not return valid JSON", raw },
        { status: 502 }
      );
    }

    if (!Array.isArray(tickets)) {
      return NextResponse.json(
        { error: "Model did not return an array", raw },
        { status: 502 }
      );
    }

    const normalized = tickets
      .filter((t) => t && (t.title || t.description))
      .map((t) => ({
        title: String(t.title ?? "Untitled").slice(0, 500),
        description: String(t.description ?? "").slice(0, 5000),
      }));

    return NextResponse.json({ tickets: normalized });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "OpenAI request failed", detail: message },
      { status: 502 }
    );
  }
}
