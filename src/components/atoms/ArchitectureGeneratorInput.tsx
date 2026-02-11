import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

interface ArchitectureGeneratorInputProps {
  topic: string;
  onTopicChange: (value: string) => void;
  count: number;
  onCountChange: (value: number) => void;
  onGenerate: () => void;
  loading: boolean;
}

export const ArchitectureGeneratorInput: React.FC<ArchitectureGeneratorInputProps> = ({
  topic,
  onTopicChange,
  count,
  onCountChange,
  onGenerate,
  loading,
}) => {
  return (
    <div className="flex flex-wrap gap-2 items-end">
      <div className="flex-1 min-w-[200px] space-y-2">
        <Label htmlFor="ai-topic">Topic or scenario</Label>
        <Input
          id="ai-topic"
          placeholder="e.g. event-driven APIs, secure auth, high-throughput"
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onGenerate()}
        />
      </div>
      <div className="w-[100px] space-y-2">
        <Label>Count</Label>
        <Select value={String(count)} onValueChange={(v) => onCountChange(Number(v))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onGenerate} disabled={loading || !topic.trim()}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
        Generate
      </Button>
    </div>
  );
};
