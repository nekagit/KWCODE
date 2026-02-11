/** Resolved feature shape from project (with optional category fields). */
export interface FeatureForExport {
  id: string;
  title: string;
  prompt_ids?: number[];
  project_paths?: string[];
  phase?: string;
  step?: string;
  organization?: string;
  categorizer?: string;
  other?: string;
}

/** Feature to .md for Project Spec export. */
export function featureToMarkdown(feature: FeatureForExport): string {
  const lines: string[] = [];
  lines.push(`# ${feature.title}`);
  lines.push("");
  lines.push(`- **ID:** \`${feature.id}\``);
  if (feature.prompt_ids?.length) {
    lines.push(`- **PromptRecord IDs:** ${feature.prompt_ids.join(", ")}`);
  }
  if (feature.project_paths?.length) {
    lines.push(`- **Project paths:** ${feature.project_paths.join(", ")}`);
  }
  const cats: string[] = [];
  if (feature.phase) cats.push(`phase: ${feature.phase}`);
  if (feature.step) cats.push(`step: ${feature.step}`);
  if (feature.organization) cats.push(`organization: ${feature.organization}`);
  if (feature.categorizer) cats.push(`categorizer: ${feature.categorizer}`);
  if (feature.other) cats.push(`other: ${feature.other}`);
  if (cats.length) {
    lines.push(`- **Categories:** ${cats.join(" · ")}`);
  }
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("*Exported from Features*");
  return lines.join("\n");
}
