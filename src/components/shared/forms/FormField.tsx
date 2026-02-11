import React from 'react';
import { Label } from '@/components/ui/label';

interface FormFieldProps {
  htmlFor: string;
  label: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ htmlFor, label, children }) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
};
