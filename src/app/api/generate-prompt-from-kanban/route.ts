import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

type KanbanFeature = { id: string; title: string; ticketRefs: number[]; done: boolean };
type KanbanTicket = {
  id: string;
  number: number;
  title: string;
  description?: string;
  priority: string;
  featureName: string;
  done: boolean;
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set. Add it in .env.local." },
      { status: 500 }
    );
  }

  let body: { features?: KanbanFeature[]; tickets?: KanbanTicket[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const features = Array.isArray(body.features) ? body.features : [];
  const tickets = Array.isArray(body.tickets) ? body.tickets : [];
  const pendingFeatures = features.filter((f) => !f.done);
  const pendingTickets = tickets.filter((t) => !t.done);

  if (pendingFeatures.length === 0 && pendingTickets.length === 0) {
    return NextResponse.json(
      {
        error:
          "No pending features or tickets. Add items in .cursor/planner/features.md and .cursor/planner/tickets.md and run Sync, or ensure some are not marked done.",
      },
      { status: 400 }
    );
  }

  const openai = new OpenAI({ apiKey });

  const featuresText =
    pendingFeatures.length === 0
      ? ""
      : "## Pending features (from .cursor/planner/features.md)\n" +
        pendingFeatures
          .map(
            (f) =>
              `- ${f.title} (ticket refs: ${f.ticketRefs.join(", ") || "none"})`
          )
          .join("\n");

  const ticketsText =
    pendingTickets.length === 0
      ? ""
      : "## Pending tickets (from .cursor/planner/tickets.md)\n" +
        pendingTickets
          .map(
            (t) =>
              `- #${t.number} [${t.priority}] ${t.title} (Feature: ${t.featureName})${t.description ? ` — ${t.description.slice(0, 200)}` : ""}`
          )
          .join("\n");

  const userPromptRecord = `You are helping a developer who uses Cursor IDE. They have a Kanban board driven by .cursor/planner/features.md and .cursor/planner/tickets.md. Below are the current PENDING (not done) features and tickets.

Generate a single Cursor/IDE prompt that will instruct an AI assistant to complete these features and tickets efficiently. The prompt should:
1. Be actionable and clear (steps, order, references to ticket numbers).
2. Respect priority (P0 > P1 > P2 > P3) and feature grouping.
3. Tell the model to implement one feature at a time, then mark items done.
4. Be concise but complete so the model has full context.

${featuresText}
${ticketsText}

Respond with a JSON object with exactly two keys:
- "title": a short title for the prompt (e.g. "Complete pending features and tickets")
- "content": the full prompt text (instructions only; no meta-commentary). No markdown code fence around the JSON.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            'You output only a single JSON object with keys "title" and "content". No other text, no markdown.',
        },
        { role: "user", content: userPromptRecord },
      ],
      temperature: 0.5,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : raw;
    let parsed: { title?: string; content?: string };
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: "Model did not return valid JSON", raw },
        { status: 502 }
      );
    }

    const title = String(parsed.title ?? "Complete features and tickets").slice(
      0,
      500
    );
    const content = String(parsed.content ?? "").slice(0, 50000);

    return NextResponse.json({ title, content });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "OpenAI request failed", detail: message },
      { status: 502 }
    );
  }
}
