"use client";

import { FileText } from "lucide-react";
import { PageHeader } from "@/components/molecules/LayoutAndNavigation/PageHeader";
import { getOrganismClasses } from "./organism-classes";

const c = getOrganismClasses("DocumentationPageContent.tsx");

export function DocumentationPageContent() {
  return (
    <div className={c["0"]} data-shared-ui>
      <PageHeader
        title="Documentation"
        description="Project docs, ADRs, and documentation hub. Use the Setup tab on a project to open documentation for that project."
        icon={<FileText className={c["1"]} />}
      />
    </div>
  );
}
