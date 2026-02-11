import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { parseAndValidate, generateDesignSchema } from "@/lib/api-validation";

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set. Add it in .env.local." },
      { status: 500 }
    );
  }

  const parsed = await parseAndValidate(request, generateDesignSchema);
  if (!parsed.success) return parsed.response;
  const { description, templateId, projectName } = parsed.data;

  const openai = new OpenAI({ apiKey });
  const userPromptRecord = `You are a web product designer. Generate a design specification in Markdown for a web page based on this description.

Description: ${description}
Page template type: ${templateId}
Project name: ${projectName}

Output a Markdown document that includes:
1. A title: "# [Page Title] — Design Spec"
2. Project and template
3. **Colors** — table with tokens: Primary, Secondary, Accent, Background, Surface, Text, Text (muted). Use hex codes (e.g. #0f172a).
4. **Typography** — Heading font, Body font, Base size, Scale
5. **Layout** — Max width, Spacing, Border radius, Nav style (minimal | centered | full | sidebar)
6. **Page structure** — numbered list of sections with type in parentheses (e.g. "1. **Hero** (hero)"). Use section kinds: hero, nav, features, testimonials, cta, pricing, faq, team, contact-form, footer, content, sidebar.

Be specific and use the user's description to choose colors, fonts, and structure. Output ONLY the markdown document, no code fence.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You output only a single Markdown document. No surrounding text, no code block wrapper.",
        },
        { role: "user", content: userPromptRecord },
      ],
      temperature: 0.6,
    });

    const markdown = (completion.choices[0]?.message?.content?.trim() ?? "").slice(0, 15000);

    return NextResponse.json({ markdown });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "OpenAI request failed", detail: message },
      { status: 502 }
    );
  }
}
