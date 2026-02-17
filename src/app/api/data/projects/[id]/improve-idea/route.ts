import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { runAgentPrompt } from "@/lib/agent-runner";
import { parseAndValidate, improveIdeaSchema } from "@/lib/api-validation";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

/**
 * POST: Improve a raw idea with AI and return polished markdown for ideas.md.
 * Used when adding new ideas from the project Ideas tab.
 * Body may include promptOnly: true to return { prompt } without running the agent.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const parsed = await parseAndValidate(request, improveIdeaSchema);
  if (!parsed.success) return parsed.response;
  const { rawIdea, projectName, promptOnly } = parsed.data;

  const context = projectName
    ? ` for project "${projectName}"`
    : "";

  const prompt = `You output only the improved idea text in markdown (no heading, no preamble). Be concise and actionable.

Improve and expand this product/feature idea${context} into a short, clear markdown block suitable for an ideas roadmap (ideas.md). Keep it concise: 2–4 sentences or a few bullet points. Do not add a heading; output only the improved idea text. If the user's input is already clear, lightly polish it. Output in the same language as the input.

User's idea:
${rawIdea}`;

  if (promptOnly) {
    return NextResponse.json({ prompt });
  }

  const cwd = path.resolve(process.cwd());
  try {
    const raw = await runAgentPrompt(cwd, prompt);
    const improved = raw.trim() || rawIdea;
    return NextResponse.json({ improved });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Agent request failed", detail: message },
      { status: 502 }
    );
  }
}
