import React from 'react';
import { Label } from '@/components/ui/label';

interface FormFieldProps {
  htmlFor: string;
  label: string;
  description?: string;
  errorMessage?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ htmlFor, label, description, errorMessage, children }) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {children}
      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
    </div>
  );
};
