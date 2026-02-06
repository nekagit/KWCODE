import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const CATEGORIES = ["saas", "iaas", "paas", "website", "webapp", "webshop", "other"] as const;

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
  const count = typeof body.count === "number" && body.count >= 1 && body.count <= 10
    ? body.count
    : 5;

  if (!topic) {
    return NextResponse.json(
      { error: "topic is required" },
      { status: 400 }
    );
  }

  const openai = new OpenAI({ apiKey });
  const userPrompt = `Generate ${count} short business/product ideas for the internet or computer space based on this topic or niche: "${topic}"

Types to mix when relevant: SaaS (software as a service), IaaS (infrastructure), PaaS (platform), website, webapp, webshop, or other digital products.

For each idea respond with a JSON array of objects. Each object must have:
- "title": short catchy name (e.g. "API usage dashboard for dev teams")
- "description": one or two sentences describing the idea and who it's for
- "category": one of: saas, iaas, paas, website, webapp, webshop, other

Output only a single JSON array, no markdown, no other text. Example format:
[{"title":"...","description":"...","category":"saas"},...]`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            'You output only a JSON array of objects with keys "title", "description", "category". Category must be one of: saas, iaas, paas, website, webapp, webshop, other. No other text, no markdown.',
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : raw;
    let parsed: { title?: string; description?: string; category?: string }[];
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: "Model did not return valid JSON array", raw },
        { status: 502 }
      );
    }

    const ideas = (Array.isArray(parsed) ? parsed : []).slice(0, count).map((item) => ({
      title: String(item.title ?? "Untitled").slice(0, 200),
      description: String(item.description ?? "").slice(0, 1000),
      category: CATEGORIES.includes(item.category as (typeof CATEGORIES)[number])
        ? item.category
        : "other",
    }));

    return NextResponse.json({ ideas });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "OpenAI request failed", detail: message },
      { status: 502 }
    );
  }
}
