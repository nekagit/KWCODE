import React from 'react';
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";

interface FeatureInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const FeatureInput: React.FC<FeatureInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
}) => {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};
