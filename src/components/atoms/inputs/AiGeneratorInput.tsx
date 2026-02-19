/** Ai Generator Input component. */
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

interface AiGeneratorInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  loading: boolean;
  placeholder?: string;
}

export const AiGeneratorInput: React.FC<AiGeneratorInputProps> = ({
  value,
  onChange,
  onGenerate,
  loading,
  placeholder,
}) => {
  return (
    <div className="flex gap-2">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onGenerate()}
      />
      <Button onClick={onGenerate} disabled={loading || !value.trim()}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        <span className="ml-2">Generate</span>
      </Button>
    </div>
  );
};
