import React from 'react';
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/forms/FormField";
import { cn } from "@/lib/utils";

interface GenericInputWithLabelProps {
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

export const GenericInputWithLabel: React.FC<GenericInputWithLabelProps> = ({
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
