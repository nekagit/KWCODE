import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const CATEGORIES = [
  "ddd", "tdd", "bdd", "dry", "solid", "kiss", "yagni",
  "clean", "hexagonal", "cqrs", "event_sourcing", "microservices",
  "rest", "graphql", "scenario",
] as const;

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set. Add it in .env.local." },
      { status: 500 }
    );
  }

  let body: { topic?: string; count?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const count = typeof body.count === "number" && body.count >= 1 && body.count <= 5
    ? body.count
    : 3;

  if (!topic) {
    return NextResponse.json(
      { error: "topic is required" },
      { status: 400 }
    );
  }

  const openai = new OpenAI({ apiKey });
  const userPrompt = `Generate ${count} short architecture or best-practice definitions for software projects based on this topic or scenario: "${topic}"

For each definition respond with a JSON array of objects. Each object must have:
- "name": short name (e.g. "Domain-Driven Design (DDD)")
- "description": one or two sentences describing the approach
- "category": one of: ${CATEGORIES.join(", ")}
- "practices": bullet points or short paragraphs for best practices / principles (plain text, newlines ok)
- "scenarios": when to use / specific scenarios (plain text, newlines ok)

Output only a single JSON array, no markdown, no other text. Example format:
[{"name":"...","description":"...","category":"ddd","practices":"- Point one\\n- Point two","scenarios":"When to use..."},...]`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You output only a JSON array of objects with keys "name", "description", "category", "practices", "scenarios". Category must be one of: ${CATEGORIES.join(", ")}. No other text, no markdown.`,
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : raw;
    let parsed: { name?: string; description?: string; category?: string; practices?: string; scenarios?: string }[];
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: "Model did not return valid JSON array", raw },
        { status: 502 }
      );
    }

    const architectures = (Array.isArray(parsed) ? parsed : []).slice(0, count).map((item) => ({
      name: String(item.name ?? "Untitled").slice(0, 200),
      description: String(item.description ?? "").slice(0, 800),
      category: CATEGORIES.includes(item.category as (typeof CATEGORIES)[number])
        ? item.category
        : "scenario",
      practices: String(item.practices ?? "").slice(0, 2000),
      scenarios: String(item.scenarios ?? "").slice(0, 2000),
    }));

    return NextResponse.json({ architectures });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "OpenAI request failed", detail: message },
      { status: 502 }
    );
  }
}
