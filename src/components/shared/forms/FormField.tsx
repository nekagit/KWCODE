import React from 'react';
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
  description?: string;
  errorMessage?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  children,
  className,
  description,
  errorMessage,
}) => {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
    </div>
  );
};
