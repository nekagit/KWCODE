import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { parseAndValidate, generatePromptRecordSchema } from "@/lib/api-validation";

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set. Add it in .env.local." },
      { status: 500 }
    );
  }

  const parsed = await parseAndValidate(request, generatePromptRecordSchema);
  if (!parsed.success) return parsed.response;
  const { description } = parsed.data;

  const openai = new OpenAI({ apiKey });
  const userPromptRecord = `Generate a single Cursor/IDE prompt based on this description. The prompt will be used to instruct an AI assistant when working in a codebase.

Description: ${description}

Respond with a JSON object with exactly two keys:
- "title": a short title for the prompt (e.g. "Refactor to use TypeScript")
- "content": the full prompt text the user will run (clear instructions, steps, rules). No markdown code fence around the JSON.`;

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

    const title = String(parsed.title ?? "Generated prompt").slice(0, 500);
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
