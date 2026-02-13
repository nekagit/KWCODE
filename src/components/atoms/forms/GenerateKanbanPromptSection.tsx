import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Wand2, ClipboardCopy } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import type { TodosKanbanData } from "@/lib/todos-kanban";

interface GenerateKanbanPromptSectionProps {
  kanbanData: TodosKanbanData | null;
  kanbanPrompt: string;
  kanbanPromptLoading: boolean;
  generateKanbanPrompt: () => Promise<void>;
}

export const GenerateKanbanPromptSection: React.FC<GenerateKanbanPromptSectionProps> = ({
  kanbanData,
  kanbanPrompt,
  kanbanPromptLoading,
  generateKanbanPrompt,
}) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="kanban-prompt">
        <AccordionTrigger className="text-base">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            Generate AI prompt from Kanban
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-muted-foreground text-sm mb-4">
            {"Generate a prompt that includes the current Kanban state (tickets) to use with AI models."}
          </p>
          <Button
            onClick={generateKanbanPrompt}
            disabled={kanbanPromptLoading || !kanbanData}
            className="mb-4"
          >
            {kanbanPromptLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Wand2 className="h-4 w-4 mr-2" />
            )}
            Generate prompt
          </Button>
          {kanbanPrompt && (
            <div className="relative rounded-md border bg-muted/30 p-4 font-mono text-sm">
              <pre className="whitespace-pre-wrap break-all pr-10">{kanbanPrompt}</pre>
              <ButtonGroup alignment="right" className="absolute right-2 top-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => navigator.clipboard.writeText(kanbanPrompt)}
                >
                  <ClipboardCopy className="h-4 w-4" />
                </Button>
              </ButtonGroup>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
