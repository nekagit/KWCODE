import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

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

export interface GenerateTicketsBody {
  description: string;
  options: GenerateTicketsOptions;
  files: UploadedFileInput[];
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
  parts.push("- Output a JSON array of objects with exactly: \"title\" (string) and \"description\" (string).");
  parts.push("- No other fields. No markdown code fence around the JSON.");
  parts.push("Example: [{\"title\":\"...\",\"description\":\"...\"}, ...]");

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

  let body: GenerateTicketsBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const options = body.options ?? {
    granularity: "medium",
    defaultPriority: "medium",
    includeAcceptanceCriteria: true,
    includeTechnicalNotes: false,
    splitByComponent: false,
  };
  const files = Array.isArray(body.files) ? body.files : [];
  const description = typeof body.description === "string" ? body.description : "";

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
    { description, options, files },
    fileTexts
  );

  const openai = new OpenAI({ apiKey });
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a project manager and technical lead. You output only valid JSON arrays of ticket objects with \"title\" and \"description\" keys. No markdown, no explanation.",
        },
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
