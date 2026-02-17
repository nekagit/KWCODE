"use client";

import { FormInput } from "@/components/atoms/FormInput";
import { PrimaryButton } from "@/components/atoms/PrimaryButton";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search…",
}: SearchBarProps) {
  return (
    <div className="flex gap-2">
      <FormInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
      />
      <PrimaryButton onClick={onSearch}>Search</PrimaryButton>
    </div>
  );
}
