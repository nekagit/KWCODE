"use client";

import { useCallback, useState } from "react";
import { BookOpen, Copy, FileJson, FileText, FolderOpen, Loader2, Printer, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { SingleContentPage } from "@/components/organisms/SingleContentPage";
import { Button } from "@/components/ui/button";
import { copyDocumentationFolderPath } from "@/lib/copy-documentation-folder-path";
import {
  downloadDocumentationInfoAsMarkdown,
  copyDocumentationInfoAsMarkdownToClipboard,
} from "@/lib/download-documentation-info-md";
import {
  downloadDocumentationInfoAsJson,
  copyDocumentationInfoAsJsonToClipboard,
} from "@/lib/download-documentation-info-json";
import { openDocumentationFolderInFileManager } from "@/lib/open-documentation-folder";
import { useRunState } from "@/context/run-state";

/**
 * Documentation page: points users to where app documentation lives
 * (.cursor/documentation/, docs/) and provides quick access via nav/shortcut.
 */
export function DocumentationPageContent() {
  const { refreshData } = useRunState();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshData();
      toast.success("Data refreshed");
    } catch {
      toast.error("Refresh failed");
    } finally {
      setRefreshing(false);
    }
  }, [refreshData]);

  return (
    <div className="space-y-0">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/" },
          { label: "Documentation" },
        ]}
        className="mb-3"
      />
      <SingleContentPage
        title="Documentation"
        description="App documentation lives in the repository. Use your editor or file manager to open the following locations."
        icon={<BookOpen className="h-5 w-5 text-muted-foreground" aria-hidden />}
        layout="simple"
      >
        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>.cursor/documentation/</strong> — setup guide, development guide, architecture overview, API reference
            </li>
            <li>
              <strong>docs/</strong> — Docusaurus-ready docs (getting started, architecture, development, api, guides, contributing)
            </li>
          </ul>
          <p className="mt-3 text-sm">
            From the repo root, open these folders in your editor or file manager to read or edit the docs.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              aria-label="Print current page"
              title="Print documentation page (⌘P)"
            >
              <Printer className="mr-2 h-4 w-4" aria-hidden />
              Print
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openDocumentationFolderInFileManager()}
              aria-label="Open documentation folder in file manager"
            >
              <FolderOpen className="mr-2 h-4 w-4" aria-hidden />
              Open documentation folder
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => copyDocumentationFolderPath()}
              aria-label="Copy documentation folder path"
            >
              <Copy className="mr-2 h-4 w-4" aria-hidden />
              Copy path
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadDocumentationInfoAsMarkdown()}
              aria-label="Download documentation info as Markdown"
              title="Download documentation info as Markdown file"
            >
              <FileText className="mr-2 h-4 w-4" aria-hidden />
              Download as Markdown
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void copyDocumentationInfoAsMarkdownToClipboard()}
              aria-label="Copy documentation info as Markdown"
              title="Copy as Markdown (same content as Download as Markdown)"
            >
              <Copy className="mr-2 h-4 w-4" aria-hidden />
              Copy as Markdown
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadDocumentationInfoAsJson()}
              aria-label="Download documentation info as JSON"
              title="Download documentation info as JSON file"
            >
              <FileJson className="mr-2 h-4 w-4" aria-hidden />
              Download as JSON
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void copyDocumentationInfoAsJsonToClipboard()}
              aria-label="Copy documentation info as JSON"
              title="Copy as JSON (same content as Download as JSON)"
            >
              <Copy className="mr-2 h-4 w-4" aria-hidden />
              Copy as JSON
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={refreshing}
              onClick={handleRefresh}
              aria-label="Refresh data"
            >
              {refreshing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
              )}
              Refresh
            </Button>
          </div>
        </div>
      </SingleContentPage>
    </div>
  );
}
