import React from 'react';
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/forms/FormField";
import { FieldWrapper } from "@/components/shared/FieldWrapper";
import { cn } from "@/lib/utils";

interface LabeledInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  className?: string;
  description?: string;
  errorMessage?: string;
}

export const LabeledInput: React.FC<LabeledInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  className,
  description,
  errorMessage,
}) => {
  return (
    <FormField
      label={label}
      htmlFor={id}
      description={description}
      errorMessage={errorMessage}
    >
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={cn("", className)}
      />
    </FormField>
  );
};
