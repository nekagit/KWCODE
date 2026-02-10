import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { parseAndValidate, generateCommitMessageSchema } from "@/lib/api-validation";

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set. Add it in .env.local." },
      { status: 500 }
    );
  }

  const parsed = await parseAndValidate(request, generateCommitMessageSchema);
  if (!parsed.success) return parsed.response;
  const { changes } = parsed.data;

  const openai = new OpenAI({ apiKey });
  const userPrompt = `Generate a single, concise git commit message based on the following changes (git status and/or changed files). Use conventional commit style when appropriate (e.g. "feat:", "fix:", "docs:", "chore:"). One line, no period at the end, max 72 characters.

Changes:
${changes}

Output only the commit message text, nothing else. No quotes, no explanation.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You output only a single line of text: the commit message. No markdown, no quotes, no explanation.",
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
    });

    const message = (completion.choices[0]?.message?.content?.trim() ?? "").slice(0, 500);

    return NextResponse.json({ message });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "OpenAI request failed", detail: message },
      { status: 502 }
    );
  }
}
