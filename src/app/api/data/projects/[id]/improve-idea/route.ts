import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { parseAndValidate, improveIdeaSchema } from "@/lib/api-validation";

/**
 * POST: Improve a raw idea with AI and return polished markdown for ideas.md.
 * Used when adding new ideas from the project Ideas tab.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const parsed = await parseAndValidate(request, improveIdeaSchema);
  if (!parsed.success) return parsed.response;
  const { rawIdea, projectName } = parsed.data;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set. Add it in .env.local." },
      { status: 500 }
    );
  }

  const openai = new OpenAI({ apiKey });
  const context = projectName
    ? ` for project "${projectName}"`
    : "";

  const userPrompt = `Improve and expand this product/feature idea${context} into a short, clear markdown block suitable for an ideas roadmap (ideas.md). Keep it concise: 2–4 sentences or a few bullet points. Do not add a heading; output only the improved idea text. If the user's input is already clear, lightly polish it. Output in the same language as the input.

User's idea:
${rawIdea}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You output only the improved idea text in markdown (no heading, no preamble). Be concise and actionable.",
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
    });

    const improved =
      completion.choices[0]?.message?.content?.trim() ||
      rawIdea;

    return NextResponse.json({ improved });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "OpenAI request failed", detail: message },
      { status: 502 }
    );
  }
}
